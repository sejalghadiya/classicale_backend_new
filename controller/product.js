import { UserModel } from "../model/user.js";
import dotenv from "dotenv";
import mongoose from "mongoose";
import nodemailer from "nodemailer";
import { SubProductTypeModel } from "../model/sub_product_type.js";
import { ProductTypeModel } from "../model/product_type.js";
import { BikeModel } from "../model/bike.js";
import { CarModel } from "../model/car.js";
import { BookSportHobbyModel } from "../model/book_sport_hobby.js";
import { ElectronicModel } from "../model/electronic.js";
import { FurnitureModel } from "../model/furniture.js";
import { JobModel } from "../model/job.js";
import { PetModel } from "../model/pet.js";
import { ServicesModel } from "../model/services.js";
import { SmartPhoneModel } from "../model/smart_phone.js";
import { OtherModel } from "../model/other.js";
import { PropertyModel } from "../model/property.js";
import { saveBase64Image } from "../utils/image_store.js";
dotenv.config();

export const addProduct_remove = async (req, res) => {
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
    // productData.userId = req.user.userId;
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

export const updateProduct11 = async (req, res) => {
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

export const addFavoriteProduct1 = async (req, res) => {
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

export const getFavoriteProductsw1 = async (req, res) => {
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

const productModels = {
  Bike: BikeModel,
  Car: CarModel,
  book_sport_hobby: BookSportHobbyModel,
  electronic: ElectronicModel,
  furniture: FurnitureModel,
  Job: JobModel,
  pet: PetModel,
  smart_phone: SmartPhoneModel,
  services: ServicesModel,
  other: OtherModel,
  property: PropertyModel,
};
//add Product
export const addProduct = async (req, res) => {
  try {
    let { data } = req.body;
    console.log(data);
    console.log("++++++++");
    if (!data.userId) {
      console.log("missing UserId", userId);
      return res.status(400).json({ message: "UserId is required" });
    }

    if (!data.productType) {
      console.log("missing product type");
      return res.status(400).json({ message: "Product Type is required" });
    }
    if (!data.subProductType) {
      console.log("missing sub-product type");
      return res.status(400).json({ message: "Sub-Product Type is required" });
    }

    // ✅ Validate if productType exists
    const _productType = await ProductTypeModel.findById(data.productType);
    if (!_productType) {
      console.log("product type not found in db");
      return res.status(404).json({ message: "Product Type not found" });
    }

    // ✅ Validate if subProductType exists under the correct productType
    const _subProductType = await SubProductTypeModel.findOne({
      _id: data.subProductType,
      productType: data.productType,
    });

    if (!_subProductType) {
      console.log("Sub Product Type not found");
      return res.status(404).json({
        message:
          "SubProduct Type not found or does not belong to this Product Type",
      });
    }
    let productImages = data.productImages;
    let imagePaths = [];
    // 🛠 Handle case where productImages is a JSON string instead of an array
    if (typeof productImages === "string") {
      try {
        productImages = JSON.parse(productImages);
      } catch (err) {
        console.error("❌ Failed to parse productImages:", err);
        productImages = [];
      }
    }

    for (const base64Image of productImages) {
      const imagePath = saveBase64Image(
        base64Image,
        "productImages",
        "product"
      );
      imagePaths.push(imagePath);
    }
    data.images = imagePaths; // Add saved image paths to the data object
    // }
    console.log("++++++++++++++++++++++++++++++++++++++++++++++++");
    console.log(imagePaths);
    // ✅ Dynamically get the correct model
    const Model = productModels[_productType.modelName];
    if (!Model) {
      console.log("model not found ");
      return res.status(400).json({ message: "Invalid Model Name" });
    }

    const product = new Model(data);
    await product.save();

    return res.status(200).json({
      message: `${_productType.name} added successfully`,
      product,
    });
  } catch (error) {
    console.log("❌ Server Error:", error.message);
    res.status(500).json({ message: "Server error!", error: error.message });
  }
};
export const updateProduct = async (req, res) => {
  try {
    const { userId, productId, productType, subProductType, ...data } =
      req.body;

    if (!productId)
      return res.status(400).json({ message: "Product ID is required" });

    if (!productType)
      return res.status(400).json({ message: "Product Type is required" });

    const _productType = await ProductTypeModel.findById(productType);
    if (!_productType)
      return res.status(404).json({ message: "Product Type not found" });

    if (!subProductType)
      return res.status(400).json({ message: "Sub-Product Type is required" });

    const _subProductType = await SubProductTypeModel.findOne({
      _id: subProductType,
      productType,
    });
    if (!_subProductType)
      return res.status(404).json({
        message:
          "SubProduct Type not found or does not belong to this Product Type",
      });

    const Model = productModels[_productType.modelName];
    if (!Model) return res.status(400).json({ message: "Invalid Model Name" });

    const product = await Model.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    // ✅ Save OLD version before making changes
    const oldVersion = product.toObject();

    // ✅ Parse and Save New Images (if sent)
    let productImages = req.body.productImages;
    let imagePaths = [];

    if (typeof productImages === "string") {
      try {
        productImages = JSON.parse(productImages);
      } catch (err) {
        console.error("❌ Failed to parse productImages:", err);
        productImages = [];
      }
    }

    if (Array.isArray(productImages) && productImages.length > 0) {
      for (const base64Image of productImages) {
        const imagePath = saveBase64Image(
          base64Image,
          "productImages",
          "product"
        );
        imagePaths.push(imagePath);
      }

      data.images = imagePaths;
    }

    // ✅ Update product fields
    Object.assign(product, data);

    // ✅ Save NEW version after applying updates
    const newVersion = product.toObject();

    // ✅ Store only two versions: [old, new]
    product.history = [oldVersion, newVersion];

    await product.save();

    return res.status(200).json({
      message: `${_productType.name} updated successfully`,
      product,
    });
  } catch (error) {
    console.error("❌ Server Error:", error.message);
    res.status(500).json({ message: "Server error!", error: error.message });
  }
};

// export const updateProduct = async (req, res) => {
//   try {
//     const { userId, productId, productType, subProductType, ...data } =
//       req.body;

//     if (!productId)
//       return res.status(400).json({ message: "Product ID is required" });

//     if (!productType)
//       return res.status(400).json({ message: "Product Type is required" });

//     const _productType = await ProductTypeModel.findById(productType);
//     if (!_productType)
//       return res.status(404).json({ message: "Product Type not found" });

//     if (!subProductType)
//       return res.status(400).json({ message: "Sub-Product Type is required" });

//     const _subProductType = await SubProductTypeModel.findOne({
//       _id: subProductType,
//       productType,
//     });
//     if (!_subProductType)
//       return res.status(404).json({
//         message:
//           "SubProduct Type not found or does not belong to this Product Type",
//       });

//     const Model = productModels[_productType.modelName];
//     if (!Model) return res.status(400).json({ message: "Invalid Model Name" });

//     const product = await Model.findById(productId);
//     if (!product) return res.status(404).json({ message: "Product not found" });

//     // ✅ Parse and Save New Images (if sent)
//     let productImages = req.body.productImages;
//     let imagePaths = [];

//     if (typeof productImages === "string") {
//       try {
//         productImages = JSON.parse(productImages);
//       } catch (err) {
//         console.error("❌ Failed to parse productImages:", err);
//         productImages = [];
//       }
//     }

//     if (Array.isArray(productImages) && productImages.length > 0) {
//       for (const base64Image of productImages) {
//         const imagePath = saveBase64Image(
//           base64Image,
//           "productImages",
//           "product"
//         );
//         imagePaths.push(imagePath);
//       }

//       data.images = imagePaths;
//     }

//     const oldVersion = product.toObject();

//     if (!Array.isArray(product.history)) {
//       product.history = [];
//     }

//     product.history = [oldVersion, product.toObject()];

//     Object.assign(product, data);
//     await product.save();

//     return res.status(200).json({
//       message: `${_productType.name} updated successfully`,
//       product,
//     });
//   } catch (error) {
//     console.error("❌ Server Error:", error.message);
//     res.status(500).json({ message: "Server error!", error: error.message });
//   }
// };

export const deleteProduct = async (req, res) => {
  try {
    const { productId, productType } = req.body;

    if (!productId || !productType) {
      return res
        .status(400)
        .json({ message: "Product ID and Product Type are required" });
    }

    const _productType = await ProductTypeModel.findById(productType);
    if (!_productType) {
      return res.status(404).json({ message: "Product Type not found" });
    }

    const Model = productModels[_productType.modelName];
    if (!Model) {
      return res.status(400).json({ message: "Invalid product type model" });
    }

    const product = await Model.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Mark as soft-deleted
    product.isDeleted = true;
    await product.save();

    return res
      .status(200)
      .json({ message: "Product deleted successfully (soft delete)" });
  } catch (error) {
    console.error("❌ Delete Error:", error.message);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

export const addFavoriteProduct = async (req, res) => {
  try {
    const { userId, productId } = req.body;

    if (!userId || !productId) {
      return res.status(400).json({
        message: "User ID and Product ID are required.",
      });
    }

    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Check if product already exists in favorites
    const existingIndex = user.favorite.findIndex(
      (fav) => fav.productId.toString() === productId.toString()
    );

    if (existingIndex !== -1) {
      // ✅ Product already in favorites —> remove it
      user.favorite.splice(existingIndex, 1);
      await user.save();
      return res.status(200).json({
        message: "Product removed from favorites.",
        favorite: user.favorite,
      });
    }

    // 🔍 Find the model name dynamically
    let foundModelName = null;
    for (const [modelName, Model] of Object.entries(productModels)) {
      const product = await Model.findById(productId);
      if (product) {
        foundModelName = modelName;
        break;
      }
    }

    if (!foundModelName) {
      return res
        .status(404)
        .json({ message: "Product not found in any model." });
    }

    // ➕ Add to favorites
    user.favorite.push({ productId, modelName: foundModelName });
    await user.save();

    return res.status(200).json({
      message: "Product added to favorites.",
      favorite: user.favorite,
    });
  } catch (err) {
    console.error("❌ Error in addFavoriteProduct:", err.message);
    return res.status(500).json({
      message: "Server error.",
      error: err.message,
    });
  }
};

export const getFavoriteProducts = async (req, res) => {
  try {
    const { userId } = req.params;
    console.log(userId);

    if (!userId) {
      return res.status(400).json({ message: "User ID is required." });
    }

    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const favoriteProducts = [];

    for (const favoriteItem of user.favorite) {
      const { productId, modelName } = favoriteItem;

      const ProductModel = productModels[modelName];
      if (ProductModel) {
        const product = await ProductModel.findById(productId);
        if (product) {
          favoriteProducts.push({
            ...product._doc,
            modelName, // For frontend reference
          });
        }
      }
    }
    console.log("Favorites from DB:", user.favorite);

    return res.status(200).json({
      message: "Favorite products fetched successfully.",
      products: favoriteProducts,
    });
  } catch (err) {
    console.error("❌ Error in getFavoriteProducts:", err.message);
    return res.status(500).json({
      message: "Server error.",
      error: err.message,
    });
  }
};

// add other product
export const addOtherProduct = async (req, res) => {
  try {
    let { data } = req.body;
    // ✅ Assign user ID
    if (!data.userId) {
      console.log("missing UserId", userId);
      return res.status(400).json({ message: "UserId is required" });
    }
    console.log(data.price);
    console.log(data.title);
    console.log(data.description);
    console.log(data.productType);
    console.log(data.subProductTypeName);
    if (!data?.productType) {
      console.log("❌ Missing product type");
      return res.status(400).json({ message: "Product Type is required" });
    }

    // 🔁 Handle subProductType or create a new one
    if (!data.subProductType) {
      if (!data.subProductTypeName) {
        console.log("❌ Missing sub-product type name");
        return res
          .status(400)
          .json({ message: "Sub-Product Name is required" });
      }

      const existingSub = await SubProductTypeModel.findOne({
        name: data.subProductTypeName,
      });

      console.log(existingSub);

      if (existingSub) {
        return res
          .status(400)
          .json({ message: "Product Type already exists." });
      }

      const subProductType = new SubProductTypeModel({
        name: data.subProductTypeName,
        productType: data.productType,
      });

      await subProductType.save();
      data.subProductType = subProductType._id;
    }

    // 🔍 Validate Product Type
    const productTypeDoc = await ProductTypeModel.findById(data.productType);
    if (!productTypeDoc) {
      return res.status(404).json({ message: "Product Type not found" });
    }

    // 🔍 Validate SubProduct Type
    const subProductTypeDoc = await SubProductTypeModel.findOne({
      _id: data.subProductType,
      productType: data.productType,
    });

    if (!subProductTypeDoc) {
      return res.status(404).json({
        message: "SubProduct Type not found or not linked to the Product Type",
      });
    }

    // 🖼️ Handle product images
    let productImages = data.productImages;
    console.log("---------------------------->");
    console.log(productImages.length);
    console.log("---------------------------->");
    let imagePaths = [];

    if (typeof productImages === "string") {
      try {
        productImages = JSON.parse(productImages);
      } catch (err) {
        console.error("❌ Failed to parse productImages:", err);
        productImages = [];
      }
    }

    if (Array.isArray(productImages)) {
      for (const base64Image of productImages) {
        const imagePath = await saveBase64Image(
          base64Image,
          "productImages",
          "product"
        );
        console.log(imagePath);
        imagePaths.push(imagePath);
      }
    }

    data.images = imagePaths;
    console.log(data.images);
    // ✅ Save the product
    const product = new OtherModel(data);
    await product.save();

    return res.status(200).json({
      message: `${productTypeDoc.name} added successfully`,
      product,
    });
  } catch (error) {
    console.error("❌ Server Error:", error.message);
    return res
      .status(500)
      .json({ message: "Server error!", error: error.message });
  }
};

export const getAllProducts1 = async (req, res) => {
  try {
    const allProducts = {};

    // Iterate over all product models
    for (const [key, Model] of Object.entries(productModels)) {
      allProducts[key] = await Model.find({})
        .populate({
          path: "productType",
          select: "-modelName",
        })
        .populate({
          path: "subProductType",
          select: "-modelName -productType",
        });
    }

    return res.status(200).json({
      message: "All products fetched successfully",
      products: allProducts,
    });
  } catch (error) {
    console.log("❌ Server Error:", error.message);
    res.status(500).json({ message: "Server error!", error: error.message });
  }
};

export const getAllProducts = async (req, res) => {
  try {
    const allProducts = {};

    for (const [key, Model] of Object.entries(productModels)) {
      const modelSchemaPaths = Model.schema.paths;

      let query = Model.find({})
        .populate({
          path: "productType",
          select: "-modelName",
        })
        .populate({
          path: "subProductType",
          select: "-modelName -productType",
        });

      // ✅ Only populate userId if the schema has the userId field
      if ("userId" in modelSchemaPaths) {
        query = query.populate({
          path: "userId", // Correct field to populate
          select:
            "fName lName mName email phone profileImage state district country area ", // Only pull the fName of the user
        });
      }

      const results = await query;

      results.forEach((product) => {
        // Check if the product has a userId and log the fName
        if (product.userId) {
          if (product.userId.fName) {
            console.log(`📦 [${key}] User fName:`, product.userId.fName);
          } else {
            console.log(`📦 [${key}] User found but no fName`);
          }
        } else {
          console.log(`📦 [${key}] No user`);
        }
      });

      allProducts[key] = results;
    }

    return res.status(200).json({
      message: "All products fetched successfully",
      products: allProducts,
    });
  } catch (error) {
    console.log("❌ Server Error:", error.message);
    res.status(500).json({ message: "Server error!", error: error.message });
  }
};

export const getProductById = async (req, res) => {
  try {
    const { productId, model } = req.query;

    // Validate input
    if (!productId || !model) {
      return res
        .status(400)
        .json({ message: "Product ID and Type are required" });
    }

    // Find the correct model
    const Model = productModels[model];
    if (!Model) {
      return res.status(400).json({ message: "Invalid Product Type" });
    }

    // Fetch the product
    const product = await Model.findById(productId)
      .populate({
        path: "productType",
        select: "-modelName",
      })
      .populate({
        path: "subProductType",
        select: "-modelName -productType",
      });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    return res.status(200).json({
      message: "Product fetched successfully",
      product,
    });
  } catch (error) {
    console.error("❌ Server Error:", error);
    res.status(500).json({ message: "Server error!", error: error.message });
  }
};

export const getProductByCategory1 = async (req, res) => {
  try {
    const { model, category } = req.query;

    // Validate input
    if (!model || !category) {
      return res
        .status(400)
        .json({ message: "Product Type and Category are required" });
    }

    // Get the correct model
    const Model = productModels[model];
    if (!Model) {
      return res.status(400).json({ message: "Invalid Product Type" });
    }

    // Fetch products by category string
    const products = await Model.find({ categories: category })
      .populate({
        path: "productType",
        select: "-modelName",
      })
      .populate({
        path: "subProductType",
        select: "-modelName -productType",
      });

    return res.status(200).json({
      message: "Products fetched successfully",
      products,
    });
  } catch (error) {
    console.error("❌ Server Error:", error);
    res.status(500).json({ message: "Server error!", error: error.message });
  }
};

export const getProductByCategory = async (req, res) => {
  try {
    const { category } = req.query;

    if (!category) {
      return res.status(400).json({ message: "Category is required" });
    }

    let allProducts = [];

    // Loop through all product models
    for (const modelKey in productModels) {
      const Model = productModels[modelKey];

      const products = await Model.find({ categories: category })
        .populate({
          path: "productType",
        })
        .populate({
          path: "subProductType",
          select: "-modelName -productType",
        });

      allProducts = allProducts.concat(products);
    }

    return res.status(200).json({
      message: "Products fetched successfully",
      products: allProducts,
    });
  } catch (error) {
    console.error("❌ Server Error:", error);
    res.status(500).json({ message: "Server error!", error: error.message });
  }
};

// export const addProduct = async (req, res) => {
//   try {
//     console.log("📌 Request Body:", req.body);

//     const { productType, subProductType, data } = req.body;

//     // ✅ Check if productType is provided
//     if (!productType) {
//       return res.status(400).json({ message: "Product Type is required" });
//     }
//     if (!subProductType) {
//       return res.status(400).json({ message: "Sub-Product Type is required" });
//     }

//     const _productType = await ProductTypeModel.findById(productType);
//     if (!_productType) {
//       return res.status(404).json({ message: "Product Type not found" });
//     }

//     // ✅ Check if subProductType exists under the correct productType
//     const _subProductType = await SubProductTypeModel.findOne({
//       _id: subProductType,
//       productType: productType,
//     });

//     if (!_subProductType) {
//       return res.status(404).json({
//         message:
//           "SubProduct Type not found or does not belong to this Product Type",
//       });
//     }

//     const Model = productModels[_productType.modelName];
//     if (!Model) {
//       return res.status(400).json({ message: "Invalid Model Name" });
//     }

//     // ✅ Save the product dynamically
//     const product = new Model(data);
//     await product.save();

//     return res.status(200).json({
//       message: `${_productType.name} added successfully`,
//       product,
//     });
//   } catch (error) {
//     console.log("❌ Server Error:", error.message);
//     res.status(500).json({ message: "Server error!", error: error.message });
//   }
// };
//add product by user

// GET /api/products/by-user/:userId
export const getProductsByUser1 = async (req, res) => {
  try {
    const { userId } = req.params;

    // Validate ObjectId (optional but good)
    if (mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid UserId" });
    }

    // Example: fetch from all models
    let allUserProducts = [];

    for (const key in productModels) {
      const Model = productModels[key];
      const products = await Model.find({ userId }).lean();
      if (products.length > 0) {
        allUserProducts.push(...products);
      }
    }

    return res.status(200).json({
      count: allUserProducts.length,
      products: allUserProducts,
    });
  } catch (err) {
    console.log("❌ Error fetching user's products:", err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
export const getProductsByUser = async (req, res) => {
  try {
    const { userId } = req.query;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid userId" });
    }

    let allUserProducts = [];

    for (const key in productModels) {
      const Model = productModels[key];
      const products = await Model.find({ userId })
        .populate({
          path: "productType",
        })
        .populate({
          path: "subProductType",
          select: "-modelName -productType",
        })
        .lean();
      allUserProducts.push(...products);
    }
    console.log(allUserProducts);

    return res.status(200).json({
      count: allUserProducts.length,
      products: allUserProducts,
    });
  } catch (error) {
    console.error("❌ Error in getProductsByUserId:", error.message);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};
