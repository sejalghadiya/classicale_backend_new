
import mongoose from "mongoose";

const SubProductTypeSchema = new mongoose.Schema({
    name: { type: String },
createTime: { type: Date, default: Date.now },
productType: { type: mongoose.Schema.Types.ObjectId, ref: "ProductType" } 
});

export const SubProductTypeModel = mongoose.model("SubProductType",SubProductTypeSchema);
