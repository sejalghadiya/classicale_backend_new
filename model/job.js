import mongoose from "mongoose";

const JobSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
    service_job: {
      type: String,
    },
    salaryPeriod: { type: [String] },
    positionType: { type: [String] },
    salaryFrom: { type: [String] },
    salaryTo: { type: [String] },
    adTitle: { type: [String] },
    description: { type: [String] },
    images: [{ type: String }],
    categories: { type: String },
    //address1: { type: [String] },
    brand: { type: [String] },
    addLink: { type: [String] },
    model: { type: [String] },
    street1: { type: [String] },
    street2: { type: [String] },
    area: { type: [String] },
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
JobSchema.index({ createdAt: -1 });
JobSchema.index({ updatedAt: -1 });
JobSchema.index({ location: "2dsphere" });

export const JobModel = mongoose.model("Job", JobSchema);
