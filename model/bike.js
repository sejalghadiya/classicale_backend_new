import mongoose from "mongoose";

const BikeSchema = new mongoose.Schema({
    brand: { type: [String] },
    year: { type: [String] },
    price: { type: [String] },
    kmDriven: { type: [String] },
    adTitle: { type: [String] },
    description: { type: [String] },
    images: [{ type: String }],

    productType: {type: mongoose.Schema.Types.ObjectId,ref: "ProductType",},
    subProductType: { type: mongoose.Schema.Types.ObjectId,ref: "SubProductType",},
});

export const BikeModel = mongoose.model("Bike", BikeSchema);