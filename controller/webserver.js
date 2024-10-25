const WebSocket = require("ws");

const wss = new WebSocket.Server({ port: 3000 });

wss.on("connection", (ws) => {
  console.log("Client connected.");

  // Listen for messages from the client
  ws.on("message", (message) => {
    const parsedMessage = JSON.parse(message);

    // Broadcast the message to all connected clients
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(parsedMessage));
      }
    });
  });

  ws.on("close", () => {
    console.log("Client disconnected.");
  });
});
