import mongoose from "mongoose";

const JobSchema = new mongoose.Schema({
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

  productType: { type: mongoose.Schema.Types.ObjectId, ref: "ProductType" },
  subProductType: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SubProductType",
  },
});

export const JobModel = mongoose.model("job", JobSchema);
