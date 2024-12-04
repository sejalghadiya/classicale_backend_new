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

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Create HTTP server
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
mongoose
  .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/classical", {})
  .then(async () => {
    console.log("Database connection successful!");
    await createAdminIfNotExists(); // Create default admin if not already created
  })
  .catch((err) => {
    console.error("Error connecting to the database:", err);
  });

// Function to create an admin if not exists
async function createAdminIfNotExists() {
  try {
    const adminExists = await Admin.findOne({ role: "admin" });

    if (!adminExists) {
      const hashedPassword = await bcrypt.hash("admin123", 10); // Default password
      const admin = new Admin({
        username: "admin",
        email: "admin@example.com",
        password: hashedPassword,
        role: "admin", // Ensure the role is 'admin'
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

// Register routes
app.use("/api/admin", AdminRouter); // Register admin routes
app.use("/api/user", UserRouter);
app.use("/api/products", ProductRouter);
app.use("/api/chat", CommunicateRouter);
app.use("/api/conversation", ConversationRouter);

// Socket.IO connection handling
io.on("connection", (socket) => {
  console.log("User connected-----:", socket.id);

  // Join a conversation room
  socket.on("joinRoom", (conversationId) => {
    socket.join(conversationId);
    console.log("Conversation:-------", conversationId);
  });

  // Listen for sendMessage event
});

// Start the server
server.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});

export default app;
