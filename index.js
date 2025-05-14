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
const uri = process.env.MONGODB_URL;
await mongoose
  .connect(uri, {})
  .then(() => {
    console.log("Connected to MongoDB Atlas!");
  })
  .catch((error) => console.error("Error connecting to MongoDB:", error));

app.post("/api/pin", async (req, res) => {
  try {
    const { tableId } = req.body;

    if (!tableId) {
      return res.status(400).json({ error: "tableId is required" });
    }
    const count = await TableData.countDocuments({ tableId });
    if (count >= 100) {
      return res.status(403).json({
        success: false,
        message: `This PIN (tableId: ${tableId}) is already used by 100 users. Please try another.`,
      });
    }
    const data = await TableData.find({ tableId });

    if (!data || data.length === 0) {
      return res.status(404).json({ error: "No data found" });
    }

    res.status(200).json({
      success: true,
      message: "Data fetched successfully",
      data: data,
    });
  } catch (error) {
    console.error("❌ Error fetching data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
app.get("/api/check-all-pins", async (req, res) => {
  try {
    const allPins = await TableData.find(
      {},
      "isAssigned assignedUsers _id tableId column2"
    );

    const updatedPins = allPins.map((pin) => ({
      ...pin._doc, // Convert Mongoose document to plain object
      assignedCount: pin.assignedUsers ? pin.assignedUsers.length : 0,
    }));

    res.status(200).json({ success: true, data: updatedPins });
  } catch (error) {
    console.error("❌ Error fetching all PINs:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
app.post("/api/assign-pin", async (req, res) => {
  try {
    console.log("📥 Incoming Request Data:", req.body);
    let { userId, tableId } = req.body;

    if (!userId || tableId === undefined) {
      console.log("❌ Missing userId or tableId");
      return res.status(400).json({ error: "userId and tableId are required" });
    }

    tableId = Number(tableId); // Ensure tableId is number
    console.log(`📌 Converted tableId: ${tableId} (Type: ${typeof tableId})`);

    let existingPin = await TableData.findOne({ tableId });

    if (!existingPin) {
      console.log("❌ No PIN found for tableId:", tableId);
      return res.status(404).json({ success: false, message: "No PIN found" });
    }

    // ✅ Fetch the user data
    const user = await UserModel.findById(userId);

    if (!user) {
      console.log("❌ User not found with userId:", userId);
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // ✅ Check if the user already has a PIN assigned
    if (user.assignedPin) {
      console.log("⚠️ User already has a PIN assigned:", user.assignedPin);
      return res.status(400).json({
        success: false,
        message: `User already has the PIN: ${user.assignedPin}`,
      });
    }
    user.assignedPin = existingPin.column2.toString();
    await user.save();

    console.log(`📌 User ${userId} assigned new PIN: ${existingPin.column2}`);
    const updateResult = await TableData.updateOne(
      { tableId },
      {
        $addToSet: { assignedUsers: userId },
        $inc: { assignedCount: 1 },
      }
    );

    if (updateResult.modifiedCount === 0) {
      return res
        .status(500)
        .json({ success: false, message: "Database update failed!" });
    }

    // ✅ Fetch the updated pin data
    const updatedPin = await TableData.findOne({ tableId });

    console.log("📌 Updated TableData:", updatedPin);

    return res.status(200).json({
      success: true,
      data: updatedPin,
      assignedCount: updatedPin.assignedCount || 0,
    });
  } catch (error) {
    console.error("❌ Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/api/locations", async (req, res) => {
  try {
    const data = await LocationModel.find(); // Fetch all location data from the database
    if (!data || data.length === 0) {
      return res.status(500).json({ error: "Data could not be loaded." });
    }

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Error fetching all locations." });
  }
});

let stateList = []; // Cached state list in memory

app.get("/api/states", async (req, res) => {
  try {
    // Check if stateList is already populated
    if (stateList.length > 0) {
      console.log("Returning cached data from memory");
      return res.json({
        success: true,
        message: "State List fetched from memory cache",
        states: stateList,
      });
    }

    // Fetch data from DB
    const data = await LocationModel.find();
    if (!data || data.length === 0) {
      return res.status(500).json({ error: "Data could not be loaded." });
    }

    const states = [...new Set(data.map((item) => item.State))];

    // Store in memory
    stateList = states;

    console.log("Memory cache updated");

    res.json({
      success: true,
      message: "State List fetched successfully",
      states,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "An error occurred while fetching states." });
  }
});

app.get("/api/districts/:state", async (req, res) => {
  try {
    const state = req.params.state;
    const data = await LocationModel.find({ State: state }); // Fetch data for the selected state
    if (!data || data.length === 0) {
      return res.status(500).json({ error: "Data could not be loaded." });
    }

    // Fetch districts for the selected state
    const districts = [...new Set(data.map((item) => item.District))];
    res.json({
      success: true,
      message: "district fetch successfully",
      districts,
    });
  } catch (error) {
    res
      .status(500)
      .json({ error: "An error occurred while fetching districts." });
  }
});
app.get("/api/locations/:district", async (req, res) => {
  try {
    const district = req.params.district;

    // Fetch locations where district matches
    const data = await LocationModel.find({ District: district });

    if (!data || data.length === 0) {
      return res
        .status(404)
        .json({ message: `No locations found for district ${district}.` });
    }

    // Extract unique location names
    const locations = [...new Set(data.map((item) => item.Location_Name))];

    res.json({
      success: true,
      message: "Locations fetched successfully",
      locations,
    });
  } catch (error) {
    console.error("Error fetching locations:", error);
    res
      .status(500)
      .json({ error: "An error occurred while fetching locations." });
  }
});

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

app.use("/public", express.static(path.join(__dirname, "public")));

app.use(express.static(path.join(__dirname, "public")));
app.use("/api/products", ProductRouter);
app.use("/api/admin", AdminRouter);
app.use("/api/user", UserRouter);
app.use("/api/otp", SendOtpRouter);
app.use("/api/chat", CommunicateRouter);
app.use("/api/location", LocationRouter);

server.listen(PORT, () => {
  console.log(`Server running on http://:${PORT}`);
});

io.on("error", (error) => {
  console.log("Socket.IO global error:", error);
});
socketInit(io);

export { io };
log("Socket setup completed");
export default app;
