import mongoose from "mongoose";

const Electronic_repairingSchema = new mongoose.Schema({
  type: { type: [String] },
  adTitle: { type: [String] },
  description: { type: [String] },
  images: [{ type: String }],
  productType: { type: mongoose.Schema.Types.ObjectId, ref: "ProductType" },
  subProductType: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SubProductType",
  },
});

export const ElectronicRepairingModel = mongoose.model("electronic_repairing",Electronic_repairingSchema);
