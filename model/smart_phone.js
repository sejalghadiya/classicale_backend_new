import mongoose from "mongoose";
const SmartPhoneSchema = new mongoose.Schema({
  brand: { type: [String] },
  model: { type: [String] },
  price: { type: [String] },
  batteryBackup: { type: [String] },
  year: { type: [String] },
  storage: { type: [String] },
  adTitle: { type: [String] },
  description: { type: [String] },
  createdTime: { type: Date, default: Date.now },
  updatedTime: { type: Date, default: Date.now },
  isDeleted: { type: Boolean, default: false },

  productType: { type: mongoose.Schema.Types.ObjectId, ref: "ProductType" },
  subProductType: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SubProductType",
  },
});

export const SmartPhoneModel = mongoose.model("smart_phone", SmartPhoneSchema);
