const jwt = require("jsonwebtoken");
const { Resend } = require("resend");
const prisma = require("../../prisma/prismaClient");

const resend = new Resend(process.env.RESEND_API_KEY);
const JWT_SECRET = process.env.JWT_SECRET;

const sendMagicLink = async (req, res) => {
  const { email } = req.body;

  // ✅ Generate the JWT token
  const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: "7d" });

  // ✅ Correctly define magicLink
  const magicLink = `http://localhost:5173/magic-login?token=${token}&email=${email}`;

  try {
    // ✅ Use the correct variable 'magicLink' instead of 'link'
    await resend.emails.send({
      from: "auth@ecoelo.dhz.app",
      to: email,
      subject: "Eco Elo Login Link",
      html: `<p>Hello! <br> This is your login link: <a href="${magicLink}">CLICK HERE</a>.<br>Best regards,<br>Eco Elo Team</p>`,
    });

    res.status(200).json({ message: "Magic link sent successfully." });
  } catch (error) {
    console.error("Error sending magic link:", error);
    res.status(500).json({ error: "Error sending email" });
  }
};

const verifyMagicLink = async (req, res) => {
  const { token, email } = req.query;

  try {
    // ✅ Verify the token
    const decoded = jwt.verify(token, JWT_SECRET);

    if (decoded.email !== email) {
      return res.status(401).json({ error: "Invalid token." });
    }

    // ✅ Create or update the user in the database
    const user = await prisma.user.upsert({
      where: { email },
      update: { lastLogin: new Date() },
      create: { email, lastLogin: new Date() },
    });

    console.log("User updated/created:", user);

    // ✅ Generate a new authToken and set cookie
    const authToken = jwt.sign({ email }, JWT_SECRET, { expiresIn: "7d" });
    res.cookie("authToken", authToken, {
      httpOnly: true, // Prevent client-side access
      secure: process.env.NODE_ENV === "production", // Use HTTPS in production
      sameSite: "strict", // Prevent CSRF attacks
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
    });

    res.status(200).json({ message: "Login successful.", user });
  } catch (error) {
    console.error("Invalid or expired token:", error);
    res.status(401).json({ error: "Invalid or expired token." });
  }
};

const logout = async (req, res) => {
  try {
    // ✅ Clear the authToken cookie
    res.clearCookie("authToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/", // Make sure this matches the cookie path
    });

    res
      .status(200)
      .json({ success: true, message: "Logged out successfully." });
  } catch (error) {
    console.error("Error during logout:", error);
    res.status(500).json({ error: "Logout failed. Please try again." });
  }
};

module.exports = { sendMagicLink, verifyMagicLink, logout };
