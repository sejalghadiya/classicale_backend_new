import mongoose from "mongoose";

const counterSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  productId: { type: Number, default: 0 },
});

export const CounterModel = mongoose.model("counter", counterSchema);
