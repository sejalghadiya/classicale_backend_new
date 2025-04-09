import { Timestamp } from "mongodb";
import mongoose from "mongoose";

const CarSchema = new mongoose.Schema({
  brand: { type: [String] },
  year: { type: [String] },
  fuel: { type: [String] },
  transmission: { type: [String] },
  kmDriven: { type: [Number] },
  noOfOwners: { type: [Number] },
  model: { type: [String] },
  title: { type: [String] },
  price: { type: [String] },
  description: { type: [String] },
  images: [{ type: String }],
  categories: { type: String },
  productType: { type: mongoose.Schema.Types.ObjectId, ref: "ProductType" },
  subProductType: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SubProductType",
  },
});

export const CarModel = mongoose.model("Car", CarSchema);
