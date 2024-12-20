import { ConversationModel } from "../model/conversation.js";
import { UserModel } from "../model/user.js";
import mongoose from "mongoose";

export const createConversation = async (req, res) => {
  const { senderId, receiverId } = req.body;

  try {
    // Check if a conversation already exists between these users
    let conversation = await ConversationModel.findOne({
      $or: [
        { senderId: senderId, receiverId: receiverId },
        { senderId: receiverId, receiverId: senderId },
      ],
    });

    // Fetch receiver details from the UserModel
    const receiver = await UserModel.findById(receiverId).select(
      "firstName email image"
    );

    if (!receiver) {
      return res.status(404).json({
        message: "Receiver user not found",
      });
    }

    // Fetch sender details from the UserModel
    const sender = await UserModel.findById(senderId).select(
      "firstName email image"
    );

    if (!sender) {
      return res.status(404).json({
        message: "Sender user not found",
      });
    }

    if (!conversation) {
      // Create a new conversation including sender's and receiver's details
      conversation = new ConversationModel({
        receiverId,
        receiverName: receiver.firstName,
        receiverEmail: receiver.email,
        receiverImage: receiver.image,
        senderId,
        senderName: sender.firstName,
        senderEmail: sender.email,
        senderImage: sender.image,
      });

      // Save the conversation to the database
      await conversation.save();
    }

    // Add conversationId to the chatList of both users
    await UserModel.updateOne(
      { _id: senderId },
      { $addToSet: { chatList: conversation._id } }
    );
    await UserModel.updateOne(
      { _id: receiverId },
      { $addToSet: { chatList: conversation._id } }
    );

    // Send the conversation ObjectId and details in the response
    res.status(200).json({
      message: "Conversation created successfully",
      conversationId: conversation._id,
      receiver: {
        userId: receiverId,
        userName: receiver.firstName,
        userEmail: receiver.email,
        userImage: receiver.image,
      },
      sender: {
        userId: senderId,
        userName: sender.firstName,
        userEmail: sender.email,
        userImage: sender.image,
      },
      conversation,
    });
    console.log("receiverImage:------", receiver.image),
      console.log("receiverName:______", receiver.firstName);
  } catch (error) {
    console.error("Error creating conversation:", error);
    res.status(500).json({
      message: "An error occurred",
      error: error.message,
    });
  }
};


export const getAllConversation = async (req, res) => {
  const { userId } = req.body; // Assuming the userId is sent in the request body

  try {
    // Find all conversations for the user
    const conversations = await ConversationModel.find({
      $or: [{ senderId: userId }, { receiverId: userId }],
    })
      .populate("senderId", "firstName email image")
      .populate("receiverId", "firstName email image");

    // Log the conversations to check populated data
    console.log("Populated Conversations:", conversations);

    if (!conversations.length) {
      return res.status(404).json({
        message: "No conversations found",
      });
    }

    // Extract unique users from conversations
    const users = new Map();

    conversations.forEach((conversation) => {
      // Log sender and receiver data
      console.log("Sender Data:", conversation.senderId);
      console.log("Receiver Data:", conversation.receiverId);

      // Add sender details if they are not the logged-in user and senderId exists
      if (
        conversation.senderId &&
        conversation.senderId._id.toString() !== userId
      ) {
        users.set(conversation.senderId._id.toString(), {
          userId: conversation.senderId._id,
          userName: conversation.senderName,
          userEmail: conversation.senderId.email,
          userImage: conversation.senderImage,
          conversationId: conversation._id,
        });
      }

      console.log("Sender Data:", conversation.senderName);

      // Add receiver details if they are not the logged-in user and receiverId exists
      if (
        conversation.receiverId &&
        conversation.receiverId._id.toString() !== userId
      ) {
        users.set(conversation.receiverId._id.toString(), {
          userId: conversation.receiverId._id,
          userName: conversation.receiverName,
          userEmail: conversation.receiverId.email,
          userImage: conversation.receiverImage,
          conversationId: conversation._id,
        });
      }
    });

    const userList = Array.from(users.values());

    // Return all unique users who have communicated with the logged-in user
    res.status(200).json({
      message: "Users retrieved successfully",
      userList,
    });
  } catch (error) {
    console.error("Error retrieving users:", error);
    res.status(500).json({
      message: "An error occurred",
      error: error.message,
    });
  }
};


// Example server-side code for sending conversation details
