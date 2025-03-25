import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Logout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const logoutUser = async () => {
      try {
        // Call backend to clear the cookie
        await axios.post("http://localhost:3002/api/auth/logout", null, {
          withCredentials: true,
        });

        // Clear authToken from client-side just in case
        document.cookie =
          "authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

        // Redirect to login after logout
        navigate("/login");
      } catch (error) {
        console.error("Error logging out:", error);
      }
    };

    logoutUser();
  }, [navigate]);

  return (
    <div className="logout-container">
      <h2>Logging out...</h2>
    </div>
  );
};

export default Logout;
