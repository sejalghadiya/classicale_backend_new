import Admin from "../model/admin.js"; // Import the Admin model
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { ProductModel } from "../model/product.js";
import { UserModel } from "../model/user.js";
import mongoose from "mongoose";
import { ConversationModel } from "../model/conversation.js";
import { CommunicateModel } from "../model/chat.js";
import { ProductTypeModel } from "../model/product_type.js";
import { SubProductTypeModel } from "../model/sub_product_type.js";
import nodemailer from "nodemailer";
import { CodeModel } from "../model/pin.js";
export const adminLogin = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find the admin user by email
    const admin = await Admin.findOne({ email });

    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    // Compare the provided password with the hashed password
    const isMatch = await bcrypt.compare(password, admin.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Generate a JWT token
    const token = jwt.sign(
      { id: admin._id, role: admin.role },
      process.env.JWT_SECRET, // Use environment variable for secret
      { expiresIn: "60d" }
    );

    // Respond with token and admin details
    res.json({ token, name: admin.username, email: admin.email });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getAllProducts = async (req, res) => {
  try {
    const products = await ProductModel.find();
    res.status(200).json(products);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching products", error: error.message });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { productId } = req.body;
    // Check if the productId is valid
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: "Invalid Product ID" });
    }

    // Find the product by product ID
    const existingProduct = await ProductModel.findById(productId);

    if (!existingProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Capture old product values for comparison
    const oldProduct = { ...existingProduct.toObject() };

    // Extract fields to update from the request body
    const {
      title,
      brand,
      year,
      description,
      model,
      categories,
      price,
      productType,
      subProductType,
    } = req.body;

    // Update the product details if they are provided in the request
    if (title !== undefined) {
      existingProduct.oldTitle = oldProduct.title;
      existingProduct.title = title;
    }

    if (brand !== undefined) {
      existingProduct.oldBrand = oldProduct.brand;
      existingProduct.brand = brand;
    }

    if (categories !== undefined) {
      existingProduct.oldCategories = oldProduct.categories;
      existingProduct.categories = categories;
    }

    if (year !== undefined) {
      existingProduct.oldYear = oldProduct.year;
      existingProduct.year = year;
    }

    if (description !== undefined) {
      existingProduct.oldDescription = oldProduct.description;
      existingProduct.description = description;
    }

    if (model !== undefined) {
      existingProduct.oldModel = oldProduct.model;
      existingProduct.model = model;
    }

    if (price !== undefined) {
      existingProduct.oldPrice = oldProduct.price;
      existingProduct.price = price;
    }

    if (productType !== undefined) {
      existingProduct.oldProductType = oldProduct.productType;
      existingProduct.productType = productType;
    }

    if (subProductType !== undefined) {
      existingProduct.oldSubProductType = oldProduct.subProductType;
      existingProduct.subProductType = subProductType;
    }

    // Update the updatedTime field
    existingProduct.updatedTime = Date.now();

    // Save the updated product
    await existingProduct.save();
    // Respond with success message and old/new product details
    return res.status(200).json({
      message: "Product updated successfully by admin",
      productId: productId.toString(),
      oldProduct: oldProduct,
      newProduct: existingProduct.toObject(),
    });
  } catch (err) {
    console.error("Error updating product by admin:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.body; // Product ID from request body

    if (!id) {
      return res.status(400).json({ message: "Product ID is required" });
    }

    // Delete the product
    const result = await ProductModel.findByIdAndDelete(id);

    if (!result) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Return success response
    return res.status(200).json({ message: "Product deleted successfully" });
  } catch (err) {
    console.error("Error deleting product:", err);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export const getUser = async (req, res) => {
  try {
    // Fetch all users, excluding sensitive information such as passwords
    const users = await UserModel.find().select(
      "-password -token -sensitiveField"
    );

    if (!users || users.length === 0) {
      // If no users found, return 404 status
      return res.status(404).json({ message: "No users found" });
    }

    // Return the array of users
    return res.status(200).json(users);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export const getAllConversation = async (req, res) => {
  try {
    // Verify admin authorization (pseudo-code, replace with actual check)

    // Retrieve all conversations
    const conversations = await ConversationModel.find(); // Fetch all conversations

    // Log to check fetched conversations
    console.log(conversations);

    res.status(200).json({
      message: "Conversations retrieved successfully",
      conversations,
    });
  } catch (error) {
    console.error(error); // Log the error for debugging
    res.status(500).json({ message: "Error retrieving conversations", error });
  }
};

export const getUserProducts = async (req, res) => {
  const { userId } = req.body; // Extract userId from the request body

  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }

  try {
    // Fetch products associated with the given userId
    const products = await ProductModel.find({ userId: userId });
    res.json({ products });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getUserChats = async (req, res) => {
  const { conversationId } = req.body;
  console.log("&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&");
  console.log(conversationId);

  if (!conversationId) {
    return res
      .status(200)
      .json({ success: false, error: "conversationId is required" });
  }

  try {
    const conversation = await CommunicateModel.findOne({
      conversationId,
    });
    console.log("????????????????????????????????");
    console.log(conversation.messages);
    console.log("******************@@@@@****************");

    if (!conversation) {
      return res.status(400).json({ message: "No conversation found" });
    }

    return res.status(200).json({
      success: true,
      messages: conversation.messages,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export const getFavoriteProduct = async (req, res) => {
  try {
    const { userId } = req.body; // Get userId from request body

    // Check if userId is provided
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    // Find the user by userId
    const user = await UserModel.findOne({ userId: userId });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if user has any favorite products
    if (!Array.isArray(user.favorites) || user.favorites.length === 0) {
      return res
        .status(200)
        .json({ message: "No favorite products found", favorites: [] });
    }

    // Fetch the favorite products by their IDs
    const favoriteProducts = await ProductModel.find({
      _id: { $in: user.favorites.map((id) => id) },
    });

    res.status(200).json({
      message: "Favorite products retrieved successfully",
      favorites: favoriteProducts,
    });
  } catch (error) {
    console.error("Error retrieving favorite products:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteUser = async (req, res) => {
  try {
    // Verify that the requesting user is an admin
    const { userId, adminId } = req.body;

    console.log("User Object", userId);

    // Check if userObjectId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid ObjectId format" });
    }

    console.log(
      `Admin ${adminId} is attempting to delete user with ObjectId ${userId}`
    );

    // Find the user to delete by ObjectId
    const userToDelete = await UserModel.findById(userId);

    if (!userToDelete) {
      // If user not found, return 404 status
      return res.status(404).json({ message: "User not found" });
    }

    // Delete the user from the database by ObjectId
    await UserModel.deleteOne({ _id: userId });

    // Return success message with admin and user details
    return res.status(200).json({
      message: `Admin ${adminId} successfully deleted user with ObjectId ${userId}`,
    });
  } catch (err) {
    console.error("Error in deleteUser:", err);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

const ObjectId = mongoose.Types.ObjectId;
export const getDeletedMessages = async (req, res) => {
  const { messageId } = req.body; // Expecting messageId in the request body

  // Check if messageId is provided
  if (!messageId) {
    return res.status(400).json({
      success: false,
      error: "Message ID is required.",
    });
  }

  try {
    // Ensure messageId is a valid ObjectId
    const messageObjectId = new ObjectId(messageId);

    // Find and delete the message by messageId
    const result = await CommunicateModel.updateOne(
      { "messages._id": messageObjectId },
      { $pull: { messages: { _id: messageObjectId } } } // This removes the message with the specified ID
    );

    // Check if any document was modified
    if (result.modifiedCount === 0) {
      return res.status(404).json({
        success: false,
        error: "Message not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Message deleted successfully.",
    });
  } catch (error) {
    console.error("Error deleting message:", error);
    res.status(500).json({
      success: false,
      error: "An error occurred while deleting the message.",
    });
  }
};

export const adminVerifyUser1 = async (req, res) => {
  const { userId, isOtpVerified } = req.body;

  try {
    // Find the user by ID
    const user = await UserModel.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    user.isOtpVerified = isOtpVerified;
    await user.save();

    if (isOtpVerified === true) {
      const otp = generateOtp(6);
      user.otp = otp;
      await user.save();
      await sendOtpEmail(user.email, otp);

      return res.status(200).json({ message: "User verified and OTP sent." });
    } else {
      return res.status(200).json({ message: "User verification rejected." });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export const adminVerifyUser = async (req, res) => {
  const { userId, isVerified } = req.body;

  try {
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // ✅ Update verification status
    user.isVerified = isVerified;

    if (isVerified) {
      // ✅ Generate OTP and save
      const otp = generateOtp(6);
      user.otp = otp;
      user.otpUsed = false; // Ensure OTP is fresh
      await sendOtpEmail(user.email, otp);
    }

    await user.save(); // ✅ Save all changes in one go

    return res.status(200).json({
      message: isVerified
        ? "User verified and OTP sent."
        : "User verification rejected.",
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

const generateOtp = (length = 6) => {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  const numbers = "0123456789";

  let otp = "";

  // Add 2 random numbers
  for (let i = 0; i < 2; i++) {
    otp += numbers.charAt(Math.floor(Math.random() * numbers.length));
  }

  // Add 4 random letters
  for (let i = 0; i < 4; i++) {
    otp += letters.charAt(Math.floor(Math.random() * letters.length));
  }

  // Shuffle OTP to mix numbers and letters
  otp = otp
    .split("")
    .sort(() => Math.random() - 0.5)
    .join("");

  return otp;
};

const sendOtpEmail = async (email, otp) => {
  // Create transporter for sending email using Gmail (or any other email service)
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
    to: email,
    subject: "Password Reset OTP",
    text: `Hello, \n\nYour OTP for resetting the password is: ${otp}\n\nThis OTP is valid for 10 minutes.`,
  };
  try {
    // Send email
    await transporter.sendMail(mailOptions);
    console.log(`OTP sent to ${email}`);
  } catch (error) {
    console.error(`Error sending OTP: ${error.message}`);
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
    if (user.verificationStatus !== "Verified") {
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
    user.otpUsed = true; // Mark OTP as used
    await user.save();

    return res.status(200).json({ message: "OTP verified successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

//add Product type

export const addProductType = async (req, res) => {
  try {
    console.log("Product type");
    console.log("+++++++++++++++++");
    const { name, modelName } = req.body;
    if (!name) {
      return res.status(400).json({ message: "Product type is required" });
    }

    const newProductType = new ProductTypeModel({ name, modelName });

    await newProductType.save();

    res.status(201).json({
      message: "Product Type added successfully!",
      data: newProductType,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error!",
      error: error.message,
    });
  }
};

export const getProductTypes = async (req, res) => {
  try {
    const productTypes = await ProductTypeModel.find();
    res.status(200).json({
      message: "Product Types fetched successfully!",
      data: productTypes,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error!", error: error.message });
  }
};

export const addSubProductType = async (req, res) => {
  try {
    const { name, productType } = req.body;

    if (!name || !productType) {
      return res
        .status(400)
        .json({ message: "Name and Product Type are required" });
    }

    // Check if the product type exists
    const productTypeExists = await ProductTypeModel.findById(productType);
    if (!productTypeExists) {
      return res.status(404).json({ message: "Product Type not found" });
    }

    const newSubProductType = new SubProductTypeModel({ name, productType });
    await newSubProductType.save();

    res.status(201).json({
      message: "SubProduct Type added successfully!",
      data: newSubProductType,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error!", error: error.message });
  }
};

export const getSubProductTypes = async (req, res) => {
  try {
    const { productTypeId } = req.query;

    if (!productTypeId) {
      return res.status(400).json({ message: "Product Type ID is required" });
    }

    // Find only those subProductTypes which have matching productType
    const subProductTypes = await SubProductTypeModel.find({
      productType: productTypeId,
    }).populate("productType");

    res.status(200).json({
      message: "SubProduct Types fetched successfully!",
      data: subProductTypes,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error!", error: error.message });
  }
};

export const addCode = async (req, res) => {
  try {
    const { code_data } = req.body;

    if (!code_data || !Array.isArray(code_data) || code_data.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "Code is required" });
    }

    const savedCodes = [];

    for (const item of code_data) {
      const existingCode = await CodeModel.findOne({ code: item.code });

      if (!existingCode) {
        const newCode = new CodeModel(item);
        const savedCode = await newCode.save();
        savedCodes.push(savedCode);
      }
    }

    res.status(200).json({
      success: true,
      message: "Codes added successfully!",
      data: savedCodes,
    });
  } catch (error) {
    console.error("Error adding codes:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error!", error: error.message });
  }
};

export const assignCodeToUser = async (req, res) => {
  try {
    const { userId, codeId } = req.body;

    if (!userId ||!codeId) {
      return res
       .status(400)
       .json({ success: false, message: "User ID and Code ID are required" });
    }

    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const code = await CodeModel.findById(codeId);
    if (!code) {
      return res.status(404).json({ success: false, message: "Code not found" });
    }

    if (user.codes.includes(codeId)) {
      return res
       .status(400)
       .json({ success: false, message: "Code is already assigned to this user" });
    }
  } catch (error) {
    console.error("Error assigning codes to user:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error!", error: error.message });
  }
};
