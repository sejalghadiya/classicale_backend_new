import Admin from "../model/admin.js"; // Import the Admin model
import { BikeModel } from "../model/bike.js";
import { BookSportHobbyModel } from "../model/book_sport_hobby.js";
import { CarModel } from "../model/car.js";
import { ElectronicModel } from "../model/electronic.js";
import { FurnitureModel } from "../model/furniture.js";
import { JobModel } from "../model/job.js";
import { OtherModel } from "../model/other.js";
import { PetModel } from "../model/pet.js";
import { ProductTypeModel } from "../model/product_type.js";
import { PropertyModel } from "../model/property.js";
import { ServicesModel } from "../model/services.js";
import { SmartPhoneModel } from "../model/smart_phone.js";
import { SubProductTypeModel } from "../model/sub_product_type.js";
import { UserModel } from "../model/user.js"; // Import the User model
import bcrypt from "bcryptjs"; // Import bcrypt for password hashing
import jwt from "jsonwebtoken"; // Import jsonwebtoken for token generation

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

// get product type
export const getProductType = async (req, res) => {
  try {
    const productTypes = await ProductTypeModel.find();

    //manuplte
    //product count

    res.status(200).json(productTypes);
  } catch (error) {
    res.status(500).json({ message: "Error fetching product types", error });
  }
};

//get product with type
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

export const getProductWithType = async (req, res) => {
  const { productTypeId } = req.query;

  try {
    const allProducts = {};

    for (const [key, Model] of Object.entries(productModels)) {
      const modelSchemaPaths = Model.schema.paths;

      const filters = { isDeleted: false }; // Removed isActive filter

      if (productTypeId) {
        filters.productType = productTypeId;
      }

      let query = Model.find(filters)
        .populate({ path: "productType" })
        .populate({
          path: "subProductType",
          select: "-modelName -productType",
        });

      if ("userId" in modelSchemaPaths) {
        query = query.populate({
          path: "userId",
          select:
            "fName lName mName email phone profileImage state district country area",
        });
      }

      const results = await query;

      results.forEach((product) => {
        product._doc.modelName = key;
      });

      if (results.length > 0) {
        allProducts[key] = {
          count: results.length,
          items: results,
        };
      }
    }

    return res.status(200).json({
      message: "Filtered products fetched successfully",
      products: allProducts,
    });
  } catch (error) {
    console.log("❌ Server Error:", error.message);
    res.status(500).json({ message: "Server error!", error: error.message });
  }
};

//get All user by userCategory

export const getUserByUserCategory = async (req, res) => {
  try {
    const { userCategory } = req.query;

    if (!userCategory) {
      return res.status(400).json({ message: "userCategory is required" });
    }

    if (!userCategory) {
      return res.status(400).json({ message: "Invalid userCategory value" });
    }

    const users = await UserModel.find({ userCategory })
      .select("-password -otp -otpExpire") // Exclude sensitive fields
      .populate("occupationId"); // Populate if occupationId exists

    return res.status(200).json({ success: true, users });
  } catch (error) {
    console.error("Error in getUserByUserCategory:", error);
    return res
      .status(500)
      .json({ message: "Server Error", error: error.message });
  }
};

//get all product details
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
      })
      .populate({
        path: "subProductType",
        select: "-modelName -productType",
      })
      .populate({
        path: "userId",
        select:
          "fName lName mName email phone profileImage state district country area ", // Only pull the fName of the user
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

//product edit for admin
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

    const product = await Model.findById(productId)
      .populate({
        path: "productType",
      })
      .populate({
        path: "subProductType",
        select: "-modelName -productType",
      })
      .populate({
        path: "userId",
        select:
          "fName lName mName email phone profileImage state district country area ", // Only pull the fName of the user
      });
    if (!product) return res.status(404).json({ message: "Product not found" });

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
      // Preserve the first image and push new ones
      for (const base64Image of productImages) {
        const imagePath = saveBase64Image(
          base64Image,
          "productImages",
          "product"
        );
        imagePaths.push(imagePath);
      }

      // Add new images to the existing ones without replacing the 0th index
      product.images = product.images; // Preserve the 0th index image
      product.images.push(...imagePaths);
    }

    // ✅ Update fields with history tracking (similar to updateUser)
    for (const key in data) {
      if (Array.isArray(product[key]) && typeof data[key] === "string") {
        // If the field is an array and the new value is a string
        product[key] = [product[key][1] || product[key][0] || "", data[key]];
      } else if (Array.isArray(product[key]) && Array.isArray(data[key])) {
        // If both the field and new value are arrays
        product[key] = [product[key][1] || product[key][0] || "", data[key][0]];
      } else if (data[key]) {
        // For non-array fields or when the new value is not an array
        product[key] = data[key];
      }
    }

    // Log the updated product for debugging
    console.log("Product updated with history tracking");

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

//product active or inactive

// controllers/productController.js
// export const productActiveOrInactive = async (req, res) => {
//   try {
//     const { productId, productType } = req.query;

//     // if (!productId || !productType || typeof isActive !== "boolean") {
//     //   return res.status(400).json({ message: "Missing required fields" });
//     // }

//     // Get model dynamically
//     const _productType = await ProductTypeModel.findById(productType);
//     if (!_productType) {
//       return res.status(404).json({ message: "Invalid product type" });
//     }

//     const Model = productModels[_productType.modelName];
//     if (!Model) {
//       return res.status(400).json({ message: "Invalid model" });
//     }

//     const product = await Model.findById(productId)
//       .populate({
//         path: "productType",
//       })
//       .populate({
//         path: "subProductType",
//         select: "-modelName -productType",
//       })
//       .populate({
//         path: "userId",
//         select:
//           "fName lName mName email phone profileImage state district country area ", // Only pull the fName of the user
//       });
//     if (!product) {
//       return res.status(404).json({ message: "Product not found" });
//     }
//     // Toggle visibility
//     const isActive = !product.isActive;
//     product.isActive = isActive;
//     await product.save();

//     return res.status(200).json({
//       message: `Product ${isActive ? "enabled" : "disabled"} successfully`,
//       product,
//     });
//   } catch (error) {
//     console.log("❌ Error toggling visibility:", error.message);
//     return res
//       .status(500)
//       .json({ message: "Server error", error: error.message });
//   }
// };

//delete product

export const deleteProduct = async (req, res) => {
  try {
    const { productId, productType } = req.query;

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

    // ✅ Permanently delete product from database
    const deletedProduct = await Model.findByIdAndDelete(productId);

    if (!deletedProduct) {
      return res
        .status(404)
        .json({ message: "Product not found or already deleted" });
    }

    return res
      .status(200)
      .json({ message: "Product permanently deleted from database" });
  } catch (error) {
    console.error("❌ Delete Error:", error.message);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};
