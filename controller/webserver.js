import { io } from "socket.io-client";

const socket = io("http://localhost:3000");

socket.on("connect", () => {
  console.log("Connected to server:", socket.id);

  // Join the user room by ID for receiving messages
  const userId = "someUserId"; // Replace with actual user ID
  socket.emit("joinRoom", userId);
});

socket.on("messageSent", (message) => {
  console.log("Message sent:", message);
});

socket.on("messageReceived", (message) => {
  console.log("New message received:", message);
});

socket.on("notification", (notification) => {
  console.log("Notification:", notification);
});
