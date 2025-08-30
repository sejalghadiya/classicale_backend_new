import { CommunicateModel } from "../model/chat.js";
import { BikeModel } from "../model/bike.js";
import { BookSportHobbyModel } from "../model/book_sport_hobby.js";
import { CarModel } from "../model/car.js";
import { ConversationModel } from "../model/conversation.js";
import { ElectronicModel } from "../model/electronic.js";
import { FurnitureModel } from "../model/furniture.js";
import { JobModel } from "../model/job.js";
import { OtherModel } from "../model/other.js";
import { PetModel } from "../model/pet.js";
import { ProductTypeModel } from "../model/product_type.js";
import { PropertyModel } from "../model/property.js";
import { ServicesModel } from "../model/services.js";
import { SmartPhoneModel } from "../model/smart_phone.js";
import { io } from "../index.js";
import { onlineUsers, joinConversation } from "../socket.js";
import { saveBase64Image } from "../utils/image_store.js";
import mongoose from "mongoose";
const productModels = {
  Bike: BikeModel,
  Car: CarModel,
  book_sport_hobby: BookSportHobbyModel,
  electronic: ElectronicModel,
  furniture: FurnitureModel,
  Job: JobModel,
  pet: PetModel,
  smart_phone: SmartPhoneModel,
  services: ServicesModel,
  other: OtherModel,
  property: PropertyModel,
};
export const createConversation = async (req, res) => {
  console.log(req.body);
  const { userId, productId, productTypeId } = req.body;
  console.log("userId", userId);

  try {
    // find model by id
    const productType = await ProductTypeModel.findById(productTypeId);
    if (!productType) {
      throw new Error("Product type not found");
    }

    const modelName = productType.modelName;

    const Model = productModels[modelName];

    // Fetch the user who added the product
    const addProductUser = await Model.findById(productId);

    if (!addProductUser) {
      throw new Error("Product not found");
    }
    // Check if the product is active
    if (!addProductUser.isActive) {
      throw new Error("Product is not active");
    }

    if (addProductUser.isDeleted) {
      throw new Error("Product is deleted");
    }

    if (!addProductUser.userId) {
      throw new Error("User not found");
    }
    const addProductUserId = addProductUser.userId;
    // Check if the userId and addProductUserId are the same
    console.log("userId", userId);
    console.log("addProductUserId", addProductUserId);
    if (userId == addProductUserId) {
      throw new Error("Cannot create conversation with yourself");
    }
    // Check if a conversation already exists
    let conversation = await ConversationModel.findOne({
      participants: { $all: [userId, addProductUserId] },
      product: productId,
    });

    // If a conversation exists, return it
    if (conversation) {
      return conversation;
    }
    if (!conversation) {
      conversation = await ConversationModel.create({
        participants: [userId, addProductUserId],
        product: productId,
        productTypeId: productTypeId,
      });
      return conversation;
    }
  } catch (error) {
    console.log("Error creating conversation:", error);
    throw error;
  }
};

