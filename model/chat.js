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
      deleted: { type: Boolean, default: false },
      senderName: {
        type: String,
      },
      senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true, // senderId is required
      },
      receiverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
      text: {
        type: String,
      },
      image: {
        type: String,
      },
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
