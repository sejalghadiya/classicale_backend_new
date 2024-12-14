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
  MISSING_MIDDLE_NAME: "Middle name is required",
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

export const userSignUp = async (req, res) => {
  try {
    // Fetch the latest user based on userId
    const latestUser = await UserModel.findOne({}).sort({ userId: -1 });

    // Determine the next userId
    let nextUserId = 1;
    if (latestUser && !isNaN(latestUser.userId)) {
      nextUserId = latestUser.userId + 1;
    }

    const {
      firstName,
      middleName,
      lastName,
      gender,
      dateOfBirth,
      password,
      Location,
      occupation,
      otherOccupation,
      email,
      phone,
      both,
      countryCode,
      role,
      country,
      city,
    } = req.body;

    const userRole = role || "user";

    // Check if the user already exists
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Handle images
    let image, proofOneImage, proofTwoImage;

    if (req.files?.image?.[0]) {
      image = req.files.image[0].buffer.toString("base64"); // Profile image
    } else {
      return res.status(400).json({ message: "Profile image is required" });
    }

    if (req.files?.aadhaarFrontImage?.[0]) {
      proofOneImage = req.files.aadhaarFrontImage[0].buffer.toString("base64"); // Proof image
    } else {
      return res
        .status(400)
        .json({ message: "Aadhaar/proof image is required" });
    }

    if (req.files?.aadhaarBackImage?.[0]) {
      proofTwoImage = req.files.aadhaarBackImage[0].buffer.toString("base64"); // Proof image
    } else {
      return res
        .status(400)
        .json({ message: "Aadhaar/proof image is required" });
    }

    // Create a new user
    const userData = new UserModel({
      userId: nextUserId,
      firstName,
      middleName,
      lastName,
      gender,
      dateOfBirth,
      password: hashedPassword,
      Location,
      occupation,
      otherOccupation,
      email,
      phone,
      both,
      country,
      city,
      countryCode,
      role: userRole,
      image,
     // profileImage, // Save the base64 profile image
      proofOneImage,
      proofTwoImage, // Save the base64 proof image
    });

    // Save the user data
    await userData.save();

    // Generate a JWT token
    const token = jwt.sign(
      { id: userData._id, email: userData.email, role: userData.role },
      "ClassicalProject",
      { expiresIn: "1h" }
    );

    return res.status(200).json({
      message: "User signed up successfully!",
      user: {
        ...userData.toObject(),
        profileImage: undefined, // Do not send sensitive data in the response
        proofImage: undefined, // Do not send sensitive data in the response
      },
      token,
    });
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
      return res.status(404).json({ message: "User not found" });
    }

    // Check if the password is correct
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      "classicalProject", // Ensure this matches your secret key
      { expiresIn: "60d" }
    );
    console.log(token);
    console.log("++++++++++++++++++");

    res.json({
      token,
      user: user,
    });
    console.log("user:-----", user);
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({
      message: "An internal server error occurred. Please try again later.",
      error: error.message,
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
      middleName: existingUser.middleName,
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
      proofOneImage: existingUser.proofOneImage, // Store old proof images
      proofTwoImage: existingUser.proofTwoImage, // Store old proof images
    };

    // Update user fields with new values from the request body
    const updates = req.body;
    for (let key in updates) {
      if (updates[key] !== undefined && updates[key] !== null) {
        existingUser[key] = updates[key];
      }
    }

    // Handle profile image if provided (base64 string)
    if (req.body.profileImage) {
      existingUser.image = req.body.profileImage;
    }

    // Handle proof images if provided (base64 string)
    if (req.body.proofOneImage) {
      existingUser.proofOneImage = req.body.proofOneImage;
    }
    if (req.body.proofTwoImage) {
      existingUser.proofTwoImage = req.body.proofTwoImage;
    }

    // If files are uploaded (for example, image files), handle them
    if (req.file) {
      existingUser.image = req.file.buffer.toString("base64"); // Update profile image with the file
    }

    // Update the `updatedAt` timestamp
    existingUser.updatedAt = new Date().toISOString();

    // Save the updated user data
    await existingUser.save();

    // Construct new data object after update
    const newData = {
      firstName: existingUser.firstName,
      middleName: existingUser.middleName,
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
      proofOneImage: existingUser.proofOneImage, // Return updated proofOneImage
      proofTwoImage: existingUser.proofTwoImage, // Return updated proofTwoImage
    };

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
