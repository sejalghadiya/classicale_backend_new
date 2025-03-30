import mongoose from "mongoose";
const LandSchema = new mongoose.Schema({
  type: { type: String, enum: ["ForRent", "ForSell"] },
  listedBy: { type: [String] },
  plotArea: { type: [String] },
  length: { type: [String] },
  breadth: { type: [String] },
  facing: { type: [String] },
  projectName: { type: [String] },
  adTitle: { type: [String] },
  description: { type: [String] },
  createdTime: { type: Date, default: Date.now },
  updatedTime: { type: Date, default: Date.now },
  isDeleted: { type: Boolean, default: false },
  image: [{ type: String }],

  productType: { type: mongoose.Schema.Types.ObjectId, ref: "ProductType" },
  subProductType: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SubProductType",
  },
});

export const LandModel = mongoose.model("land", LandSchema);
