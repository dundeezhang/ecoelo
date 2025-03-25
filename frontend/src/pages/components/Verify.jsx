import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSearchParams, useNavigate } from "react-router-dom";

const Verify = () => {
  const [message, setMessage] = useState("");
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const verifyMagicLink = async () => {
      const token = searchParams.get("token");
      const email = searchParams.get("email");

      if (!token || !email) {
        setMessage("Invalid or expired link.");
        return;
      }

      try {
        const res = await axios.get(
          `http://localhost:3002/api/auth/verify-magic-link?token=${token}&email=${email}`,
          { withCredentials: true },
        );
        setMessage("Login successful! Redirecting...");
        setTimeout(() => {
          navigate("/dashboard");
        }, 2000);
      } catch (error) {
        setMessage("Invalid or expired token.");
      }
    };

    verifyMagicLink();
  }, [searchParams, navigate]);

  return (
    <div className="flex items-center justify-center h-screen text-xl font-semibold">
      {message}
    </div>
  );
};

export default Verify;
