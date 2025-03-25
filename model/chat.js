import mongoose from "mongoose";

const CommunicateSchema = new mongoose.Schema({
  conversationId: {
    type: mongoose.Types.ObjectId,
    ref: "conversation",
  },

  senderName: {
    type: String,
  },
  receiverName: {
    type: String,
  },
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Reference to the User model
    required: true,
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product", // Reference to the Product model
  },
  messages: [
    {
      id: {
        type: mongoose.Types.ObjectId,
      },
      senderName: {
        type: String,
      },
      senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      deletedBy: { type: [mongoose.Schema.Types.ObjectId], default: [] },
      receiverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      text: {
        type: String,
      },
      image: {
        type: String,
      },
      status: {
        type: String,
        enum: ["pending", "seen"], // Allowed values
        default: "pending", // Default status
      },
      isDeleted: { type: Boolean, default: false },
      isRead: { type: Boolean, default: false },

      createdTime: {
        type: Date,
        default: Date.now,
      },
    },
  ],

  createdTime: {
    type: Date,
    default: Date.now,
  },
});

export const CommunicateModel = mongoose.model(
  "Communicate",
  CommunicateSchema
);

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
});

export const UserModel = mongoose.model("User", userSchema);
