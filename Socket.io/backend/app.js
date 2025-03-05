const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"],
    },
});

// Handle client connection
io.on("connection", (socket) => {
    console.log(`User Connected: ${socket.id}`);

    // Listen for room join
    socket.on("join", (data) => {
        socket.join(data.room);
        console.log(`User ${socket.id} joined room ${data.room}`);
        socket.emit("join", { userId: socket.id, room: data.room }); // Confirm join
    });

    // Listen for messages
    socket.on("message", (data) => {
        const messageData = {
            userId: socket.id,
            text: data.text,
            room: data.room,
        };

        // Emit message to the room, including the sender
        io.to(data.room).emit("message", messageData);
    });

    // Handle disconnect
    socket.on("disconnect", () => {
        console.log(`User Disconnected: ${socket.id}`);
    });
});

// Start server
server.listen(3000, () => {
    console.log("Server running on port 3000");
});
