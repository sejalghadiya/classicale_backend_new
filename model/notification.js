import mongoose from "mongoose";

// Define the Notification schema
const NotificationSchema = new mongoose.Schema({
  receiverId: { type: String, required: true },
  message: { type: Object, required: true }, // Assuming a message object
  createdAt: { type: Date, default: Date.now },
  status: { type: String, default: "unread" }, // unread or read
});

// Create and export the Notification model
export const NotificationModel = mongoose.model(
  "notification",
  NotificationSchema
);
