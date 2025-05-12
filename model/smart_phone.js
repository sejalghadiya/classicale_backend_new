import mongoose from "mongoose";
const SmartPhoneSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
    brand: { type: [String] },
    model: { type: [String] },
    price: { type: [String] },
    batteryBackup: { type: [String] },
    year: { type: [String] },
    storage: { type: [String] },
    adTitle: { type: [String] },
    description: { type: [String] },
    createdTime: { type: Date, default: Date.now },
    updatedTime: { type: Date, default: Date.now },
    isDeleted: { type: Boolean, default: false },
    images: { type: [String] },
    categories: { type: String },
    address1: { type: [String] },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
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

export const SmartPhoneModel = mongoose.model("smart_phone", SmartPhoneSchema);
