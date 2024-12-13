import nodemailer from "nodemailer";
import { UserModel } from "../model/user.js";
import { OTPModel } from "../model/sendOtp.js";
import bcrypt from "bcryptjs";

// Generate a random OTP
const generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

export const forgotPassword12 = async (req, res) => {
  const { email } = req.body;

  try {
    // Check if user exists
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ message: "User with this email does not exist" });
    }

    // Generate OTP and save it to a temporary collection
    const otp = generateOTP();
    const expiresAt = Date.now() + 10 * 60 * 1000; // OTP expires after 10 minutes

    const otpRecord = await OTPModel.findOne({ email, otp });
    if (!otpRecord) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // Check if OTP is expired
    if (otpRecord.expiresAt < Date.now()) {
      return res.status(400).json({ message: "OTP has expired" });
    }
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
      logger: true, // Log messages to console
    });

    // Email options
    const mailOptions = {
      from: '"Support Team" <support@yourdomain.com>', // Custom sender name and email
      to: user.email,
      subject: "Password Reset OTP",
      text: `Hello, \n\nYour OTP for resetting the password is: ${otp}\n\nThis OTP is valid for 10 minutes.`,
    };
    // Send OTP via email
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return console.log("Error occurred", error);
      }
      console.log("Email sent successfully", info.response);
    });

    // Send success response
    res.status(200).json({ message: "OTP sent successfully to your email" });
  } catch (error) {
    console.error("Error sending OTP:", error);
    res
      .status(500)
      .json({ message: "Failed to send OTP. Please try again later." });
  }
};

export const forgotPassword13 = async (req, res) => {
  const { email } = req.body;

  try {
    // Check if user exists
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ message: "User with this email does not exist" });
    }

    // Generate OTP and save it to a temporary collection
    const otp = generateOTP();
    const expiresAt = Date.now() + 10 * 60 * 1000; // OTP expires after 10 minutes

    // Save OTP to the database
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
      from: '"Support Team" <support@yourdomain.com>', // Custom sender name
      to: user.email,
      subject: "Password Reset OTP",
      text: `Hello, \n\nYour OTP for resetting the password is: ${otp}\n\nThis OTP is valid for 10 minutes.`,
    };

    // Send OTP via email
    await transporter.sendMail(mailOptions);

    // Send success response
    res.status(200).json({ message: "OTP sent successfully to your email" });
  } catch (error) {
    console.error("Error sending OTP:", error);
    res
      .status(500)
      .json({ message: "Failed to send OTP. Please try again later." });
  }
};

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
export const verifyOTPAndResetPassword13 = async (req, res) => {
  const { email, otp } = req.body;

  try {
    // Find OTP in database
    const otpRecord = await OTPModel.findOne({ email, otp });

    if (!otpRecord) {
      return res.status(400).json({ message: "Invalid OTP." });
    }

    // Check if OTP is expired
    if (otpRecord.expiresAt < Date.now() || otpRecord.isExpired) {
      return res.status(400).json({ message: "OTP has expired." });
    }

    // Mark OTP as expired
    otpRecord.isExpired = true;
    await otpRecord.save();

    res.status(200).json({ message: "OTP verified successfully." });
  } catch (error) {
    console.error("Error verifying OTP:", error);
    res
      .status(500)
      .json({ message: "Failed to verify OTP. Please try again later." });
  }
};


export const verifyOTPAndResetPassword12 = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  try {
    // Find the OTP record
    const otpRecord = await OTPModel.findOne({ email, otp });
    if (!otpRecord) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // Check if OTP is expired
    if (otpRecord.expiresAt < Date.now()) {
      return res.status(400).json({ message: "OTP has expired" });
    }

    // Update user's password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await UserModel.updateOne({ email }, { password: hashedPassword });

    // Delete the OTP record after successful verification
    await OTPModel.deleteOne({ email });

    res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    console.error("Error resetting password:", error);
    res
      .status(500)
      .json({ message: "Failed to reset password. Please try again." });
  }
};
