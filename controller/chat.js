import mongoose from "mongoose";
import { CommunicateModel } from "../model/chat.js";
import { io } from "socket.io-client";
import { Socket } from "socket.io";
const socket = io("http://localhost:3000");
export const sendMessage12 = async (req, res) => {
  const { conversationId, senderId, receiverId, text } = req.body;

  console.log("Sending message", senderId);
  console.log("receiverId:-----", receiverId);
  console.log("text:", text);
  console.log("conversationId:", conversationId);

  const image = req.file;
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
      receiverId,
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
    console.log("****************************************5454654645");
    console.log("new message", newMessage);
    // Emit notifications for sender and receiver
    const notificationMessage = {
      title: "New Message",
      body: `New message from ${senderId}: ${text}`, // You can customize this
    };

    console.log("****************************************5454654645");
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
                id: receiver.id,
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
export const sendMessage22 = async (req, res) => {
  const { conversationId, senderId, receiverId, text } = req.body;

  console.log("Sending message", senderId);
  console.log("receiverId:-----", receiverId);
  console.log("text:", text);
  console.log("conversationId:", conversationId);

  const image = req.file;
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

    // Create the new message object with the 'isRead' field set to false by default
    const newMessage = {
      _id: new mongoose.Types.ObjectId(), // Create a unique ID for the message
      senderId,
      receiverId,
      text,
      image: imageUrl, // Store image if exists
      createdTime: new Date(),
      isRead: false, // Default is "not seen"
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
    console.log("****************************************5454654645");
    console.log("new message", newMessage);

    // Emit notifications for sender and receiver
    const notificationMessage = {
      title: "New Message",
      body: `New message from ${senderId}: ${text}`, // You can customize this
    };

    console.log("****************************************5454654645");
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
          isRead: message.isRead, // Include the 'isRead' status in the response
          sender: sender
            ? {
                id: sender._id,
                firstName: sender.firstName,
                email: sender.email,
              }
            : null,
          receiver: receiver
            ? {
                id: receiver.id,
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

const ObjectId = mongoose.Types.ObjectId;

export const deleteMessage13 = async (req, res) => {
  const { messageId } = req.body; // Expecting messageId in the request body
  const userId = req.user.id; // Get the user ID from the request
  const userRole = req.user.role; // Get the user role from the request

  try {
    // Ensure messageId is a valid ObjectId
    const messageObjectId = new ObjectId(messageId);

    // Find the conversation that contains the message
    const conversation = await CommunicateModel.findOne({
      "messages.id": messageObjectId,
    });

    console.log("conversation:--------",messageObjectId);
    if (!conversation) {
      return res.status(404).json({
        success: false,
        error: "Message not found.",
      });
    }
    console.log("conversation:--------", conversation);
    // Retrieve the specific message from the messages array
    const message = conversation.messages.id(messageObjectId);

    console.log("message:--------", message);
    // Check if the message exists
    if (!message) {
      return res.status(404).json({
        success: false,
        error: "Message not found in the conversation.",
      });
    }

    // Fallback if message.userId is missing
    if (message.userId) {
      return res.status(400).json({
        success: false,
        error: "Message does not have an associated user ID.",
      });
    }

    // Mark the message as deleted for regular users
    if (userRole === "user") {
      message.deleted = true; // Mark as deleted
      await conversation.save();

      // Log the deleted message details
      console.log("Deleted message:", message);

      return res.status(200).json({
        success: true,
        message: "Message deleted successfully.",
      });
    }

    // If admin, confirm view-only deletion status without altering the deleted flag
    res.status(200).json({
      success: true,
      message: "Message deletion viewed by admin (no deletion applied).",
    });
  } catch (error) {
    console.error("Error deleting message:", error);
    res.status(500).json({
      success: false,
      error: "An error occurred while deleting the message.",
    });
  }
};
export const deleteMessage11 = async (req, res) => {
  const { messageId } = req.body; // Expecting messageId in the request body
  const userId = req.user.id; // Get the user ID from the request
  const userRole = req.user.role; // Get the user role from the request

  try {
    // Ensure messageId is a valid ObjectId
    const messageObjectId = new ObjectId(messageId);

    // Find the conversation that contains the message
    const conversation = await CommunicateModel.findOne({
      "messages.id": messageObjectId,
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        error: "Conversation not found.",
      });
    }

    console.log("conversation:--------", conversation);

    // Retrieve the specific message from the messages array using .find()
    const message = conversation.messages.find(
      (msg) => msg.id.toString() === messageObjectId.toString()
    );

    if (!message) {
      return res.status(404).json({
        success: false,
        error: "Message not found in the conversation.",
      });
    }

    console.log("message:--------", message);

    // Continue your logic here to handle message deletion, etc.

    return res.status(200).json({
      success: true,
      message: "Message retrieved successfully.",
    });
  } catch (error) {
    console.error("Error deleting message:", error);
    res.status(500).json({
      success: false,
      error: "An error occurred while deleting the message.",
    });
  }
};

export const deleteMessage = async (req, res) => {
  const { messageId } = req.body; // Expecting messageId in the request body
  const userId = req.user.id; // Get the user ID from the authenticated user

  try {
    // Ensure messageId is a valid ObjectId
    const messageObjectId = new ObjectId(messageId);

    // Update the message's `isDeleted` field and add the userId to `deletedBy`
    const result = await CommunicateModel.updateOne(
      { "messages.id": messageObjectId },
      {
        $set: { "messages.$.isDeleted": true }, // Mark message as deleted
        $addToSet: { "messages.$.deletedBy": userId }, // Add userId to deletedBy array
      }
    );

    if (result.nModified === 0) {
      return res.status(404).json({
        success: false,
        error: "Message not found or already deleted.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Message marked as deleted successfully.",
    });
  } catch (error) {
    console.error("Error deleting message:", error);
    res.status(500).json({
      success: false,
      error: "An error occurred while deleting the message.",
    });
  }
};

export const deleteMessage12 = async (req, res) => {
  const { messageId } = req.body; // Expecting messageId in the request body

  console.log("Deleting message", messageId);
  try {
    // Convert messageId into a valid ObjectId to query MongoDB
    const messageObjectId = new ObjectId(messageId);

    // Find the conversation containing the message by looking for the message ID in the 'messages' array
    const conversation = await CommunicateModel.findOne({
      "messages.id": messageId, // Use _id to correctly query nested message IDs
    });

    console.log("conversation:----",conversation,messageId);

    // Check if the conversation was found
    if (conversation) {
      return res.status(404).json({
        success: false,
        error: "Message not found in any conversation.",
      });
    }

    // Retrieve the specific message from the messages array within the conversation
    const messages = conversation.messages.id(messageObjectId);

    // If the message doesn't exist, return an error
    if (messages) {
      return res.status(404).json({
        success: false,
        error: "Message not found in the conversation.",
      });
    }

    // If the user is not the author of the message, deny the deletion
    if (message.userId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        error: "You are not authorized to delete this message.",
      });
    }

    // If the user is a regular user, mark the message as deleted (without removing it from the database)
    if (userRole === "user") {
      message.deleted = true; // Mark the message as deleted
      await conversation.save(); // Save the updated conversation document

      return res.status(200).json({
        success: true,
        message: "Message deleted successfully.",
      });
    }

    // If the user is an admin, they can only view the deletion status (without actually deleting it)
    res.status(200).json({
      success: true,
      message: "Message deletion viewed by admin (no deletion applied).",
    });
  } catch (error) {
    console.error("Error deleting message:", error);
    res.status(500).json({
      success: false,
      error: "An error occurred while deleting the message.",
    });
  }
};

export const getMessages11 = async (req, res) => {
  const { conversationId } = req.body;
  console.log("Fetching messages for conversationId:", conversationId);

  if (!conversationId) {
    return res
      .status(400)
      .json({ success: false, error: "conversationId is required" });
  }

  try {
    const conversation = await CommunicateModel.findOne({
      conversationId,
    });

    if (!conversation) {
      return res
        .status(404)
        .json({ success: false, message: "No conversation found" });
    }

    // Filter out deleted messages
    const messages = conversation.messages.filter(
      (message) => !message.deleted
    );

    return res.status(200).json({
      success: true,
      messages,
    });
  } catch (err) {
    console.error("Error fetching messages:", err);
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong" });
  }
};


export const getMessages = async (req, res) => {
  try {
    // Assuming the conversationId is sent in the body of the request
    const { conversationId } = req.body;
    console.log("Conversation ID received:", conversationId);

    // Query the database for messages related to the conversationId
    const messages = await CommunicateModel.find({
      conversationId: conversationId,
    });

    console.log("Messages fetched:", messages);

    // Send the messages back in the response
    res.json(messages);
  } catch (err) {
    console.error("Error fetching messages:", err);
    res.status(500).send(err);
  }
};

export const forwardMessage = async (req, res) => {
  const { originalMessageId, newReceiverId, senderId } = req.body;

  // Check if originalMessageId, newReceiverId, and senderId are present
  if (!originalMessageId || !newReceiverId || !senderId) {
    return res.status(400).json({
      success: false,
      error: "originalMessageId, newReceiverId, and senderId are required.",
    });
  }

  try {
    // Find the original message by originalMessageId
    const originalMessage = await CommunicateModel.findOne({
      "messages._id": originalMessageId,
    });

    // If original message doesn't exist, return an error
    if (!originalMessage) {
      return res.status(404).json({
        success: false,
        error: "Original message not found.",
      });
    }

    // Extract message details
    const messageDetails = originalMessage.messages.id(originalMessageId);

    // Prepare the new message object
    const forwardedMessage = {
      _id: new mongoose.Types.ObjectId(), // Create a unique ID for the forwarded message
      senderId,
      text: messageDetails.text, // Forwarding the text of the original message
      image: messageDetails.image, // Forwarding the image if exists
      createdTime: new Date(), // Set created time to now
      deleted: false, // Message is not deleted by default
    };

    // Find or create a conversation for the new receiver
    let conversation = await CommunicateModel.findOne({
      senderId: senderId,
      receiverId: newReceiverId,
    });

    // If conversation doesn't exist, create a new one
    if (!conversation) {
      conversation = new CommunicateModel({
        conversationId: new mongoose.Types.ObjectId(), // Create a new conversation ID
        senderId,
        receiverId: newReceiverId,
        messages: [],
      });
    }

    // Add the forwarded message to the conversation
    conversation.messages.push(forwardedMessage);

    // Save the conversation with the new forwarded message
    await conversation.save();

    // Emit the new message via Socket.IO to the new receiver
    socket.emit("messageSent", senderId, forwardedMessage); // Notify sender
    socket.emit("messageReceived", newReceiverId, forwardedMessage); // Notify new receiver

    // Emit notifications for sender and new receiver
    const notificationMessage = {
      title: "Message Forwarded",
      body: `Forwarded message from ${senderId}: ${messageDetails.text}`,
    };

    // Notify the new receiver if online
    socket.emit("notification", newReceiverId, notificationMessage);

    // Respond with the forwarded message details
    res.status(200).json({
      success: true,
      message: forwardedMessage,
    });
  } catch (error) {
    console.error("Error forwarding message:", error);
    res.status(500).json({
      success: false,
      error: "An error occurred while forwarding the message.",
    });
  }
};


export const getUnreadCounts = async (req, res) => {
  try {
    // Extract userId from the request body
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }

    console.log("User ID received for unread counts:", userId);

    // Query the database for all conversations involving the user
    const conversations = await CommunicateModel.find({
      "participants.userId": userId, // Match conversations where the user is a participant
    }).select("conversationId participants");

    // Process conversations to extract unread counts
    const unreadCounts = conversations.map((conversation) => {
      // Find the participant object for the given userId
      const participant = conversation.participants.find(
        (p) => p.userId === userId
      );

      return {
        conversationId: conversation.conversationId,
        unreadCount: participant?.unreadCount || 0, // Default to 0 if no unreadCount
      };
    });

    console.log("Unread counts fetched:", unreadCounts);

    // Send the unread counts back in the response
    res.json(unreadCounts);
  } catch (err) {
    console.error("Error fetching unread counts:", err);
    res.status(500).json({ error: "Failed to fetch unread counts" });
  }
};
