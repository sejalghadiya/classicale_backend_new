import mongoose from "mongoose";
import { CommunicateModel } from "../model/chat.js";

// Example of client-side Socket.IO usage
import { io } from "socket.io-client";
import { Socket } from "socket.io";

// Connect to the server
const socket = io("http://localhost:3000");

export const sendMessage11 = async (req, res) => {
  const { conversationId, senderId, receiverId, text } = req.body;
  const image = req.file;

  let imageUrl = "";
  if (image) {
    imageUrl = `data:${image.mimetype};base64,${image.buffer.toString(
      "base64"
    )}`;
  }

  // Check for required fields
  if (!senderId || !receiverId) {
    return res
      .status(400)
      .json({ success: false, error: "senderId and receiverId are required" });
  }

  try {
    // Find or create a conversation
    let conversation = await CommunicateModel.findOne({ conversationId });

    if (!conversation) {
      conversation = new CommunicateModel({
        conversationId,
        senderId,
        messages: [],
      });
    }

    // Create a new message object
    const newMessage = {
      _id: new mongoose.Types.ObjectId(),
      senderId,
      text,
      image: imageUrl,
      createdTime: new Date(),
      deleted: false, // Initially, the message is not deleted
    };

    // Add the new message to the conversation
    conversation.messages.push(newMessage);

    // Save the conversation
    await conversation.save();

    // Emit the new message to all connected clients
    io.emit("receiveMessage", newMessage);
    console.log(newMessage);
    console.log("+++++++++++++++++++++++++");

    // Populate sender and receiver details, excluding deleted messages for the user
    const populatedConversation = await CommunicateModel.findById(
      conversation._id
    )
      .populate({
        path: "messages.senderId",
        select: "firstName email",
      })
      .populate({
        path: "messages.receiverId",
        select: "firstName email",
      })
      .exec();

    // Filter out deleted messages for the user
    const formattedMessages = populatedConversation.messages
      .filter((message) => !message.deleted) // Exclude deleted messages
      .map((message) => {
        const sender = message.senderId;
        const receiver = message.receiverId;

        return {
          _id: message._id,
          text: message.text,
          image: message.image,
          createdTime: message.createdTime,
          sender: sender
            ? {
                id: sender._id,
                firstName: sender.firstName,
                email: sender.email,
              }
            : null,
          receiver: receiver
            ? {
                id: receiver._id,
                firstName: receiver.firstName,
                email: receiver.email,
              }
            : null,
        };
      });

    // Return the updated conversation with formatted messages
    res.status(200).json({
      success: true,
      conversationId: populatedConversation.conversationId,
      messages: formattedMessages,
    });
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const sendMessage22 = async (req, res) => {
  const { conversationId, senderId, receiverId, text } = req.body;

  console.log("Sending message", senderId);
  console.log("+++++++++++++++++++++++++");
  console.log("receiverId:-----", receiverId);
  console.log("+++++++++++++++++++++++++");
  console.log("text:", text);
  console.log("+++++++++++++++++++++++++");
  console.log("conversationId:", conversationId);
  console.log("+++++++++++++++++++++++++");
  const image = req.file;

  // Initialize imageUrl variable
  let imageUrl = "";
  if (image) {
    imageUrl = `data:${image.mimetype};base64,${image.buffer.toString(
      "base64"
    )}`;
  }
  // Check if senderId and receiverId are present
  if (!senderId || !receiverId) {
    return res.status(400).json({
      success: false,
      error: "Both senderId and receiverId are required.",
    });
  }

  try {
    // Find the conversation by conversationId, or create a new one
    let conversation = await CommunicateModel.findOne({ conversationId });

    // If conversation doesn't exist, create a new one
    if (!conversation) {
      conversation = new CommunicateModel({
        conversationId,
        senderId,
        receiverId,
        text,
        image,
      });
    }
    console.log("image:-----", image);
    // Create the new message object
    const newMessage = {
      _id: new mongoose.Types.ObjectId(), // Create a unique ID for the message
      senderId,
      text,
      image: imageUrl, // Store image if exists
      createdTime: new Date(),
      deleted: false, // Message is not deleted by default
    };

    console.log("************************************************");

    // Add the new message to the conversation
    conversation.messages.push(newMessage);

    // Save the conversation with the new message
    await conversation.save();

    // Emit the new message via Socket.IO to all clients
    socket.emit("sendMessage", newMessage.senderId); // Emit to sender
    socket.emit("receiveMessage", newMessage.receiverId); // Emit to receiver
    console.log("New message sent:", newMessage, senderId);
    console.log("Received new message:", newMessage, receiverId);
    // Populate sender and receiver details for the conversation response
    const populatedConversation = await CommunicateModel.findById(
      conversation._id
    )
      .populate({
        path: "messages.senderId",
        select: "firstName email", // Only fetch the firstName and email of sender
      })
      .populate({
        path: "messages.receiverId",
        select: "firstName email", // Only fetch the firstName and email of receiver
      });

    // Format the messages by filtering out deleted messages
    const formattedMessages = populatedConversation.messages
      .filter((message) => !message.deleted) // Exclude deleted messages
      .map((message) => {
        const sender = message.senderId;
        const receiver = message.receiverId;

        console.log("sender:-----------", sender);
        console.log("++++++++++++++++++++");
        console.log("receiver:--------", receiver);

        return {
          _id: message._id,
          text: message.text,
          image: message.image,
          createdTime: message.createdTime,
          sender: sender
            ? {
                id: sender._id,
                firstName: sender.firstName,
                email: sender.email,
              }
            : null,
          receiver: receiver
            ? {
                id: receiver._id,
                firstName: receiver.firstName,
                email: receiver.email,
              }
            : null,
        };
      });

    // Respond with the updated conversation data
    res.status(200).json({
      success: true,
      conversationId: populatedConversation.conversationId,
      messages: formattedMessages,
    });
    console.log("response:--------", formattedMessages);
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({
      success: false,
      error: "An error occurred while sending the message.",
    });
  }
};

export const sendMessage = async (req, res) => {
  const { conversationId, senderId, receiverId, text } = req.body;

  console.log("Sending message", senderId);
  console.log("receiverId:-----", receiverId);
  console.log("text:", text);
  console.log("conversationId:", conversationId);

  const image = req.file;

  // Initialize imageUrl variable
  let imageUrl = "";
  if (image) {
    imageUrl = `data:${image.mimetype};base64,${image.buffer.toString(
      "base64"
    )}`;
  }

  // Check if senderId and receiverId are present
  if (!senderId || !receiverId) {
    return res.status(400).json({
      success: false,
      error: "Both senderId and receiverId are required.",
    });
  }

  try {
    // Find the conversation by conversationId, or create a new one
    let conversation = await CommunicateModel.findOne({ conversationId });

    // If conversation doesn't exist, create a new one
    if (!conversation) {
      conversation = new CommunicateModel({
        conversationId,
        senderId,
        receiverId,
        text,
        image,
      });
    }

    console.log("image:-----", image);

    // Create the new message object
    const newMessage = {
      _id: new mongoose.Types.ObjectId(), // Create a unique ID for the message
      senderId,
      text,
      image: imageUrl, // Store image if exists
      createdTime: new Date(),
      deleted: false, // Message is not deleted by default
    };

    console.log("************************************************");

    // Add the new message to the conversation
    conversation.messages.push(newMessage);

    // Save the conversation with the new message
    await conversation.save();

    // Emit the new message via Socket.IO to all clients
    socket.emit("messageSent", senderId, newMessage); // Notify sender
    socket.emit("messageReceived", receiverId, newMessage); // Notify receiver

    // Emit notifications for sender and receiver
    const notificationMessage = {
      title: "New Message",
      body: `New message from ${senderId}: ${text}`, // You can customize this
    };

    console.log("************************************************");
    console.log(notificationMessage);

    // Notify the receiver if online
    socket.emit("notification", receiverId, notificationMessage);

    console.log("New message sent:", newMessage, senderId);
    console.log("Received new message:", newMessage, receiverId);

    // Populate sender and receiver details for the conversation response
    const populatedConversation = await CommunicateModel.findById(
      conversation._id
    )
      .populate({
        path: "messages.senderId",
        select: "firstName email", // Only fetch the firstName and email of sender
      })
      .populate({
        path: "messages.receiverId",
        select: "firstName email", // Only fetch the firstName and email of receiver
      });

    // Format the messages by filtering out deleted messages
    const formattedMessages = populatedConversation.messages
      .filter((message) => !message.deleted) // Exclude deleted messages
      .map((message) => {
        const sender = message.senderId;
        const receiver = message.receiverId;

        return {
          _id: message._id,
          text: message.text,
          image: message.image,
          createdTime: message.createdTime,
          sender: sender
            ? {
                id: sender._id,
                firstName: sender.firstName,
                email: sender.email,
              }
            : null,
          receiver: receiver
            ? {
                id: receiver._id,
                firstName: receiver.firstName,
                email: receiver.email,
              }
            : null,
        };
      });

    // Respond with the updated conversation data
    res.status(200).json({
      success: true,
      conversationId: populatedConversation.conversationId,
      messages: formattedMessages,
    });
    console.log("response:--------", formattedMessages);
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({
      success: false,
      error: "An error occurred while sending the message.",
    });
  }
};

export const deleteMessage = async (req, res) => {
  const { messageId, conversationId } = req.body;

  try {
    // Find the conversation by conversationId
    const conversation = await CommunicateModel.findOne({ conversationId });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        error: "Conversation not found.",
      });
    }

    // Find the message by messageId and mark it as deleted
    const message = conversation.messages.id(messageId);
    if (!message) {
      return res.status(404).json({
        success: false,
        error: "Message not found.",
      });
    }

    message.deleted = true; // Mark as deleted
    await conversation.save();

    res.status(200).json({
      success: true,
      message: "Message deleted successfully.",
    });
  } catch (error) {
    console.error("Error deleting message:", error);
    res.status(500).json({
      success: false,
      error: "An error occurred while deleting the message.",
    });
  }
};

export const getMessages = async (req, res) => {
  const { conversationId } = req.body;
  console.log("&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&");
  console.log(conversationId);

  if (!conversationId) {
    return res
      .status(200)
      .json({ success: false, error: "conversationId is required" });
  }

  try {
    const conversation = await CommunicateModel.findOne({
      conversationId,
    });
    console.log("????????????????????????????????");
    console.log(conversation.messages);
    console.log("******************@@@@@****************");

    if (!conversation) {
      return res.status(400).json({ message: "No conversation found" });
    }

    return res.status(200).json({
      success: true,
      messages: conversation.messages,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Something went wrong" });
  }
};
