import mongoose from "mongoose";

const ElectronicSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
    price: { type: [String] },
    adTitle: { type: [String] },
    description: { type: [String] },
    images: [{ type: String }],
    categories: { type: String },
    // address1: { type: [String] },
    brand: { type: [String] },
    model: { type: [String] },
    street1: { type: [String] },
    street2: { type: [String] },
    area: { type: [String] },
    addLink: { type: [String] },
    city: { type: [String] },
    state: { type: [String] },
    pincode: { type: [String] },
    country: { type: [String] },
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
      coordinates: { type: [Number], default: [0, 0] }, // [longitude, latitude]
    },
  },
  {
    timestamps: true,
  }
);
ElectronicSchema.index({ createdAt: -1 });
ElectronicSchema.index({ updatedAt: -1 });
ElectronicSchema.index({ location: "2dsphere" });

export const ElectronicModel = mongoose.model("electronic",ElectronicSchema);
