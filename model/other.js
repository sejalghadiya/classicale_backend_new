import mongoose from "mongoose";

const OtherSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
    type: { type: Number, enum: [0, 1, 2] }, // 0  for nil, 1 for job and 2 for service
    price: { type: [String] },
    adTitle: { type: [String] },
    description: { type: [String] },
    images: [{ type: String }],
    categories: { type: String },
    // address1: { type: [String] },
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
      coordinates: { type: [Number], default: [0, 0] }, // [longitude, latitude]
    },
  },
  {
    timestamps: true,
  }
);
OtherSchema.index({ createdAt: -1 });
OtherSchema.index({ updatedAt: -1 });
OtherSchema.index({ location: "2dsphere" });
export const OtherModel = mongoose.model("other", OtherSchema);
