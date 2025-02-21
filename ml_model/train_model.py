import pandas as pd
import pickle
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split

# Load dataset (Ensure the file exists in the correct location)
df = pd.read_csv("phishing_dataset.csv")

# Combine 'subject' and 'body' into a single 'text' column
df['text'] = df['subject'].fillna('') + " " + df['body'].fillna('')

# Keep only necessary columns
df = df[['text', 'label']]

# Verify the dataset structure
print("Dataset Sample:")
print(df.head())

# Split features and labels
X = df['text']
y = df['label']  # 0 for legitimate, 1 for phishing

# Convert text into numerical features using TF-IDF
vectorizer = TfidfVectorizer(stop_words="english", max_features=5000)
X_tfidf = vectorizer.fit_transform(X)

# Split into training and testing sets
X_train, X_test, y_train, y_test = train_test_split(X_tfidf, y, test_size=0.2, random_state=42)

# Train a Random Forest model
model = RandomForestClassifier(n_estimators=100, random_state=42)
model.fit(X_train, y_train)

# Save the trained model
with open("model.pkl", "wb") as file:
    pickle.dump(model, file)

# Save the vectorizer
with open("vectorizer.pkl", "wb") as file:
    pickle.dump(vectorizer, file)

print("✅ Model and vectorizer saved successfully!")
