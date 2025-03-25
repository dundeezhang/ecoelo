// server/src/utils/sendEmail.js
const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

exports.sendMagicLink = async (email, link) => {
  try {
    await resend.emails.send({
      from: "auth@ecoelo.dhz.app",
      to: email,
      subject: "Eco Elo Login Link",
      html: `<p>Hello! <br> This is your login link: <a href="${link}">${link}</a>.<br>Best regards,<br>Eco Elo Team</p>`,
    });
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};
