// API functions to interact with our backend server
// Backend handles the Claude API calls to avoid CORS issues

// Base URL for backend API
const API_BASE_URL = 'http://localhost:3001/api';
const AUTH_API_BASE_URL = 'http://localhost:3002/api'; 
// The backend servers are on different ports

// Function to extract text from receipt image
export async function extractTextFromImage(imageFile) {
  try {
    console.log("Sending image to backend for processing:", imageFile.name);
    
    // Create a FormData object to send the image
    const formData = new FormData();
    formData.append('receipt', imageFile);
    
    // Call our backend API to extract text from the image
    const response = await fetch(`${API_BASE_URL}/extract-receipt-text`, {
      method: 'POST',
      body: formData
    });
    
    // Parse the response
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || "Failed to extract text from image");
    }
    
    console.log("Successfully extracted text from image");
    return data;
  } catch (error) {
    console.error("Error extracting text from image:", error);
    return {
      success: false,
      error: "Failed to extract text from receipt image: " + error.message
    };
  }
}

// Function to analyze receipt data for eco-friendliness
export async function analyzeReceiptData(receiptText) {
  try {
    console.log("Sending receipt text to backend for analysis");
    
    // Call our backend API to analyze the receipt text
    const response = await fetch(`${API_BASE_URL}/analyze-receipt`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ text: receiptText })
    });
    
    // Parse the response
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || "Failed to analyze receipt data");
    }
    
    console.log("Successfully analyzed receipt text");
    return data;
  } catch (error) {
    console.error("Error analyzing receipt:", error);
    return {
      success: false,
      error: "Failed to analyze receipt data: " + error.message
    };
  }
}

// Function to update user ELO score after receipt analysis
export async function updateUserElo(email, greenScore) {
  try {
    console.log("Updating user ELO score for", email, "with green score:", greenScore);
    
    // Ensure greenScore is a number
    const scoreValue = parseInt(greenScore, 10);
    if (isNaN(scoreValue)) {
      console.error("Invalid green score value:", greenScore);
      return {
        success: false,
        error: "Invalid green score value"
      };
    }
    
    // Call our backend API to update the user's ELO score
    const response = await fetch(`${API_BASE_URL}/update-user-elo`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        email: email,
        greenScore: scoreValue
      })
    });
    
    // Parse the response
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || "Failed to update user ELO");
    }
    
    console.log("Successfully updated user ELO");
    return data;
  } catch (error) {
    console.error("Error updating user ELO:", error);
    return {
      success: false,
      error: "Failed to update user ELO: " + error.message
    };
  }
}