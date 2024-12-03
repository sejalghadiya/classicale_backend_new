import { UserModel } from "../model/user.js";
import { ProductModel } from "../model/product.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import crypto from "crypto";
// Import Twilio using ES module syntax
//import twilio from 'twilio';

//const twilio = require("twilio");

//import { Client } from "client";
//import { sendOTPEmail } from "../controller/sendOtp.js"; // Import your sendOTPEmail function
//const { sendOTPEmail } = require("../sendOtp.js");

//const jwtKey =
//process.env.ACCESS_TOKEN_SECRET || "classicalProjects";

//const token = jwt.sign(payload, SECRET_KEY, { expiresIn: '1h' });

const ERROR_MESSAGES = {
  MISSING_FIRST_NAME: "First name is required",
  MISSING_LAST_NAME: "Last name is required",
  MISSING_GENDER: "Gender is required",
  MISSING_DATE_OF_BIRTH: "Date of Birth is required",
  INVALID_DATE_OF_BIRTH: "Invalid Date of Birth format",
  MISSING_PASSWORD: "Password is required",
  MISSING_LOCATION: "Location is required",
  MISSING_OCCUPATION: "Occupation is required",
  MISSING_EMAIL: "Email is required",
  USER_ALREADY_EXISTS: "User already exists",
  SOMETHING_WENT_WRONG: "Something went wrong",
  MISSING_PHONE: "Please enter your phone number",
  SELECTED_VALUES: "Please select a value",
};

