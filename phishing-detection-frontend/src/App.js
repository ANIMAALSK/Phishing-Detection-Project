import React, { useState } from "react";
import axios from "axios";
import { FaEnvelope, FaLink, FaSpinner, FaCheckCircle, FaTimesCircle, FaExclamationTriangle, FaShieldAlt, FaLock, FaInfoCircle } from "react-icons/fa";
import CountryMap from "./components/CountryMap";

function App() {
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [sender, setSender] = useState("");
  const [url, setUrl] = useState("");
  const [result, setResult] = useState(null);
  const [activeTab, setActiveTab] = useState("email");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const analyzeEmail = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post("http://localhost:8000/analyze-email/", { 
        sender_email: sender,
        subject: subject, 
        email_text: email 
      });
      setResult(response.data);
    } catch (error) {
      console.error("Error analyzing email:", error);
      setError("Failed to analyze email. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const analyzeUrl = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post("http://localhost:8000/analyze-url/", { url });
      setResult(response.data);
    } catch (error) {
      console.error("Error analyzing URL:", error);
      setError("Failed to analyze URL. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getRiskLevelClass = (score) => {
    if (score >= 80) return "critical-risk";
    if (score >= 60) return "high-risk";
    if (score >= 40) return "medium-risk";
    if (score >= 20) return "low-risk";
    return "safe";
  };

  // const getRiskLevelText = (score) => {
  //   if (score >= 80) return "Critical Risk";
  //   if (score >= 60) return "High Risk";
  //   if (score >= 40) return "Medium Risk";
  //   if (score >= 20) return "Low Risk";
  //   return "Safe";
  // };

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="logo">
          <FaShieldAlt size={28} />
          <h1>Phishing Detection System</h1>
        </div>
      </header>

      <nav className="nav-menu">
        <button
          onClick={() => {
            setActiveTab("email");
            setResult(null);
          }}
          className={activeTab === "email" ? "active" : ""}
        >
          <FaEnvelope /> Email Analysis
        </button>
        <button
          onClick={() => {
            setActiveTab("url");
            setResult(null);
          }}
          className={activeTab === "url" ? "active" : ""}
        >
          <FaLink /> URL Analysis
        </button>
      </nav>

      <div className="content">
        {activeTab === "email" ? (
          <div className="input-card">
            <div className="card-header">
              <FaEnvelope />
              <h2>Email Analysis</h2>
            </div>
            <div className="card-body">
              <div className="input-group">
                <label htmlFor="sender">Sender Email</label>
                <input
                  id="sender"
                  type="email"
                  placeholder="e.g. sender@example.com"
                  value={sender}
                  onChange={(e) => setSender(e.target.value)}
                />
              </div>
              <div className="input-group">
                <label htmlFor="subject">Email Subject</label>
                <input
                  id="subject"
                  type="text"
                  placeholder="e.g. Urgent: Your Account Needs Verification"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
              </div>
              <div className="input-group">
                <label htmlFor="email-content">Email Content</label>
                <textarea
                  id="email-content"
                  placeholder="Paste the email content here..."
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <button 
                className="analyze-btn" 
                onClick={analyzeEmail} 
                disabled={loading || !sender || !subject || !email}
              >
                {loading ? <><FaSpinner className="spinner" /> Analyzing...</> : "Analyze Email"}
              </button>
            </div>
          </div>
        ) : (
          <div className="input-card">
            <div className="card-header">
              <FaLink />
              <h2>URL Analysis</h2>
            </div>
            <div className="card-body">
              <div className="input-group">
                <label htmlFor="url">URL to Analyze</label>
                <input
                  id="url"
                  type="text"
                  placeholder="e.g. https://example.com"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                />
              </div>
              <button 
                className="analyze-btn" 
                onClick={analyzeUrl} 
                disabled={loading || !url}
              >
                {loading ? <><FaSpinner className="spinner" /> Analyzing...</> : "Analyze URL"}
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="error-message">
            <FaExclamationTriangle /> {error}
          </div>
        )}

        {result && (
          <div className="report-container">
            <div className="report-header">
              <FaInfoCircle size={24} />
              <h2>Analysis Report</h2>
            </div>
            
            {result.phishing !== undefined && (
              <div className={`risk-indicator ${result.phishing ? "high-risk" : "safe"}`}>
                {result.phishing ? (
                  <>
                    <FaExclamationTriangle size={28} /> 
                    <div>
                      <h3>High Risk Detected</h3>
                      <p>This content shows signs of phishing activity.</p>
                    </div>
                  </>
                ) : (
                  <>
                    <FaCheckCircle size={28} />
                    <div>
                      <h3>Low Risk Detected</h3>
                      <p>No obvious phishing indicators found.</p>
                    </div>
                  </>
                )}
              </div>
            )}
            
            <div className="report-grid">
              {result.url && (
                <div className="report-item">
                  <span className="item-label">URL</span>
                  <span className="item-value url-value">{result.url}</span>
                </div>
              )}
              
              {result.phishing_risk_score !== undefined && (
                <div className="report-item">
                  <span className="item-label">Phishing Risk Score</span>
                  <div className="progress-container">
                    <div 
                      className={`progress-bar ${getRiskLevelClass(result.phishing_risk_score)}`}
                      style={{ width: `${result.phishing_risk_score}%` }}
                    >
                    </div>
                    <span className="tooltip">{result.phishing_risk_score}%</span>
                  </div>
                </div>
              )}
              
              {result.typosquatting_score !== undefined && (
                <div className="report-item">
                  <span className="item-label">Typosquatting Score</span>
                  <div className="progress-container">
                    <div 
                      className={`progress-bar ${getRiskLevelClass(result.typosquatting_score)}`}
                      style={{ width: `${result.typosquatting_score}%` }}
                    >
                    </div>
                    <span className="tooltip">{result.typosquatting_score}%</span>
                  </div>
                </div>
              )}
              
              {result.typosquatting_risk && (
                <div className="report-item">
                  <span className="item-label">Typosquatting Risk</span>
                  <span className="item-value">{result.typosquatting_risk}</span>
                </div>
              )}
              
              {result.suspicion_score !== undefined && (
                <div className="report-item">
                  <span className="item-label">Suspicion Score</span>
                  <div className="progress-container">
                    <div 
                      className={`progress-bar ${getRiskLevelClass(result.suspicion_score)}`}
                      style={{ width: `${result.suspicion_score}%` }}
                    >
                    </div>
                    <span className="tooltip">{result.suspicion_score}%</span>
                  </div>
                </div>
              )}
              
              {result.domain_valid !== undefined && (
                <div className="report-item">
                  <span className="item-label">Domain Valid</span>
                  <span className={`item-value ${result.domain_valid ? "valid" : "invalid"}`}>
                    {result.domain_valid ? (
                      <><FaCheckCircle /> Valid</>
                    ) : (
                      <><FaTimesCircle /> Invalid</>
                    )}
                  </span>
                </div>
              )}
              
              {result.ssl_valid !== undefined && (
                <div className="report-item">
                  <span className="item-label">SSL Certificate</span>
                  <span className={`item-value ${result.ssl_valid ? "valid" : "invalid"}`}>
                    {result.ssl_valid ? (
                      <><FaLock /> Valid</>
                    ) : (
                      <><FaTimesCircle /> Invalid</>
                    )}
                  </span>
                </div>
              )}
              
              {result.domain_age !== undefined && (
                <div className="report-item">
                  <span className="item-label">Domain Age</span>
                  <span className="item-value">
                    {result.domain_age}
                    {result.domain_age < 30 && (
                      <span className="warning-tag">New Domain</span>
                    )}
                  </span>
                </div>
              )}
              
              {result.whois_registered !== undefined && (
                <div className="report-item">
                  <span className="item-label">WHOIS Registered</span>
                  <span className={`item-value ${result.whois_registered ? "valid" : "invalid"}`}>
                    {result.whois_registered ? (
                      <><FaCheckCircle /> Yes</>
                    ) : (
                      <><FaTimesCircle /> No</>
                    )}
                  </span>
                </div>
              )}

              {result.hosting_country && (
                <div className="report-item">
                  <span className="item-label">Hosting Country</span>
                  <CountryMap country={result.hosting_country} />
                </div>
              )}
              
              
              {result.time_taken !== undefined && (
                <div className="report-item">
                  <span className="item-label">Time taken</span>
                    <span className="item-value">{result.time_taken} seconds</span>
                </div>
              )}
                
                {result.no_of_redirects !== undefined && (
                <div className="report-item">
                  <span className="item-label">No of Redirects</span>
                    <span className="item-value">{result.no_of_redirects}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <footer className="app-footer">
        <p> {new Date().getFullYear()} Phishing Detection System</p>
      </footer>

      <style jsx>{`
        .app-container {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
          max-width: 1200px;
          margin: 0 auto;
          background-color: #f8fafc;
          color: #334155;
          border-radius: 12px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
          overflow: hidden;
        }
        
        .app-header {
          background: linear-gradient(135deg, #1e3a8a, #3b82f6);
          padding: 20px;
          text-align: center;
          color: white;
        }
        
        .logo {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
        }
        
        .logo h1 {
          margin: 0;
          font-size: 24px;
          font-weight: 700;
        }
        
        .nav-menu {
          display: flex;
          background-color: #ffffff;
          border-bottom: 1px solid #e2e8f0;
          padding: 0 16px;
        }
        
        .nav-menu button {
          padding: 16px 24px;
          background: transparent;
          border: none;
          border-bottom: 3px solid transparent;
          cursor: pointer;
          font-size: 16px;
          font-weight: 600;
          color: #64748b;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.2s ease;
        }
        
        .nav-menu button:hover {
          color: #3b82f6;
        }
        
        .nav-menu button.active {
          color: #3b82f6;
          border-bottom: 3px solid #3b82f6;
        }
        
        .content {
          padding: 24px;
        }
        
        .input-card {
          background-color: #ffffff;
          border-radius: 12px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
          overflow: hidden;
          margin-bottom: 24px;
        }
        
        .card-header {
          background-color: #f1f5f9;
          padding: 16px 24px;
          border-bottom: 1px solid #e2e8f0;
          display: flex;
          align-items: center;
          gap: 12px;
        }
        
        .card-header h2 {
          margin: 0;
          font-size: 18px;
          font-weight: 600;
        }
        
        .card-body {
          padding: 24px;
        }
        
        .input-group {
          margin-bottom: 20px;
        }
        
        .input-group label {
          display: block;
          margin-bottom: 8px;
          font-weight: 500;
          color: #475569;
        }
        
        .input-group input,
        .input-group textarea {
          width: 100%;
          padding: 12px 16px;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          font-size: 16px;
          color: #334155;
          background-color: #ffffff;
          transition: border-color 0.2s ease;
        }
        
        .input-group input:focus,
        .input-group textarea:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }
        
        .input-group textarea {
          height: 150px;
          resize: vertical;
        }
        
        .analyze-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          background-color: #3b82f6;
          color: white;
          border: none;
          border-radius: 8px;
          padding: 12px 24px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: background-color 0.2s ease;
          width: 100%;
          margin-top: 8px;
        }
        
        .analyze-btn:hover {
          background-color: #2563eb;
        }
        
        .analyze-btn:disabled {
          background-color: #cbd5e1;
          cursor: not-allowed;
        }
        
        .spinner {
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .error-message {
          background-color: #fee2e2;
          color: #b91c1c;
          padding: 12px 16px;
          border-radius: 8px;
          margin-bottom: 24px;
          display: flex;
          align-items: center;
          gap: 12px;
        }
        
        .report-container {
          background-color: #ffffff;
          border-radius: 12px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
          overflow: hidden;
          margin-top: 24px;
        }
        
        .report-header {
          background-color: #f8fafc;
          padding: 16px 24px;
          border-bottom: 1px solid #e2e8f0;
          display: flex;
          align-items: center;
          gap: 12px;
        }
        
        .report-header h2 {
          margin: 0;
          font-size: 20px;
          font-weight: 600;
        }
        
        .risk-indicator {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 16px 24px;
          border-bottom: 1px solid #e2e8f0;
        }
        
        .risk-indicator h3 {
          margin: 0 0 4px 0;
          font-size: 16px;
          font-weight: 600;
        }
        
        .risk-indicator p {
          margin: 0;
          font-size: 14px;
        }
        
        .risk-indicator.high-risk {
          background-color: #fef2f2;
          color: #b91c1c;
        }
        
        .risk-indicator.safe {
          background-color: #f0fdf4;
          color: #15803d;
        }
        
        .report-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 16px;
          padding: 24px;
        }
        
        .report-item {
          padding: 16px;
          background-color: #f8fafc;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
        }
        
        .item-label {
          display: block;
          font-size: 14px;
          font-weight: 500;
          color: #64748b;
          margin-bottom: 8px;
        }
        
        .item-value {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 16px;
          font-weight: 600;
        }
        
        .url-value {
          word-break: break-all;
        }
        
        .valid {
          color: #15803d;
        }
        
        .invalid {
          color: #b91c1c;
        }
        
        .progress-container {
          height: 8px;
          background-color: #e2e8f0;
          border-radius: 4px;
          position: relative;
          margin-top: 8px;
          overflow: visible;
        }
        
        .progress-bar {
          height: 100%;
          position: absolute;
          left: 0;
          top: 0;
          border-radius: 4px;
          transition: width 0.5s ease;
        }
        
        .progress-bar.critical-risk {
          background-color: #dc2626;
        }
        
        .progress-bar.high-risk {
          background-color: #ea580c;
        }
        
        .progress-bar.medium-risk {
          background-color: #eab308;
        }
        
        .progress-bar.low-risk {
          background-color: #84cc16;
        }
        
        .progress-bar.safe {
          background-color: #10b981;
        }
        
        .progress-text {
          position: absolute;
          right: 0;
          top: 12px;
          font-size: 14px;
          font-weight: 600;
        }
        .tooltip {
          position: absolute;
          top: -30px;
          left: 50%;
          transform: translateX(-50%);
          background-color: #3b82f6;
          color: white;
          padding: 5px 8px;
          font-size: 12px;
          border-radius: 4px;
          opacity: 0;
          transition: opacity 0.3s ease-in-out;
          white-space: nowrap;
          pointer-events: none;
        }

        .progress-bar:hover .tooltip {
          opacity: 1;
        }

        .progress-container:hover .tooltip {
          opacity: 1;
        }
        
        .warning-tag {
          display: inline-block;
          background-color: #fef3c7;
          color: #b45309;
          font-size: 12px;
          font-weight: 600;
          padding: 2px 8px;
          border-radius: 4px;
          margin-left: 8px;
        }
        
        .app-footer {
          background-color: #f1f5f9;
          padding: 16px;
          text-align: center;
          border-top: 1px solid #e2e8f0;
        }
        
        .app-footer p {
          margin: 0;
          font-size: 14px;
          color: #64748b;
        }
        
        @media (max-width: 768px) {
          .report-grid {
            grid-template-columns: 1fr;
          }
          
          .nav-menu button {
            padding: 12px 16px;
            font-size: 14px;
          }
        }
      `}</style>
    </div>
  );
}

export default App;