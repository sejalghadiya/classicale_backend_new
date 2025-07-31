import mongoose from "mongoose";

const ChatReportSchema = new mongoose.Schema(
  {
    reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    reportedUser: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    conversationId: { type: mongoose.Schema.Types.ObjectId, ref: "Conversation" },
    message: { type: String },
    description: { type: String, required: true },
    image: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model("ChatReport", ChatReportSchema);
