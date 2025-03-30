import mongoose from "mongoose";

const ConditionSchema = new mongoose.Schema({
  title: String,
  author: String,
  date: Date,
  content: String,
});

export const ConditionModel = mongoose.model("condition", ConditionSchema);
