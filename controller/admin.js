import Admin from "../model/admin.js"; // Import the Admin model
import { BikeModel } from "../model/bike.js";
import { BookSportHobbyModel } from "../model/book_sport_hobby.js";
import { CarModel } from "../model/car.js";
import { ElectronicModel } from "../model/electronic.js";
import { FurnitureModel } from "../model/furniture.js";
import { JobModel } from "../model/job.js";
import { OtherModel } from "../model/other.js";
import { PetModel } from "../model/pet.js";
import { CodeModel } from "../model/pin.js";
import { ProductTypeModel } from "../model/product_type.js";
import { PropertyModel } from "../model/property.js";
import { ServicesModel } from "../model/services.js";
import { SmartPhoneModel } from "../model/smart_phone.js";
import { SubProductTypeModel } from "../model/sub_product_type.js";
import { UserModel } from "../model/user.js"; // Import the User model
import bcrypt from "bcryptjs"; // Import bcrypt for password hashing
import jwt from "jsonwebtoken"; // Import jsonwebtoken for token generation
import { sendEmail } from "../utils/sent_email.js"; // Import the sendEmail function
import { ReportProductModel } from "../model/reoprt_product.js";

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

// Get product types with actual product counts
export const getProductType = async (req, res) => {
  try {
    const productTypes = await ProductTypeModel.find();
    const typeCountsMap = {};

    // Iterate over each product model and count based on productType
    for (const Model of Object.values(productModels)) {
      const items = await Model.aggregate([
        {
          $match: {
            isDeleted: false,
          },
        },
        {
          $group: {
            _id: "$productType",
            count: { $sum: 1 },
          },
        },
      ]);

      items.forEach(({ _id, count }) => {
        if (_id) {
          if (!typeCountsMap[_id]) {
            typeCountsMap[_id] = 0;
          }
          typeCountsMap[_id] += count;
        }
      });
    }

    // Merge count with product types
    const productTypesWithCount = productTypes.map((productType) => ({
      ...productType._doc,
      count: typeCountsMap[productType._id?.toString()] || 0,
    }));

    return res.status(200).json({
      message: "Product types fetched successfully",
      data: productTypesWithCount,
    });
  } catch (error) {
    console.error("Error in getProductType:", error);
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
  const { productTypeId, category } = req.query;

  try {
    const allProducts = {};

    for (const [key, Model] of Object.entries(productModels)) {
      const modelSchemaPaths = Model.schema.paths;

      const filters = { isDeleted: false }; // Removed isActive filter

      if (productTypeId) {
        filters.productType = productTypeId;
      }
      if (category) {
        filters.categories = category;
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
export const productActiveOrInactive = async (req, res) => {
  try {
    const { productId, productType } = req.query;

    // if (!productId || !productType || typeof isActive !== "boolean") {
    //   return res.status(400).json({ message: "Missing required fields" });
    // }

    // Get model dynamically
    const _productType = await ProductTypeModel.findById(productType);
    if (!_productType) {
      return res.status(404).json({ message: "Invalid product type" });
    }

    const Model = productModels[_productType.modelName];
    if (!Model) {
      return res.status(400).json({ message: "Invalid model" });
    }

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
    // Toggle visibility
    const isActive = !product.isActive;
    product.isActive = isActive;
    await product.save();

    return res.status(200).json({
      message: `Product ${isActive ? "enabled" : "disabled"} successfully`,
      product,
    });
  } catch (error) {
    console.log("❌ Error toggling visibility:", error.message);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

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

    // ✅ Soft delete: set isDeleted to true
    const updatedProduct = await Model.findByIdAndUpdate(
      productId,
      { isDeleted: true },
      { new: true }
    );

    if (!updatedProduct) {
      return res
        .status(404)
        .json({ message: "Product not found or already deleted" });
    }

    return res.status(200).json({
      message: "Product soft deleted successfully",
      product: updatedProduct,
    });
  } catch (error) {
    console.error("❌ Delete Error:", error.message);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};
``;
//user category get

export const getUserCategory = async (req, res) => {
  try {
    const userCategories = await UserModel.distinct("userCategory");

    return res.status(200).json({
      message: "User categories fetched successfully",
      userCategories,
    });
  } catch (error) {
    console.error("❌ Server Error:", error.message);
    return res
      .status(500)
      .json({ message: "Server error!", error: error.message });
  }
};

//admin is delete user in database

export const deleteUser1 = async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    // Find and delete the user
    const deletedUser = await UserModel.findByIdAndDelete(userId);

    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      message: "User deleted successfully",
      user: deletedUser,
    });
  } catch (error) {
    console.error("❌ Server Error:", error.message);
    return res
      .status(500)
      .json({ message: "Server error!", error: error.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { userId } = req.query;

    console.log("User ID:", userId);

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }
    // Check if the user exists
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    // Check if the user is already soft-deleted
    const isDeleted = user.isDeleted;
    // Perform soft delete
    const deletedUser = await UserModel.findByIdAndUpdate(
      userId,
      { isDeleted: !isDeleted },
      { new: true }
    );

    console.log("Deleted User:", deletedUser);

    return res.status(200).json({
      message: "User soft-deleted successfully",
      user: deletedUser,
    });
  } catch (error) {
    console.error("❌ Server Error:", error.message);
    return res
      .status(500)
      .json({ message: "Server error!", error: error.message });
  }
};

//get all user

// export const getAllUser = async (req, res) => {
//   try {
//     const getCategoryStats = async (regex) => {
//       const baseQuery = { userCategory: { $regex: regex, $options: "i" } };

//       const total = await UserModel.countDocuments(baseQuery);

//       const verified = await UserModel.countDocuments({
//         ...baseQuery,
//         isPinVerified: true,
//         isOtpVerified: true,
//       });

//       // Strictly pending = both false
//       const pending = await UserModel.countDocuments({
//         ...baseQuery,
//         $or: [
//           { isPinVerified: false, isOtpVerified: true },
//           { isPinVerified: true, isOtpVerified: false },
//         ],
//       });

//       const deleted = await UserModel.countDocuments({
//         ...baseQuery,
//         isDeleted: true,
//       });

//       const disable = await UserModel.countDocuments({
//         ...baseQuery,
//         isActive: false,
//       });

//       return { total, verified, pending, deleted, disable };
//     };

//     const categoryAStats = await getCategoryStats("A");
//     const categoryBStats = await getCategoryStats("B");
//     const category1Stats = await getCategoryStats("1");
//     const category2Stats = await getCategoryStats("2");

//     // Total stats
//     const totalUsers = await UserModel.countDocuments();

//     const totalVerifiedUsers = await UserModel.countDocuments({
//       isPinVerified: true,
//       isOtpVerified: true,
//     });

//     // Strictly pending: either pin or otp not verified (but not both true)
//     const totalPendingAccessUsers = await UserModel.countDocuments({
//       $or: [
//         { isPinVerified: false, isOtpVerified: true },
//         { isPinVerified: true, isOtpVerified: false },
//       ],
//     });

//     const totalDeletedUsers = await UserModel.countDocuments({
//       isDeleted: true,
//     });

//     const totalDisabledUsers = await UserModel.countDocuments({
//       isActive: false,
//     });

//     // Unverified counts (partial)
//     const categoryAUnverifiedPinCount = await UserModel.countDocuments({
//       userCategory: { $regex: "A", $options: "i" },
//       isPinVerified: false,
//     });

//     const categoryBOtpUnverifiedCount = await UserModel.countDocuments({
//       userCategory: { $regex: "B", $options: "i" },
//       isOtpVerified: false,
//     });

//     const category1UnverifiedPinCount = await UserModel.countDocuments({
//       userCategory: { $regex: "1", $options: "i" },
//       isOtpVerified: false,
//     });

//     const category2UnverifiedPinCount = await UserModel.countDocuments({
//       userCategory: { $regex: "2", $options: "i" },
//       isOtpVerified: false,
//     });

//     return res.status(200).json({
//       success: true,
//       totalUsers,
//       verifiedUsers: totalVerifiedUsers,
//       pendingAccessUsers: totalPendingAccessUsers, // Correct strict pending count here
//       deletedUsers: totalDeletedUsers,
//       disabledUsers: totalDisabledUsers,

//       categoryStats: {
//         "Category A": categoryAStats,
//         "Category B": categoryBStats,
//         "Category 1": category1Stats,
//         "Category 2": category2Stats,
//       },

//       unverifiedCounts: {
//         "Category A (isPinVerified: false)": categoryAUnverifiedPinCount,
//         "Category B (isOtpVerified: false)": categoryBOtpUnverifiedCount,
//         "Category 1 (isOtpVerified: false)": category1UnverifiedPinCount,
//         "Category 2 (isOtpVerified: false)": category2UnverifiedPinCount,
//       },
//     });
//   } catch (error) {
//     console.error("Error in getAllUser:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Server Error",
//       error: error.message,
//     });
//   }
// };

export const getAccesCode = async (req, res) => {
  try {
    const pin = await CodeModel.find({});
    if (!pin) {
      return res.status(404).json({ message: "Code not found" });
    }

    return res.status(200).json({
      message: "Code is valid",
      data: pin,
    });
  } catch (error) {
    console.error("Error in getAccesCode:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

export const userAccess = async (req, res) => {
  try {
    const { email, userCategory } = req.body;
    console.log("Email:", email);

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await UserModel.findOne({ email, userCategory });
    console.log("User:", user);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    console.log("User Category:", user.userCategory);
    user.userCategory;
    if (user.userCategory === "A") {
      console.log("User Category A");

      return sendPinAccess(req, res);
    }
    if (user.userCategory === "B") {
      console.log("User Category B");
      return sendOtpToCategoryB(req, res);
    }
    if (user.userCategory === "1") {
      console.log("User Category 1");
      return sendOtpToCategoryB(req, res);
    }
    if (user.userCategory === "2") {
      console.log("User Category 1");
      return sendOtpToCategoryB(req, res);
    }
    return res.status(400).json({
      message: "Invalid user category",
    });
  } catch (error) {
    console.error("Error in userAccess:", error);
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

//send pin access

export const sendPinAccess = async (req, res) => {
  try {
    const { code, email, userCategory } = req.body;
    console.log("Code:", code);

    if (!code || !email) {
      return res.status(400).json({ message: "Code and email are required" });
    }
    console.log("Code and Email:", code, email);

    // Find new pin
    const newPin = await CodeModel.findOne({ code });
    if (!newPin) {
      return res.status(404).json({ message: "Code not found" });
    }
    console.log("New Pin:", newPin);
    // Find the user
    const user = await UserModel.findOne({ email, userCategory });
    console.log("User:", user);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Handle old pin
    if (user.assignedPins && user.assignedPins !== code) {
      const oldPin = await CodeModel.findOne({ code: user.assignedPins });
      if (oldPin) {
        oldPin.use_count = Math.max(0, oldPin.use_count - 1);
        await oldPin.save();
      }
    }

    // Increment new pin use count
    newPin.use_count += 1;
    await newPin.save();

    // Save pin in user
    user.assignedPins = newPin.code; // ✅ Correct field
    user.isPinVerified = true;
    await user.save();

    // Send the email
    await sendEmail(
      email,
      "Your Access PIN Code",
      `Your new access code is: ${newPin.code}`
    );

    return res.status(200).json({
      message: "New code sent and saved successfully",
      data: {
        user,
        //pin: newPin,
      },
    });
  } catch (error) {
    console.error("Error in sendPinAccess:", error);
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

//otp send

const generateOTP = () => {
  const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lowercase = "abcdefghijklmnopqrstuvwxyz";
  const digits = "0123456789";

  const getRandomChar = (chars) =>
    chars.charAt(Math.floor(Math.random() * chars.length));

  // Pick one uppercase, one lowercase, and four digits
  const upperChar = getRandomChar(uppercase);
  const lowerChar = getRandomChar(lowercase);

  let digitChars = "";
  for (let i = 0; i < 4; i++) {
    digitChars += getRandomChar(digits);
  }

  // Combine all parts
  let otp = upperChar + lowerChar + digitChars;

  // Shuffle the OTP characters to randomize order
  otp = otp
    .split("")
    .sort(() => Math.random() - 0.5)
    .join("");

  return otp;
};

export const sendOtpToCategoryB = async (req, res) => {
  try {
    const { email, userCategory } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required." });
    }

    // Find user by email, must be category B and not yet OTP verified
    const user = await UserModel.findOne({
      email,
      userCategory,
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found or already verified, or not in category B.",
      });
    }

    const otp = generateOTP();

    // Send email
    await sendEmail(email, "Your OTP Code", `Your OTP is: ${otp}`);

    // Save OTP and mark as verified
    user.otp = otp;
    user.isOtpVerified = true;
    user.otpExpire = Date.now() + 1.5 * 60 * 1000; // OTP expires in 1.5 minutes
    await user.save();

    return res.status(200).json({
      message: "OTP sent successfully",
    });
  } catch (error) {
    console.error("Error sending OTP:", error);
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

//user active-inactive
export const userActiveOrInactive = async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    // Find the user
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Toggle isBlocked status
    user.isActive = !user.isActive;
    await user.save();

    return res.status(200).json({
      message: `User ${
        user.isActive ? "activated" : "deactivated"
      } successfully`,
      user,
    });
  } catch (error) {
    console.error("Error toggling user status:", error);
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

//get product report

export const getReportedProducts = async (req, res) => {
  try {
    const reportedProducts = await ReportProductModel.find()
      .populate("userId")
      .populate("productId");

    const validReports = [];

    for (const report of reportedProducts) {
      const { modelName, productId } = report;

      const Model = productModels[modelName];
      if (!Model || !productId?._id) continue;

      const productExists = await Model.findById(productId._id)
        .populate("productType")
        .populate({ path: "userId" })
        .populate({
          path: "subProductType",
          select: "-modelName -productType",
        });
      if (productExists) {
        validReports.push({
          ...report._doc,
          productId: productExists,
        });
      }
    }

    return res.status(200).json({
      message: "Filtered reported products fetched successfully",
      count: validReports.length,
      data: validReports,
    });
  } catch (error) {
    console.error("Error fetching reported products:", error);
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

//get report details by id

export const getReportDetailsById = async (req, res) => {
  try {
    const { reportId } = req.query;

    if (!reportId) {
      return res.status(400).json({ message: "Report ID is required" });
    }

    // Step 1: Fetch report details and populate related user and product
    const reportDetails = await ReportProductModel.findById(reportId)
      .populate("userId")
      .populate("productId");

    if (!reportDetails) {
      return res.status(404).json({ message: "Report not found" });
    }

    const { modelName, productId, userId } = reportDetails;
    const Model = productModels[modelName];

    if (!Model) {
      return res.status(400).json({ message: "Invalid model name" });
    }

    // Step 2: Fetch product details using dynamic model and populate relevant fields
    const product = await Model.findById(productId)
      .populate("productType")
      .populate({ path: "userId" })
      .populate({ path: "subProductType", select: "-modelName -productType" });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Step 3: Construct response data
    const responseData = {
      ...reportDetails._doc,
      userId: userId,
      productId: product,
    };

    return res.status(200).json({
      message: "Report details fetched successfully",
      data: responseData,
    });
  } catch (error) {
    console.error("Error fetching report details:", error);
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

//get report count
export const getReportCount = async (req, res) => {
  try {
    const reportedProducts = await ReportProductModel.find()
      .populate("userId")
      .populate("productId");

    const validReports = [];

    for (const report of reportedProducts) {
      const { modelName, productId } = report;

      const Model = productModels[modelName];
      if (!Model || !productId?._id) continue;

      const productExists = await Model.findById(productId._id);
      if (productExists) {
        validReports.push(report);
      }
    }

    return res.status(200).json({
      message: "Filtered reported products fetched successfully",
      count: validReports.length,
    });
  } catch (error) {
    console.error("Error fetching reported products:", error);
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

//get all product by category
export const getAllProductByCategory = async (req, res) => {
  try {
    const { category } = req.query;

    if (!category) {
      return res.status(400).json({ message: "Category is required" });
    }

    const allProducts = {};
    const categoryList = ["A", "B", "C", "D", "E"];
    const categoryCounts = Object.fromEntries(categoryList.map((c) => [c, 0]));
    let totalProductCount = 0;

    for (const [key, Model] of Object.entries(productModels)) {
      const modelSchemaPaths = Model.schema.paths;

      let query = Model.find({ categories: category, isDeleted: false })
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

        totalProductCount += results.length;

        results.forEach((product) => {
          const productCategories = Array.isArray(product.categories)
            ? product.categories
            : [product.categories];

          productCategories.forEach((cat) => {
            const catUpper = cat?.toUpperCase();
            if (categoryList.includes(catUpper)) {
              categoryCounts[catUpper]++;
            }
          });
        });
      }
    }

    return res.status(200).json({
      message: "Filtered products fetched successfully",
      totalProductCount,
      categoryCounts, // A to E counts
      products: allProducts,
    });
  } catch (error) {
    console.error("❌ Server Error:", error.message);
    res.status(500).json({ message: "Server error!", error: error.message });
  }
};

//new dashbord api

export const getAllUser = async (req, res) => {
  try {
    const getCategoryStats = async (regex) => {
      const baseQuery = { userCategory: { $regex: regex, $options: "i" } };

      const total = await UserModel.countDocuments(baseQuery);

      const verified = await UserModel.countDocuments({
        ...baseQuery,
        isPinVerified: true,
        isOtpVerified: true,
      });

      const pending = await UserModel.countDocuments({
        ...baseQuery,
        $or: [
          { isPinVerified: false, isOtpVerified: true },
          { isPinVerified: true, isOtpVerified: false },
        ],
      });

      const deleted = await UserModel.countDocuments({
        ...baseQuery,
        isDeleted: true,
      });

      const disable = await UserModel.countDocuments({
        ...baseQuery,
        isActive: false,
      });

      return { total, verified, pending, deleted, disable };
    };

    // --- USER CATEGORY STATS ---
    const categoryAStats = await getCategoryStats("A");
    const categoryBStats = await getCategoryStats("B");
    const category1Stats = await getCategoryStats("1");
    const category2Stats = await getCategoryStats("2");

    const totalUsers = await UserModel.countDocuments();
    const totalVerifiedUsers = await UserModel.countDocuments({
      isPinVerified: true,
      isOtpVerified: true,
    });
    const totalPendingAccessUsers = await UserModel.countDocuments({
      $or: [
        { isPinVerified: false, isOtpVerified: true },
        { isPinVerified: true, isOtpVerified: false },
      ],
    });
    const totalDeletedUsers = await UserModel.countDocuments({
      isDeleted: true,
    });
    const totalDisabledUsers = await UserModel.countDocuments({
      isActive: false,
    });

    const categoryAUnverifiedPinCount = await UserModel.countDocuments({
      userCategory: { $regex: "A", $options: "i" },
      isPinVerified: false,
    });
    const categoryBOtpUnverifiedCount = await UserModel.countDocuments({
      userCategory: { $regex: "B", $options: "i" },
      isOtpVerified: false,
    });
    const category1UnverifiedPinCount = await UserModel.countDocuments({
      userCategory: { $regex: "1", $options: "i" },
      isOtpVerified: false,
    });
    const category2UnverifiedPinCount = await UserModel.countDocuments({
      userCategory: { $regex: "2", $options: "i" },
      isOtpVerified: false,
    });

    // --- PRODUCT CATEGORY COUNT STATS (ONLY A–E total count) ---
    const categoryList = ["A", "B", "C", "D", "E"];
    const categoryCounts = Object.fromEntries(categoryList.map((c) => [c, 0]));
    let totalProductCount = 0;

    for (const [key, Model] of Object.entries(productModels)) {
      const products = await Model.find({ isDeleted: false }); // filter deleted if needed

      totalProductCount += products.length;

      products.forEach((product) => {
        const productCategories = Array.isArray(product.categories)
          ? product.categories
          : [product.categories];

        productCategories.forEach((cat) => {
          const catUpper = cat?.toUpperCase();
          if (categoryList.includes(catUpper)) {
            categoryCounts[catUpper]++;
          }
        });
      });
    }

    // --- REPORT COUNT ---
    const reportedProducts = await ReportProductModel.find()
      .populate("userId")
      .populate("productId");

    // let validReportCount = 0;

    // for (const report of reportedProducts) {
    //   const { modelName, productId } = report;

    //   const Model = productModels[modelName];
    //   if (!Model || !productId?._id) continue;

    //   const productExists = await Model.findById(productId._id);
    //   if (productExists) {
    //     validReportCount++;
    //   }
    // }
    const validReportCount = await ReportProductModel.countDocuments({});

    const totalResolveRepoerts = await ReportProductModel.countDocuments({
      isActive: false,
    });

    // --- FINAL RESPONSE ---
    return res.status(200).json({
      success: true,
      totalUsers,
      verifiedUsers: totalVerifiedUsers,
      pendingAccessUsers: totalPendingAccessUsers,
      deletedUsers: totalDeletedUsers,
      disabledUsers: totalDisabledUsers,

      categoryStats: {
        Category_A: categoryAStats,
        Category_B: categoryBStats,
        Category_1: category1Stats,
        Category_2: category2Stats,
      },

      // unverifiedCounts: {
      //   "Category A (isPinVerified: false)": categoryAUnverifiedPinCount,
      //   "Category B (isOtpVerified: false)": categoryBOtpUnverifiedCount,
      //   "Category 1 (isOtpVerified: false)": category1UnverifiedPinCount,
      //   "Category 2 (isOtpVerified: false)": category2UnverifiedPinCount,
      // },

      productStats: {
        totalProductCount,
        categoryCounts, // A, B, C, D, E: total count each
      },

      reportStats: {
        totalReportedProducts: validReportCount,
        totalResolveRepoerts,
        totalPendingReports: validReportCount - totalResolveRepoerts,
      },
    });
  } catch (error) {
    console.error("Error in getAllUser:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};
