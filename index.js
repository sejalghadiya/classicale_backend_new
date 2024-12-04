

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

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Join room based on conversationId
  socket.on("joinRoom", (conversationId) => {
    socket.join(conversationId);
    console.log(`User joined conversation: ${conversationId}`);
  });

  // Listen for message send event
  socket.on("sendMessage", async (data) => {
    const { conversationId, senderId, senderName, receiverId, text, image } =
      data;

    try {
      const message = {
        id: new mongoose.Types.ObjectId(),
        senderId,
        senderName,
        receiverId,
        text,
        image,
        createdTime: new Date(),
      };

      // Update the Communicate document with the new message
      await CommunicateModel.findOneAndUpdate(
        { conversationId },
        { $push: { messages: message } },
        { new: true, upsert: true } // Create if doesn't exist
      );

      // Emit the new message to all clients in the conversation room
      io.to(conversationId).emit("receiveMessage", message);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});



server.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});

export default app;

