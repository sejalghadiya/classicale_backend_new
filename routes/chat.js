import express from "express";
import { deleteMessage, getMessages, getUnreadCounts, sendMessage} from "../controller/chat.js";
import authenticateUser from "../auth/middle.js";
import multer from "multer";


const router = express.Router();

const storage = multer.memoryStorage();

const upload = multer({ storage });

export const uploadMiddleware = upload.fields([
  { name: "image", maxCount: 1 }, // Profile image
  { name: "aadhaarFrontImage", maxCount: 1 },
  { name: "aadhaarBackImage", maxCount: 1 }, // Aadhaar/proof image
]);
router.post("/conversation", uploadMiddleware, sendMessage);


router.get("/getMessage", getMessages);

router.delete("/deleteMessage", authenticateUser, deleteMessage);

router.get("/getUnreadMessage", getUnreadCounts);

export default router;
