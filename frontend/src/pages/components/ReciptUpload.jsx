import React, { useEffect, useState } from "react";
import axios from "axios";
import Nav from "./Nav";
import Background from "./Background";
import { extractTextFromImage, analyzeReceiptData, updateUserElo } from "../../api/ai";

const ReceiptUpload = () => {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [extractedData, setExtractedData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [authMessage, setAuthMessage] = useState("");
  const [userEmail, setUserEmail] = useState(null);

  // Check user authentication on component load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await axios.get(
          "http://localhost:3002/api/protected/dashboard",
          {
            withCredentials: true, // Send cookies for authentication
          },
        );
        
        console.log("Auth check response:", res.data);
        setAuthMessage(res.data.message);
        
        // Get user details including email
        if (res.data.user && res.data.user.email) {
          console.log("Setting user email:", res.data.user.email);
          setUserEmail(res.data.user.email);
        } else if (res.data.email) {
          // Some APIs return email directly
          console.log("Setting user email from direct property:", res.data.email);
          setUserEmail(res.data.email);
        } else {
          console.warn("No user email found in auth response. Checking if we can extract from welcome message");
          
          // If it's in format "Welcome back, email@example.com!"
          const welcomeMatch = res.data.message && res.data.message.match(/Welcome back, ([^!]+)!/);
          if (welcomeMatch && welcomeMatch[1]) {
            const extractedEmail = welcomeMatch[1].trim();
            console.log("Setting email extracted from welcome message:", extractedEmail);
            setUserEmail(extractedEmail);
          } else {
            console.warn("No user email found in auth response:", res.data);
          }
        }
      } catch (error) {
        console.error("Auth check error:", error);
        setAuthMessage("Unauthorized. Please log in.");
      }
    };

    checkAuth();
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
      setErrorMessage(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!image) {
      setErrorMessage("Please select a receipt image first");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      // Step 1: Extract text from the receipt image using Claude Vision
      console.log("Processing receipt image...");
      console.log(
        "Image size:",
        Math.round(image.size / 1024),
        "KB",
        "Type:",
        image.type,
      );

      const extractionResult = await extractTextFromImage(image);

      if (!extractionResult.success) {
        throw new Error(
          extractionResult.error || "Failed to extract text from image",
        );
      }

      const extractedText = extractionResult.text;
      console.log("Extracted text:", extractedText);

      if (!extractedText || extractedText.trim().length < 10) {
        throw new Error(
          "Could not extract enough text from the receipt image. Please try a clearer image.",
        );
      }

      // Step 2: Analyze the extracted text with Claude
      console.log("Analyzing receipt text...");
      const analysisResult = await analyzeReceiptData(extractedText);

      if (!analysisResult.success) {
        throw new Error(
          analysisResult.error || "Failed to analyze receipt data",
        );
      }

      console.log("Analysis result:", analysisResult.data);

      // Validate the structure of the returned data
      const data = analysisResult.data;
      if (!data.storeName || !data.items || !data.greenScore) {
        throw new Error(
          "The analysis returned incomplete data. Please try again with a clearer image.",
        );
      }

      // Set the extracted data to display in the UI
      setExtractedData(analysisResult.data);
      
      // Update user's ELO if the user is logged in
      if (userEmail && analysisResult.data.greenScore && analysisResult.data.greenScore.totalScore) {
        try {
          const totalScore = analysisResult.data.greenScore.totalScore;
          console.log("Updating user ELO with:", {
            email: userEmail,
            totalScore: totalScore
          });
          
          // Make sure we have a valid score
          if (typeof totalScore !== 'number' || isNaN(totalScore)) {
            console.error("Invalid green score, not a number:", totalScore);
          } else {
            const eloResult = await updateUserElo(
              userEmail, 
              totalScore
            );
            
            if (eloResult.success) {
              console.log("User ELO updated successfully:", eloResult.user.elo);
              // Could show a success message or update UI if needed
            } else {
              console.error("Failed to update user ELO:", eloResult.error);
            }
          }
        } catch (eloError) {
          console.error("Error updating user ELO:", eloError);
        }
      } else {
        console.warn("Cannot update ELO: missing data:", {
          userEmail,
          greenScore: analysisResult.data.greenScore?.totalScore
        });
      }
    } catch (error) {
      console.error("Error processing receipt:", error);
      setErrorMessage(
        error.message ||
          "An error occurred while processing the receipt. Please try again with a clearer image.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setImage(null);
    setPreview(null);
    setExtractedData(null);
    setErrorMessage(null);
  };

  // Show login message if unauthorized
  if (authMessage === "Unauthorized. Please log in.") {
    return (
      <div>
        <Nav />
        <h1>Green Receipt Analyzer</h1>
        <h2>{authMessage}</h2>
        <p>
          Click <a href="/login">here</a> to login.
        </p>
        <Background />
      </div>
    );
  }

  return (
    <>
      <Nav />
      <div className="container">
        <h1>Green Receipt Analyzer</h1>
        <p className="description">
          Upload your receipt to see how environmentally friendly your purchase
          was.
        </p>


        {errorMessage && (
          <div
            style={{
              backgroundColor: "#fee2e2",
              borderColor: "#f87171",
              color: "#b91c1c",
              padding: "0.75rem",
              borderRadius: "0.25rem",
              marginBottom: "1rem",
            }}
          >
            {errorMessage}
          </div>
        )}

        {!extractedData ? (
          <div className="upload-section">
            <form onSubmit={handleSubmit}>
              <div className="file-input-container">
                <label htmlFor="receipt-upload" className="file-input-label">
                  {preview ? "Change Image" : "Upload Receipt"}
                </label>
                <input
                  type="file"
                  id="receipt-upload"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="file-input"
                />
              </div>

              {preview && (
                <div className="preview-container">
                  <img
                    src={preview}
                    alt="Receipt preview"
                    className="preview-image"
                  />
                  <button
                    type="submit"
                    className="submit-button"
                    disabled={isLoading}
                  >
                    {isLoading ? "Processing..." : "Analyze Receipt"}
                  </button>
                </div>
              )}
            </form>
          </div>
        ) : (
          <div className="results-section">
            <h2>Receipt Analysis Results</h2>

            <div className="receipt-data">
              <div className="data-group">
                <h3>Store Information</h3>
                <p>
                  <strong>Store Name:</strong> {extractedData.storeName}
                </p>
                <p>
                  <strong>Date:</strong> {extractedData.date}
                </p>
                <p>
                  <strong>Time:</strong> {extractedData.time}
                </p>
                <p>
                  <strong>Eco-Friendly Store:</strong>{" "}
                  {extractedData.isStoreGreen ? "Yes" : "No"}
                </p>
                <p>
                  <strong>Total Purchase:</strong> $
                  {extractedData.totalPrice.toFixed(2)}
                </p>
              </div>

              <div className="data-group">
                <h3>Items Purchased</h3>
                <table className="items-table">
                  <thead>
                    <tr>
                      <th>Item</th>
                      <th>Price</th>
                      <th>Green Rating</th>
                    </tr>
                  </thead>
                  <tbody>
                    {extractedData.items.map((item, index) => (
                      <tr key={index}>
                        <td>{item.name}</td>
                        <td>${item.price.toFixed(2)}</td>
                        <td>
                          <span className="green-indicator">
                            {Array(5)
                              .fill("●")
                              .map((dot, i) => (
                                <span
                                  key={i}
                                  className={
                                    i < item.greenRating ? "filled" : ""
                                  }
                                >
                                  {dot}
                                </span>
                              ))}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="green-score">
                <h3>Your Green Score</h3>
                <div className="score-display">
                  <div className="score-number">
                    {extractedData.greenScore.totalScore}
                  </div>
                  <div className="score-label">points</div>
                </div>
                <p className="score-message">
                  {extractedData.greenScore.message}
                </p>
                <ul className="score-breakdown">
                  {extractedData.greenScore.breakdown.map((item, index) => (
                    <li key={index}>
                      <span>{item.category}:</span> {item.points} points
                    </li>
                  ))}
                </ul>
              </div>

              <button onClick={resetForm} className="reset-button">
                Analyze Another Receipt
              </button>
            </div>
          </div>
        )}
      </div>
      <Background />
    </>
  );
};

export default ReceiptUpload;
