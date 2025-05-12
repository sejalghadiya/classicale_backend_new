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

export const getProductWithType1 = async (req, res) => {
  const { productTypeId } = req.body;

  try {
    const allProducts = {};

    for (const [key, Model] of Object.entries(productModels)) {
      const modelSchemaPaths = Model.schema.paths;

      const filters = { isActive: true, isDeleted: false };

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

      // ✅ Only include non-empty product arrays
      if (results.length > 0) {
        allProducts[key] = results;
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

