import mongoose from "mongoose";

const BikeSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
    brand: { type: [String] },
    year: { type: [String] },
    model: { type: [String] },
    price: { type: [String] },
    kmDriven: { type: [String] },
    adTitle: { type: [String] },
    description: { type: [String] },
    images: [{ type: String }],
    categories: { type: String },
    street1: { type: [String] },
    street2: { type: [String] },
    area: { type: [String] },
    city: { type: [String] },
    state: { type: [String] },
    pincode: { type: [String] },
    country: { type: [String] },
    addLink: { type: [String] },
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
    view_count: { type: [mongoose.Schema.Types.ObjectId], ref: "user" },
    stateLatest: { type: String },
    cityLatest: { type: String },
    countryLatest: { type: String },
  },
  {
    timestamps: true,
  }
);
// Index to quickly filter by active products in categories
BikeSchema.index({ categories: 1, isActive: 1, isDeleted: 1 });

// Compound index for geo + category filtering
BikeSchema.index({ categories: 1, location: "2dsphere" });

// Index for filtering by user (e.g., my ads, user profile)
BikeSchema.index({ userId: 1 });

// Indexes for location fallback filtering
BikeSchema.index({ countryLatest: 1, stateLatest: 1, cityLatest: 1 });

BikeSchema.pre("save", function (next) {
  if (this.state?.length) this.stateLatest = this.state[this.state.length - 1];
  if (this.city?.length) this.cityLatest = this.city[this.city.length - 1];
  if (this.country?.length)
    this.countryLatest = this.country[this.country.length - 1];
  next();
});

export const BikeModel = mongoose.model("Bike", BikeSchema);
