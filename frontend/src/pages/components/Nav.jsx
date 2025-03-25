import React, { useEffect, useState } from "react";
import axios from "axios";

const Nav = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await axios.get(
          "http://localhost:3002/api/protected/dashboard",
          {
            withCredentials: true,
          }
        );
        console.log("Authenticated:", res.data);
        setIsAuthenticated(true);
      } catch (error) {
        console.log("Not authenticated:", error);
        setIsAuthenticated(false);
      }
    };

    checkAuth();
  }, []);

  return (
    <nav>
      <ul className="navbar">
        <div className="nav-left">
          <li className="nav-item">
            <a href="/" className="page-link">
              Home
            </a>
          </li>
          <li className="nav-item">
            <a href="/ranks" className="page-link">
              Ranking
            </a>
          </li>
          {isAuthenticated && (
            <li className="nav-item">
              <a href="/dashboard" className="page-link">
                Dashboard
              </a>
            </li>
          )}
        </div>
        {isAuthenticated ? (
          <div className="nav-right">
            <li className="nav-item logout-btn">
              <a href="/logout" className="logout-link">
                Log Out
              </a>
            </li>
          </div>
        ) : (
          <div className="nav-right">
            <li className="nav-item">
              <a href="/login" className="page-link">
                Login
              </a>
            </li>
          </div>
        )}
      </ul>
    </nav>
  );
};

export default Nav;
