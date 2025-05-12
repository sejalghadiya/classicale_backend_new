import { Timestamp } from "mongodb";
import mongoose from "mongoose";

const CarSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
    brand: { type: [String] },
    year: { type: [String] },
    fuel: { type: [String] },
    transmission: { type: [String] },
    kmDriven: { type: [String] },
    noOfOwners: { type: [String] },
    model: { type: [String] },
    title: { type: [String] },
    price: { type: [String] },
    description: { type: [String] },
    images: [{ type: String }],
    categories: { type: String },
    address1: { type: [String] },
    isActive: {
      type: Boolean,
      default: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    productType: { type: mongoose.Schema.Types.ObjectId, ref: "ProductType" },
    subProductType: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubProductType",
    },
  },

  {
    timestamps: true,
  }
);

export const CarModel = mongoose.model("Car", CarSchema);
