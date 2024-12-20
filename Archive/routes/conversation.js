import express from "express";

const router = express.Router();
import {
  createConversation,
  getAllConversation,
} from "../controller/conversation.js";
import authenticateUser from "../auth/middle.js";

//import { getUsersWithConversations } from "../controller/chat.js";

router.post("/create", authenticateUser, createConversation);
router.get("/getAll", getAllConversation);

export default router;
