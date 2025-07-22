import mongoose from "mongoose";

const RatingSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
    rating: { type: Number, min: 1, max: 5, required: true },
    comment: { type: String },
  },
  { timestamps: true }
);

// ✅ Prevent duplicate rating value from same user
RatingSchema.index({ user: 1 }, { unique: true });

export const RatingModel = mongoose.model("rating", RatingSchema);
