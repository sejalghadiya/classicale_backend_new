import { ProductModel } from "../model/product.js";
import { UserModel } from "../model/user.js";
import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();


export const addProduct = async (req, res) => {
  try {
    console.log("User ID from request:", req.user.userId); // Ensure user data is available

    // 1. Fetch user details based on userId passed through the token
    const user = await UserModel.findOne({ userId: req.user.userId });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 2. Ensure an image file is uploaded
    // if (!req.files) {
    //   return res.status(400).json({ message: "No image uploaded" });
    // }

    // 3. Construct the image path
    // const imagePath = /images/${req.file.filename};

    const images = [];
    req.files.forEach((image) => {
      images.push(`/images/${image.filename}`);
    });

    // 4. Extract product details from the request body
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

    // 5. Create a new product with userId and addProductUserId set
    const newProduct = new ProductModel({
      title,
      brand,
      year,
      description,
      model,
      categories,
      price,
      productType,
      subProductType,
      images: images, // Add the uploaded image path
      userId: req.user.userId, // Passed from token/user middleware
      addProductUserId: user._id, // User's database _id
      createdTime: Date.now(),
      updatedTime: Date.now(),
    });

    // 6. Save the product to the database
    await newProduct.save();

    // 7. Increment the product count for the user
    user.productCount += 1;
    await user.save();

    // 8. Return the response
    res.status(201).json({
      message: "Product added successfully",
      productId: newProduct._id,
      product: newProduct,
    });
  } catch (error) {
    console.error("Error adding product:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
export const showProduct = async (req, res) => {
  try {
    const products = await ProductModel.find();
    console.log("+++++++++++++++++++++++++++++++++++++++++++++");
    console.log("products:", products);
    res.status(200).json(products); // The image URLs are already included in the product data
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const userId = req.user.userId; // Extract userId from request
    const { productId } = req.body;

    // Validate productId
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

    // Extract fields to update
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

    // Update fields only if provided
    const fieldsToUpdate = {
      title,
      brand,
      year,
      description,
      model,
      categories,
      price,
      productType,
      subProductType,
    };

    for (const key in fieldsToUpdate) {
      if (fieldsToUpdate[key] !== undefined) {
        existingProduct[`old${key.charAt(0).toUpperCase() + key.slice(1)}`] =
          oldProduct[key]; // Corrected this line
        existingProduct[key] = fieldsToUpdate[key];
      }
    }
    // Update the updatedTime field
    existingProduct.updatedTime = Date.now();

    // Save the updated product
    await existingProduct.save();

    // Update the user document with the productId
    await UserModel.findByIdAndUpdate(
      userId._id,
      { $addToSet: { productIds: productId } },
      { new: true }
    );

    // Log old and new product details
    console.log("Old Product:", oldProduct);
    console.log("New Product:", existingProduct.toObject());

    // Respond with success message and details
    return res.status(200).json({
      message: "Product updated successfully",
      productId: productId.toString(),
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
      return res.status(200).json({
        message: "Product added to favorites successfully",
        favorites: user.favorites,
      });
    } else {
      return res.status(400).json({
        message: "Product already in your favorites",
      });
    }
  } catch (error) {
    console.error("Error adding product to favorites:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const showUserAddProduct = async (req, res) => {
  const { addProductUserId } = req.body;

  if (!addProductUserId) {
    return res.status(400).json({ message: "User ID is required" });
  }

  try {
    // Fetch products associated with the given userId
    const products = await ProductModel.find({
      addProductUserId: addProductUserId,
    });
    console.log("produts:----", products);

    // Return both the products and the count of products
    res.json({
      products,
      productCount: products.length,
    });
  } catch (error) {
    console.error("Error fetching products:", error);
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

export const softDeleteProduct = async (req, res) => {
  try {
    const { productId, addProductUserId } = req.body;

    // Find the product by its ID
    const product = await ProductModel.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Check if the user who owns the product is the one requesting the deletion
    if (product.addProductUserId.toString() !== addProductUserId) {
      return res
        .status(403)
        .json({ message: "You can only delete your own products." });
    }

    // Mark the product as deleted (soft delete)
    product.isDeleted = true;
    product.deletedAt = new Date();

    // Save the changes
    await product.save();

    return res.status(200).json({ message: "Product successfully deleted" });
  } catch (err) {
    console.error("Error deleting product:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};
