import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import "../../css/Login.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await axios.get(
          "http://localhost:3002/api/protected/dashboard",
          { withCredentials: true }
        );
        if (res.status === 200) {
          navigate("/dashboard");
        }
      } catch (error) {
        console.log("User not authenticated:", error);
      }
    };
    checkAuth();
  }, [navigate]);

  const sendMagicLink = async (e) => {
    e.preventDefault();
    setMessage("");
    
    if (!email.trim()) {
      setMessage("Please enter your email address");
      return;
    }
    
    setIsSubmitting(true);
    try {
      await axios.post(
        "http://localhost:3002/api/auth/send-magic-link",
        { email },
        { withCredentials: true }
      );
      setMessage("Magic link sent! Check your email.");
    } catch (error) {
      setMessage("Error sending magic link. Please try again.");
      console.error("Error sending magic link:", error);
    }
    setIsSubmitting(false);
  };

  return (
    <div className="login-container">
      <motion.div 
        className="login-card"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.h2 
          className="login-header"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          Login with Magic Link
        </motion.h2>
        
        <form className="login-form" onSubmit={sendMagicLink}>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="login-input"
              required
            />
          </motion.div>
          
          <motion.button 
            type="submit" 
            className="login-button"
            disabled={isSubmitting}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isSubmitting ? "Processing..." : "Send Magic Link"}
          </motion.button>
        </form>
        
        {message && (
          <motion.p 
            className="login-message"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {message}
          </motion.p>
        )}
      </motion.div>
    </div>
  );
};

export default Login;
