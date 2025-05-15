import express from "express";
import {
  createConversation,
  fetchAllConversations,
  fetchConversationId,
  fetchMessages,
  sendMessage,
  updateAllMessagesStatus,
} from "../controller/chat.js";
import authenticateUser from "../auth/middle.js";

const router = express.Router();

router.post("/fetch-exsisting-conversationId", fetchConversationId);
router.post("/send-message", sendMessage);
router.get("/get-all-messages/:conversationId", fetchMessages);
router.get("/get-all-conversations/:userId", fetchAllConversations);
router.put("/update-message-status", updateAllMessagesStatus);

export default router;
