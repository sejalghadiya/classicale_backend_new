import { Server } from "socket.io";
import mongoose from "mongoose";
import { CommunicateModel } from "./model/chat.js";

const userSocketMap = new Map();

 export function setupSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    socket.on("joinRoom", (data) => {
      const { userId } = data;
      if (userId) {
        userSocketMap.set(userId, socket.id);
        console.log(`User ${userId} connected with Socket ID ${socket.id}`);
      }
    });

    socket.on("sendMessage", async (data) => {
      const { conversationId, senderId, receiverId, text, image, pdf } = data;
      console.log("Received sendMessage event:", data);

      if (!senderId || !mongoose.Types.ObjectId.isValid(senderId)) {
        socket.emit("messageError", { error: "Invalid senderId" });
        return;
      }

      if (!receiverId || !mongoose.Types.ObjectId.isValid(receiverId)) {
        socket.emit("messageError", { error: "Invalid receiverId" });
        return;
      }

      const message = {
        senderId: new mongoose.Types.ObjectId(senderId),
        receiverId: new mongoose.Types.ObjectId(receiverId),
        text,
        image,
        pdf,
        status: "pending",
        createdTime: new Date(),
        id: new mongoose.Types.ObjectId(),
      };

      try {
        console.log("Saving message to database...");

        const result = await CommunicateModel.findOneAndUpdate(
          { conversationId },
          { $push: { messages: message } },
          { new: true, upsert: true }
        );

        console.log("Message saved successfully:", result);

        const receiverSocketId = userSocketMap.get(receiverId);
        if (receiverSocketId) {
          io.to(receiverSocketId).emit("receiveMessage", message);
        } else {
          socket.emit("receiverOffline", { receiverId, conversationId });
        }
      } catch (error) {
        console.error("Message sending error:", error.message);
        socket.emit("messageError", { error: error.message });
      }
    });

    socket.on("messageSeen", async (data) => {
      const { messageId } = data;
      console.log("Marking message as seen:", messageId);

      const result = await CommunicateModel.updateOne(
        { "messages.id": messageId },
        { $set: { "messages.$.status": "seen" } }
      );

      if (result.modifiedCount > 0) {
        socket.emit("messageSeen", { messageId });
      }
    });

    socket.on("receiverOnline", async (data) => {
      const { receiverId } = data;
      const receiverSocketId = userSocketMap.get(receiverId);
      console.log(
        `Receiver ${receiverId} is back online, sending pending messages.`
      );

      const messages = await CommunicateModel.find({
        receiverId,
        status: "pending",
      });

      messages.forEach((msg) => {
        io.to(receiverSocketId).emit("receiveMessage", msg);
        CommunicateModel.updateOne(
          { "messages.id": msg.id },
          { $set: { "messages.$.status": "delivered" } }
        );
      });
    });

    socket.on("disconnect", () => {
      for (const [userId, socketId] of userSocketMap.entries()) {
        if (socketId === socket.id) {
          userSocketMap.delete(userId);
          console.log(`User ${userId} disconnected`);
          break;
        }
      }
    });
  });

  return io;
}


