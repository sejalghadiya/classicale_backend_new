import mongoose from "mongoose";

const PetSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
  price: { type: [String] },
  adTitle: { type: [String] },
  description: { type: [String] },
  images: [{ type: String }],
  categories: { type: String },
  address1: { type: [String] },
  isDeleted: {
    type: Boolean,
    default: false,
  },
  productType: { type: mongoose.Schema.Types.ObjectId, ref: "ProductType" },
  subProductType: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SubProductType",
  },
});

export const PetModel = mongoose.model("pet", PetSchema);
