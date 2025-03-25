import { ProductModel } from "../model/product.js";
import { UserModel } from "../model/user.js";
import dotenv from "dotenv";
import mongoose from "mongoose";
import nodemailer from "nodemailer";

dotenv.config();

export const addProduct2 = async (req, res) => {
  try {
    const user = await UserModel.findOne({ userId: req.user.userId });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const { title, category } = req.body;

    // ✅ Check if the product is already in the process of being added
    const existingProduct = await ProductModel.findOne({
      title: title.trim(),
      categories: { $in: [category] },
      addProductUserId: user._id,
    });

    if (existingProduct) {
      return res.status(400).json({
        message: "This product has already been added.",
      });
    }

    // ✅ Save Product in Database
    const productData = {
      title,
      brand: req.body.brand,
      year: req.body.year,
      description: req.body.description,
      model: req.body.model,
      categories: req.body.categories,
      price: req.body.price,
      productType: req.body.productType,
      subProductType: req.body.subProductType || req.body.adTitle,
      images:
        req.files?.images?.map((img) => `/public/images/${img.filename}`) || [],
      pdfResume: req.files?.pdfResume
        ? `/public/pdfs/${req.files.pdfResume[0].filename}`
        : "",
      userId: req.user.userId,
      addProductUserId: user._id,
      createdTime: Date.now(),
      updatedTime: Date.now(),
      location: {
        state: user.state || "Unknown",
        district: user.district || "Unknown",
        locationName: user.locationName || "Unknown",
      },
    };

    const newProduct = new ProductModel(productData);
    await newProduct.save();

    // ✅ Update user's product count
    user.productCount = (user.productCount || 0) + 1;
    await user.save();

    res.status(201).json({
      message: "Product added successfully!",
      productId: newProduct._id,
      product: newProduct,
    });
  } catch (error) {
    console.error("Error adding product:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

export const addProduct22 = async (req, res) => {
  try {
    const user = await UserModel.findOne({ userId: req.user?.userId });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const productData = { ...req.body };

    if (!productData.title || !productData.categories) {
      return res
        .status(400)
        .json({ message: "Title and Category are required." });
    }

    const existingProduct = await ProductModel.findOne({
      title: productData.title?.trim(),
      categories: { $in: [productData.categories] },
      addProductUserId: user._id,
    });

    if (existingProduct) {
      return res
        .status(400)
        .json({ message: "This product has already been added." });
    }

    if (req.files?.images) {
      if (!Array.isArray(req.files.images)) {
        req.files.images = [req.files.images];
      }
      productData.images = req.files.images.map(
        (img) => `/public/images/${img.filename}`
      );
    } else {
      productData.images = [];
    }

    // 📄 Handle PDF Upload
    if (req.files?.pdfResume && req.files.pdfResume.length > 0) {
      const pdfFilePath = `/public/pdfs/${req.files.pdfResume[0].filename}`;
      productData.pdfResume = pdfFilePath;
      console.log("Uploaded PDF Path:", pdfFilePath); // ✅ Debugging
    } else {
      productData.pdfResume = ""; // 🛠 Set empty if no PDF uploaded
    }

    console.log("PDF Path:", req.files.pdfResume?.[0]?.path);

    productData.userId = req.user.userId;
    productData.addProductUserId = user._id;
    productData.createdTime = Date.now();
    productData.updatedTime = Date.now();
    productData.location = {
      state: user.state || "Unknown",
      district: user.district || "Unknown",
      locationName: user.locationName || "Unknown",
    };

    const newProduct = new ProductModel(productData);
    await newProduct.save();

    user.productCount = (user.productCount || 0) + 1;
    await user.save();

    res.status(201).json({
      message: "Product added successfully!",
      productId: newProduct._id,
      product: newProduct,
      pdfLink: `${req.protocol}://${req.get("host")}${productData.pdfResume}`, // 📄 PDF का Link
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error.", error: error.message });
  }
};
export const addProduct = async (req, res) => {
  try {
    // 🔍 Find the user
    const user = await UserModel.findOne({ userId: req.user?.userId });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const productData = { ...req.body };

    // 🖼️ Handle image uploads
    if (req.files?.images) {
      if (!Array.isArray(req.files.images)) {
        req.files.images = [req.files.images];
      }
      productData.images = req.files.images.map(
        (img) => `/public/images/${img.filename}`
      );
    } else {
      productData.images = [];
    }

    if (req.files?.pdfResume && req.files.pdfResume.length > 0) {
      const pdfFilePath = `/public/pdfs/${req.files.pdfResume[0].filename}`;
      console.log("✅ Uploaded PDF Path:", pdfFilePath);
      productData.pdfResume = pdfFilePath; 
    } else {
      console.log("❌ No PDF uploaded.");
    }
    console.log("PDF Path:", productData.pdfResume); 

    console.log("PDF Path:", productData.pdfResume); 

    // 🗂️ Set other product data
    productData.userId = req.user.userId;
    productData.addProductUserId = user._id;
    productData.createdTime = Date.now();
    productData.updatedTime = Date.now();
    productData.location = {
      state: user.state || "Unknown",
      district: user.district || "Unknown",
      locationName: user.locationName || "Unknown",
    };

    // 🆕 Create and save the new product
    const newProduct = new ProductModel(productData);
    await newProduct.save();

    // 📄 Send PDF link in response
    res.status(201).json({
      message: "Product added successfully!",
      productId: newProduct._id,
      product: newProduct,
      //pdfLink: `${req.protocol}://${req.get("host")}${productData.pdfResume}`, // 📄 PDF link
    });
  } catch (error) {
    console.log("Error:", error);
    res
      .status(500)
      .json({ message: "Internal server error.", error: error.message });
  }
};

export const searchProduct1 = async (req, res) => {
  try {
    const { query } = req.body;

    if (!query) {
      return res.status(400).json({ message: "Query is required" });
    }
    const searchRegex = new RegExp(query, "i");
    const products = await ProductModel.find({
      $or: [
        { title: searchRegex },
        { productType: searchRegex },
        { subProductType: searchRegex },
      ],
    }).select("productType subProductType");

    console.log("Found products:", products);
    res.status(200).json(products);
  } catch (error) {
    console.error("Error in search API:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const searchProduct = async (req, res) => {
  try {
    const { query } = req.body;

    if (!query) {
      return res.status(400).json({ message: "Query is required" });
    }

    const searchRegex = new RegExp(query, "i");
    console.log("Search Query:", query);
    console.log("Search Regex:", searchRegex);

    const products = await ProductModel.find({
      $or: [
        { title: searchRegex },
        { productType: searchRegex },
        { subProductType: searchRegex },
      ],
    }).select("title productType subProductType");

    console.log("Found products:", products);
    res.status(200).json(products);
  } catch (error) {
    console.error("Error in search API:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const showProduct1 = async (req, res) => {
  try {
    // Query parameters ko decode karein
    const state = decodeURIComponent(req.query.state || "").trim();
    const district = decodeURIComponent(req.query.district || "").trim();
    const locationName = decodeURIComponent(
      req.query.locationName || ""
    ).trim();
    const searchQuery = decodeURIComponent(req.query.search || "").trim(); // ✅ Search Query Add Kiya

    // Special characters ko escape karein
    const escapeRegex = (str) => {
      return str.replace(/[.*+?^=!:${}()|\[\]\/\\]/g, "\\$&");
    };

    // Default query: isDeleted false hone chahiye
    const query = { isDeleted: false };

    // Location-based filters
    if (state) {
      query["location.state"] = { $regex: new RegExp(escapeRegex(state), "i") };
    }
    if (district) {
      query["location.district"] = {
        $regex: new RegExp(escapeRegex(district), "i"),
      };
    }
    if (locationName) {
      query["location.locationName"] = {
        $regex: new RegExp(escapeRegex(locationName), "i"),
      };
    }

    // ✅ **Search Query ko Filter mein Add karein**
    if (searchQuery) {
      query["$or"] = [
        { productType: { $regex: new RegExp(escapeRegex(searchQuery), "i") } }, // 🔍 Product Type Search
        {
          subProductType: { $regex: new RegExp(escapeRegex(searchQuery), "i") },
        }, // 🔍 Sub Product Type Search
      ];
    }

    console.log("Constructed Query:", query); // Debugging ke liye query log karein

    // Database se products fetch karein
    const products = await ProductModel.find(query);

    if (!products.length) {
      return res.status(404).json({
        message: `No products found for search: ${searchQuery}, district: ${district}, state: ${state}`,
      });
    }

    res.status(200).json(products);
  } catch (err) {
    console.error("Error in showProduct:", err);
    res.status(500).send("Internal Server Error");
  }
};

export const showProduct = async (req, res) => {
  try {
    // Query parameters ko decode karein
    const state = decodeURIComponent(req.query.state || "").trim();
    const district = decodeURIComponent(req.query.district || "").trim();
    const locationName = decodeURIComponent(
      req.query.locationName || ""
    ).trim();
    const searchQuery = decodeURIComponent(req.query.search || "").trim();

    // Special characters ko escape karein
    const escapeRegex = (str) => {
      return str.replace(/[.*+?^=!:${}()|\[\]\/\\]/g, "\\$&");
    };

    // Default query: isDeleted false hone chahiye
    const query = { isDeleted: false };

    // ✅ Location-based filters (अगर यूज़र ने फ़िल्टर दिए हैं)
    if (state) {
      query["location.state"] = { $regex: new RegExp(escapeRegex(state), "i") };
    }
    if (district) {
      query["location.district"] = {
        $regex: new RegExp(escapeRegex(district), "i"),
      };
    }
    if (locationName) {
      query["location.locationName"] = {
        $regex: new RegExp(escapeRegex(locationName), "i"),
      };
    }
    if (searchQuery) {
      query["$or"] = [
        { productType: { $regex: new RegExp(escapeRegex(searchQuery), "i") } },
        {
          subProductType: { $regex: new RegExp(escapeRegex(searchQuery), "i") },
        },
        { productName: { $regex: new RegExp(escapeRegex(searchQuery), "i") } },
        { description: { $regex: new RegExp(escapeRegex(searchQuery), "i") } },
        { category: { $regex: new RegExp(escapeRegex(searchQuery), "i") } },
        { brand: { $regex: new RegExp(escapeRegex(searchQuery), "i") } },
        { title: { $regex: new RegExp(escapeRegex(searchQuery), "i") } },
        {
          "location.state": {
            $regex: new RegExp(escapeRegex(searchQuery), "i"),
          },
        },
        {
          "location.district": {
            $regex: new RegExp(escapeRegex(searchQuery), "i"),
          },
        },
        {
          "location.locationName": {
            $regex: new RegExp(escapeRegex(searchQuery), "i"),
          },
        },
      ];
    }

    console.log("Constructed Query:", JSON.stringify(query, null, 2));
    const products = await ProductModel.find(query);

    if (!products.length) {
      return res.status(404).json({
        message: `No products found for search: ${searchQuery}, district: ${district}, state: ${state}`,
      });
    }

    res.status(200).json(products);
  } catch (err) {
    console.error("Error in showProduct:", err);
    res.status(500).send("Internal Server Error");
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

    console.log(productId); // Debugging ke liye

    // Fetch user details
    const user = await UserModel.findOne({ userId: req.user.userId });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Ensure `favorites` is an array
    if (!Array.isArray(user.favorites)) {
      user.favorites = [];
    }

    var o_id = new mongoose.Types.ObjectId(productId);

    // Check if product exists
    const product = await ProductModel.findById({ _id: o_id });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // **Toggle Logic: Add or Remove**
    const favoriteIndex = user.favorites.indexOf(productId);
    if (favoriteIndex === -1) {
      // ✅ Add to favorites
      user.favorites.push(productId);
      await user.save();
      return res.status(200).json({
        message: "Product added to favorites successfully",
        favorites: user.favorites,
      });
    } else {
      // ❌ Remove from favorites
      user.favorites.splice(favoriteIndex, 1);
      await user.save();
      return res.status(200).json({
        message: "Product removed from favorites successfully",
        favorites: user.favorites,
      });
    }
  } catch (error) {
    console.error("Error toggling favorite product:", error);
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


export const requestPdfAccess = async (req, res) => {
  const { uploaderId, receiverEmail, pdfUrl, pdfName, requesterName } =
    req.body;

  try {
    // 🟢 Uploader User खोजें
    const uploader = await UserModel.findById(uploaderId);
    if (!uploader) {
      return res.status(404).json({ message: "Uploader not found" });
    }

    // 🟢 Nodemailer Setup
    const transporter = nodemailer.createTransport({
      service: "gmail",
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: "ttsnikol89@gmail.com",
        pass: "qkrn wlbu wnft qzgn",
      },
    });

    // 🟢 Yes और No Button वाली URL
    const yesUrl = `http://yourdomain.com/api/handlePdfAccess?response=yes&uploaderId=${uploaderId}&receiverEmail=${receiverEmail}&pdfUrl=${encodeURIComponent(
      pdfUrl
    )}`;
    const noUrl = `http://yourdomain.com/api/handlePdfAccess?response=no&uploaderId=${uploaderId}&receiverEmail=${receiverEmail}&pdfUrl=${encodeURIComponent(
      pdfUrl
    )}`;

    // 🟢 Email Options
    const mailOptions = {
      from: '"Support Team" <support@yourdomain.com>',
      to: uploader.email,
      subject: "PDF Access Request",
    };

    // 🟢 Email Send करें
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: "Access request email sent to uploader." });
  } catch (error) {
    console.error("Error sending PDF access request:", error);
    res.status(500).json({ message: "Failed to send access request email." });
  }
};

