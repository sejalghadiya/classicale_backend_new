import mongoose from "mongoose";

const accessCodeSchema = new mongoose.Schema({
  code: String,
  maxUseCount: Number,
  useCount: { type: Number, default: 0 },
  usedBy: [
    {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      usedAt: { type: Date, default: Date.now },
    },
  ],
});

export const AccessCodeModel = mongoose.model("AccessCode", accessCodeSchema);
