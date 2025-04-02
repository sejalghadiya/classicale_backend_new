import mongoose from "mongoose";

const pinModel = new mongoose.Schema(
  {
    code: { type: String },
    use_count: { type: Number, default: 0 },
    max_count: { type: Number, default: 100 },
  },
  {
    timestamps: true,
  }
);

export const CodeModel = mongoose.model("code", pinModel);
