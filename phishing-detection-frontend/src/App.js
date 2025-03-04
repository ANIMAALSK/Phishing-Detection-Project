import React, { useState } from "react";
import axios from "axios";
import { FaEnvelope, FaLink, FaSpinner, FaCheckCircle, FaTimesCircle, FaExclamationTriangle } from "react-icons/fa";

function App() {
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [sender, setSender] = useState("");
  const [url, setUrl] = useState("");
  const [result, setResult] = useState(null);
  const [activeTab, setActiveTab] = useState("email");
  const [loading, setLoading] = useState(false);

  const analyzeEmail = async () => {
    setLoading(true);
    try {
      const response = await axios.post("http://localhost:8000/analyze-email/", { sender_email:sender,subject: subject, email_text: email });
      setResult(response.data);
    } catch (error) {
      console.error("Error analyzing email:", error);
    } finally {
      setLoading(false);
    }
  };

  const analyzeUrl = async () => {
    setLoading(true);
    try {
      const response = await axios.post("http://localhost:8000/analyze-url/", { url });
      setResult(response.data);
    } catch (error) {
      console.error("Error analyzing URL:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <nav className="nav-menu">
        <button
          onClick={() => setActiveTab("email")}
          className={activeTab === "email" ? "active" : ""}
        >
          <FaEnvelope /> Email Analysis
        </button>
        <button
          onClick={() => setActiveTab("url")}
          className={activeTab === "url" ? "active" : ""}
        >
          <FaLink /> URL Analysis
        </button>
      </nav>

      <div className="content">
        <h2>Phishing Detection System</h2>
        {activeTab === "email" && (
          <div className="input-section">
             <input
              placeholder="Enter Sender"
              onChange={(e) => setSender(e.target.value)}
            />
            <input
              placeholder="Enter Subject"
              onChange={(e) => setSubject(e.target.value)}
            />
            <textarea
              placeholder="Enter Email Content"
              onChange={(e) => setEmail(e.target.value)}
            />
            <button onClick={analyzeEmail} disabled={loading}>
              {loading ? <FaSpinner className="spinner" /> : "Analyze Email"}
            </button>
          </div>
        )}
        {activeTab === "url" && (
          <div className="input-section">
            <input
              type="text"
              placeholder="Enter URL"
              onChange={(e) => setUrl(e.target.value)}
            />
            <button onClick={analyzeUrl} disabled={loading}>
              {loading ? <FaSpinner className="spinner" /> : "Analyze URL"}
            </button>
          </div>
        )}

        {result && (
          <div className="report-container">
            <h3>Analysis Report</h3>
            <table>
              <tbody>
                <tr>
                  <td>URL</td>
                  <td>{result.url}</td>
                </tr>
                <tr>
                  <td>Phishing Prediction</td>
                  <td className={result.phishing ? "high-risk" : "low-risk"}>
                    {result.phishing ? (
                    <>
                      <FaExclamationTriangle /> High Risk
                    </>
                    ) : (
                    <>
                      <FaCheckCircle /> Safe
                    </>
                    )}
                  </td>
                </tr>
                <tr>
                  <td>Phising Risk Percentage</td>
                  <td>{result.phishing_risk_score}%</td>
                </tr>
                <tr>
                  <td>Typosquatting Score</td>
                  <td>{result.typosquatting_score}%</td>
                </tr>
                <tr>
                  <td>Typosquatting Risk</td>
                  <td>{result.typosquatting_risk}</td>
                </tr>
                <tr>
                  <td>Suspicion Score</td>
                  <td>{result.suspicion_score}%</td>
                </tr>
                <tr>
                  <td>Domain Valid</td>
                  <td>
                    {result.domain_valid ? (
                    <>
                      <FaCheckCircle /> Yes
                    </>
                    ) : (
                      <>
                      <FaTimesCircle /> No
                      </>
                    )}
                  </td>
                </tr>
                <tr>
                  <td>SSL Certificate</td>
                  <td>
                    {result.ssl_valid ? (
                    <>
                      <FaCheckCircle /> Valid
                    </>
                    ) : (
                    <>
                      <FaTimesCircle /> Invalid
                    </>
                    )}
                  </td>
                </tr>
                <tr>
                  <td>Domain Age</td>
                  <td>{result.domain_age} days</td>
                </tr>
                <tr>
                  <td>Hosting Country</td>
                  <td>{result.hosting_country}</td>
                </tr>
                <tr>
                  <td>WHOIS Registered</td>
                  <td>
                    {result.whois_registered ? (
                    <>
                      <FaCheckCircle /> Yes
                    </>
                  ) : (
                    <>
                      <FaTimesCircle /> No
                    </>
                  )}
                  </td>
                </tr>
                <tr>
                  <td>Blacklisted</td>
                  <td>
                    {result.blacklisted ? (
                      <>
                        <FaTimesCircle /> Yes ) 
                      </>
                    ) : (
                      <>
                      <FaCheckCircle /> No 
                      </>
                    )} 
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>

      <style jsx>{`
        .app-container {
          font-family: "Segoe UI", Arial, sans-serif;
          max-width: 900px;
          margin: auto;
          padding: 20px;
          background-color: #f5f5f5;
          color: #333;
          border-radius: 10px;
          box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
        }
        .nav-menu {
          display: flex;
          justify-content: center;
          gap: 10px;
          margin-bottom: 20px;
        }
        .nav-menu button {
          padding: 10px 15px;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          background: #007bff;
          color: white;
          font-size: 16px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .nav-menu .active {
          background: #0056b3;
        }
        .content {
          text-align: center;
        }
        .input-section {
          margin-bottom: 20px;
        }
        .input-section input,
        .input-section textarea {
          width: 60%;
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 5px;
          background-color: white;
          color: #333;
          font-size: 14px;
        }
        .input-section textarea {
          height: 120px;
        }
        .input-section button {
          padding: 10px 15px;
          background: #007bff;
          border: none;
          color: white;
          border-radius: 5px;
          cursor: pointer;
          font-size: 14px;
          display: flex;
          align-items: center;
          gap: 8px;
          margin: 10px auto;
        }
        .input-section button:disabled {
          background: #ccc;
          cursor: not-allowed;
        }
        .spinner {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
        .report-container {
          margin-top: 20px;
          background: white;
          padding: 20px;
          border-radius: 10px;
          box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.1);
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 10px;
        }
        table td {
          padding: 12px;
          border-bottom: 1px solid #ddd;
          text-align: left;
        }
        table td:first-child {
          font-weight: bold;
          width: 40%;
        }
        .high-risk {
          color: #ff4c4c;
        }
        .low-risk {
          color: #4caf50;
        }
      `}</style>
    </div>
  );
}

export default App;