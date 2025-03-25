import React, { useEffect, useState } from "react";
import axios from "axios";
import Nav from "./components/Nav";
import Background from "./components/Background";
import { motion, AnimatePresence } from "framer-motion";

const Dashboard = () => {
  const [authMessage, setAuthMessage] = useState("");
  const [eloPoints, setEloPoints] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAuthMessage, setShowAuthMessage] = useState(false);

  useEffect(() => {
    const fetchEloPoints = async () => {
      try {
        const res = await axios.get("http://localhost:3002/api/protected/dashboard", {
          withCredentials: true,
        });
        console.log("API Response:", res.data);
        
        setAuthMessage(res.data.message);
        setEloPoints(res.data.elo);
        setLoading(false);
      } catch (err) {
        console.error("Dashboard API error:", err);
        setAuthMessage("Unauthorized. Please log in.");
        setError(err);
        setLoading(false);
      }
    };

    fetchEloPoints();
  }, []);

  useEffect(() => {
    if (authMessage) {
      setShowAuthMessage(true);
      const timer = setTimeout(() => {
        setShowAuthMessage(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [authMessage]);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-icon">⚠️</div>
        <h2>Oops! Something went wrong</h2>
        <p>{error.message}</p>
        <button onClick={() => window.location.reload()} className="retry-button">
          Try Again
        </button>
      </div>
    );
  }

  if (authMessage === "Unauthorized. Please log in.") {
    return (
      <>
        <Nav />
        <div className="container auth-required">
          <div className="auth-card">
            <h1>Dashboard Access</h1>
            <div className="auth-message">
              <i className="lock-icon">🔒</i>
              <h2>{authMessage}</h2>
            </div>
            <p>Please sign in to access your personal dashboard</p>
            <a href="/login" className="login-button">Sign In</a>
          </div>
        </div>
        <Background />
      </>
    );
  }

  return (
    <>
      <Nav />
      <div className="container dashboard">
        <header className="dashboard-header">
          <h1>Welcome Back!</h1>
          <div className="elo-badge">
            <span className="elo-label">ELO</span>
            <span className="elo-value">{eloPoints !== null ? eloPoints : 'N/A'}</span>
          </div>
        </header>
        
        <section className="dashboard-content">
          <h2>Quick Actions</h2>
          <div className="quick-links">
            <a href="/receipt" className="quick-link">
              <span className="quick-link-icon">📄</span>
              <span className="quick-link-text">Upload Receipt</span>
            </a>
            <a href="/activity" className="quick-link">
              <span className="quick-link-icon">📊</span>
              <span className="quick-link-text">View Activity</span>
            </a>
          </div>
        </section>
      </div>
      
      <div className="notification-wrapper">
        <AnimatePresence>
          {showAuthMessage && authMessage && (
            <motion.div 
              className="notification success-notification"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
            >
              <span className="notification-icon">✓</span>
              {authMessage}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      <Background />
      
      <style jsx>{`
        .notification-wrapper {
          position: fixed;
          bottom: 20px;
          right: 20px;
          z-index: 1000;
        }
        .success-notification {
          background:rgb(96, 194, 99);
          color: white;
          padding: 10px 20px;
          border-radius: 8px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          display: flex;
          align-items: center;
        }
        .notification-icon {
          margin-right: 8px;
        }
      `}</style>
    </>
  );
};

export default Dashboard;
