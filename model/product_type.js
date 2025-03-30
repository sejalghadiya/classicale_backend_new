
import mongoose from "mongoose";


const ProductTypeSchema = new mongoose.Schema({
  name: { type: String },
  modelName: { type: String },
  createTime: { type: Date, default: Date.now },
});

export const ProductTypeModel = mongoose.model("ProductType", ProductTypeSchema);
