import express from "express";

const router = express.Router();
import {
  createConversation,
  getAllConversation,
  resetNewMessages,
} from "../controller/conversation.js";
import authenticateUser from "../auth/middle.js";

//import { getUsersWithConversations } from "../controller/chat.js";

router.post("/create", authenticateUser, createConversation);
router.get("/getAll", getAllConversation);

router.post("/resetNewMessages", resetNewMessages);

export default router;
