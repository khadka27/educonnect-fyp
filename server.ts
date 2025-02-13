// import { createServer } from "http";
// import { parse } from "url";
// import next from "next";
// import { Server } from "socket.io";
// import { PrismaClient } from "@prisma/client";
// import { v4 as uuidv4 } from "uuid";

// const prisma = new PrismaClient();

// const port = parseInt(process.env.PORT || "3000", 10);
// const dev = process.env.NODE_ENV !== "production";
// const app = next({ dev });
// const handle = app.getRequestHandler();

// app.prepare().then(() => {
//   const httpServer = createServer((req, res) => {
//     const parsedUrl = parse(req.url!, true);
//     handle(req, res, parsedUrl);
//   });

//   const io = new Server(httpServer);

//   io.on("connection", (socket) => {
//     console.log("New client connected");

//     // User joins a room based on their user ID
//     socket.on("joinRoom", (userId) => {
//       socket.join(userId);
//       console.log(`User ${userId} joined room`);
//     });

//     // Fetch the message history for a user
//     socket.on("fetchMessages", async ({ senderId, receiverId }) => {
//       try {
//         const messages = await prisma.message.findMany({
//           where: {
//             OR: [
//               { senderId, receiverId },
//               { senderId: receiverId, receiverId: senderId },
//             ],
//           },
//           orderBy: { createdAt: "asc" },
//         });

//         const formattedMessages = messages.map((msg) => ({
//           ...msg,
//           createdAt: msg.createdAt.toISOString(),
//         }));

//         socket.emit("messageHistory", formattedMessages);
//       } catch (err) {
//         console.error("Error fetching message history:", err);
//       }
//     });

//     // Send a message and emit it to both sender and receiver
//     socket.on("sendMessage", async (data) => {
//       try {
//         const message = await prisma.message.create({
//           data: {
//             content: data.content,
//             senderId: data.senderId,
//             receiverId: data.receiverId,
//             groupId: data.groupId,
//           },
//         });

//         const newMessage = {
//           id: message.id,
//           content: message.content,
//           senderId: message.senderId,
//           receiverId: message.receiverId,
//           groupId: message.groupId,
//           createdAt: message.createdAt.toISOString(),
//           isRead: message.isRead,
//         };

//         // Emit to both sender and receiver rooms
//         io.to(data.senderId).emit("newMessage", newMessage);
//         io.to(data.receiverId).emit("newMessage", newMessage);

//         console.log("Message saved and emitted:", message);
//       } catch (err) {
//         console.error("Error saving message:", err);
//       }
//     });

//     // Send a file and emit it to both sender and receiver
//     socket.on("sendFile", async (data) => {
//       try {
//         const fileName = uuidv4() + "_" + data.fileName;

//         const message = await prisma.message.create({
//           data: {
//             content: data.content,
//             senderId: data.senderId,
//             receiverId: data.receiverId,
//             groupId: data.groupId,
//             fileUrl: `https://your-file-storage.com/${fileName}`,
//             fileType: data.fileType,
//           },
//         });

//         const newMessage = {
//           id: message.id,
//           content: message.content,
//           senderId: message.senderId,
//           receiverId: message.receiverId,
//           groupId: message.groupId,
//           createdAt: message.createdAt.toISOString(),
//           fileUrl: message.fileUrl,
//           fileType: message.fileType,
//           isRead: message.isRead,
//         };

//         // Emit to both sender and receiver rooms
//         io.to(data.senderId).emit("newMessage", newMessage);
//         io.to(data.receiverId).emit("newMessage", newMessage);

//         console.log("File message saved and emitted:", message);
//       } catch (err) {
//         console.error("Error saving file message:", err);
//       }
//     });

//     // Mark a message as read
//     socket.on("markAsRead", async (messageId) => {
//       try {
//         await prisma.message.update({
//           where: { id: messageId },
//           data: { isRead: true },
//         });

//         socket.emit("messageRead", messageId);
//       } catch (err) {
//         console.error("Error marking message as read:", err);
//       }
//     });

//     // Fetch unseen messages for a user
//     socket.on("fetchUnseenMessages", async (userId) => {
//       try {
//         const unseenMessages = await prisma.message.findMany({
//           where: {
//             receiverId: userId,
//             isRead: false,
//           },
//         });

//         socket.emit("unseenMessages", unseenMessages);
//       } catch (err) {
//         console.error("Error fetching unseen messages:", err);
//       }
//     });

//     socket.on("disconnect", (reason) => {
//       console.log("Client disconnected:", reason);
//     });
//   });

//   httpServer.listen(port, () => {
//     console.log(`> Ready on http://localhost:${port}`);
//   });
// });

import { createServer } from "http";
import { parse } from "url";
import next from "next";
import { Server } from "socket.io";
import { PrismaClient } from "@prisma/client";

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

  const io = new Server(httpServer);

  io.on("connection", async (socket) => {
    console.log("New client connected");

    // Fetch all groups when a user connects
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

    // Fetch users from database
    socket.on("fetchUsers", async () => {
      try {
        const users = await prisma.user.findMany();
        socket.emit("userList", users);
      } catch (err) {
        console.error("Error fetching users:", err);
      }
    });

    // Create a group (Only Teachers)
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

    // Rename a group (Only Admin)
    socket.on("renameGroup", async ({ adminId, groupId, newName }) => {
      try {
        const group = await prisma.group.update({
          where: { id: groupId, adminId },
          data: { name: newName },
        });

        io.emit("groupUpdated", group);
        console.log("Group renamed:", group);
      } catch (err) {
        console.error("Error renaming group:", err);
      }
    });

    // Delete a group (Only Admin)
    socket.on("deleteGroup", async ({ adminId, groupId }) => {
      try {
        await prisma.group.delete({ where: { id: groupId, adminId } });
        io.emit("groupDeleted", groupId);
        console.log(`Group ${groupId} deleted by admin.`);
      } catch (err) {
        console.error("Error deleting group:", err);
      }
    });

    // Add user to group (Only Admin)
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
        io.emit("userAddedToGroup", { groupId, userId });
        console.log(`User ${userId} added to group ${groupId}`);
      } catch (err) {
        console.error("Error adding user to group:", err);
      }
    });

    // Kick user from group (Only Admin)
    socket.on("removeUserFromGroup", async ({ adminId, groupId, userId }) => {
      try {
        const group = await prisma.group.findFirst({
          where: { id: groupId, adminId },
        });

        if (!group) {
          socket.emit("error", "Only admins can remove users.");
          return;
        }

        await prisma.groupMember.deleteMany({ where: { groupId, userId } });
        io.emit("userRemovedFromGroup", { groupId, userId });
        console.log(`User ${userId} removed from group ${groupId}`);
      } catch (err) {
        console.error("Error removing user from group:", err);
      }
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected");
    });
  });

  httpServer.listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`);
  });
});
