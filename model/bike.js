import mongoose from "mongoose";

const BikeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
  brand: { type: [String] },
  year: { type: [String] },
  model: { type: [String] },
  price: { type: [String] },
  kmDriven: { type: [String] },
  adTitle: { type: [String] },
  description: { type: [String] },
  images: [{ type: String }],
  categories: { type: String },
  address1: { type: [String] },
  isDeleted: {
    type: Boolean,
    default: false,
  },
  productType: { type: mongoose.Schema.Types.ObjectId, ref: "ProductType" },
  subProductType: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SubProductType",
  },
});

export const BikeModel = mongoose.model("Bike", BikeSchema);