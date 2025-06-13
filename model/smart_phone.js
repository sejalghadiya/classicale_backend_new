import mongoose from "mongoose";
const SmartPhoneSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
    brand: { type: [String] },
    model: { type: [String] },
    price: { type: [String] },
    batteryBackup: { type: [String] },
    storage: { type: [String] },
    adTitle: { type: [String] },
    description: { type: [String] },
    createdTime: { type: Date, default: Date.now },
    updatedTime: { type: Date, default: Date.now },
    isDeleted: { type: Boolean, default: false },
    images: { type: [String] },
    categories: { type: String },
    //address1: { type: [String] },
    street1: { type: [String] },
    street2: { type: [String] },
    area: { type: [String] },
    city: { type: [String] },
    state: { type: [String] },
    country: { type: [String] },
    pincode: { type: [String] },
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
    location: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], default: [0, 0] }, // [longitude, latitude],
    },
  },
  {
    timestamps: true,
  }
);
SmartPhoneSchema.index({ createdAt: -1 });
SmartPhoneSchema.index({ updatedAt: -1 });
SmartPhoneSchema.index({ location: "2dsphere" });
export const SmartPhoneModel = mongoose.model("smart_phone", SmartPhoneSchema);
