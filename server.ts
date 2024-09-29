// server.ts
import { createServer } from "http";
import { parse } from "url";
import next from "next";
import { Server } from "socket.io";
import { PrismaClient } from "@prisma/client";

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

    socket.on("sendMessage", (data) => {
      // Emit the message to all clients immediately to avoid blocking UI
      io.emit("newMessage", {
        content: data.content,
        senderId: data.senderId,
        receiverId: data.receiverId,
        groupId: data.groupId,
      });

      // Save the message to the database in the background
      prisma.message
        .create({
          data: {
            content: data.content,
            senderId: data.senderId,
            receiverId: data.receiverId,
            groupId: data.groupId,
          },
        })
        .then((message) => {
          console.log("Message saved:", message);
        })
        .catch((err) => {
          console.error("Error saving message:", err);
        });
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected");
    });
  });

  httpServer.listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`);
  });
});
