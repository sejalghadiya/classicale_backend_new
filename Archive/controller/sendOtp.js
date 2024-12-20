import nodemailer from "nodemailer";
import { UserModel } from "../model/user.js";
import { OTPModel } from "../model/sendOtp.js";
import bcrypt from "bcryptjs";

// Generate a random OTP
const generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    // Check if user exists
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ message: "User with this email does not exist" });
    }

    // Generate OTP and expiry time
    const otp = generateOTP();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes validity

    // Save OTP to database without removing old records
    await OTPModel.create({ email, otp, expiresAt });

    // Setup nodemailer transport
    const transporter = nodemailer.createTransport({
      service: "gmail",
      host: "smtp.gmail.com",
      port: 465,
      secure: true, // Use SSL
      auth: {
        user: "ttsnikol89@gmail.com",
        pass: "qkrn wlbu wnft qzgn",
      },
    });

    // Email options
    const mailOptions = {
      from: '"Support Team" <support@yourdomain.com>',
      to: user.email,
      subject: "Password Reset OTP",
      text: `Hello, \n\nYour OTP for resetting the password is: ${otp}\n\nThis OTP is valid for 10 minutes.`,
    };

    // Send OTP via email
    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: "OTP sent successfully to your email" });
  } catch (error) {
    console.error("Error sending OTP:", error);
    res
      .status(500)
      .json({ message: "Failed to send OTP. Please try again later." });
  }
};

export const verifyOTPAndResetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  try {
    // Find OTP record in the database
    const otpRecord = await OTPModel.findOne({ email, otp });

    if (!otpRecord) {
      return res.status(400).json({ message: "Invalid OTP." });
    }

    // Check if OTP is expired
    if (otpRecord.expiresAt < Date.now() || otpRecord.isExpired) {
      return res.status(400).json({ message: "OTP has expired." });
    }

    // Hash the new password before saving
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Find the user and update their password
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Update the user's password
    user.password = hashedPassword;
    await user.save();

    // Mark OTP as expired to prevent reuse
    otpRecord.isExpired = true;
    await otpRecord.save();

    res
      .status(200)
      .json({
        message:
          "Password reset successfully. You can now log in with your new password.",
      });
  } catch (error) {
    console.error("Error during OTP verification and password reset:", error);
    res
      .status(500)
      .json({ message: "Failed to reset password. Please try again later." });
  }
};
