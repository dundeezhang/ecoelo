import React, { useEffect, useState } from "react";
import axios from "axios";
import Nav from "./components/Nav";
import Background from "./components/Background";

const Three = () => {
  const [message, setMessage] = useState("");

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await axios.get(
          "http://localhost:3002/api/protected/dashboard",
          {
            withCredentials: true,
          },
        );
        setMessage(res.data.message);
      } catch (error) {
        setMessage("Unauthorized. Please log in.");
      }
    };

    checkAuth();
  }, []);

  return (
    <div>
      <Nav />
      <h1>Test Page</h1>
      <p>{message}</p>
      <Background />
    </div>
  );
};

export default Three;
