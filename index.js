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
import ConversationRouter from "./routes/conversation.js";
import AdminRouter from "./routes/admin.js";
import Admin from "./model/admin.js";
import { CommunicateModel } from "./model/chat.js";
import { ConversationModel } from "./model/conversation.js";
import { LocationModel } from "./model/location.js";
import SendOtpRouter from "./routes/sendOtp.js";
import path from "path";
import cors from "cors";
import { upload } from "./auth/image.js";
import LocationRouter from "./routes/location.js";
import { TableData } from "./model/pin.js";
import fs from "fs";
import { UserModel } from "./model/user.js";
import { setupSocket } from "./socket.js";
dotenv.config();

const app = express();
const PORT = process.env.PORT;
const server = http.createServer(app);
// Create Socket.IO server
// export const io = new Server(server, {
//   cors: {
//     origin: "*",
//     methods: ["GET", "POST"],
//   },
// });
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const __filename = new URL(import.meta.url).pathname;
const __dirname = path.dirname(__filename);
const filePath = path.join(__dirname, "pin/pin.json");
const fileName = path.join(__dirname, "condition/ai_future.json");
const uri = process.env.MONGODB_URL;
mongoose
  .connect(uri, {})
  .then(() => {
    console.log("Connected to MongoDB Atlas!");
    importLocationData();
  })
  .catch((error) => console.error("Error connecting to MongoDB:", error));
console.log("++hgdsjdbsj++");
async function importPin() {
  try {
    const data = fs.readFileSync(filePath, "utf8");

    let records = JSON.parse(data); // JSON को Object में बदलें
    records = records.map((item) => ({
      tableId: item["Table 1"], // "Table 1" को "tableId" में बदलें
      column2: item.Column2,
      isAssigned: false, // ✅ Default value
      assignedUsers: [], // ✅ Initially no assigned users
    }));

    await TableData.deleteMany({});

    // ✅ MongoDB में Insert करें
    await TableData.insertMany(records);
    console.log("✅ Data inserted successfully!");
  } catch (error) {
    console.error("Error reading or inserting data:", error);
  }
}

importPin();
console.log("jsonFile");
// export async function importJson() {
//   try {
//   const data = fs.readFileSync(fileName, "utf8");
//   console.log("Raw JSON Data:", data);
// } catch (error) {
//   console.error("❌ File read error:", error);
// }
// }

// importJson();
//const fileName = "./condition/ai_future.json"; // JSON फ़ाइल का path

// async function importJson() {
//   try {
//     const data = fs.readFileSync(fileName, "utf8");
//     console.log("Raw JSON Data:", data);

//     let records = JSON.parse(data);
//     console.log("Parsed JSON:", records);

//     if (!Array.isArray(records)) {
//       records = [records];
//     }

//     // Default values set करो
//     records = records.map((record) => ({
//       title: record.title || "Untitled",
//       author: record.author || "Unknown",
//       date: record.date || new Date().toISOString(),
//       content: record.content || "No content available.",
//     }));

//     // ✅ insertMany() से डुप्लिकेट को ignore करें
//     await ConversationModel.insertMany(records, { ordered: false }) // ordered: false → बाक़ी के inserts नहीं रुकेंगे
//       .then(() => console.log("✅ Data inserted successfully!"))
//       .catch((error) => {
//         if (error.code === 11000) {
//           console.log("⚠️ Some duplicate records were ignored.");
//         } else {
//           throw error;
//         }
//       });

//   } catch (error) {
//     console.error("❌ Error reading or inserting data:", error);
//   }
// }
// importJson();

