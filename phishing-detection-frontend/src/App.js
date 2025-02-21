import React, { useState } from "react";
import axios from "axios";

function App() {
  const [email, setEmail] = useState("");
  const [url, setUrl] = useState("");
  const [result, setResult] = useState("");
  const [activeTab, setActiveTab] = useState("email"); // State to manage active tab

  const analyzeEmail = async () => {
    const response = await axios.post("http://localhost:8000/analyze-email/", { email_text: email });
    setResult(response.data.prediction);
  };

  const analyzeUrl = async () => {
    const response = await axios.post("http://localhost:8000/analyze-url/", { url: url });
    setResult(response.data.prediction);
  };

  return (
    <div style={styles.container}>
      {/* Navigation Menu */}
      <div style={styles.navMenu}>
        <button
          onClick={() => setActiveTab("email")}
          style={activeTab === "email" ? styles.activeNavButton : styles.navButton}
        >
          Email Analysis
        </button>
        <button
          onClick={() => setActiveTab("url")}
          style={activeTab === "url" ? styles.activeNavButton : styles.navButton}
        >
          URL Analysis
        </button>
      </div>

      {/* Main Content */}
      <div style={styles.content}>
        <h2 style={styles.title}>Phishing Detection System</h2>

        {/* Email Tab */}
        {activeTab === "email" && (
          <div style={styles.tabContent}>
            <textarea
              placeholder="Enter Email Content"
              onChange={(e) => setEmail(e.target.value)}
              style={styles.textarea}
            />
            <button onClick={analyzeEmail} style={styles.button}>
              Analyze Email
            </button>
          </div>
        )}

        {/* URL Tab */}
        {activeTab === "url" && (
          <div style={styles.tabContent}>
            <input
              type="text"
              placeholder="Enter URL"
              onChange={(e) => setUrl(e.target.value)}
              style={styles.input}
            />
            <button onClick={analyzeUrl} style={styles.button}>
              Analyze URL
            </button>
          </div>
        )}

        {/* Result Display */}
        <h3 style={styles.result}>Result: {result}</h3>
      </div>
    </div>
  );
}

export default App;

const styles = {
  container: {
    display: "flex",
    fontFamily: "Arial, sans-serif",
    maxWidth: "800px",
    margin: "0 auto",
    padding: "20px",
    backgroundColor: "#f9f9f9",
    borderRadius: "10px",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
  },
  navMenu: {
    display: "flex",
    flexDirection: "column",
    width: "150px",
    marginRight: "20px",
  },
  navButton: {
    padding: "10px",
    marginBottom: "10px",
    backgroundColor: "#007bff",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    fontSize: "16px",
    textAlign: "left",
  },
  activeNavButton: {
    padding: "10px",
    marginBottom: "10px",
    backgroundColor: "#0056b3",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    fontSize: "16px",
    textAlign: "left",
  },
  content: {
    flex: 1,
    textAlign: "center",
  },
  title: {
    color: "#333",
    marginBottom: "20px",
  },
  tabContent: {
    marginBottom: "20px",
  },
  input: {
    width: "70%",
    padding: "10px",
    marginRight: "10px",
    border: "1px solid #ccc",
    borderRadius: "5px",
    fontSize: "16px",
  },
  textarea: {
    width: "70%",
    padding: "10px",
    marginRight: "10px",
    border: "1px solid #ccc",
    borderRadius: "5px",
    fontSize: "16px",
    height: "150px",
    resize: "vertical",
  },
  button: {
    padding: "10px 20px",
    backgroundColor: "#007bff",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    fontSize: "16px",
  },
  result: {
    marginTop: "20px",
    color: "#28a745",
    fontSize: "18px",
  },
};