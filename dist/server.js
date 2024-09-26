// server.ts
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { PrismaClient } from "@prisma/client";
import cron from "node-cron";
// Initialize Express app, HTTP server, Socket.io, and Prisma client
const app = express();
const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000", // Update this to your frontend URL
        methods: ["GET", "POST"],
    },
});
const prisma = new PrismaClient();
// Middleware to parse JSON
app.use(express.json());
// Handle socket connections
io.on("connection", (socket) => {
    console.log("New client connected:", socket.id);
    // Listen for incoming messages
    socket.on("sendMessage", async ({ content, senderId, receiverId, fileUrl, fileType }) => {
        // Emit the message to the receiver
        socket.to(receiverId).emit("receiveMessage", {
            content,
            senderId,
            receiverId,
            fileUrl,
            fileType,
        });
        // Save the message in the database
        try {
            const message = await prisma.message.create({
                data: {
                    content,
                    senderId,
                    receiverId,
                    fileUrl,
                    fileType,
                    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // Set expiry to 24 hours
                },
            });
            console.log("Message saved:", message);
        }
        catch (error) {
            console.error("Error saving message to database:", error);
        }
    });
    socket.on("disconnect", () => {
        console.log("Client disconnected:", socket.id);
    });
});
// Schedule a task to run every hour to delete expired messages
cron.schedule("0 * * * *", async () => {
    try {
        const deletedMessages = await prisma.message.deleteMany({
            where: {
                expiresAt: {
                    lt: new Date(),
                },
            },
        });
        console.log(`Expired messages deleted: ${deletedMessages.count}`);
    }
    catch (error) {
        console.error("Error deleting expired messages:", error);
    }
});
// Start the server and listen on a port
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`Socket.io server running on port ${PORT}`);
});
