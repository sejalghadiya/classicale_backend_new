console.log("Hello world!");

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
import SendOtpRouter from "./routes/sendOtp.js";
import path from "path";
dotenv.config();
app.use(cors());

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


const __filename = new URL(import.meta.url).pathname;
const __dirname = path.dirname(__filename);
console.log("+++++++++++++++");
console.log("fileName:---------", __filename);
//app.use("/images", express.static(path.join("public", "images")));


app.use(express.static(path.join(__dirname, 'public')));

app.use("/api/products", ProductRouter);

app.use("/api/admin", AdminRouter);
app.use("/api/user", UserRouter);
app.use("/api/otp", SendOtpRouter);
app.use("/api/chat", CommunicateRouter);
app.use("/api/conversation", ConversationRouter);

const userSocketMap = new Map(); // Map to store socketId by userId
const userFCMTokenMap = new Map(); // Map to store FCM token by userId

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("sendMessage", async (data) => {
    const { conversationId, senderId, senderName, receiverId, text, image } =
      data;

    try {
      // Validate the required fields
      if (!conversationId || !senderId || !receiverId) {
        throw new Error(
          "Missing required fields: conversationId, senderId, receiverId."
        );
      }

      // Create a new message object
      const messageId = new mongoose.Types.ObjectId();
      const message = {
        id: messageId,
        senderId,
        senderName,
        receiverId,
        text,
        image,
        createdTime: new Date(),
        isRead: false,
      };

      // Save message to the database
      await CommunicateModel.findOneAndUpdate(
        { conversationId },
        { $push: { messages: message } },
        { new: true, upsert: true }
      );

      // Check if the receiver is online
      const receiverSocketId = userSocketMap.get(receiverId);

      if (receiverSocketId) {
        // Receiver is online - send the message in real-time
        io.to(receiverSocketId).emit("receiveMessage", message);
        socket.emit("messageSent", message); // Notify the sender
        console.log("Message sent to receiver:", receiverId);
      } else {
        // Receiver is offline
        socket.emit("receiverOffline", {
          receiverId,
          conversationId,
        });

        // You can also add push notification logic here (Firebase Cloud Messaging)
        console.log("Receiver is offline. Sending push notification.");
      }
    } catch (error) {
      console.error("Error sending message:", error.message);
      socket.emit("messageError", { error: error.message });
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
    const userId = [...userSocketMap.entries()].find(
      ([key, value]) => value === socket.id
    )?.[0];
    if (userId) {
      userSocketMap.delete(userId);
      console.log(`User ${userId} removed from socket map.`);
    }
  });
});
// Your existing code

server.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});

export default app;
