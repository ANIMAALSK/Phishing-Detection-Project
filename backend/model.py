import pickle
from transformers import pipeline

# Load pre-trained models
with open("ml_model/model.pkl", "rb") as file:
    model = pickle.load(file)

nlp_pipeline = pipeline("text-classification", model="bert-base-uncased")

def predict_email(email_text):
    result = nlp_pipeline(email_text)
    print(result)
    return "Phishing" if result[0]['label'] == 'LABEL_1' else "Legitimate" #1- phising , 0-Legitimate

#Load the Model 
with open("ml_model/url_model.pkl", "rb") as file:
    url_model = pickle.load(file)

# Load the vectorizer
with open("ml_model/url_vectorizer.pkl", "rb") as file:
    url_vectorizer = pickle.load(file)

def predict_url(url):
    url_tfidf = url_vectorizer.transform([url]) #to vectorize the url
    prob = url_model.predict_proba(url_tfidf)[0]
    phishing_probability = prob[1] * 100
    risk_score = round(phishing_probability, 2)
    prediction = True if prob[1] > 0.5 else False #True means phishing , False means Legitimate
    return prediction, risk_score