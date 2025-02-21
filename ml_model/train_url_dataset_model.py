import pandas as pd
import pickle
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split

df = pd.read_csv("url_dataset.csv") # Reads the "url_dataset.csv" file and loads its contents into a Pandas DataFrame for further processing.

df = df[['url', 'type']]

print("Dataset Sample:")
print(df.head())

X = df['url']
y = df['type']

vectorizer = TfidfVectorizer(stop_words="english", max_features=5000)
X_tfidf = vectorizer.fit_transform(X)

X_train, X_test, y_train, y_test = train_test_split(X_tfidf, y, test_size=0.2, random_state=42)

model = RandomForestClassifier(n_estimators=100, random_state=42)
model.fit(X_train, y_train)

# Save the trained model
with open("url_model.pkl", "wb") as file:
    pickle.dump(model, file)

# Save the vectorizer
with open("url_vectorizer.pkl", "wb") as file:
    pickle.dump(vectorizer, file)

print("URL Model and vectorizer saved successfully!")
