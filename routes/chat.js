import express from "express";
import { deleteMessage, getMessages, sendMessage } from "../controller/chat.js";
import authenticateUser from "../auth/middle.js";
import multer from "multer";

const router = express.Router();

// Set up multer for handling file uploads
const memoryStorage = multer.memoryStorage();
const upload = multer({ storage: memoryStorage });

// Define your routes correctly
router.post("/conversation", upload.single("image"), sendMessage);

router.get("/getMessage", getMessages);

router.delete("/deleteMessage", authenticateUser, deleteMessage);

export default router;
