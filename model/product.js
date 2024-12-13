import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema({
  addProductUserId: {
    type: mongoose.Schema.Types.ObjectId, // This should be ObjectId
    ref: "User", // Reference to the User model
    required: true,
  },
  isDeleted: { type: Boolean, default: false }, // Field to mark the product as deleted
  deletedAt: { type: Date, default: null },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
  },
  uId: {
    type: mongoose.Schema.Types.ObjectId, // Use ObjectId type
    ref: "User",
  },
  userId: {
    type: Number,
    required: true,
  },

  userName: {
    type: String,
  },
  userEmail: {
    type: String,
  },
  type: {
    type: String,
    enum: ["ForRent", "ForSell"],
  },
  price: {
    type: String,
  },
  oldPrice: {
    type: String,
  },
  brand: {
    type: String,
  },
  oldBrand: {
    type: String,
  },
  year: {
    type: String,
  },
  oldYear: {
    type: String,
  },
  description: {
    type: String,
  },
  oldDescription: {
    type: String,
  },
  title: {
    type: String,
  },
  oldTitle: {
    type: String,
  },
  model: {
    type: String,
  },
  oldModel: {
    type: String,
  },
  image: { type: String },
  oldImage: {
    type: String,
  },
  categories: {
    type: String,
    enum: ["A", "B", "C", "D", "E"],
  },
  oldCategories: {
    type: String,
    enum: ["A", "B", "C", "D", "E"],
  },
  productType: {
    type: String,
    enum: ["Car", "Bike", "Phone", "Property", "Other", "Pets"],
  },
  subProductType: {
    type: [String],
  },
  fuel: {
    type: String,
  },
  transmission: {
    type: String,
  },
  kmDriven: {
    type: Number,
  },
  oldKmDriven: {
    type: Number,
  },
  noOfOwners: {
    type: Number,
  },
  oldNoOfOwners: {
    type: Number,
  },

  propertyType: {
    type: String,
  },
  oldPropertyType: {
    type: String,
  },

  bedRooms: {
    type: Number,
  },
  oldBedRooms: {
    type: Number,
  },

  bathrooms: {
    type: Number,
  },
  oldBathRooms: {
    type: Number,
  },

  furnishing: {
    type: String,
  },
  oldFurnishing: {
    type: String,
  },

  constructionStatus: {
    type: String,
  },
  oldConstraintStatus: {
    type: String,
  },

  listedBy: {
    type: String,
  },

  superBuildUpArea: {
    type: String,
  },
  oldSuperBuildUpArea: {
    type: String,
  },

  carpetArea: {
    type: String,
  },
  oldCarpetArea: {
    type: String,
  },

  maintenance: {
    type: String,
  },
  oldMaintenance: {
    type: String,
  },

  totalFloor: {
    type: Number,
  },
  oldTotalFloor: {
    type: Number,
  },

  carParking: {
    type: String,
  },
  oldCarParking: {
    type: String,
  },

  facing: {
    type: String,
  },

  oldFacing: {
    type: String,
  },

  projectName: {
    type: String,
  },
  oldProjectName: {
    type: String,
  },

  createdTime: {
    type: Date,
    default: Date.now,
  },
  updatedTime: {
    type: Date,
    default: Date.now,
  },
});

// Use the default ObjectId provided by MongoDB as the unique identifier for each product
export const ProductModel = mongoose.model("Product", ProductSchema);
