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
import { io, onlineUsers } from "../index.js";
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
      const newMessage = await CommunicateModel.create({
        chatId: conversationId,
        senderId: senderId,
        productId: productId,
        type: type,
        content: content,
        metaData: metaData,
        status: status,
      });

      // Update the conversation with the new message
      await newMessage.save();
      // Populate senderId
      await newMessage.populate("senderId");

      // console.log("response", newMessage);
      if (!newMessage) {
        return res.status(404).json({ message: "Conversation not found" });
      }
      // Identify recipient (the other participant)
      const recipientId = conversation.participants.find(
        (id) => id.toString() !== senderId
      );
      console.log("recipientId", recipientId);
      const recipientSocketId = onlineUsers.get(recipientId.toString());

      if (recipientSocketId) {
        console.log("recipientSocketId", recipientSocketId);
        io.to(recipientSocketId).emit("message", newMessage);
      }
      // Emit the message to the socket
      // socket.emit("message", newMessage);
      return res.status(200).json({
        message: "Message sent successfully",
        status: 200,
        data: newMessage,
      });
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

export const fetchAllConversations = async (req, res) => {
  const { userId } = req.params;

  try {
    const conversations = await ConversationModel.find({
      participants: { $all: [userId] },
    })
      .populate(
        "participants",
        "_id name email profileImage phone fName lName mName gender"
      )
      .populate("productTypeId");

    if (!conversations || conversations.length === 0) {
      return res.status(404).json({ message: "Conversations not found" });
    }

    // Enhance each conversation with last message and unread count
    const enhancedConversations = await Promise.all(
      conversations.map(async (conversation) => {
        const lastMessage = await CommunicateModel.findOne({
          chatId: conversation._id,
        })
          .populate(
            "senderId",
            "_id name email profileImage phone fName lName mName gender"
          )
          .sort({ createdAt: -1 })
          .lean();

        const unreadCount = await CommunicateModel.countDocuments({
          chatId: conversation._id,
          senderId: { $ne: userId }, // not sent by current user
          status: { $ne: "read" },
        });

        return {
          ...conversation.toObject(),
          lastMessage,
          unreadCount,
        };
      })
    );

    res.status(200).json({
      message: "Conversations fetched successfully",
      status: 200,
      data: enhancedConversations,
    });
  } catch (error) {
    console.error("Error fetching conversations:", error);
    res.status(500).json({ message: "Internal server error", error });
  }
};

export const fetchMessages = async (req, res) => {
  const { conversationId } = req.params;

  try {
    const messages = await CommunicateModel.find({ chatId: conversationId })
      .populate(
        "senderId",
        "_id name email profileImage phone fName lName mName gender"
      )
      .sort({ createdAt: 1 });

    if (!messages) {
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
