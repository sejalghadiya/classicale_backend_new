import mongoose from "mongoose";
import { UserModel } from "./model/user.js";
import { CommunicateModel } from "./model/chat.js";
import { ConversationModel } from "./model/conversation.js";

const onlineUsers = new Map(); // userId → socket.id

const socketInit = (io) => {
    const emitOnlineUsers = () => {
        const onlineUserIds = Array.from(onlineUsers.keys());
        io.emit("onlineUsers", onlineUserIds);
    };

    io.on("connection", async (socket) => {
        const userId = socket.handshake.query.userId;
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            socket.emit("error", { message: "Invalid user ID format" });
            return;
        }

        const user = await UserModel.findById(userId);
        if (!user) {
            socket.emit("error", { message: "User not found" });
            return;
        }

        console.log(`✅ User connected: ${userId} → socket ${socket.id}`);

        // Remove stale connections
        for (const [id, sId] of onlineUsers.entries()) {
            if (sId === socket.id && id !== userId) {
                onlineUsers.delete(id);
            }
        }

        // Register user
        onlineUsers.set(userId, socket.id);
        emitOnlineUsers();

        // 🔁 Handle new message
        socket.on("sendMessage", async (data) => {
            const {
                senderId,
                receiverId,
                conversationId,
                productId,
                productTypeId,
                content,
                type = "text",
                status = "sent",
                metaData = {},
            } = data;

            try {
                // Find conversation or create new one
                let conversation = conversationId
                    ? await ConversationModel.findById(conversationId)
                    : await ConversationModel.findOneAndUpdate(
                        {
                            participants: { $all: [senderId, receiverId] },
                            product: productId,
                        },
                        {},
                        {
                            new: true,
                            upsert: true,
                            setDefaultsOnInsert: true,
                        }
                    );

                if (!conversation) {
                    socket.emit("error", {
                        message: "Conversation not found or created",
                    });
                    return;
                }

                const newMessage = await CommunicateModel.create({
                    chatId: conversation._id,
                    senderId,
                    productId,
                    type,
                    content,
                    metaData,
                    status,
                });

                await newMessage.populate("senderId");

                // Send message to recipient
                const recipientSocketId = onlineUsers.get(receiverId.toString());
                if (recipientSocketId) {
                    io.to(recipientSocketId).emit("newMessage", newMessage);
                    io.to(recipientSocketId).emit("updateConversation", {
                        conversationId: conversation._id,
                        message: newMessage,
                        unreadCount: 1,
                    });
                }

                // Also emit to sender (to update their chat)
                const senderSocketId = onlineUsers.get(senderId.toString());
                if (senderSocketId) {
                    io.to(senderSocketId).emit("newMessage", newMessage);
                    io.to(senderSocketId).emit("updateConversation", {
                        conversationId: conversation._id,
                        message: newMessage,
                        unreadCount: 0,
                    });
                }
            } catch (err) {
                console.error("Error sending message:", err);
                socket.emit("error", { message: err.message });
            }
        });

        // 📩 Read message
        socket.on("messageRead", async ({ messageId }) => {
            try {
                await CommunicateModel.findByIdAndUpdate(messageId, { status: "read" });
                socket.emit("messageReadAck", { messageId });
            } catch (err) {
                console.log("Error marking message read:", err);
            }
        });

        // 🧑‍💻 Typing (optional)
        socket.on("typing", ({ toUserId, conversationId }) => {
            const recipientSocketId = onlineUsers.get(toUserId);
            if (recipientSocketId) {
                io.to(recipientSocketId).emit("typing", {
                    from: userId,
                    conversationId,
                });
            }
        });

        // ❌ Disconnect
        socket.on("disconnect", () => {
            for (const [id, sId] of onlineUsers.entries()) {
                if (sId === socket.id) {
                    onlineUsers.delete(id);
                    console.log(`❌ User ${id} disconnected`);
                    break;
                }
            }
            emitOnlineUsers();
        });

        // Error
        socket.on("error", (err) => {
            console.log("Socket error:", err);
        });
    });

    io.on("error", (error) => {
        console.log("Socket.IO global error:", error);
    });
};

export default socketInit;
export { onlineUsers };
