from fastapi import FastAPI, HTTPException
from backend.model import predict_email, predict_url # Ensure these functions exist
from backend.utils import calculate_suspicion_score, calculate_typosquatting_score, domain_exists, url_exists, get_ssl_details, get_domain_age, get_hosting_country, count_redirects
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Change this to specific origins if needed
    allow_credentials=True,
    allow_methods=["*"],  # Allows all HTTP methods, including OPTIONS
    allow_headers=["*"],  # Allows all headers
)


@app.get("/")
def home():
    return {"message": "Phishing Detection API is running"}

@app.post("/analyze-email/")
async def analyze_email(data: dict):
    subject = data.get("subject")
    sender = data.get("sender_email")
    email_text = data.get("email_text")

    if not email_text:  # Only body is strictly required
        raise HTTPException(status_code=400, detail="Body is required")

    prediction, phishing_risk_score = predict_email(subject, sender, email_text)

    domain_valid = domain_exists(sender.split('@')[1])

    return {"phishing": prediction,"phishing_risk_score": phishing_risk_score, "domain_valid": domain_valid}

@app.post("/analyze-url/")
async def analyze_url(data: dict):
    url = data.get("url")
    if not url:
        raise HTTPException(status_code=400, detail="URL missing")
    
    # Step 1: Check if domain exists
    parsed_domain = url.split("//")[-1].split("/")[0]  # Extract domain
    domain_valid = domain_exists(parsed_domain)

    if not domain_valid:
        return {"url": url, "phishing": True, "domain_valid": domain_valid}

    url_valid = url_exists(url)
    if not url_valid:
        return {"url": url, "phishing": True, "domain_valid": url_valid}
    
    suspicion_score = calculate_suspicion_score(url) #based on url features
    typosquatting_score, typosquatting_risk = calculate_typosquatting_score(url)

    # Step 3: Use ML model to predict phishing probability
    prediction, phishing_risk_score = predict_url(url)

    ssl_info = get_ssl_details(url).get('valid',False)

    is_whois_registered, domain_age, err = get_domain_age(url)

    hosting_country, err_hosting_country = get_hosting_country(url)

    no_of_redirects = count_redirects(url)

    return {
            "url": url, 
            "phishing": prediction, 
            "phishing_risk_score": phishing_risk_score,
            "typosquatting_score": typosquatting_score, 
            "typosquatting_risk": typosquatting_risk, 
            "suspicion_score": suspicion_score,
            "domain_valid": domain_valid,
            "ssl_valid": ssl_info,
            "domain_age": domain_age,
            "hosting_country": hosting_country,
            "whois_registered": is_whois_registered,
            "no_of_redirects": no_of_redirects,
        }
