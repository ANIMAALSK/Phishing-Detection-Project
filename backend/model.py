import pickle
from transformers import pipeline

with open("ml_model/email_model.pkl", "rb") as file:
    model = pickle.load(file)

with open("ml_model/email_vectorizer.pkl", "rb") as file:
    vectorizer = pickle.load(file)

# Function to predict an email
def predict_email(subject, sender_email, email_text):
    combined_text = subject + " " + sender_email + " " + email_text  # Combine all fields
    email_features = vectorizer.transform([combined_text])
    prob = model.predict_proba(email_features)
    
    phishing_probability = prob[0][1] * 100  # Get the probability for phishing (class 1)
    risk_score = round(phishing_probability, 2)
    prediction = True if prob[0][1] > 0.5 else False  # True means phishing, False means legitimate
    
    return prediction, risk_score


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