export const sendMessage = async (req, res) => {
  try {
    let {
      senderId,
      productId,
      type,
      conversationId,
      content,
      metaData,
      productTypeId,
      status,
    } = req.body;

    // Validate the request body
    if (!senderId) {
      return res.status(400).json({
        message: "Sender Id  is missing",
      });
    }
    if (!productId) {
      return res.status(400).json({
        message: "Product Id  is missing",
      });
    }
    if (!type) {
      return res.status(400).json({
        message: "Message type  is missing",
      });
    }
    if (!content) {
      return res.status(400).json({
        message: "Message content  is missing",
      });
    }
    if (!metaData) {
      return res.status(400).json({
        message: "Metadata  is missing",
      });
    }
    if (!productTypeId) {
      return res.status(400).json({
        message: "ProductType Id  is missing",
      });
    }
    if (!status) {
      return res.status(400).json({
        message: "Status  is missing",
      });
    }
    let conversation;

    if (!conversationId) {
      conversation = await createConversation({
        body: { userId: senderId, productId, productTypeId },
      });
      conversationId = conversation._id;
    } else {
      conversation = await ConversationModel.findById(conversationId);
      if (!conversation) {
        conversation = await createConversation({
          body: {
            userId: senderId,
            productId,
            productTypeId,
          },
        });
        conversationId = conversation._id;
      }
    }
    if (type === "text") {
      try {
        // Find the recipient
        const recipientId = conversation.participants.find(
          (id) => id.toString() !== senderId
        );

        // Remove both users from deletedBy array in conversation
        await ConversationModel.findByIdAndUpdate(conversationId, {
          $pull: {
            deletedBy: {
              $in: [senderId, recipientId],
            },
          },
        });

        const newMessage = await CommunicateModel.create({
          chatId: conversationId,
          senderId: senderId,
          productId: productId,
          type: type,
          content: content,
          metaData: metaData,
          status: status,
          deletedBy: [], // Initialize empty deletedBy array
        });

        // Populate senderId for the response
        await newMessage.populate("senderId");

        // console.log("response", newMessage);
        console.log("senderId", senderId);
        console.log("recipientId", recipientId);

        // Convert IDs to strings for consistent comparison
        const recipientIdStr = recipientId.toString();
        const senderIdStr = senderId.toString();
        const conversationIdStr = conversationId.toString();

        console.log("Checking socket connections:");
        console.log("All online users:", Array.from(onlineUsers.entries()));
        console.log(
          "All active conversations:",
          Array.from(joinConversation.entries())
        );

        // Get socket IDs
        const recipientSocketId = onlineUsers.get(recipientIdStr);
        const senderSocketId = onlineUsers.get(senderIdStr);

        console.log(
          `Recipient socket ID (${recipientIdStr}):`,
          recipientSocketId
        );
        console.log(`Sender socket ID (${senderIdStr}):`, senderSocketId);

        // Emit to conversation room first
        io.to(conversationIdStr).emit("message", {
          type: "new_message",
          data: newMessage,
        });

        // Send notifications to individual sockets
        if (recipientSocketId) {
          io.to(recipientSocketId).emit("notification", {
            type: "new_message",
            data: newMessage,
          });
        }

        if (senderSocketId) {
          io.to(senderSocketId).emit("notification", {
            type: "message_sent",
            data: newMessage,
          });
        }

        return res.status(200).json({
          message: "Message sent successfully",
          status: 200,
          data: newMessage,
        });
      } catch (error) {
        console.error("Error sending message:", error);
        throw error;
      }
    } else if (type === "image") {
    } else if (type === "pdf") {
    } else {
      return res.status(400).json({ message: "Invalid message type" });
    }

    // Emit the message to the socket
    // socket.emit("message", newMessage);

    res
      .status(200)
      .json({ message: "Message sent successfully", data: newMessage });
  } catch (error) {
    console.log("Error sending message:", error);
    res.status(500).json({ message: error.message });
  }
};

export const fetchConversationId = async (req, res) => {
  const { userId, productId } = req.body;

  try {
    const conversation = await ConversationModel.findOne({
      participants: { $all: [userId] },
      product: productId,
      deletedBy: { $ne: userId }, // <-- NOT deleted by this user
    });

    if (!conversation) {
      return res.status(201).json({ message: "Conversation not found" });
    }

    res.status(200).json({
      message: "Conversation found",
      status: 200,
      data: conversation,
    });
  } catch (error) {
    console.error("Error fetching conversation ID:", error);
    res.status(500).json({ message: "Error fetching conversation ID:", error });
  }
};

// export const fetchAllConversations = async (req, res) => {
//   const { userId } = req.params;

//   try {
//     const conversations = await ConversationModel.find({
//       participants: { $all: [userId] },
//     })
//       .populate(
//         "participants",
//         "_id name email profileImage phone fName lName mName gender"
//       )
//       .populate("productTypeId");

//     if (!conversations || conversations.length === 0) {
//       return res.status(404).json({ message: "Conversations not found" });
//     }

//     // Enhance each conversation with last message and unread count
//     const enhancedConversations = await Promise.all(
//       conversations.map(async (conversation) => {
//         const lastMessage = await CommunicateModel.findOne({
//           chatId: conversation._id,
//         })
//           .populate(
//             "senderId",
//             "_id name email profileImage phone fName lName mName gender"
//           )
//           .sort({ createdAt: -1 })
//           .lean();

//         const unreadCount = await CommunicateModel.countDocuments({
//           chatId: conversation._id,
//           senderId: { $ne: userId }, // not sent by current user
//           status: { $ne: "read" },
//         });

//         return {
//           ...conversation.toObject(),
//           lastMessage,
//           unreadCount,
//         };
//       })
//     );

//     res.status(200).json({
//       message: "Conversations fetched successfully",
//       status: 200,
//       data: enhancedConversations,
//     });
//   } catch (error) {
//     console.error("Error fetching conversations:", error);
//     res.status(500).json({ message: "Internal server error", error });
//   }
// };

