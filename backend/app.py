from fastapi import FastAPI, HTTPException
from backend.model import predict_email, predict_url # Ensure these functions exist
from backend.database import save_to_db  # Ensure this function exists
from backend.utils import calculate_suspicion_score, calculate_typosquatting_score, domain_exists, url_exists
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
    email_text = data.get("email_text")

    if not email_text:  # Only body is strictly required
        raise HTTPException(status_code=400, detail="Body is required")

    prediction = predict_email(email_text)
    save_to_db(None, None, None, None, None,prediction, email_text)

    return {"prediction": prediction}

# @app.post("/analyze-url/")
# async def analyze_url(data: dict):
#     url = data.get("url")
#     if not url:
#         raise HTTPException(status_code=400, detail="URL missing")
    
#     # Call a function to Check if the domain exists (WHOIS/DNS resolution) and store the result
#     # determine if url is  using its features (length, special characters, subdomains, etc.).
#     # 3. Use ML to predict phishing risk (but show a probability score instead of a strict yes/no). call predict_url here
#     # 4. Cross-check with real-time sources (Google Safe Browsing, VirusTotal, etc.).

#     prediction = predict_url(url)
#     save_to_db(None, None, None, None, None, prediction, url)  # Adjust if needed

#     return {"url": url, "prediction": prediction}

@app.post("/analyze-url/")
async def analyze_url(data: dict):
    url = data.get("url")
    if not url:
        raise HTTPException(status_code=400, detail="URL missing")
    
    # Step 1: Check if domain exists
    parsed_domain = url.split("//")[-1].split("/")[0]  # Extract domain
    if not domain_exists(parsed_domain):
        return {"url": url, "prediction": "Domain does not exist"}

    # Step 2: Check if full URL is accessible
    if not url_exists(url):
        return {"url": url, "prediction": "URL is not accessible"}
    
    suspicion_score = calculate_suspicion_score(url)
    typosquatting_score, typosquatting_risk = calculate_typosquatting_score(url)

    # Step 3: Use ML model to predict phishing probability
    prediction, risk_score = predict_url(url)
    save_to_db(None, None, None, None, None, prediction, url)

    return {"url": url, "prediction": prediction, "suspicion_score": suspicion_score, "typosquatting_score": typosquatting_score, "typosquatting_risk": typosquatting_risk, "risk_score": risk_score}