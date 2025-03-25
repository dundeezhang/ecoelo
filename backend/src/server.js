const express = require("express");
const cors = require("cors");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const fetch = require("node-fetch");
const Tesseract = require("tesseract.js");
const { updateUserElo } = require("./controllers/userController");
const { PrismaClient } = require("@prisma/client"); // Import Prisma Client
const authMiddleware = require("./middleware/authMiddleware"); // Import the authentication middleware
require("dotenv").config();

// Import skibidi from './app'
const skibidi = require("./app");
const DUNDEEPORT = process.env.DUNDEEPORT || 3002;
// Initialize express app
const app = express();
const port = process.env.PORT || 3001;
const prisma = new PrismaClient(); // Initialize Prisma Client

// Configure middleware
app.use(
  cors({
    origin: "http://localhost:5173", // Adjust the origin as needed
    credentials: true, // Allow credentials (cookies) to be sent
  }),
);
app.use(express.json());
app.use(require("cookie-parser")()); // Add cookie-parser middleware

// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // Limit file size to 10MB
});

// Claude API key from environment variables
const CLAUDE_API_KEY = process.env.ANTHROPIC_API_KEY;
const CLAUDE_API_URL = "https://api.anthropic.com/v1/messages";

// Route to extract text from receipt image using Tesseract.js
app.post(
  "/api/extract-receipt-text",
  upload.single("receipt"),
  async (req, res) => {
    try {
      console.log("Receipt image received:", req.file.originalname);

      if (!req.file) {
        return res
          .status(400)
          .json({ success: false, error: "No file uploaded" });
      }

      // Path to the uploaded file
      const imagePath = req.file.path;

      // Use Tesseract.js to extract text from the image
      console.log("Extracting text with Tesseract.js...");
      const result = await Tesseract.recognize(imagePath, "eng", {
        logger: (m) => console.log(m),
      });

      // Clean up the extracted text
      const extractedText = result.data.text;
      console.log("Extracted text:", extractedText);

      // Clean up by removing the temporary file
      fs.unlinkSync(imagePath);

      return res.json({ success: true, text: extractedText });
    } catch (error) {
      console.error("Error processing receipt image:", error);

      // Clean up any uploaded file in case of error
      if (req.file && req.file.path && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }

      return res.status(500).json({
        success: false,
        error: `Failed to process receipt image: ${error.message}`,
      });
    }
  },
);

// Route to analyze receipt text using Claude
app.post("/api/analyze-receipt", async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res
        .status(400)
        .json({ success: false, error: "No receipt text provided" });
    }

    console.log("Analyzing receipt text with Claude...");

    // Pre-process the text to extract key information
    const preprocessedText = preprocessReceiptText(text);

    // Call Claude API to analyze the receipt text - using much less tokens now
    const analysisResponse = await fetch(CLAUDE_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": CLAUDE_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-3-haiku-20240307", // Using the smallest, most efficient model
        max_tokens: 1000,
        temperature: 0,
        system:
          "You are an expert in evaluating environmental impact of purchases. Your task is to analyze receipt data and rate items on eco-friendliness. Be concise and focus only on the analysis, providing results in JSON format.",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Here is pre-processed receipt data to analyze for eco-friendliness:

${preprocessedText}

Based on this data:
1. Determine if the store is eco-friendly (green stores include: Whole Foods, Trader Joe's, Sprouts, Farmers Market, organic stores)
2. Rate each purchased item on eco-friendliness from 1-5:
   - Organic, local, or reusable items: 5
   - Eco-friendly products: 4
   - Neutral items: 3
   - Non-recyclable items: 2
   - Plastic or disposable items: 1
3. Calculate a green score:
   - Store: 30 points if eco-friendly, 10 if not
   - Items: Sum of (item green rating × 2) for all items

Return your analysis as this exact JSON structure:
{
  "storeName": "Store Name",
  "date": "MM/DD/YYYY",
  "time": "HH:MM",
  "items": [
    {"name": "Item 1", "price": 3.99, "greenRating": 5},
    {"name": "Item 2", "price": 2.49, "greenRating": 3}
  ],
  "totalPrice": 20.48,
  "isStoreGreen": true,
  "greenScore": {
    "totalScore": 65,
    "message": "Great job! Your shopping was very eco-friendly!",
    "breakdown": [
      {"category": "Store Selection", "points": 30},
      {"category": "Item Choices", "points": 35}
    ]
  }
}

For the message field:
- totalScore > 50: "Great job! Your shopping was very eco-friendly!"
- totalScore < 25: "Consider more eco-friendly options next time."
- Otherwise: "Your shopping was somewhat eco-friendly."

Return ONLY the JSON with no explanations or code blocks.`,
              },
            ],
          },
        ],
      }),
    });

    // Process the API response
    if (!analysisResponse.ok) {
      const errorData = await analysisResponse.json();
      console.error("Claude API error during analysis:", errorData);
      return res.status(500).json({
        success: false,
        error: `Analysis API error: ${errorData.error?.message || analysisResponse.status}`,
      });
    }

    const responseData = await analysisResponse.json();
    const analysisText = responseData.content[0].text;

    // Parse the JSON response
    try {
      // First try direct JSON parsing
      const analysisJson = JSON.parse(analysisText);
      return res.json({ success: true, data: analysisJson });
    } catch (jsonError) {
      // If that fails, try to extract JSON from text response
      console.warn(
        "Initial JSON parsing failed, trying to extract JSON from text",
        jsonError,
      );

      // Look for JSON structure in the text
      const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          const extractedJson = JSON.parse(jsonMatch[0]);
          return res.json({ success: true, data: extractedJson });
        } catch (extractError) {
          return res.status(500).json({
            success: false,
            error: `Failed to parse Claude's JSON response: ${extractError.message}`,
          });
        }
      } else {
        return res.status(500).json({
          success: false,
          error: "Could not find valid JSON in Claude's response",
        });
      }
    }
  } catch (error) {
    console.error("Error analyzing receipt:", error);
    return res.status(500).json({
      success: false,
      error: `Failed to analyze receipt: ${error.message}`,
    });
  }
});

