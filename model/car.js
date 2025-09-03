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
    //address1: { type: [String] },
    street1: { type: [String] },
    addLink: { type: [String] },
    street2: { type: [String] },
    area: { type: [String] },
    city: { type: [String] },
    state: { type: [String] },
    pincode: { type: [String] },
    country: { type: [String] },
    stateLatest: { type: String },
    cityLatest: { type: String },
    countryLatest: { type: String },
    view_count: { type: [mongoose.Schema.Types.ObjectId], ref: "user" },
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
CarSchema.index({ categories: 1, isActive: 1, isDeleted: 1 });

// Compound index for geo + category filtering
CarSchema.index({ categories: 1, location: "2dsphere" });

// Index for filtering by user (e.g., my ads, user profile)
CarSchema.index({ userId: 1 });

// Indexes for location fallback filtering
CarSchema.index({
  countryLatest: 1,
  stateLatest: 1,
  cityLatest: 1,
});


CarSchema.pre("save", function (next) {
  if (this.state?.length) this.stateLatest = this.state[this.state.length - 1];
  if (this.city?.length) this.cityLatest = this.city[this.city.length - 1];
  if (this.country?.length)
    this.countryLatest = this.country[this.country.length - 1];
  next();
});

export const CarModel = mongoose.model("Car", CarSchema);
