import { NotificationModel } from "../model/notification.js";

// Save an offline notification
export const saveOfflineNotification = async (receiverId, message) => {
  try {
    await NotificationModel.create({
      receiverId,
      message,
      createdAt: new Date(),
      status: "unread",
    });
    console.log("Notification saved successfully!");
  } catch (error) {
    console.error("Error saving notification:", error);
  }
};

// Fetch unread notifications
export const getUnreadNotifications = async (receiverId) => {
  try {
    const notifications = await NotificationModel.find({
      receiverId,
      status: "unread",
    });
    return notifications;
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return [];
  }
};

// Fetch unread notifications
export const getNotification = async (receiverId) => {
  try {
    const notifications = await NotificationModel.find({
      receiverId,
      status: "unread",
    });
    return notifications;
  } catch (error) {
    console.error("Error fetching notifications:", error);
    throw error;
  }
};
