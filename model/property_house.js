import mongoose from "mongoose";
const HouseSchema = new mongoose.Schema({
  type: { type: String, enum: ["ForRent", "ForSell"] },
  propertyType: { type: [String] },
  bhk: { type: [Number] },
  furnishing: { type: [String] },
  listedBy: { type: [String] },
  projectName: { type: [String] },
  projectStatus: { type: [String] },
  superBuildUpArea: { type: [String] },
  carpetArea: { type: [String] },
  maintenance: { type: [String] },
  facing: { type: [String] },
  totalFloor: { type: [Number] },
  florNo: { type: [String] },
  carParking: { type: [String] },
  adTitle: { type: [String] },
  description: { type: [String] },
  createdTime: { type: Date, default: Date.now },
  updatedTime: { type: Date, default: Date.now },
  isDeleted: { type: Boolean, default: false },

  productType: { type: mongoose.Schema.Types.ObjectId, ref: "ProductType" },
  subProductType: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SubProductType",
  },
});

export const HouseModel = mongoose.model("house", HouseSchema);
