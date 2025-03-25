import mongoose from "mongoose";

const PdfAccessRequestSchema = new mongoose.Schema(
  {
    uploaderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    viewerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "denied"],
      default: "pending",
    },
  },
  { timestamps: true } // ✅ Yeh automatically createdAt aur updatedAt store karega
);

//module.exports = mongoose.model("PdfAccessRequest", PdfAccessRequestSchema);

export const PdfModel = mongoose.model("PdfAccessRequest", PdfAccessRequestSchema);
