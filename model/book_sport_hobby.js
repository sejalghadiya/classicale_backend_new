import mongoose from "mongoose";

const Book_sport_hobbySchema = new mongoose.Schema({
  price: { type: [String] },
  adTitle: { type: [String] },
  description: { type: [String] },
  images: [{ type: String }],
  categories: { type: String },
  productType: { type: mongoose.Schema.Types.ObjectId, ref: "ProductType" },
  subProductType: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SubProductType",
  },
});

export const BookSportHobbyModel = mongoose.model("book_sport_hobby", Book_sport_hobbySchema);
