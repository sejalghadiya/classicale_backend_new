import { UserModel } from "../model/user.js";
import { ProductModel } from "../model/product.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { CodeModel } from "../model/pin.js";
import mongoose from "mongoose";
import { OccupationModel } from "../model/occupation.js";
import { read } from "fs";
import { SubProductTypeModel } from "../model/sub_product_type.js";
import { ProductTypeModel } from "../model/product_type.js";

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

const generateOtp = (firstName, lastName) => {
  const firstNamePrefix = firstName.slice(0, 2).toUpperCase();
  const lastNamePrefix = lastName.slice(0, 2).toUpperCase();
  const randomDigits = Math.floor(10 + Math.random() * 90);
  return `${firstNamePrefix}${lastNamePrefix}${randomDigits}`;
};

export const userSignUp = async (req, res) => {
  try {
    const {
      phone,
      fName,
      lName,
      mName,
      email,
      password,
      gender,
      DOB,
      occupationId,
      state,
      district,
      country,
      area,
      aadharNumber,
      userCategory,
    } = req.body;

    // ✅ Step 1: Email Validation
    if (!email.endsWith("@gmail.com")) {
      return res
        .status(400)
        .json({ message: "Only Gmail ID (@gmail.com) allowed!" });
    }

    // ✅ Step 2: Check if user already exists
    const existingUser = await UserModel.findOne({ email, userCategory });
    if (existingUser) {
      return res.status(400).json({ message: "Already exists Email" });
    }

    // // Check if user already exists
    const hashedPassword = await bcrypt.hash(password, 10);

    // Handle file paths correctly
    const profileImagePath = req.files?.profileImage
      ? `/public/profileImages/${req.files.profileImage[0].filename}`
      : null;
    console.log(req.files?.profileImage);
    const aadhaarFrontPath = req.files?.aadhaarCardImage1
      ? `/public/aadharcardImages/${req.files.aadhaarCardImage1[0].filename}`
      : null;
    const aadhaarBackPath = req.files?.aadhaarCardImage2
      ? `/public/aadharcardImages/${req.files.aadhaarCardImage2[0].filename}`
      : null;

    // Determine if admin verification is required
    let isAdminVerify = userCategory === "A";

    let read = [];
    let write = [];

    if (userCategory === "A") {
      read = ["A", "B", "D", "E"];
      write = ["A", "B", "D", "E"];
    } else if (userCategory === "B") {
      read = ["B", "C", "D", "E"];
      write = ["C"];
    }

    // Create user
    const newUser = new UserModel({
      read,
      write,
      phone,
      fName,
      lName,
      mName,
      email,
      password: hashedPassword,
      gender,
      DOB,
      occupationId: new mongoose.Types.ObjectId(occupationId),
      state,
      district,
      country,
      area,
      profileImage: profileImagePath,
      aadhaarCardImage1: aadhaarFrontPath,
      aadhaarCardImage2: aadhaarBackPath,
      aadharNumber,
      role: "user",
      userCategory,
      isVerified: isAdminVerify,
      isDeleted: false,
      isBlocked: false,
      isPinVerified: !isAdminVerify,
      isOtpVerified: isAdminVerify,
    });

    // Save user
    await newUser.save();

    res
      .status(200)
      .json({ message: "User registered successfully", user: newUser });
  } catch (error) {
    console.log("Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
export const userLogin = async (req, res) => {
  const { email, password, userCategory } = req.body;

  try {
    // ✅ Find User
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (user.userCategory !== userCategory) {
      return res.status(404).json({ message: "Invalid category" });
    }

    // ✅ Check Password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid password" });
    }

    // ✅ Check if First-Time Login
    let requiresVerification = false;
    let verificationType = null;

    if (user.userCategory === "A" && !user.pinVerified) {
      requiresVerification = true;
      verificationType = "PIN";
    } else if (user.userCategory === "B" && !user.otpUsed) {
      requiresVerification = true;
      verificationType = "OTP";
    }

    // ✅ Generate Token
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "60d" }
    );

    return res.status(200).json({
      message: "Login successful",
      token,
      user: {
        read: user.read,
        write: user.write,
        userId: user._id,
        phone: user.phone,
        fName: user.fName,
        mName: user.mName,
        lName: user.lName,
        DOB: user.DOB,
        gender: user.gender,
        email: user.email,
        phone: user.phone,
        role: user.role,
        state: user.state,
        district: user.district,
        area: user.area,
        country: user.country,
        //userCategory: user.userCategory,
        aadhaarCardImage1: user.aadhaarCardImage1,
        aadhaarCardImage2: user.aadhaarCardImage2,
        profileImage: user.profileImage,
        verificationStatus: user.verificationStatus,
        verificationType,
        isPinVerified: user.isPinVerified,
        isOtpVerified: user.isOtpVerified,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    console.error("Error during login:", error);
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { userId, oldPassword, newPassword } = req.body;

    // ✅ Step 1: Check if user exists
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // ✅ Step 2: Verify Old Password
    const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Old password is incorrect" });
    }

    // ✅ Step 3: Hash New Password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // ✅ Step 4: Update Password in Database
    user.password = hashedNewPassword;
    await user.save();

    return res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    console.error("Error resetting password:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

export const getOccupation = async (req, res) => {
  try {
    const occupations = await OccupationModel.find();
    return res.status(200).json({ occupations });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching user", error: error.message });
  }
};

export const verifyPin = async (req, res) => {
  try {
    const { userId, pin } = req.body;
    console.log("Incoming PIN Verification Request:", req.body);

    // Validate request data
    if (!userId || !pin) {
      console.warn("Missing required fields:", { userId, pin });
      return res.status(400).json({ message: "User ID and PIN are required" });
    }

    // Find user in the database
    const user = await UserModel.findById(userId);
    if (!user) {
      console.warn("User not found:", userId);
      return res.status(404).json({ message: "User not found" });
    }

    console.log("User found:", {
      userId: user._id,
      assignedPins: user.assignedPins,
    });

    // Validate PIN against database
    const existingPin = await CodeModel.findOne({ code: pin });
    if (!existingPin) {
      console.warn("Invalid PIN entered:", pin);
      return res.status(400).json({ message: "Invalid PIN" });
    }
    existingPin.use_count += 1;
    await existingPin.save();

    // Assign PIN to user and mark as verified
    user.assignedPins = pin;
    user.isPinVerified = true;
    await user.save();
    console.info("PIN assigned and verified for user:", userId);

    // Update CodeModel with assigned user
    const userIdObject = new mongoose.Types.ObjectId(user._id);
    await CodeModel.findOneAndUpdate(
      { code: pin },
      {
        $addToSet: { assignedUsers: userIdObject },
        $inc: { assignedCount: 1 },
      }
    );
    console.info("Updated CodeModel for PIN:", pin);

    return res.status(200).json({ message: "PIN verified successfully!" });
  } catch (error) {
    console.error("PIN verification error:", error);
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

export const updateUser1 = async (req, res) => {
  try {
    let { _id, ...updates } = req.body;

    // ✅ Validate User ID (Corrected)
    if (!_id) {
      return res.status(400).json({ message: "User ID is required" });
    }

    // ✅ Convert User ID to ObjectId if needed
    const userId = mongoose.Types.ObjectId.isValid(_id)
      ? new mongoose.Types.ObjectId(_id)
      : _id;

    // 🔍 Find User by userId (Corrected)
    const existingUser = await UserModel.findOne({ _id: userId });

    if (!existingUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const objectId = existingUser._id;

    // 🔄 Handle Image Uploads (If Provided)
    const profileImage = req.files?.image?.[0]?.path;
    const aadhaarFrontImage = req.files?.aadhaarProofs?.[0]?.path;
    const aadhaarBackImage = req.files?.aadhaarProofs?.[1]?.path;

    // ✅ Update Images Only If They Are Provided
    if (profileImage) updates.image = profileImage;
    if (aadhaarFrontImage) updates.aadhaarFront = aadhaarFrontImage;
    if (aadhaarBackImage) updates.aadhaarBack = aadhaarBackImage;

    // 🔄 Update Only Provided Fields
    Object.keys(updates).forEach((key) => {
      if (updates[key] !== undefined && updates[key] !== null) {
        existingUser[key] = updates[key];
      }
    });

    await existingUser.save();

    return res.status(200).json({
      message: "User updated successfully",
      objectId,
      updatedData: updates,
    });
  } catch (err) {
    console.error("❌ Error updating user:", err);
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: err.message });
  }
};

export const updateUser = async (req, res) => {
  try {
    let { userId, ...updateData } = req.body;

    // ✅ Validate User ID
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    // ✅ Convert User ID to ObjectId if needed
    const userObjectId = mongoose.Types.ObjectId.isValid(userId)
      ? new mongoose.Types.ObjectId(userId)
      : userId;

    // 🔍 Find User
    const user = await UserModel.findById(userObjectId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // ✅ Fields that need array shifting
    const arrayFields = [
      "phone",
      "fName",
      "lName",
      "mName",
      "gender",
      "state",
      "district",
      "area",
      "profileImage",
      "aadhaarCardImage1",
      "aadhaarCardImage2",
      "aadharNumber",
    ];

    let updatedFields = {}; // Store updated fields

    // ✅ Handle Image Uploads (If Provided)
    const profileImage = req.files?.image?.[0]?.path;
    const aadhaarFrontImage = req.files?.aadhaarProofs?.[0]?.path;
    const aadhaarBackImage = req.files?.aadhaarProofs?.[1]?.path;

    if (profileImage) updateData.profileImage = profileImage;
    if (aadhaarFrontImage) updateData.aadhaarCardImage1 = aadhaarFrontImage;
    if (aadhaarBackImage) updateData.aadhaarCardImage2 = aadhaarBackImage;

    // ✅ Update & Shift Array Values
    arrayFields.forEach((field) => {
      if (updateData[field]) {
        if (!Array.isArray(user[field])) {
          user[field] = [];
        }

        // Ensure array has exactly 2 elements
        if (user[field].length > 1) {
          user[field].shift(); // Remove index[0] (old)
        }

        // Shift index[1] to index[0] if exists
        if (user[field].length === 1) {
          user[field][0] = user[field][0];
        }

        // ✅ Save new data at index[1]
        user[field][1] = updateData[field];

        // Store updated field for response
        updatedFields[field] = user[field][1];
      }
    });

    // ✅ Update Other Non-Array Fields
    Object.keys(updateData).forEach((key) => {
      if (!arrayFields.includes(key)) {
        user[key] = updateData[key];
        updatedFields[key] = updateData[key];
      }
    });

    // ✅ Save updated user
    await user.save();

    return res.status(200).json({
      message: "User updated successfully",
      updatedFields, // ✅ Return only newly updated fields
    });
  } catch (error) {
    console.error("❌ Error updating user:", error);
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
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
export const verifyOtp = async (req, res) => {
  const { userId, otp } = req.body;

  try {
    const user = await UserModel.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Ensure the user is verified before verifying OTP
    if (user.isPinVerified !== true) {
      return res
        .status(400)
        .json({ message: "User is not verified yet by admin" });
    }

    // Check if OTP exists and is not expired
    const currentTime = new Date().getTime();
    if (user.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (user.otpUsed) {
      return res.status(400).json({ message: "OTP has already been used" });
    }

    if (currentTime > user.otpExpiry) {
      return res.status(400).json({ message: "OTP has expired" });
    }

    // OTP is valid and not used yet
    user.isOtpVerified = true; // Mark OTP as used
    await user.save();

    // Send the user details in the response
    return res.status(200).json({
      message: "OTP verified successfully",
      user: {
        userId: user.userId,
        firstName: user.firstName,
        middleName: user.middleName,
        lastName: user.lastName,
        gender: user.gender,
        dateOfBirth: user.dateOfBirth,
        password: user.password,
        Location: user.location,
        occupation: user.occupation,
        otherOccupation: user.otherOccupation,
        email: user.email,
        phone: user.phone,
        userCategory: user.userCategory,
        country: user.country,
        city: user.city,
        countryCode: user.countryCode,
        image: user.image,
        aadhaarFrontImage: user.aadhaarFrontImage,
        aadhaarBackImage: user.aadhaarBackImage,
        role: user.role,
        verificationStatus: user.verificationStatus,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export const createNewPassword = async (req, res) => {
  const { email, password } = req.body; // New password from user

  try {
    // Find user by email
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if OTP has expired (1 hour validity)
    const otpExpirationTime = 60 * 60 * 1000; // 1 hour in milliseconds
    if (Date.now() - user.otpTimestamp > otpExpirationTime) {
      return res.status(400).json({ message: "OTP has expired" });
    }

    // Hash the new password before storing
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update user's password
    user.password = hashedPassword;

    // Optionally, reset OTP and timestamp after password update
    user.otp = null;
    user.otpTimestamp = null;

    // Save the updated user
    await user.save();

    // Return success response
    return res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Error updating password:", error);
    return res
      .status(500)
      .json({ message: "An error occurred while updating the password" });
  }
};

export const checkBothUser = async (req, res) => {
  const { email } = req.body;
  const user = await UserModel.findOne({ email });

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  return res.json({ userType: user.userCategory });
};

export const getOtherOccupations = async (req, res) => {
  try {
    const otherOccupations = await UserModel.find(
      { otherOccupation: { $ne: "" } }, // खाली (empty) values को हटा दें
      { _id: 0, otherOccupation: 1 } // केवल otherOccupation फ़ील्ड लाएं
    );

    // Duplicate values को हटाएं (Set का उपयोग करके)
    const uniqueOtherOccupations = [
      ...new Set(otherOccupations.map((item) => item.otherOccupation)),
    ];

    return res.status(200).json(uniqueOtherOccupations);
  } catch (err) {
    console.error("Error fetching other occupations:", err);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export const getProductTypes = async (req, res) => {
  try {
    const sub_product_types = await SubProductTypeModel.find().populate({
      path: "productType",
    });

    console.log(sub_product_types);

    return res
      .status(200)
      .json({
        success: true,
        message: "Product sub type fetch successfully.",
        sub_product_types,
      });
  } catch (err) {
    console.error("Error fetching product types:", err);
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong" });
  }
};

export const getProductSubType = async (req, res) => {
  try {
    console.log("Product Sub Type");
    const { sub_product_type_id } = req.params;
    console.log(sub_product_type_id);
    const sub_product_types = await SubProductTypeModel.find({
      productType: sub_product_type_id,
    }).populate({
      path: "productType",
    });

    return res.status(200).json({success:true,message:"sub product type fetch successfully.",sub_product_types});
  } catch (err) {
    console.error("Error fetching product sub types:", err);
    return res.status(500).json({ message: "Something went wrong" });
  }
};
