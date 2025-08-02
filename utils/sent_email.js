import nodemailer from "nodemailer";
import config from "./config.js";
export const sendEmail = async (email, subject, text) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      host: "smtp.gmail.com",
      port: 465,
      secure: true, // Use SSL
      auth: {
        user: config.email.user,
        pass: config.email.pass,
      },
    });

    // Email options
    const mailOptions = {
      from: `"Support Team" <${config.email.user}>`,
      to: email,
      subject: subject,
      text: text,
    };
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.log("Error sending email:", error);
    throw new Error("Failed to send email. Please try again later.");
  }
};
