import express from "express";
import { deleteMessage, forwardMessage, getMessages, getUnreadCounts} from "../controller/chat.js";
import authenticateUser from "../auth/middle.js";
import multer from "multer";
import { io } from "socket.io-client";

const router = express.Router();

// Set up multer for handling file uploads
const memoryStorage = multer.memoryStorage();
const upload = multer({ storage: memoryStorage });

// Define your routes correctly
//router.post("/conversation", upload.single("image"), sendMessage);

router.get("/getMessage", getMessages);

router.delete("/deleteMessage", authenticateUser, deleteMessage);

router.post("/forWordMessage", forwardMessage);

router.get("/getUnreadMessage", getUnreadCounts);

export default router;