// Regex for validating the email address
const EMAIL_REGEX =
  /^(?=.*[!@#$%^&*])(?=.*\d)[A-Za-z\d!@#$%^&*]+@[A-Za-z\d.-]+\.[A-Za-z]{2,}$/;

export const userSignUp = async (req, res) => {
  try {
    const latestUser = await UserModel.findOne({}).sort({ userId: -1 });
    let nextUserId = 1;
    if (latestUser) {
      nextUserId = latestUser.userId + 1;
    }

    const {
      firstName,
      lastName,
      gender,
      dateOfBirth,
      password,
      Location,
      occupation,
      email,
      phone,
      both,
      countryCode, // Accept countryCode from request
      role,
      country,
      city, // Added role field
    } = req.body;

    const userRole = role || "user";

    if (!EMAIL_REGEX.test(email)) {
      return res.status(400).json({ message: "Invalid Email Format" });
    }

    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Combine countryCode and phone into one field, or store them separately
    const userData = new UserModel({
      userId: nextUserId,
      firstName,
      lastName,
      gender,
      dateOfBirth,
      password: hashedPassword,
      Location,
      occupation,
      email,
      phone: `${phone}`, // Combine country code and phone number
      both,
      country,
      city,
      countryCode, // Store the country code separately if needed
      role: userRole,
      image: req.file ? req.file.buffer.toString("base64") : undefined,
    });

    await userData.save();

    console.log(userData);
    console.log(
      "****************************************************************"
    );

    const token = jwt.sign(
      { id: userData._id, email: userData.email, role: userData.role },
      "ClassicalProject",
      { expiresIn: "1h" }
    );

    userData.token = token;
    await userData.save();

    return res.status(201).json({ user: userData, token });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export const userLogin = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find the user by email
    const user = await UserModel.findOne({ email });
    if (!user) {
      console.log("User not found:", email);
      return res.status(404).json({ message: "User not found" });
    }

    // Check if the password is correct
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      console.log("Invalid credentials for user:", email);
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Fetch all products added by the user
    const products = await ProductModel.find({ userId: user.uId });

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      "classicalProject", // Ensure this matches your secret key
      { expiresIn: "1h" }
    );

    await token.save;
    // Send response with token, user info, product count, and product details
    res.json({
      token,
      user: user,
    });
  } catch (error) {
    console.error("Error during login:", error); // Log error to the console
    res.status(500).json({
      message: "An internal server error occurred. Please try again later.",
      error: error.message, // Return the specific error message
    });
  }
};

// Request Password Reset via SMS
export const requestPasswordReset2 = async (req, res) => {
  const { email } = req.body;

  try {
    // Find the user by email
    const user = await UserModel.findOne({ email });
    if (!user) {
      console.log("User not found:", email);
      return res.status(404).json({ message: "User not found" });
    }

    // Generate a reset token
    const resetToken = crypto.randomBytes(20).toString("hex");

    // Set token and expiration on the user
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

    await user.save(); // Save the user with the token and expiration

    // For demo purposes, we're simulating sending an email with a console log

    res.json({
      message: "Password reset link has been sent to your email (simulated).",
    });
  } catch (error) {
    console.error("Error during forgot password:", error);
    res.status(500).json({
      message: "An internal server error occurred. Please try again later.",
      error: error.message,
    });
  }
};

const generateResetToken = () => {
  return crypto.randomBytes(32).toString("hex"); // Generates a secure random token
};

// Function to request a password reset
export const requestPasswordReset33 = async (req, res) => {
  const { email } = req.body;

  try {
    // Find the user by email
    const user = await UserModel.findOne({ email });
    if (!user) {
      console.log("User not found:", email);
      return res.status(404).json({ message: "User not found" });
    }

    // Generate a reset token and set expiration
    const resetToken = generateResetToken();
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // Token valid for 1 hour

    await user.save(); // Save the user with the token and expiration

    console.log(`Reset token: ${resetToken}`); // Log the token for demonstration (remove in production)

    // Send a response indicating that the password reset has been initiated
    res.status(200).json({
      message: "Password reset instructions have been sent to your email.",
    });
  } catch (error) {
    console.error("Error during forgot password:", error);
    res.status(500).json({
      message: "An internal server error occurred. Please try again later.",
      error: error.message,
    });
  }
};

// Function to reset the password
export const resetPassword6 = async (req, res) => {
  const { resetToken, newPassword } = req.body;

  // Validate request body
  if (!resetToken || !newPassword) {
    return res
      .status(400)
      .json({ message: "Reset token and new password are required." });
  }

  try {
    console.log("Received reset token:", resetToken);

    // Find user by reset token and ensure token has not expired
    const user = await UserModel.findOne({
      resetPasswordToken: resetToken.toString(), // Ensure string comparison
      resetPasswordExpires: { $gt: Date.now() }, // Token must still be valid
    });

    // Check if the user exists and if the token is valid
    if (!user) {
      console.log("Invalid or expired token for resetToken:", resetToken);
      return res
        .status(400)
        .json({ message: "Invalid or expired reset token." });
    }

    console.log("User found, resetting password for:", user.email);

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the user's password and clear the reset token and expiration fields
    user.password = hashedPassword;
    user.resetPasswordToken = undefined; // Clear reset token
    user.resetPasswordExpires = undefined; // Clear expiration time

    await user.save();

    // Respond with a success message
    res
      .status(200)
      .json({ message: "Your password has been successfully reset." });
  } catch (error) {
    console.error("Error during password reset:", error);
    res.status(500).json({
      message: "An internal server error occurred. Please try again later.",
      error: error.message,
    });
  }
};

export const requestPasswordReset44 = async (req, res) => {
  try {
    const { email } = req.body;

    console.log("email:", email);

    // Step 1: Check if the user exists by email
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ message: "User not found with this email" });
    }

    // Step 2: Generate a 5-digit reset token (OTP)
    const resetToken = Math.floor(10000 + Math.random() * 90000).toString();
    console.log("reset token:", resetToken);

    // Step 3: Store the token and set expiration time to 10 minutes
    user.resetPasswordToken = resetToken;
    user.resetTokenExpiration = Date.now() + 600000; // 10 minutes expiration
    await user.save();

    console.log("User saved with reset token:", user.resetPasswordToken);

    // Step 4: Set up Nodemailer transport
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "sejalghadiya100@gmail.com", // Your email
        pass: "sejan@1009", // Your email password or App Password if using 2FA
      },
      logger: true, // Enables logs
      debug: true, // Enables detailed SMTP logs
    });

    // Step 5: Send the reset token via email
    const mailOptions = {
      from: "sejalghadiya100@gmail.com",
      to: user.email,
      subject: "Password Reset OTP",
      text: `Your password reset code is ${resetToken}. It will expire in 10 minutes.`,
    };

    // Use transporter to send the email
    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.error("Error sending email:", err);
        return res
          .status(500)
          .json({ message: "Failed to send email", error: err.message });
      }
      console.log(`Email sent: ${info.response}`);

      // Step 6: Respond to the client
      return res
        .status(200)
        .json({ message: "Password reset token sent via email" });
    });
  } catch (error) {
    console.error("Error generating reset token or sending email:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

export const requestPasswordReset66 = async (req, res) => {
  try {
    const { email } = req.body;

    console.log("email:", email);

    const user = await UserModel.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ message: "User not found with this email" });
    }

    const resetToken = Math.floor(10000 + Math.random() * 90000).toString();
    console.log("reset token:", resetToken);

    user.resetPasswordToken = resetToken;
    user.resetTokenExpiration = Date.now() + 600000; // 10 minutes expiration
    await user.save();

    console.log("User saved with reset token:", user.resetPasswordToken);

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true, // Use true for port 465
      auth: {
        user: "sejalghadiya100@gmail.com", // Your email address
        pass: "Sejal@1838", // Your app password
      },
    });

    const mailOptions = {
      from: "sejalghadiya100@gmail.com",
      to: user.email,
      subject: "Password Reset OTP",
      text: `Your password reset code is ${resetToken}. It will expire in 10 minutes.`,
    };

    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.error("Error sending email:", err);
        return res
          .status(500)
          .json({ message: "Failed to send email", error: err.message });
      }
      console.log(`Email sent: ${info.response}`);
      return res
        .status(200)
        .json({ message: "Password reset token sent via email", resetToken });
    });
  } catch (error) {
    console.error("Error generating reset token or sending email:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

export const requestPasswordReset99 = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await UserModel.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ message: "User not found with this email" });
    }

    // Generate a secure random token
    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = resetToken;
    await user.save();

    return res
      .status(200)
      .json({ message: "Reset token generated", resetToken });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

