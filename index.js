console.log("Hello world!");
import { ConditionModel } from "./model/conditon.js";
import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import http from "http";
import { Server } from "socket.io";
import UserRouter from "./routes/user.js";
import ProductRouter from "./routes/product.js";
import CommunicateRouter from "./routes/chat.js";
import AdminRouter from "./routes/admin.js";
import Admin from "./model/admin.js";
import { LocationModel } from "./model/location.js";
import SendOtpRouter from "./routes/sendOtp.js";
import path from "path";
import cors from "cors";
import { upload } from "./auth/image.js";
import LocationRouter from "./routes/location.js";
import fs from "fs";
import { UserModel } from "./model/user.js";
import { log } from "console";
import socketInit from "./socket.js";
dotenv.config();

const app = express();
app.use(express.json({ limit: "10mb" })); // or even higher like '50mb'
app.use(express.urlencoded({ limit: "10mb", extended: true }));

app.use(cors());
const PORT = process.env.PORT || 3000;
const server = http.createServer(app);
// Create Socket.IO server
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  },
});
const __filename = new URL(import.meta.url).pathname;
const __dirname = path.dirname(__filename);
const uploadsRoot = "/var/www/classical_uploads";
const uri = process.env.MONGODB_URL;
await mongoose
  .connect(uri, {})
  .then(() => {
    console.log("Connected to MongoDB Atlas!");
  })
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
      const hashedPassword = await bcrypt.hash("admin123", 10);
      const updatedAdmin = await Admin.findOneAndUpdate(
        { role: "admin" },
        {
          username: "admin",
          email: "admin@example.com",
          password: hashedPassword,
        },
        { new: true }
      );

      // console.log("Admin user updated successfully!", updatedAdmin);
    }
  } catch (error) {
    console.error("Error creating or updating admin user:", error);
  }
}

app.use("/public", express.static(path.join(uploadsRoot, "public")));

app.use(express.static(path.join(uploadsRoot, "public")));
app.use("/api/products", ProductRouter);
app.use("/api/admin", AdminRouter);
app.use("/api/user", UserRouter);
app.use("/api/otp", SendOtpRouter);
app.use("/api/chat", CommunicateRouter);
app.use("/api/location", LocationRouter);

server.listen(PORT, "127.0.0.1", () => {
  console.log(`Server running on port ${PORT}`);
});

io.on("error", (error) => {
  console.log("Socket.IO global error:", error);
});
socketInit(io);

export { io };
log("Socket setup completed");
export default app;
