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
    addLink: { type: [String] },
    city: { type: [String] },
    state: { type: [String] },
    country: { type: [String] },
    pincode: { type: [String] },
    view_count: { type: [mongoose.Schema.Types.ObjectId], ref: "user" },

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
// Index to quickly filter by active products in categories
SmartPhoneSchema.index({ categories: 1, isActive: 1, isDeleted: 1 });

// Compound index for geo + category filtering
SmartPhoneSchema.index({ categories: 1, location: "2dsphere" });

// Index for filtering by user (e.g., my ads, user profile)
SmartPhoneSchema.index({ userId: 1 });

// Indexes for location fallback filtering
SmartPhoneSchema.index({ country: 1, state: 1, city: 1 });
export const SmartPhoneModel = mongoose.model("smart_phone", SmartPhoneSchema);
