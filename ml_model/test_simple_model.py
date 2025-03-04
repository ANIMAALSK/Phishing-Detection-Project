import pickle

# Load the model and vectorizer
with open("email_model.pkl", "rb") as file:
    model = pickle.load(file)

with open("email_vectorizer.pkl", "rb") as file:
    vectorizer = pickle.load(file)

# Function to predict an email
def predict_email(subject, sender_email, email_text):
    combined_text = subject + " " + sender_email + " " + email_text  # Combine all fields
    email_features = vectorizer.transform([combined_text])
    prediction = model.predict(email_features)
    return "Phishing" if prediction[0] == 1 else "Legitimate"

# Test the model
input_json ={
    
  "subject": "URGENT: Your Amazon Account Will Be Suspended!",
  "sender_email": "support@amazon-security.in",
  "email_text": "Dear Customer,\n\nWe have detected unusual activity on your Amazon account. To prevent suspension, please verify your details immediately by clicking the link below:\n\n🔗 http://amazon-security-verification.com\n\nFailure to verify within 24 hours will result in account suspension.\n\nBest regards,\nAmazon Security Team"
}

  


subject = input_json['subject']
sender_email = input_json['sender_email']
email_text = input_json['email_text']

print("Prediction:", predict_email(subject, sender_email, email_text))
