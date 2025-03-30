import mongoose from "mongoose";

const ServicesSchema = new mongoose.Schema({
  service_job: {
    type: String,
    enum: ["Service", "Job"],
  },
  adTitle: { type: [String] },
  description: { type: [String] },
  images: [{ type: String }],

  productType: { type: mongoose.Schema.Types.ObjectId, ref: "ProductType" },
  subProductType: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SubProductType",
  },
});

export const ServicesModel = mongoose.model("services", ServicesSchema);
