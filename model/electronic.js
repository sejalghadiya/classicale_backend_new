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
    areaLatest: { type: String },
    stateLatest: { type: String },
    cityLatest: { type: String },
    countryLatest: { type: String },
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
// Index to quickly filter by active products in categories
ElectronicSchema.index({ categories: 1, isActive: 1, isDeleted: 1 });

// Compound index for geo + category filtering
ElectronicSchema.index({ categories: 1, location: "2dsphere" });

// Index for filtering by user (e.g., my ads, user profile)
ElectronicSchema.index({ userId: 1 });

// Indexes for location fallback filtering
ElectronicSchema.index({
  countryLatest: 1,
  stateLatest: 1,
  cityLatest: 1,
  areaLatest: 1,
});

ElectronicSchema.pre("save", function (next) {
  if (this.area?.length) this.areaLatest = this.area[this.area.length - 1];
  if (this.state?.length) this.stateLatest = this.state[this.state.length - 1];
  if (this.city?.length) this.cityLatest = this.city[this.city.length - 1];
  if (this.country?.length)
    this.countryLatest = this.country[this.country.length - 1];
  next();
});

export const ElectronicModel = mongoose.model("electronic",ElectronicSchema);
