import { ProductModel } from "../model/product.js";
import { UserModel } from "../model/user.js";
import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

// This line sets up multer to expect multiple files with the key 'images[]'

export const addProduct = async (req, res) => {
  try {
    // Log the user ID being passed
    console.log("User ID from request:", req.user._id);

    // Check if you're querying by the correct field (userId or _id)
    const user = await UserModel.findOne({ userId: req.user.userId }); // Assuming userId is a number
    // Using findById if userId is MongoDB _id

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Create new product by copying all fields from req.body
    const newProduct = new ProductModel({
      ...req.body, // Spread all fields from req.body into the new product
      userId: req.user.userId,
      addProductUserId: user._id,
      userName: user.firstName,
      userEmail: user.email,
      image: req.file ? req.file.buffer.toString("base64") : undefined,
      createdTime: Date.now(),
      updatedTime: Date.now(),
    });

    await newProduct.save();

    // Increment productCount for the user
    user.productCount += 1;
    await user.save();

    // Return response
    res.status(201).json({
      message: "Product added successfully",
      productId: newProduct._id.toString(),
      addProductUserId: user._id.toString(),
      product: newProduct.toObject(),
      productCount: user.productCount, // Return updated product count
    });
  } catch (error) {
    console.error("Error adding product:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const addProduct11 = async (req, res) => {
  try {
    // Log the user ID being passed
    console.log("User ID from request:", req.user._id);

    // Find the user based on userId
    const user = await UserModel.findOne({ userId: req.user.userId });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Process multiple images
    const images = req.files
      ? req.files.map((file) => file.buffer.toString("base64"))
      : [];

    // Create new product
    const newProduct = new ProductModel({
      ...req.body, // Spread all fields from req.body into the new product
      userId: req.user.userId,
      addProductUserId: user._id,
      userName: user.firstName,
      userEmail: user.email,
      images: images, // Save the array of images
      createdTime: Date.now(),
      updatedTime: Date.now(),
    });

    await newProduct.save();

    // Increment productCount for the user
    user.productCount += 1;
    await user.save();

    // Return response
    res.status(201).json({
      message: "Product added successfully",
      productId: newProduct._id.toString(),
      addProductUserId: user._id.toString(),
      product: newProduct.toObject(),
      productCount: user.productCount, // Return updated product count
    });
  } catch (error) {
    console.error("Error adding product:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const showProduct = async (req, res) => {
  try {
    const products = await ProductModel.find();
    console.log(products);
    res.status(200).json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { productId } = req.body;

    console.log(`Product ID: ${productId}`);
    console.log(`User ID: ${userId}`);

    // Check if the productId is valid
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: "Invalid Product ID" });
    }

    // Find the existing product by product ID and user ID
    const existingProduct = await ProductModel.findOne({
      _id: productId,
      userId: userId,
    });

    if (!existingProduct) {
      return res.status(404).json({
        message:
          "Product not found or you are not authorized to update this product",
      });
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

    // Update the user document with the new productId if not already present
    await UserModel.findByIdAndUpdate(
      userId._id,
      { $addToSet: { productIds: productId } },
      { new: true }
    );

    console.log("Product ObjectID is: ", productId); // Log the ObjectId

    // Respond with success message and old/new product details
    return res.status(200).json({
      message: "Product updated successfully",
      productId: productId.toString(), // Return the productId in the response
      oldProduct: oldProduct,
      newProduct: existingProduct.toObject(),
    });
  } catch (err) {
    console.error("Error updating product:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const addFavoriteProduct = async (req, res) => {
  try {
    const { productId } = req.body;

    // Log the productId for debugging
    console.log(productId);

    // Fetch user details
    const user = await UserModel.findOne({ userId: req.user.userId });
    console.log(user);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Initialize favorites array if not already initialized
    if (!Array.isArray(user.favorites)) {
      user.favorites = [];
    }

    var o_id = new mongoose.Types.ObjectId(productId);
    // Check if the product exists by productId
    const product = await ProductModel.findById({ _id: o_id });
    console.log(o_id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Check if the product ID is already in the user's favorites
    if (!user.favorites.includes(productId)) {
      user.favorites.push(productId); // Add the product ID to the favorites array
      await user.save();
    } else {
      user.favorites.remove(productId);
      await user.save();
    }

    res.status(200).json({
      message: "Product added to favorites successfully",
      favorites: user.favorites,
    });
  } catch (error) {
    console.error("Error adding product to favorites:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getFavoriteProducts = async (req, res) => {
  try {
    // Fetch user details using the userId from the request
    const user = await UserModel.findOne({ userId: req.user.userId });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if the user has any favorites
    if (!Array.isArray(user.favorites) || user.favorites.length === 0) {
      return res
        .status(200)
        .json({ message: "No favorite products found", favorites: [] });
    }

    // Fetch the product details for each favorite product ID
    const favoriteProducts = await ProductModel.find({
      _id: { $in: user.favorites.map((id) => new mongoose.Types.ObjectId(id)) },
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
// Assuming you have UserModel and ProductModel

export const getProductsWithUserDetails = async (req, res) => {
  try {
    // Fetch all products and populate user details
    const products = await ProductModel.find().populate(
      "userId",
      "firstName email profileImage"
    );

    console.log(products.firstName);
    console.log("dart");

    if (!products || products.length === 0) {
      return res.status(404).json({ message: "No products found" });
    }

    return res.status(200).json(products);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

// Assuming you're using Express.js
// controller/product.js
