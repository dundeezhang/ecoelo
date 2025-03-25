const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/dashboard", authMiddleware, (req, res) => {
  res.status(200).json({ 
    message: `Welcome back, ${req.user}!`,
    email: req.user  // Add email to the response
  });
});

module.exports = router;
