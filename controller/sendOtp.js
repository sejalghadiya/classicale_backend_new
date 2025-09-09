import nodemailer from "nodemailer";
import { UserModel } from "../model/user.js";
import bcrypt from "bcryptjs";
import { sendEmail } from "../utils/sent_email.js";
import { sub } from "date-fns";

// Generate a random OTP
const generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

export const forgotPassword = async (req, res) => {
  const { email, category } = req.body;

  try {
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }
    if (!category) {
      return res.status(400).json({ message: "User category is required" });
    }
    // Check if user exists
    const user = await UserModel.findOne({ email, userCategory: category });
    if (!user) {
      return res
        .status(404)
        .json({ message: "User with this email does not exist" });
    }

    // Generate OTP and expiry time
    const otp = generateOTP();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes validity

    // Save OTP to database without removing old records
    // await OTPModel.create({ email, otp, expiresAt });
    await UserModel.updateOne(
      { email },
      { $set: { otp: otp, otpExpire: expiresAt } }
    );

    // Setup nodemailer transport
    // const transporter = nodemailer.createTransport({
    //   service: "gmail",
    //   host: "smtp.gmail.com",
    //   port: 465,
    //   secure: true, // Use SSL
    //   auth: {
    //     user: process.env.EMAIL_USER,
    //     pass: process.env.EMAIL_PASS,
    //   },
    // });

    // // Email options
    // const mailOptions = {
    //   from: '"Support Team" <support@yourdomain.com>',
    //   to: user.email,
    //   subject: "Password Reset OTP",
    //   text: `Hello, \n\nYour OTP for resetting the password is: ${otp}\n\nThis OTP is valid for 10 minutes.`,
    // };

    // // Send OTP via email
    // await transporter.sendMail(mailOptions);
    const userEmail = user.email;
    const subject = "Password Reset OTP";
    const text = `Hello, \n\nYour OTP for resetting the password is: ${otp}\n\nThis OTP is valid for 10 minutes.`;
    await sendEmail(userEmail, subject, text);

    res.status(200).json({ message: "OTP sent successfully to your email" });
  } catch (error) {
    console.error("Error sending OTP:", error);
    res
      .status(500)
      .json({ message: "Failed to send OTP. Please try again later." });
  }
};

// export const verifyOTPAndResetPassword = async (req, res) => {
//   const { email, otp, newPassword } = req.body;

//   try {
//     // Find OTP record in the database
//     const user = await UserModel.findOne({ email });

//     if (!user) {
//       return res.status(404).json({ message: "User not found." });
//     }

//     // Check if OTP matches
//     if (user.otp !== otp) {
//       return res.status(400).json({ message: "Invalid OTP." });
//     }

//     // Check if OTP is expired
//     if (user.expiresAt < Date.now()) {
//       return res.status(400).json({ message: "OTP has expired." });
//     }

//     // Hash the new password before saving
//     const hashedPassword = await bcrypt.hash(newPassword, 10);

//     // Update the user's password
//     user.password = hashedPassword;
//     await user.save();

//     res.status(200).json({
//       message:
//         "Password reset successfully. You can now log in with your new password.",
//     });
//   } catch (error) {
//     console.error("Error during OTP verification and password reset:", error);
//     res
//       .status(500)
//       .json({ message: "Failed to reset password. Please try again later." });
//   }
// };

export const verifyOTP1 = async (req, res) => {
  const { otp } = req.body; // Only OTP is needed for verification

  try {
    // Find the user using the OTP stored in the database
    const user = await UserModel.findOne({ otp });

    if (!user) {
      return res.status(404).json({ message: "OTP is invalid or expired." });
    }

    if (user.otpExpire < Date.now()) {
      return res.status(400).json({ message: "OTP has expired." });
    }

    // OTP verified, proceed with password reset flow
    user.isOtpVerified = true; // Mark OTP as verified
    await user.save();

    res.status(200).json({ message: "OTP verified successfully." });
  } catch (error) {
    console.error("Error during OTP verification:", error);
    res.status(500).json({ message: "Failed to verify OTP. Try again later." });
  }
};
export const verifyOTP = async (req, res) => {
  const {email, otp, category } = req.body;

  try {
    if (!email) {
      return res.status(400).json({ message: "Email is required for OTP verification." });
    }

    if (!category) {
      return res.status(400).json({ message: "User category is required for OTP verification." });
    }
    if (!otp) {
      return res.status(400).json({ message: "OTP is required for verification." });
    }

    const user = await UserModel.findOne({email, userCategory: category });

    if (!user) {
      return res.status(404).json({ message: "OTP is invalid or expired." });
    }
    if(!user.otp) {
      return res.status(400).json({ message: "No OTP found for this user." });
    }
    if (user.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP." });
    }

    if (user.otpExpire < Date.now()) {
      return res.status(400).json({ message: "OTP has expired." });
    }

    // Save email temporarily in req.session (or in-memory if no session used)
    req.session = req.session || {}; // Safely initialize session object
    req.session.resetEmail = user.email; // ✅ Save email temporarily

    //user.isOtpVerified = true;
    user.otp = null; // Clear OTP after verification
    user.otpExpire = null; // Clear OTP expiry after verification
    await user.save();

    res.status(200).json({ message: "OTP verified successfully." });
  } catch (error) {
    console.error("Error during OTP verification:", error);
    res.status(500).json({ message: "Failed to verify OTP. Try again later." });
  }
};

export const changePassword = async (req, res) => {
  const { email, newPassword, confirmPassword,category } = req.body;

  try {
    if (!email) {
      return res
        .status(400)
        .json({ message: "Email is required to reset password." });
    }
    if (!category) {
      return res
        .status(400)
        .json({ message: "User category is required to reset password." });
    }
    if (!newPassword || !confirmPassword) {
      return res
        .status(400)
        .json({ message: "Both password fields are required." });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match." });
    }

    const user = await UserModel.findOne({ email, userCategory: category });

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // if (!user.isOtpVerified) {
    //   return res.status(400).json({
    //     message: "OTP verification required before resetting password.",
    //   });
    // }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    //user.isOtpVerified = false;
    user.otp = null;
    user.otpExpire = null;
    await user.save();

    res.status(200).json({ message: "Password reset successfully." });
  } catch (error) {
    console.error("Error during password reset:", error);
    res
      .status(500)
      .json({ message: "Failed to reset password. Try again later." });
  }
};
