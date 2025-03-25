import React, { useEffect, useState } from "react";
import axios from "axios";
import Nav from "./Nav";
import Background from "./Background";

const Activity = () => {
  const [history, setHistory] = useState([]);
  const [elo, setElo] = useState(null); // State to hold elo rating
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch the user's history and elo from the API
    const fetchHistory = async () => {
      try {
        const response = await axios.get(
          "http://localhost:3001/api/user/history", // Adjust the endpoint as needed
          { withCredentials: true }, // Include credentials if necessary
        );

        console.log("Response data:", response.data); // Debug log

        // Get history and elo from response
        let userHistory = response.data.history;
        const userElo = response.data.elo;

        // Parse history if it is a JSON string
        if (typeof userHistory === "string") {
          userHistory = JSON.parse(userHistory);
        }
        console.log("User history:", userHistory); // Debug log

        // Ensure we have an array
        userHistory = Array.isArray(userHistory) ? userHistory : [];

        // Update state with the reversed history (if needed)
        setHistory(userHistory.reverse());
        setElo(userElo); // Save the elo value
        setLoading(false);
      } catch (err) {
        setError(err);
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <>
      <Nav />
      <div className="container">
        <h3>ELO: {elo !== null ? elo : "N/A"}</h3>
        <h1>Activity</h1>
        {history.length === 0 ? (
          <p>No activity history available.</p>
        ) : (
          <ul className="activity-list">
            {history.map((entry, index) => (
              <li key={index}>
                <strong>Date:</strong>{" "}
                {new Date(entry.date).toLocaleDateString()} -{" "}
                <strong>Points Gained:</strong> {entry.score}
              </li>
            ))}
          </ul>
        )}
      </div>
      <Background />
    </>
  );
};

export default Activity;
