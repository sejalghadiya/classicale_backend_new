import mongoose from "mongoose";

const OtherSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
    type: { type: Number, enum: [0, 1, 2] }, // 0  for nil, 1 for job and 2 for service
    price: { type: [String] },
    title: { type: [String] },
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

export const OtherModel = mongoose.model("other", OtherSchema);