export const resetPassword9 = async (req, res) => {
  try {
    const { email, resetToken, newPassword } = req.body;

    // Find user by email
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ message: "User not found with this email" });
    }

    // Check if the token is valid
    const isTokenValid = user.resetPasswordToken === resetToken;

    if (!isTokenValid) {
      return res.status(400).json({ message: "Invalid reset token" });
    }

    // Hash the new password and update it
    user.password = await bcrypt.hash(newPassword, 10);
    user.resetPasswordToken = undefined; // Clear the reset token once used
    await user.save();

    return res
      .status(200)
      .json({ message: "Password has been reset successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

export const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;

    // Find the user by email
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ message: "User not found with this email" });
    }

    // Generate a 5-digit reset token
    const resetToken = Math.floor(10000 + Math.random() * 90000).toString(); // 5-digit token
    user.resetPasswordToken = resetToken;
    await user.save();

    // Respond with the reset token (for testing purposes)
    return res
      .status(200)
      .json({ message: "Reset token generated", resetToken });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { email, resetToken, newPassword } = req.body;

    // Find user by email
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ message: "User not found with this email" });
    }

    // Validate the reset token
    if (user.resetPasswordToken !== resetToken) {
      return res
        .status(400)
        .json({ message: "Invalid or expired reset token" });
    }

    // Hash the new password and update it
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.resetPasswordToken = undefined; // Clear the reset token after use
    await user.save();

    return res
      .status(200)
      .json({ message: "Password has been reset successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};
export const resetPassword33 = async (req, res) => {
  try {
    const { resetToken, newPassword } = req.body;

    if (!resetToken || !newPassword) {
      return res
        .status(400)
        .json({ message: "Token and new password are required" });
    }

    // Find the user by resetToken and check if the token has expired
    const user = await UserModel.findOne({
      resetPasswordToken: resetToken,
      resetTokenExpiration: { $gt: Date.now() }, // Check if the token is still valid
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update the user's password
    user.password = hashedPassword;
    user.resetPasswordToken = null; // Clear the reset token
    user.resetTokenExpiration = null; // Clear the expiration
    await user.save();

    res.status(200).json({
      message: "Password has been reset successfully",
    });
  } catch (error) {
    console.error("Error resetting password:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
export const updateUser = async (req, res) => {
  try {
    const userId = req.user.userId;

    // Find the existing user by userId
    const existingUser = await UserModel.findOne({ userId });
    if (!existingUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Store old data before updating
    const oldUserData = {
      firstName: existingUser.firstName,
      lastName: existingUser.lastName,
      gender: existingUser.gender,
      dateOfBirth: existingUser.dateOfBirth,
      location: existingUser.Location, // Ensure correct field casing
      occupation: existingUser.occupation,
      email: existingUser.email,
      phone: existingUser.phone,
      both: existingUser.both,
      image: existingUser.image,
      city: existingUser.city,
      country: existingUser.country,
      updatedAt: existingUser.updatedAt,
    };

    // Update user fields with new values from the request body
    const updates = req.body;
    for (let key in updates) {
      if (updates[key] !== undefined && updates[key] !== null) {
        existingUser[key] = updates[key];
      }
    }

    // Handle profile image if provided
    if (req.file) {
      existingUser.image = req.file.buffer.toString("base64");
    }

    // Update the `updatedAt` timestamp
    existingUser.updatedAt = new Date().toISOString();

    // Save the updated user data
    await existingUser.save();

    // Construct new data object after update
    const newData = {
      firstName: existingUser.firstName,
      lastName: existingUser.lastName,
      gender: existingUser.gender,
      dateOfBirth: existingUser.dateOfBirth,
      location: existingUser.Location, // Make sure location is reflected here
      occupation: existingUser.occupation,
      email: existingUser.email,
      phone: existingUser.phone,
      both: existingUser.both,
      city: existingUser.city,
      country: existingUser.country,
      image: existingUser.image,
      updatedAt: existingUser.updatedAt,
    };

    console.log(existingUser.location);
    console.log("++++++++++++++++++++++++++++++++++++++++++++++++");
    // Return a success response with both old and updated data
    return res.status(200).json({
      oldData: oldUserData,
      newData: newData,
      message: "User updated successfully",
    });
  } catch (err) {
    console.error("Error updating user:", err);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const userId = parseInt(req.params.userId, 10);

    if (!userId) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    console.log(userId);
    // Find the user by userId
    const user = await UserModel.findOne({ userId });

    if (!user) {
      // If user not found, return 404 status with message
      return res.status(404).json({ message: "User not found" });
    }

    // Delete the user from the database
    await UserModel.deleteOne({ userId });

    // Return success message
    return res.status(200).json({ message: "User deleted successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Something went wrong" });
  }
};