app.post("/api/pin", async (req, res) => {
  try {
    const { tableId } = req.body; // ✅ क्लाइंट से tableId ले रहे हैं

    if (!tableId) {
      return res.status(400).json({ error: "tableId is required" });
    }

    // ✅ MongoDB से `tableId` के यूजर्स गिनें
    const count = await TableData.countDocuments({ tableId });

    // ✅ अगर यूजर लिमिट 100 से ज्यादा हो गई, तो एक्सेस रोकें
    if (count >= 100) {
      return res.status(403).json({
        success: false,
        message: `This PIN (tableId: ${tableId}) is already used by 100 users. Please try another.`,
      });
    }

    // ✅ यदि limit 100 से कम है, तो डेटा भेजें
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

    // 🔹 Add assignedCount to each PIN
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

    // ✅ Fetch the existing PIN data from the table
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

const importLocationData = async () => {
  try {
    const existingLocations = await LocationModel.countDocuments();

    if (existingLocations > 0) {
      console.log("Data already exists in the database. Skipping insertion.");
      return;
    }
    const jsonData = JSON.parse(fs.readFileSync("./data/data.json", "utf8"));

    const formattedData = jsonData.slice(0, 20).map((item) => ({
      countryCode: item.Country_Code || "default-country-code",
      postalCode: item.Postal_Code || "000000",
      stateCode: item.State_Code || "default-state-code",
      state: item.State,
      district: item.District,
      locationName: item.Location_Name,
      subDistrictCode: item.Sub_district_Code || "default-subdistrict-code",
      subDistrictName: item.Sub_district_Name || "default-subdistrict-name",
    }));
    await LocationModel.insertMany(formattedData);
    console.log("Location data imported successfully!");
  } catch (error) {
    console.error("Error importing location data:", error.message);
  }
};

importLocationData();

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

app.get("/api/states", async (req, res) => {
  try {
    const data = await LocationModel.find();
    console.log(data);
    if (!data || data.length === 0) {
      return res.status(500).json({ error: "Data could not be loaded." });
    }
    const states = [...new Set(data.map((item) => item.state))];
    res.json(states);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "An error occurred while fetching states." });
  }
});

app.get("/api/districts/:state", async (req, res) => {
  try {
    const state = req.params.state;
    const data = await LocationModel.find({ state }); // Fetch data for the selected state
    if (!data || data.length === 0) {
      return res.status(500).json({ error: "Data could not be loaded." });
    }

    // Fetch districts for the selected state
    const districts = [...new Set(data.map((item) => item.district))];
    res.json(districts);
  } catch (error) {
    res
      .status(500)
      .json({ error: "An error occurred while fetching districts." });
  }
});

app.get("/api/location/:district", async (req, res) => {
  try {
    const district = req.params.district;
    const data = await LocationModel.find({ district }); // Fetch data for the selected district
    if (!data || data.length === 0) {
      return res.status(500).json({ error: "Data could not be loaded." });
    }

    // Fetch all location names for the selected district
    const locations = [...new Set(data.map((item) => item.locationName))];

    if (locations.length > 0) {
      res.json(locations);
    } else {
      res.status(404).json({
        message: `No locations found for district ${district}.`,
      });
    }
  } catch (error) {
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

      console.log("Admin user updated successfully!", updatedAdmin);
    }
  } catch (error) {
    console.error("Error creating or updating admin user:", error);
  }
}

console.log("+++++++++++++++");
console.log("fileName:---------", __filename);

// app.use(express.static("public"));

app.use("/public", express.static(path.join(__dirname, "public")));
app.use("/api/products", ProductRouter);
app.use("/api/admin", AdminRouter);
app.use("/api/user", UserRouter);
app.use("/api/otp", SendOtpRouter);
app.use("/api/chat", CommunicateRouter);
app.use("/api/conversation", ConversationRouter);
app.use("/api/location", LocationRouter);

// app.use(express.static(path.join(__dirname, "public")));

app.post("/api/upload/pdf", upload.single("pdfResume"), (req, res) => {
  if (!req.file) {
    return res
      .status(400)
      .json({ success: false, message: "No file uploaded." });
  }

  const { userId } = req.body;
  if (!userId) {
    return res
      .status(400)
      .json({ success: false, message: "User ID is required." });
  }

  const filePath = `/uploads/pdfs/${req.file.filename}`;
  console.log("Uploaded PDF Path:", filePath);

  res.status(200).json({
    success: true,
    message: "File uploaded successfully",
    filePath: `http://your-server.com${filePath}`, // Return full URL
    userId: userId,
  });
});
// Serve PDFs
app.get("/uploads/pdfs/:filename", (req, res) => {
  const { filename } = req.params;
  const filePath = path.join(__dirname, "uploads", "pdfs", filename);

  if (fs.existsSync(filePath)) {
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename="${filename}"`);
    res.sendFile(filePath);
  } else {
    res.status(404).json({ success: false, message: "File not found" });
  }
});

app.post("/api/request-pdf-access", (req, res) => {
  const { uploaderId, viewerId, productId } = req.body;

  if (!uploaderId || !viewerId || !productId) {
    return res
      .status(400)
      .json({ success: false, message: "सभी फ़ील्ड्स अनिवार्य हैं।" });
  }

  // Notify uploader via socket
  if (userSockets[uploaderId]) {
    io.to(userSockets[uploaderId]).emit("pdf_access_request", {
      viewerId,
      productId,
      message: `User ${viewerId} wants access to your PDF.`,
    });
  }

  // Assume database call here to store request
  console.log(
    `Access request from ${viewerId} to ${uploaderId} for product ${productId}`
  );

  res
    .status(200)
    .json({ success: true, message: "Request sent successfully!" });
});

app.post("/api/respond-pdf-access", (req, res) => {
  const { viewerId, uploaderId, approved, pdfUrl } = req.body;

  if (!viewerId || !uploaderId || pdfUrl === undefined) {
    return res
      .status(400)
      .json({ success: false, message: "Missing required fields." });
  }

  if (approved) {
    if (userSockets[viewerId]) {
      io.to(userSockets[viewerId]).emit("pdf_access_granted", { pdfUrl });
    }
  } else {
    if (userSockets[viewerId]) {
      io.to(userSockets[viewerId]).emit("pdf_access_denied");
    }
  }

  res
    .status(200)
    .json({ success: true, message: "Response sent successfully!" });
});

app.post("/api/upload", upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).send("No file uploaded.");
  }
  const imageName = `image-${Date.now()}-${Math.random()
    .toString(36)
    .substr(2, 9)}.png`;
  const imageUrl = `/public/images/${imageName}`;
  console.log("File uploaded:", req.file.filename);
  console.log("Generated image URL:", imageUrl);
  fs.renameSync(
    path.join(__dirname, "public", "images", req.file.filename),
    path.join(__dirname, "public", "images", imageName)
  );
  res.status(200).json({
    url: imageUrl,
  });
});

app.post("/api/conversation/resetNewMessages", async (req, res) => {
  const { conversationId } = req.body;

  try {
    await ConversationModel.findOneAndUpdate(
      { conversationId },
      { newMessages: 0 }
    );
    res.status(200).json({ message: "New messages reset successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const io = setupSocket(server);

server.listen(PORT, () => {
  console.log(`Server running on http://:${PORT}`);
});

export default app;
