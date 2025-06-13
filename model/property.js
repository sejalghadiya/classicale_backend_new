import mongoose from "mongoose";

const PropertySchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
    type: { type: String, enum: ["ForRent", "ForSell"] },
    bhk: {
      type: [String],
      enum: ["1", "2", "3", "4", "4+"],
    },
    furnishing: {
      type: [String],
      enum: ["Fully Furnished", "Semi Furnished", "Unfurnished"],
    },
    projectName: { type: [String] },
    projectStatus: {
      type: [String],
      enum: ["New Launch", "Ready to Move", "Under Construction"],
    },
    listedBy: {
      type: [String],
      enum: ["Owner", "Builder", "Dealer"],
    },
    price: { type: [String] },
    area: { type: [String] },
    facing: { type: [String] },
    adTitle: { type: [String] },
    description: { type: [String] },
    createdTime: { type: Date, default: Date.now },
    updatedTime: { type: Date, default: Date.now },
    isDeleted: { type: Boolean, default: false },
    images: [{ type: String }],
    //address1: { type: [String] },
    street1: { type: [String] },
    street2: { type: [String] },
    areaLocation: { type: [String] },
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
    categories: { type: String },
    productType: { type: mongoose.Schema.Types.ObjectId, ref: "ProductType" },
    subProductType: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubProductType",
    },
    history: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
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
PropertySchema.index({ createdAt: -1 });
PropertySchema.index({ updatedAt: -1 });
PropertySchema.index({ location: "2dsphere" });

export const PropertyModel = mongoose.model("property", PropertySchema);