export const fetchAllConversations = async (req, res) => {
  const { userId } = req.params; // current user

  try {
    /* 1️⃣  Filter: exclude conversations soft‑deleted by this user */
    const conversations = await ConversationModel.find({
      participants: { $all: [userId] }, // user is a participant
      deletedBy: { $nin: [userId] }, // <-- NOT deleted by this user
    })
      .populate(
        "participants",
        "_id name email profileImage phone fName lName mName gender"
      )
      .populate("productTypeId");
    console.log("conversations", conversations);

    if (!conversations.length) {
      return res
        .status(404)
        .json({ message: "Conversations not found", status: 404 });
    }

    /* 2️⃣  Enhance with lastMessage + unreadCount as before */
    const enhancedConversations = await Promise.all(
      conversations.map(async (conversation) => {
        const lastMessage = await CommunicateModel.findOne({
          chatId: conversation._id,
          deletedBy: { $nin: [userId] }, // Don't show messages deleted by this user
        })
          .populate(
            "senderId",
            "_id name email profileImage phone fName lName mName gender"
          )
          .sort({ createdAt: -1 })
          .lean();

        const unreadCount = await CommunicateModel.countDocuments({
          chatId: conversation._id,
          senderId: { $ne: userId }, // not current user
          status: { $ne: "read" },
          deletedBy: { $nin: [userId] }, // Don't count deleted messages
        });

        return {
          ...conversation.toObject(),
          lastMessage,
          unreadCount,
        };
      })
    );

    return res.status(200).json({
      message: "Conversations fetched successfully",
      status: 200,
      data: enhancedConversations,
    });
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", error, status: 500 });
  }
};

