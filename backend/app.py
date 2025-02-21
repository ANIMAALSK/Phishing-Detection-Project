from fastapi import FastAPI, HTTPException
from backend.model import predict_email, predict_url  # Ensure these functions exist
from backend.database import save_to_db  # Ensure this function exists
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

@app.post("/analyze-url/")
async def analyze_url(data: dict):
    url = data.get("url")
    if not url:
        raise HTTPException(status_code=400, detail="URL missing")

    prediction = predict_url(url)
    save_to_db(None, None, None, None, None, prediction, url)  # Adjust if needed

    return {"url": url, "prediction": prediction}
