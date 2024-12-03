import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
  {
    participants: {
      type: [String], // Array of user IDs (e.g., [user1, user2])
      required: true,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User", // Assuming you have a User model
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User", // Assuming you have a User model
    },
    senderName: {
      type: String,
      ref: "User",
    }, // Assuming you have a User},
    senderEmail: {
      type: String,
      ref: "User",
    }, // Assuming you have a User},
    senderImage: {
      type: String,
      ref: "User",
    }, // Assuming you have a User
    receiverName: {
      type: String,
      ref: "User",
    }, // Assuming you have a User},
    receiverEmail: {
      type: String,
      ref: "User",
    }, // Assuming you have a User},
    receiverImage: {
      type: String,
      ref: "User",
    }, // Assuming you have a User
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export const ConversationModel = mongoose.model(
  "Conversation",
  conversationSchema
);