export const fetchMessages = async (req, res) => {
  const { conversationId } = req.params;

  try {
    const messages = await CommunicateModel.find({
      chatId: conversationId,
      deletedBy: { $nin: [req.user._id] }, // Use $nin for array field
    })
      .populate(
        "senderId",
        "_id name email profileImage phone fName lName mName gender"
      )
      .sort({ createdAt: 1 });
    console.log("Request user ID:", req.user._id);
    console.log("Fetched messages:", messages);
    if (!messages || messages.length === 0) {
      // Added check for empty array
      return res.status(404).json({ message: "Messages not found" });
    }

    res.status(200).json({
      message: "Messages fetched successfully",
      status: 200,
      data: messages,
    });
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// update message status
export const updateMessageStatus = async (messageId) => {
  try {
    const updatedMessage = await CommunicateModel.findByIdAndUpdate(
      messageId,
      {
        status: "delivered",
      },
      { new: true } // returns the updated document instead of the original
    );

    if (!updatedMessage) {
      io.emit("messageDeliveredError", {
        message: "Message not found",
        error: "Message not found",
      });
    }
    io.emit("messageDelivered", {
      message: "Message status updated successfully",
      data: updatedMessage,
    });
  } catch (error) {
    console.error("Error updating message status:", error);
    io.emit("messageDeliveredError", {
      message: "Error updating message status",
      error: error.message,
    });
    // res.status(500).json({ message: "Internal server error" });
  }
};

// get userId and conversationId then update the all messages to delivered if it is not sent by the userId
export const updateAllMessagesStatus = async (req, res) => {
  const { userId, conversationId } = req.body;

  try {
    // Step 1: Find all matching messages
    const messagesToUpdate = await CommunicateModel.find({
      chatId: conversationId,
      senderId: { $ne: userId },
      status: { $ne: "read" },
    });

    if (messagesToUpdate.length === 0) {
      return res.status(404).json({ message: "No unread messages to update" });
    }

    // Step 2: Update each message and collect updated versions
    const updatedMessages = await Promise.all(
      messagesToUpdate.map(async (msg) => {
        msg.status = "read";
        return await msg.save(); // Save the updated message and return it
      })
    );

    // Step 3: Send updated messages in response
    res.status(200).json({
      message: "Messages status updated successfully",
      status: 200,
      data: updatedMessages,
    });
  } catch (error) {
    console.error("Error updating messages status:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

//unread message count
export const getUnreadMessageCount = async (req, res) => {
  const { userId } = req.body;

  try {
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const unreadCount = await CommunicateModel.countDocuments({
      senderId: { $ne: userId }, // not sent by the user
      status: { $ne: "read" }, // not yet read
      receiverId: userId, // optional: only if you store receiverId
    });

    res.status(200).json({
      message: "Unread message count fetched successfully",
      status: 200,
      unreadCount,
    });
  } catch (error) {
    console.error("Error fetching unread message count:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// sent image message
export const sendImageMessage = async (req, res) => {
  try {
    const { chatId, senderId, productId, type, content, metaData, status } =
      req.body;
    const { fileName, fileSize, mimeType } = metaData;

    if (
      !chatId ||
      !senderId ||
      !productId ||
      !type ||
      !content ||
      !metaData ||
      !status
    ) {
      // return array of missing field
      const missingFields = [];
      if (!chatId) missingFields.push("chatId");
      if (!senderId) missingFields.push("senderId");
      if (!productId) missingFields.push("productId");
      if (!type) missingFields.push("type");
      if (!content) missingFields.push("content");
      if (!metaData) missingFields.push("metaData");

      if (metaData) {
        if (!fileName) missingFields.push("metaData.fileName");
        if (!fileSize) missingFields.push("metaData.fileSize");
        if (!mimeType) missingFields.push("metaData.mimeType");
      }
      if (!status) missingFields.push("status");
      return res.status(400).json({
        message: "Missing required fields",
        missingFields,
      });
    }

    const imageURL = saveBase64Image(
      content,
      `chat/images/${senderId}`,
      fileName
    );
    if (!imageURL) {
      return res.status(500).json({ message: "Failed to save image" });
    }
    const imageName = imageURL.split("/").pop();
    const newMessage = await CommunicateModel.create({
      chatId,
      senderId,
      productId,
      type,
      content: imageURL, // Store the URL of the saved image
      metaData: {
        imageName,
        fileSize,
        mimeType,
      },
      status,
    });

    // Update the conversation with the new message
    await newMessage.save();
    // Populate senderId
    await newMessage.populate("senderId");
    if (!newMessage) {
      return res.status(404).json({ message: "Conversation not found" });
    }
    // Identify recipient (the other participant)
    const conversation = await ConversationModel.findById(chatId);
    const recipientId = conversation.participants.find(
      (id) => id.toString() !== senderId
    );
    console.log("recipientId", recipientId);
    const onlineUserSocketId = onlineUsers.get(recipientId.toString());
    const onlineSenderSocketId = onlineUsers.get(senderId.toString());
    const recipientSocketId = joinConversation.get(recipientId.toString());
    if (onlineUserSocketId) {
      io.to(onlineUserSocketId).emit("fetchAPI", {
        message: "fetch message",
      });
    }
    if (onlineSenderSocketId) {
      io.to(onlineSenderSocketId).emit("fetchAPI", {
        message: "fetch message",
      });
    }
    if (recipientSocketId) {
      console.log("recipientSocketId", recipientSocketId);
      io.to(recipientSocketId).emit("message", newMessage);
    }
    // Emit the message to the socket
    // socket.emit("message", newMessage);
    res.status(200).json({
      message: "Image message sent successfully",
      status: 200,
      data: newMessage,
    });
  } catch (error) {
    console.error("Error sending image message:", error);
    res.status(500).json({ message: error.message });
  }
};

//conversation delete for user
export const deleteConversationForUser = async (req, res) => {
  const { conversationId } = req.params;
  const userId = req.userId || req.body.userId;

  try {
    // Find conversation and validate
    const conv = await ConversationModel.findById(conversationId);
    if (!conv) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    // Check if user is a participant
    if (!conv.participants.map((id) => id.toString()).includes(userId)) {
      return res.status(403).json({ message: "Not your conversation" });
    }

    // Check if already deleted by this user
    if (conv.deletedBy.includes(userId)) {
      return res.status(200).json({ message: "Already deleted" });
    }

    try {
      // Add user to deletedBy array in conversation
      conv.deletedBy.push(userId);
      await conv.save();

      // Add deletedBy field to all messages in this conversation for this user
      await CommunicateModel.updateMany(
        {
          chatId: conversationId,
          deletedBy: { $ne: userId }, // Only update if not already deleted by this user
        },
        {
          $addToSet: { deletedBy: userId },
        }
      );

      return res.status(200).json({
        message:
          "Conversation and associated messages soft deleted successfully",
        status: 200,
      });
    } catch (error) {
      console.error("Error in delete operation:", error);
      throw error;
    }
  } catch (err) {
    console.error("Delete conversation error:", err);
    res.status(500).json({ message: "Internal server error", status: 500 });
  }
};
