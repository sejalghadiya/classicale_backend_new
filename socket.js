import mongoose from "mongoose";
import { UserModel } from "./model/user.js";
import verifyuser, {
  addUserToSocket,
  removeUserFromSocket,
} from "./controller/socketController.js";
import { updateMessageStatus } from "./controller/chat.js";

const onlineUsers = new Map(); // userId → socket.id
const joinConversation = new Map(); // conversationId → socket.id

const socketInit = (io) => {
  io.on("connection", async (socket) => {
    const userId = socket.handshake.query.userId;
    // verify user
    await verifyuser(userId, socket);
    // Check if userId is already connected
    removeUserFromSocket(userId);
    // Add user to onlineUsers map
    addUserToSocket(userId, socket.id);
    // Listen for user registration
    socket.on("joinRoom", async (conversationId) => {
      try {
        // Check if userId is valid
        if (!conversationId) {
          socket.emit("error", {
            message: "Invalid userId",
          });
          return;
        }
        joinConversation.set(conversationId, socket.id);
        console.log("Registering user:", userId);
        socket.emit("joinRoomSuccess", {
          message: "User successfully Joined Room",
        });
      } catch (error) {
        console.error("Error in register event:", error);
        socket.emit("error", {
          message: "Failed to register user",
          details: error.message,
        });
      }
    });

    socket.on("exitRoom", async (conversationId) => {
      try {
        // Check if userId is valid
        if (!conversationId) {
          socket.emit("error", {
            message: "Invalid conversation Id",
          });
          return;
        }

        joinConversation.delete(conversationId);
        console.log("Unregistering from room:", conversationId);
        socket.emit("exitRoomSuccess", {
          message: "User successfully exited from Room",
        });
      } catch (error) {
        console.error("Error in exitRoom event:", error);
        socket.emit("error", {
          message: "Failed to exit room",
          details: error.message,
        });
      }
    });

    socket.on("messageDelivered", async (data) => {
      console.log("Message delivered event:", data._id);
      await updateMessageStatus(data._id);
    });

    socket.on("disconnect", () => {
      // Remove disconnected user from onlineUsers list
      for (const [id, sId] of onlineUsers.entries()) {
        if (sId === socket.id) {
          onlineUsers.delete(id);
          console.log(`User ${id} disconnected`);
          break;
        }
      }
    });
    socket.on("error", (error) => {
      console.log(`Socket error on ${socket.id}:`, error);
    });
    
  });
};

export default socketInit;
export { onlineUsers };
