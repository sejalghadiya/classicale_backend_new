import { ConversationModel } from "../model/conversation.js";
import { UserModel } from "../model/user.js";
import mongoose from "mongoose";

export const resetNewMessages = async (req, res) => {
  const { conversationId } = req.body;

  try {
    // Validate conversationId format
    if (!mongoose.Types.ObjectId.isValid(conversationId)) {
      return res.status(400).json({ message: "Invalid conversation ID" });
    }

    // Reset newMessages to 0
    const updatedConversation = await ConversationModel.findOneAndUpdate(
      { _id: conversationId },
      { newMessages: 0 }, // Reset the newMessages field
      { new: true } // Return the updated conversation
    );

    // If conversation not found
    if (!updatedConversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    // Success response
    res.status(200).json({
      message: "New messages reset successfully",
      conversation: updatedConversation,
    });
  } catch (error) {
    console.error("Error resetting new messages:", error);
    res.status(500).json({
      message: "An error occurred",
      error: error.message,
    });
  }
};

export const createConversation = async (req, res) => {
  const { senderId, receiverId } = req.body;

  try {
    // Fetch sender and receiver from the database
    const [sender, receiver] = await Promise.all([
      UserModel.findById(senderId).select("firstName email image"),
      UserModel.findById(receiverId).select("firstName email image"),
    ]);

    if (!sender) {
      return res
        .status(404)
        .json({ message: `Sender with ID ${senderId} not found` });
    }

    if (!receiver) {
      console.log(`Receiver ID ${receiverId} not found in UserModel`);
      return res
        .status(404)
        .json({ message: `Receiver with ID ${receiverId} not found` });
    }

    // Check if a conversation already exists
    let conversation = await ConversationModel.findOne({
      $or: [
        { senderId: senderId, receiverId: receiverId },
        { senderId: receiverId, receiverId: senderId },
      ],
    });

    // Create a new conversation if it doesn't exist
    if (!conversation) {
      conversation = new ConversationModel({
        senderId,
        senderName: sender.firstName,
        senderEmail: sender.email,
        senderImage: sender.image,
        receiverId,
        receiverName: receiver.firstName,
        receiverEmail: receiver.email,
        receiverImage: receiver.image,
      });
      await conversation.save();

      // Add conversationId to both users' chatLists
      await Promise.all([
        UserModel.updateOne(
          { _id: senderId },
          { $addToSet: { chatList: conversation._id } }
        ),
        UserModel.updateOne(
          { _id: receiverId },
          { $addToSet: { chatList: conversation._id } }
        ),
      ]);
    }

    // Respond with success
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
export const getAllConversation12 = async (req, res) => {
  const { userId } = req.body;

  try {
    // Find all conversations for the user
    const conversations = await ConversationModel.find({
      $or: [{ senderId: userId }, { receiverId: userId }],
    })
      .populate("senderId", "firstName email image")
      .populate("receiverId", "firstName email image");

    console.log("Populated Conversations:", conversations);

    if (!conversations.length) {
      return res.status(404).json({
        message: "No conversations found",
      });
    }

    const users = new Map();

    // Iterate through the conversations and set 'pending' status for each message
    for (const conversation of conversations) {
      if (Array.isArray(conversation.messages)) {
        // Check if messages is an array
        for (const message of conversation.messages) {
          if (message.status === "pending") {
            if (message.receiverId.toString() === userId) {
              await ConversationModel.updateOne(
                { _id: conversation._id, "messages.id": message.id },
                { $set: { "messages.$.status": "pending" } }
              );
            }
          }
        }
      } else {
        console.log("No messages in conversation:", conversation._id);
      }
    }

    const userList = Array.from(users.values());

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
