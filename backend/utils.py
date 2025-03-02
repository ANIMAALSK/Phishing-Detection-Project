import re
from urllib.parse import urlparse
import requests
import tldextract
from fuzzywuzzy import fuzz
import socket
import requests
from urllib.parse import urlparse
import ssl
from datetime import datetime
import whois

# List of suspicious words commonly used in phishing URLs
SUSPICIOUS_KEYWORDS = {"secure", "login", "bank", "update", "verify", "account", "password", "free", "offer", "confirm"}

def extract_url_features(url):
    """Extracts key features from the URL for phishing risk calculation."""
    parsed_url = urlparse(url)
    domain = parsed_url.netloc
    path = parsed_url.path

    features = {}

    # Feature 1: URL length
    features["length"] = len(url)

    # Feature 2: Special characters count (hyphens, underscores, @, etc.)
    features["special_chars"] = len(re.findall(r"[-@!#$%^&*()_+=~]", url))

    # Feature 3: Number of subdomains
    features["subdomains"] = domain.count(".")

    # Feature 4: Number of digits in domain (phishing URLs often use numbers)
    features["digits_in_domain"] = sum(c.isdigit() for c in domain)

    # Feature 5: Presence of suspicious words in URL or path
    features["suspicious_words"] = sum(word in url.lower() for word in SUSPICIOUS_KEYWORDS)

    return features

def calculate_suspicion_score(url):
    """Calculates a phishing suspicion score (0-100%) based on URL features."""
    features = extract_url_features(url)

    # Adjusted weight distribution
    weights = {
        "length": 0.15,
        "special_chars": 0.25,
        "subdomains": 0.2,
        "digits_in_domain": 0.2,
        "suspicious_words": 0.4  # More impact if phishing keywords are present
    }

    # Maximum threshold values for normalization
    max_values = {
        "length": 120,  # URLs longer than 120 chars are highly suspicious
        "special_chars": 12,  # Over 12 special chars is excessive
        "subdomains": 4,  # More than 4 subdomains is unusual
        "digits_in_domain": 6,  # Over 6 digits in domain is a red flag
        "suspicious_words": 3  # More than 3 phishing-related words is risky
    }

    suspicion_score = 0
    for feature, value in features.items():
        normalized_value = min(value / max_values[feature], 1)  # Normalize between 0-1
        suspicion_score += normalized_value * weights[feature] * 100

    return round(suspicion_score, 2)  # Return a clean percentage score

def get_existing_domains():
    """Fetch top-ranked domains dynamically from Tranco or fallback to a known list."""
    try:
        response = requests.get("https://tranco-list.eu/api/lists", timeout=5)  # Replace with API key if needed
        if response.status_code == 200:
            domains = response.json().get("domains", [])
            return set(domains[:100])  # Get top 100 domains
    except requests.exceptions.RequestException:
        pass
    return {"google.com", "facebook.com", "gmail.com", "yahoo.com", "amazon.com", "microsoft.com"}  # Fallback list

def calculate_typosquatting_score(url):
    """Calculate typosquatting similarity score with improved matching."""
    extracted = tldextract.extract(url)
    domain = f"{extracted.domain}.{extracted.suffix}"  

    existing_domains = get_existing_domains()
    
    highest_similarity = 0
    for existing_domain in existing_domains:
        similarity = max(fuzz.ratio(domain, existing_domain), 
                         fuzz.partial_ratio(domain, existing_domain), 
                         fuzz.token_sort_ratio(domain, existing_domain))
        highest_similarity = max(highest_similarity, similarity)
    
    # Classification logic
    if highest_similarity == 100:
        risk = "Likely Safe"
    elif highest_similarity >= 80:
        risk = "Possible Typosquatting"
    else:
        risk = "Potential Phishing Attempt"

    return highest_similarity, risk

def domain_exists(domain):
    """Check if the domain exists using DNS resolution."""
    try:
        socket.gethostbyname(domain)  # Resolve domain to an IP
        return True
    except socket.gaierror:
        return False  # Domain does not exist

def url_exists(url):
    """Check if the full URL is accessible via HTTP/HTTPS."""
    try:
        parsed_url = urlparse(url)

        # ✅ Step 1: Validate scheme
        if parsed_url.scheme not in ("http", "https"):
            return False  # Invalid scheme

        # ✅ Step 2: Extract domain and verify if it exists
        domain = parsed_url.netloc
        if not domain or not domain_exists(domain):
            return False  # Domain doesn't exist

        # ✅ Step 3: Send an HTTP request to check URL accessibility
        response = requests.get(url, timeout=5)  # 5-second timeout
        return response.status_code == 200  # Return True if status is 200 (OK)

    except requests.RequestException:
        return False  # Request failed (timeout, connection error, etc.)

def get_ssl_details(url):
    """Fetch SSL certificate details for a given domain."""
    parsed_url = urlparse(url)

    if parsed_url.scheme != "https":
        return {"valid": None, "error": "Not an HTTPS URL"}  # Handle non-HTTPS cases

    domain = parsed_url.netloc  # Extract domain

    try:
        context = ssl.create_default_context()
        with socket.create_connection((domain, 443), timeout=5) as sock:
            with context.wrap_socket(sock, server_hostname=domain) as ssock:
                cert = ssock.getpeercert()
                
                if not cert:
                    return {"valid": False, "error": "No SSL certificate found"}

                # Extract certificate details
                expiry_date = datetime.strptime(cert["notAfter"], "%b %d %H:%M:%S %Y %Z")
                return {
                    "valid": expiry_date > datetime.utcnow(),
                    "issuer": dict(x[0] for x in cert["issuer"]),
                    "subject": dict(x[0] for x in cert["subject"]),
                    "valid_from": cert["notBefore"],
                    "valid_to": cert["notAfter"],
                    "serial_number": cert.get("serialNumber"),
                    "algorithm": cert.get("signatureAlgorithm"),
                }

    except (ssl.SSLError, socket.error) as e:
        return {"valid": False, "error": str(e)}

def get_domain_age(url):
    """Fetch the domain's registration age in days and check WHOIS registration."""
    parsed_url = urlparse(url)
    domain = parsed_url.netloc
    try:
        domain_info = whois.whois(domain)

        # Check if the domain is registered
        if not domain_info.creation_date:
            return {"registered": False, "error": "Domain not found in WHOIS"}

        # Extract creation date (it can be a list)
        creation_date = domain_info.creation_date
        if isinstance(creation_date, list):
            creation_date = creation_date[0]  # Take the earliest creation date

        # Calculate age in days
        age_days = (datetime.utcnow() - creation_date).days

        return True, age_days, ""

    except whois.UnknownTld:
        return False, None, "Unknown top-level domain (TLD)"

    except whois.WhoisCommandFailed:
        return False, None, "WHOIS query failed"
    
    except whois.WhoisPrivateRegistry:
        return False, None, "Domain is privately registered"

    except Exception as e:
        return False, None, str(e)


def get_hosting_country(url):
    """Fetch the country of a domain using WHOIS lookup."""
    parsed_url = urlparse(url)
    domain = parsed_url.netloc

    try:
        domain_info = whois.whois(domain)
        country = domain_info.get("country")
        return country, ""

    except Exception as e:
        return None, str(e)
        
def count_redirects(url):
    """Check the number of redirects for a given URL."""
    try:
        response = requests.get(url, allow_redirects=True)  # Follow redirects
        num_redirects = len(response.history)  # Count redirect responses

        return num_redirects

    except requests.RequestException as e:
        return None
