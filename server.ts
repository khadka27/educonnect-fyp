import { createServer } from "http";
import { parse } from "url";
import next from "next";
import { Server } from "socket.io";
import { PrismaClient } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";

const prisma = new PrismaClient();

const port = parseInt(process.env.PORT || "3000", 10);
const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    const parsedUrl = parse(req.url!, true);
    handle(req, res, parsedUrl);
  });

  const io = new Server(httpServer);

  io.on("connection", (socket) => {
    console.log("New client connected");

    // User joins a room based on their user ID
    socket.on("joinRoom", (userId) => {
      socket.join(userId);
      console.log(`User ${userId} joined room`);
    });

    // Fetch the message history for a user
    socket.on("fetchMessages", async ({ senderId, receiverId }) => {
      try {
        const messages = await prisma.message.findMany({
          where: {
            OR: [
              { senderId, receiverId },
              { senderId: receiverId, receiverId: senderId },
            ],
          },
          orderBy: { createdAt: "asc" },
        });

        const formattedMessages = messages.map((msg) => ({
          ...msg,
          createdAt: msg.createdAt.toISOString(),
        }));

        socket.emit("messageHistory", formattedMessages);
      } catch (err) {
        console.error("Error fetching message history:", err);
      }
    });

    // Send a message and emit it to both sender and receiver
    socket.on("sendMessage", async (data) => {
      try {
        const message = await prisma.message.create({
          data: {
            content: data.content,
            senderId: data.senderId,
            receiverId: data.receiverId,
            groupId: data.groupId,
          },
        });

        const newMessage = {
          id: message.id,
          content: message.content,
          senderId: message.senderId,
          receiverId: message.receiverId,
          groupId: message.groupId,
          createdAt: message.createdAt.toISOString(),
          isRead: message.isRead,
        };

        // Emit to both sender and receiver rooms
        io.to(data.senderId).emit("newMessage", newMessage);
        io.to(data.receiverId).emit("newMessage", newMessage);

        console.log("Message saved and emitted:", message);
      } catch (err) {
        console.error("Error saving message:", err);
      }
    });

    // Send a file and emit it to both sender and receiver
    socket.on("sendFile", async (data) => {
      try {
        const fileName = uuidv4() + "_" + data.fileName;

        const message = await prisma.message.create({
          data: {
            content: data.content,
            senderId: data.senderId,
            receiverId: data.receiverId,
            groupId: data.groupId,
            fileUrl: `https://your-file-storage.com/${fileName}`,
            fileType: data.fileType,
          },
        });

        const newMessage = {
          id: message.id,
          content: message.content,
          senderId: message.senderId,
          receiverId: message.receiverId,
          groupId: message.groupId,
          createdAt: message.createdAt.toISOString(),
          fileUrl: message.fileUrl,
          fileType: message.fileType,
          isRead: message.isRead,
        };

        // Emit to both sender and receiver rooms
        io.to(data.senderId).emit("newMessage", newMessage);
        io.to(data.receiverId).emit("newMessage", newMessage);

        console.log("File message saved and emitted:", message);
      } catch (err) {
        console.error("Error saving file message:", err);
      }
    });

    // Mark a message as read
    socket.on("markAsRead", async (messageId) => {
      try {
        await prisma.message.update({
          where: { id: messageId },
          data: { isRead: true },
        });

        socket.emit("messageRead", messageId);
      } catch (err) {
        console.error("Error marking message as read:", err);
      }
    });

    // Fetch unseen messages for a user
    socket.on("fetchUnseenMessages", async (userId) => {
      try {
        const unseenMessages = await prisma.message.findMany({
          where: {
            receiverId: userId,
            isRead: false,
          },
        });

        socket.emit("unseenMessages", unseenMessages);
      } catch (err) {
        console.error("Error fetching unseen messages:", err);
      }
    });

    socket.on("disconnect", (reason) => {
      console.log("Client disconnected:", reason);
    });
  });

  httpServer.listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`);
  });
});
