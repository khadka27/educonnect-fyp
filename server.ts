import { createServer } from "http";
import { parse } from "url";
import next from "next";
import { Server } from "socket.io";
import { PrismaClient } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";
import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary using environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const prisma = new PrismaClient();

const port = parseInt(process.env.PORT ?? "3000", 10);
const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    const parsedUrl = parse(req.url!, true);
    handle(req, res, parsedUrl);
  });

  const io = new Server(httpServer, {
    cors: {
      origin: "*", // Change this for security in production
      methods: ["GET", "POST"],
    },
  });

  // Track online users
  const onlineUsers = new Map(); // userId -> socketId
  const userSockets = new Map(); // socketId -> userId

  io.on("connection", (socket) => {
    console.log("New client connected:", socket.id);

    /** ────────────────────────────
     *  📌 USER ROOM JOINING & ONLINE STATUS
     *  ─────────────────────────── */
    socket.on("joinRoom", (userId) => {
      socket.join(userId);
      console.log(`User ${userId} joined room`);

      // Track online status
      onlineUsers.set(userId, socket.id);
      userSockets.set(socket.id, userId);

      // Broadcast user online status to all connected clients
      io.emit("userStatusChange", { userId, status: "online" });
    });

    socket.on("joinGroup", (groupId) => {
      socket.join(`group-${groupId}`);
      console.log(`User joined group room: group-${groupId}`);
    });

    /** ────────────────────────────
     *  📌 TYPING INDICATORS
     *  ─────────────────────────── */
    socket.on("userTyping", ({ userId, receiverId, isTyping }) => {
      // Emit typing status to the recipient only
      io.to(receiverId).emit("userTyping", { userId, isTyping });
    });

    /** ────────────────────────────
     *  📌 MESSAGE DELIVERY STATUS
     *  ─────────────────────────── */
    socket.on("deliverMessage", ({ messageId, senderId }) => {
      // Update message as delivered in database
      try {
        prisma.message
          .update({
            where: { id: messageId },
            data: { isDelivered: true },
          })
          .then(() => {
            // Notify sender that message was delivered
            io.to(senderId).emit("messageDelivered", {
              messageId,
              receiverId: userSockets.get(socket.id),
            });
          });
      } catch (err) {
        console.error("Error marking message as delivered:", err);
      }
    });

    /** ────────────────────────────
     *  📌 FETCH GROUPS
     *  ─────────────────────────── */
    socket.on("fetchGroups", async (userId) => {
      try {
        const groups = await prisma.group.findMany({
          where: {
            OR: [{ adminId: userId }, { members: { some: { userId } } }],
          },
          include: { members: true },
        });
        socket.emit("groupList", groups);
      } catch (err) {
        console.error("Error fetching groups:", err);
      }
    });

    /** ────────────────────────────
     *  📌 FETCH USERS
     *  ─────────────────────────── */
    socket.on("fetchUsers", async () => {
      try {
        const users = await prisma.user.findMany();

        // Add online status to each user
        const enhancedUsers = users.map((user) => ({
          ...user,
          isOnline: onlineUsers.has(user.id),
        }));

        socket.emit("userList", enhancedUsers);
      } catch (err) {
        console.error("Error fetching users:", err);
      }
    });

    /** ────────────────────────────
     *  📌 GROUP CHAT OPERATIONS
     *  ─────────────────────────── */
    socket.on("createGroup", async ({ teacherId, groupName }) => {
      try {
        const teacher = await prisma.user.findFirst({
          where: { id: teacherId, role: "TEACHER" },
        });

        if (!teacher) {
          socket.emit("error", "Only teachers can create groups.");
          return;
        }

        const group = await prisma.group.create({
          data: {
            name: groupName,
            adminId: teacherId,
          },
        });

        io.emit("groupCreated", group);
        console.log("Group created:", group);
      } catch (err) {
        console.error("Error creating group:", err);
      }
    });

    socket.on("addUserToGroup", async ({ adminId, groupId, userId }) => {
      try {
        const group = await prisma.group.findFirst({
          where: { id: groupId, adminId },
        });

        if (!group) {
          socket.emit("error", "Only admins can add users.");
          return;
        }

        await prisma.groupMember.create({ data: { groupId, userId } });

        io.to(`group-${groupId}`).emit("userAddedToGroup", { groupId, userId });
        console.log(`User ${userId} added to group ${groupId}`);
      } catch (err) {
        console.error("Error adding user to group:", err);
      }
    });

    socket.on("fetchGroupMessages", async (groupId) => {
      try {
        const messages = await prisma.message.findMany({
          where: { groupId },
          orderBy: { createdAt: "asc" },
        });

        socket.emit("groupMessageHistory", messages);
      } catch (err) {
        console.error("Error fetching group messages:", err);
      }
    });

    socket.on("sendGroupMessage", async ({ content, senderId, groupId }) => {
      try {
        const message = await prisma.message.create({
          data: {
            content,
            senderId,
            groupId,
            isGroupMessage: true,
          },
        });

        const newMessage = {
          id: message.id,
          content: message.content,
          senderId: message.senderId,
          groupId: message.groupId,
          createdAt: message.createdAt.toISOString(),
        };

        io.to(`group-${groupId}`).emit("newGroupMessage", newMessage);
        console.log("Group message sent:", newMessage);
      } catch (err) {
        console.error("Error sending group message:", err);
      }
    });

    //kick user from group
    socket.on("kickUserFromGroup", async ({ adminId, groupId, userId }) => {
      try {
        // Verify the group exists and the sender is the admin.
        const group = await prisma.group.findFirst({
          where: { id: groupId, adminId },
        });

        if (!group) {
          socket.emit("kickUserError", "Only admins can kick users.");
          return;
        }

        // Remove the user from the group.
        await prisma.groupMember.deleteMany({
          where: { groupId, userId },
        });

        // Notify all clients in the group room.
        io.to(`group-${groupId}`).emit("userKickedFromGroup", {
          groupId,
          userId,
        });
        console.log(`User ${userId} kicked from group ${groupId}`);
      } catch (err) {
        console.error("Error kicking user from group:", err);
        socket.emit(
          "kickUserError",
          "An error occurred while kicking the user."
        );
      }
    });

    // leave group
    socket.on("leaveGroup", async ({ userId, groupId }) => {
      try {
        await prisma.groupMember.deleteMany({
          where: { groupId, userId },
        });

        io.to(`group-${groupId}`).emit("userLeftGroup", { groupId, userId });
        console.log(`User ${userId} left group ${groupId}`);
      } catch (err) {
        console.error("Error leaving group:", err);
      }
    });

    //rename group by admin
    socket.on("renameGroup", async ({ adminId, groupId, newGroupName }) => {
      try {
        const group = await prisma.group.findFirst({
          where: { id: groupId, adminId },
        });

        if (!group) {
          socket.emit("error", "Only admins can rename groups.");
          return;
        }

        await prisma.group.update({
          where: { id: groupId },
          data: { name: newGroupName },
        });

        io.to(`group-${groupId}`).emit("groupRenamed", {
          groupId,
          newGroupName,
        });
        console.log(`Group ${groupId} renamed to ${newGroupName}`);
      } catch (err) {
        console.error("Error renaming group:", err);
      }
    });

    /** ────────────────────────────
     *  📌 DIRECT CHAT
     *  ─────────────────────────── */
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

        socket.emit("messageHistory", messages);
      } catch (err) {
        console.error("Error fetching message history:", err);
      }
    });

    socket.on("sendMessage", async ({ content, senderId, receiverId }) => {
      try {
        const message = await prisma.message.create({
          data: {
            content,
            senderId,
            receiverId,
            isDelivered: onlineUsers.has(receiverId), // Mark as delivered if recipient is online
          },
        });

        io.to(senderId).emit("newMessage", message);
        io.to(receiverId).emit("newMessage", message);

        console.log("Message sent:", message);
      } catch (err) {
        console.error("Error sending message:", err);
      }
    });

    /** ────────────────────────────
     *  📌 FILE MESSAGE (Direct & Group)
     *  ─────────────────────────── */
    socket.on(
      "sendFile",
      async ({ fileName, fileType, senderId, receiverId, groupId }) => {
        try {
          const storedFileName = uuidv4() + "_" + fileName;

          const message = await prisma.message.create({
            data: {
              content: "File message",
              sender: { connect: { id: senderId } },
              fileUrl: `https://your-file-storage.com/${storedFileName}`,
              fileType,
              senderId,
              receiverId,
              groupId,
              isDelivered: receiverId ? onlineUsers.has(receiverId) : false,
            },
          });

          if (receiverId) {
            io.to(senderId).emit("newMessage", message);
            io.to(receiverId).emit("newMessage", message);
          }

          if (groupId) {
            io.to(`group-${groupId}`).emit("newGroupMessage", message);
          }

          console.log("File message sent:", message);
        } catch (err) {
          console.error("Error sending file message:", err);
        }
      }
    );

    /** ────────────────────────────
     *  📌 MESSAGE STATUS
     *  ─────────────────────────── */
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

    socket.on("fetchUnseenMessages", async (userId) => {
      try {
        const unseenMessages = await prisma.message.findMany({
          where: { receiverId: userId, isRead: false },
        });

        socket.emit("unseenMessages", unseenMessages);
      } catch (err) {
        console.error("Error fetching unseen messages:", err);
      }
    });

    // ────────────────────────────
    //  📌 sent file in group
    // ───────────────────────────

    socket.on(
      "sendFile",
      async ({
        fileName,
        fileType,
        fileData,
        senderId,
        receiverId,
        groupId,
      }) => {
        try {
          // Validate allowed file types
          const allowedFileTypes = [
            "pdf",
            "doc",
            "docx",
            "zip",
            "png",
            "jpg",
            "jpeg",
            "gif",
            "mp4",
            "mov",
          ];
          if (!allowedFileTypes.includes(fileType.toLowerCase())) {
            socket.emit("error", "File type not allowed");
            return;
          }

          // Determine Cloudinary resource type based on fileType
          let resourceType = "raw";
          if (/(png|jpg|jpeg|gif)/i.test(fileType)) {
            resourceType = "image";
          } else if (/(mp4|mov)/i.test(fileType)) {
            resourceType = "video";
          }

          // Generate a unique file name for Cloudinary
          const storedFileName = uuidv4() + "_" + fileName;

          console.log(
            "Uploading file to Cloudinary with public_id:",
            storedFileName
          );
          // Upload file to Cloudinary.
          // fileData should be a valid file path, URL, or Base64 string.
          const uploadResult = await cloudinary.uploader.upload(fileData, {
            resource_type: resourceType as "raw" | "image" | "video" | "auto",
            public_id: storedFileName,
          });

          console.log("Cloudinary upload result:", uploadResult);

          const fileUrl = uploadResult.secure_url;
          if (!fileUrl) {
            console.error("Cloudinary did not return a secure_url");
            socket.emit("error", "File upload failed: No URL returned");
            return;
          }

          const message = await prisma.message.create({
            data: {
              content: "File message",
              sender: { connect: { id: senderId } },
              fileUrl,
              fileType,
              senderId,
              receiverId,
              groupId,
              isDelivered: receiverId ? onlineUsers.has(receiverId) : false,
            },
          });

          socket.emit("newFileMessage", message);
          console.log("File message sent:", message);
        } catch (err) {
          console.error("Error sending file message:", err);
          socket.emit("error", "An error occurred while uploading the file.");
        }
      }
    );

    /** ────────────────────────────
     *  📌 NOTIFICATIONS
     *  ─────────────────────────── */
    socket.on("sendNotification", async ({ userId, content }) => {
      try {
        const notification = await prisma.notification.create({
          data: {
            userId,
            content,
          },
        });

        io.to(userId).emit("newNotification", notification);
        console.log("Notification sent:", notification);
      } catch (err) {
        console.error("Error sending notification:", err);
      }
    });

    /** ────────────────────────────
     *  📌 DISCONNECT
     *  ─────────────────────────── */
    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);

      // If we know which user this socket belonged to
      const userId = userSockets.get(socket.id);
      if (userId) {
        // Remove user from online tracking
        onlineUsers.delete(userId);
        userSockets.delete(socket.id);

        // Update last seen time in database
        try {
          prisma.user
            .update({
              where: { id: userId },
              data: { lastSeen: new Date() },
            })
            .then(() => {
              // Broadcast user offline status
              io.emit("userStatusChange", { userId, status: "offline" });
            });
        } catch (err) {
          console.error("Error updating last seen:", err);
        }
      }
    });
  });

  httpServer.listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`);
  });
});