// Function to preprocess receipt text before sending to Claude
// This reduces the token count by extracting only the essential information
function preprocessReceiptText(text) {
  try {
    // Extract store name (usually first line)
    const lines = text.split("\n").filter((line) => line.trim());
    let storeName = lines[0];

    // Extract date and time
    let date = "";
    let time = "";

    const dateMatch = text.match(
      /date:?\s*(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/i,
    );
    if (dateMatch) date = dateMatch[1];

    const timeMatch = text.match(/time:?\s*(\d{1,2}:\d{1,2}(?:\s*[ap]m)?)/i);
    if (timeMatch) time = timeMatch[1];

    // Extract items and prices
    const itemLines = [];
    const itemRegex = /(.+)\s+\$?(\d+\.\d{2})/;

    for (const line of lines) {
      // Skip header lines
      if (
        line.toLowerCase().includes("date:") ||
        line.toLowerCase().includes("time:") ||
        line.toLowerCase().includes("receipt") ||
        line.toLowerCase().includes("thank you")
      ) {
        continue;
      }

      // Try to match items with prices
      const match = line.match(itemRegex);
      if (match) {
        const item = match[1].trim();
        const price = match[2];
        itemLines.push(`${item} - $${price}`);
      }
    }

    // Extract total
    let total = "";
    const totalMatch = text.match(/total:?\s*\$?(\d+\.\d{2})/i);
    if (totalMatch) total = totalMatch[1];

    // Construct preprocessed text with only the essential information
    const preprocessed = [
      `Store: ${storeName}`,
      `Date: ${date}`,
      `Time: ${time}`,
      `Items:`,
      ...itemLines,
      `Total: $${total}`,
    ].join("\n");

    return preprocessed;
  } catch (error) {
    console.error("Error preprocessing receipt text:", error);
    // If preprocessing fails, return original text
    return text;
  }
}

app.post("/api/update-user-elo", async (req, res) => {
  await updateUserElo(req, res);
});

// New route to fetch user history and elo
app.get("/api/user/history", authMiddleware, async (req, res) => {
  try {
    console.log("Fetching user data for user:", req.user);
    const userEmail = req.user; // Assuming req.user is the email or unique identifier
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
      select: { history: true, elo: true }, // Include elo in the selection
    });

    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    // Return both the history and elo values
    return res.json({ success: true, history: user.history, elo: user.elo });
  } catch (error) {
    console.error("Error fetching user history and elo:", error);
    return res.status(500).json({
      success: false,
      error: `Failed to fetch user data: ${error.message}`,
    });
  }
});

// New route to fetch user ELO points
app.get("/api/user/elo", authMiddleware, async (req, res) => {
  try {
    console.log("Fetching ELO points for user:", req.user); // Add log
    const userEmail = req.user; // Assuming user email is available in the request object
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
      select: { elo: true },
    });

    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    return res.json({ success: true, elo: user.elo });
  } catch (error) {
    console.error("Error fetching ELO points:", error);
    return res.status(500).json({
      success: false,
      error: `Failed to fetch ELO points: ${error.message}`,
    });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Backend server running on http://localhost:${port}`);
});

// ✅ Start skibidi server on a different port
skibidi.listen(DUNDEEPORT, () => {
  console.log(`Skibidi server running on http://localhost:${DUNDEEPORT}`);
});
