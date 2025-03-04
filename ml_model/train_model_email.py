import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.model_selection import train_test_split
from sklearn.naive_bayes import MultinomialNB
import pickle

# Load dataset
df = pd.read_csv("email_dataset.csv")

# Combine subject, sender email, and email text into a single feature
df["combined_text"] = df["subject"] + " " + df["sender_email"] + " " + df["email_text"]

# Convert text into numerical features using TF-IDF
vectorizer = TfidfVectorizer()
X = vectorizer.fit_transform(df["combined_text"])
y = df["label"]

# Split data
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Train model
model = MultinomialNB()
model.fit(X_train, y_train)

# Save the model and vectorizer
with open("email_model.pkl", "wb") as file:
    pickle.dump(model, file)

with open("email_vectorizer.pkl", "wb") as file:
    pickle.dump(vectorizer, file)

print("✅ Email model trained with subject, sender, and email text!")
