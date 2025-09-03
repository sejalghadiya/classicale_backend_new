import mongoose from "mongoose";

const PropertySchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
    typeFor: { type: String, enum: ["ForRent", "ForSell"] },
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
    brand: { type: [String] },
    model: { type: [String] },
    addLink: { type: [String] }, // Added for additional links
    street1: { type: [String] },
    street2: { type: [String] },
    areaLocation: { type: [String] },
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
// Index to quickly filter by active products in categories
PropertySchema.index({ categories: 1, isActive: 1, isDeleted: 1 });

// Compound index for geo + category filtering
PropertySchema.index({ categories: 1, location: "2dsphere" });

// Index for filtering by user (e.g., my ads, user profile)
PropertySchema.index({ userId: 1 });

// Indexes for location fallback filtering
PropertySchema.index({ country: 1, state: 1, city: 1 });

export const PropertyModel = mongoose.model("property", PropertySchema);
