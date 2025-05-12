import mongoose from "mongoose";

const JobSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
    service_job: {
      type: String,
      enum: ["Service", "Job"],
    },
    salaryPeriod: { type: [String] },
    positionType: { type: [String] },
    salaryFrom: { type: [String] },
    salaryTo: { type: [String] },
    adTitle: { type: [String] },
    description: { type: [String] },
    images: [{ type: String }],
    categories: { type: String },
    address1: { type: [String] },
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
  },
  {
    timestamps: true,
  }
);

export const JobModel = mongoose.model("job", JobSchema);
