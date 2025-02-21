import pickle
import re
from transformers import pipeline

# Load pre-trained models
with open("ml_model/model.pkl", "rb") as file:
    model = pickle.load(file)

nlp_pipeline = pipeline("text-classification", model="bert-base-uncased")

def predict_email(email_text):
    result = nlp_pipeline(email_text)
    print(result)
    return "Phishing" if result[0]['label'] == 'LABEL_1' else "Legitimate"

def predict_url(url):
    phishing_keywords = ["bank", "verify", "account", "secure", "login"]
    return "Phishing" if any(word in url for word in phishing_keywords) else "Legitimate"
