const prisma = require("../../prisma/prismaClient");

/**
 * Update user's ELO score with new points from receipt analysis
 */
const updateUserElo = async (req, res) => {
  try {
    console.log("updateUserElo called with request body:", req.body);
    const { email, greenScore } = req.body;

    if (!email || greenScore === undefined) {
      console.log("Missing required fields - email:", email, "greenScore:", greenScore);
      return res.status(400).json({ error: "Email and greenScore are required" });
    }
    
    // Make sure greenScore is a number
    const scoreValue = typeof greenScore === 'number' ? greenScore : parseInt(greenScore, 10);
    if (isNaN(scoreValue)) {
      console.error("Invalid green score value:", greenScore);
      return res.status(400).json({ error: "Invalid green score value" });
    }

    console.log("Looking up user with email:", email);
    // Get current user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    console.log("User found:", user);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Create history entry with today's date (not the receipt date)
    const today = new Date();
    const historyEntry = {
      date: today.toISOString(),
      score: scoreValue,
    };

    // Parse existing history and add new entry
    let history = [];
    try {
      if (user.history && user.history !== '[]') {
        history = JSON.parse(user.history);
        if (!Array.isArray(history)) {
          console.log('History is not an array, resetting to empty array');
          history = [];
        }
      } else {
        console.log('History is empty or null, using empty array');
      }
    } catch (e) {
      console.log('Error parsing history, resetting to empty array:', e);
      history = [];
    }
    
    history.push(historyEntry);

    // Update user with new total ELO and updated history
    console.log("Before update - Current ELO:", user.elo, "Adding green score:", scoreValue);
    console.log("Updating user ELO with new total:", user.elo + scoreValue);
    
    const updatedUser = await prisma.user.update({
      where: { email },
      data: {
        elo: user.elo + scoreValue,
        history: JSON.stringify(history),
      },
    });
    
    console.log("After update - User:", updatedUser);

    res.status(200).json({ 
      success: true, 
      message: "User ELO updated successfully",
      user: {
        email: updatedUser.email,
        elo: updatedUser.elo,
        history: JSON.parse(updatedUser.history),
      }
    });
  } catch (error) {
    console.error("Error updating user ELO:", error);
    console.error("Error stack:", error.stack);
    if (error.code) console.error("Prisma error code:", error.code);
    if (error.meta) console.error("Prisma error meta:", error.meta);
    res.status(500).json({ error: "Failed to update user ELO: " + error.message });
  }
};

module.exports = { updateUserElo };