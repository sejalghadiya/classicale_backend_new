import mongoose from "mongoose";

const OtherSchema = new mongoose.Schema({
  price: { type: [String] },
  title: { type: [String] },
  description: { type: [String] },
  images: [{ type: String }],
  categories: { type: String },
  productType: { type: mongoose.Schema.Types.ObjectId, ref: "ProductType" },
  subProductType: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SubProductType",
  },
});

export const OtherModel = mongoose.model("other", OtherSchema);
