console.log("Hello world!");

// server.js

import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import http from "http";
import { Server } from "socket.io";

// Import routes and models
import UserRouter from "./routes/user.js";
import ProductRouter from "./routes/product.js";
import CommunicateRouter from "./routes/chat.js";
import ConversationRouter from "./routes/conversation.js";
import AdminRouter from "./routes/admin.js";
import Admin from "./model/admin.js"; // Import the admin model
import { CommunicateModel } from "./model/chat.js";
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const server = http.createServer(app);
// Create Socket.IO server
export const io = new Server(server, {
  cors: {
    origin: "*", // Allow all origins (can restrict in production)
    methods: ["GET", "POST"],
  },
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB connection
const uri =
  process.env.MONGODB_URI ||
  "mongodb+srv://ttsnikol89:QONe2IT1Nel7X5HD@cluster0.rao1q.mongodb.net/classical?retryWrites=true&w=majority";

mongoose
  .connect(uri, {})
  .then(() => console.log("Connected to MongoDB Atlas!"))
  .catch((error) => console.error("Error connecting to MongoDB:", error));

createAdminIfNotExists();

async function createAdminIfNotExists() {
  try {
    const adminExists = await Admin.findOne({ role: "admin" });

    if (!adminExists) {
      const hashedPassword = await bcrypt.hash("admin123", 10);
      const admin = new Admin({
        username: "admin",
        email: "admin@example.com",
        password: hashedPassword,
        role: "admin",
      });

      await admin.save();
      console.log("Admin user created successfully!");
    } else {
      console.log("Admin user already exists.");
    }
  } catch (error) {
    console.error("Error creating admin user:", error);
  }
}

app.use("/api/products", ProductRouter);

app.use("/api/admin", AdminRouter);
app.use("/api/user", UserRouter);

app.use("/api/chat", CommunicateRouter);
app.use("/api/conversation", ConversationRouter);

// Store active user socket connections
const userSocketMap = new Map();

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Add user to userSocketMap when they connect
  socket.on("joinRoom", (conversationId) => {
    socket.join(conversationId);
    console.log(`User joined conversation: ${conversationId}`);

    const userId = socket.handshake.query.userId; // Ensure userId is passed in the connection
    userSocketMap.set(userId, socket.id); // Add user to the map
    console.log(`User ${userId} added to the socket map`);
  });

socket.on("sendMessage", async (data) => {
  const { conversationId, senderId, senderName, receiverId, text, image } =
    data;

  try {
    // Validate the incoming data
    if (!conversationId || !senderId || !receiverId) {
      throw new Error(
        "Missing required fields (conversationId, senderId, receiverId)."
      );
    }

    // Create a message object
    const messageId = new mongoose.Types.ObjectId();
    const message = {
      id: messageId,
      senderId,
      senderName,
      receiverId,
      text,
      image, // Ensure this contains the image URL or metadata
      createdTime: new Date(),
      deletedBy: [],
      isRead: false,
    };

    // Log message details
    console.log("New message received:");
    console.log("Text:", text || "No text message");
    if (image) {
      console.log("Image URL:", image);
      console.log("Additional image metadata can be added here.");
    } else {
      console.log("No image included in this message.");
    }

    // Save message in the database
    const conversation = await CommunicateModel.findOneAndUpdate(
      { conversationId },
      { $push: { messages: message } },
      { new: true, upsert: true }
    );

    // Emit message back to sender and conversation participants
    socket.emit("messageSent", message);
    io.to(conversationId).emit("receiveMessage", message);

    // Check if the receiver is online
    const receiverSocketId = userSocketMap.get(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newNotification", {
        senderId,
        senderName,
        message: text || image,
        createdTime: message.createdTime,
        roomId: conversationId,
      });
      console.log("Notification sent to receiver:", receiverId);
    } else {
      // Notify sender that the receiver is offline
      io.to(userSocketMap.get(senderId)).emit("receiverOffline", {
        receiverId,
        conversationId,
      });
      console.log(
        "Receiver is offline. Push notification logic can be added here."
      );
    }
  } catch (error) {
    console.error("Error saving message:", error.message);
    socket.emit("messageError", { error: error.message });
  }
});


  // Handle disconnection
  socket.on("disconnect", () => {
    // Find the user that disconnected
    const userId = [...userSocketMap.entries()]
      .find(([key, value]) => value === socket.id)?.[0];

    if (userId) {
      // Remove the user from the map when they disconnect
      userSocketMap.delete(userId);
      console.log(`User ${userId} disconnected and removed from the socket map.`);
    }
  });
});



server.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});

export default app;
