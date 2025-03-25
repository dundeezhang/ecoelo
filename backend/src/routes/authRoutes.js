const express = require("express");
const router = express.Router();
const {
  sendMagicLink,
  verifyMagicLink,
  logout,
} = require("../controllers/authController");

// Existing routes
router.post("/send-magic-link", sendMagicLink);
router.get("/verify-magic-link", verifyMagicLink);

// new route
router.post("/logout", logout);

module.exports = router;
