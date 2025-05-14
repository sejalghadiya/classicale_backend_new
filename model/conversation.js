import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
  {
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "user" }],
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    productTypeId: { type: mongoose.Schema.Types.ObjectId, ref: "ProductType" },
  },
  {
    timestamps: true,
  }
);

export const ConversationModel = mongoose.model(
  "conversation",
  conversationSchema
);
//module.exports = mongoose.model("conversation", conversationSchema);
