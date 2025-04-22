import { PrismaClient } from "@prisma/client";
import { createServer } from "http";
import { Server } from "socket.io";
import { io as Client } from "socket.io-client";
import { AddressInfo } from "net";

const prisma = new PrismaClient();

describe("Socket.IO Server Tests", () => {
  let io: Server;
  let serverSocket: any;
  let clientSocket: any;
  let httpServer: any;

  beforeAll((done) => {
    httpServer = createServer();
    io = new Server(httpServer);
    httpServer.listen(() => {
      const port = (httpServer.address() as AddressInfo).port;
      clientSocket = Client(`http://localhost:${port}`);
      io.on("connection", (socket) => {
        serverSocket = socket;
      });
      clientSocket.on("connect", done);
    });
  });

  afterAll(() => {
    io.close();
    clientSocket.close();
    httpServer.close();
  });

  // User Room Tests
  test("should join a room", (done) => {
    const userId = "test-user-123";
    clientSocket.emit("joinRoom", userId);

    // Add a small delay to ensure the room join is processed
    setTimeout(() => {
      expect(serverSocket.rooms.has(userId)).toBe(true);
      done();
    }, 100);
  });

  test("should join a group room", (done) => {
    const groupId = "group-123";
    clientSocket.emit("joinGroup", groupId);

    setTimeout(() => {
      expect(serverSocket.rooms.has(`group-${groupId}`)).toBe(true);
      done();
    }, 100);
  });

  // Group Tests
  test("should fetch groups for a user", (done) => {
    const userId = "user-123";
    clientSocket.emit("fetchGroups", userId);

    clientSocket.on("groupList", (groups: any[]) => {
      expect(Array.isArray(groups)).toBe(true);
      done();
    });
  });

  test("should fetch all users", (done) => {
    clientSocket.emit("fetchUsers");

    clientSocket.on("userList", (users: any[]) => {
      expect(Array.isArray(users)).toBe(true);
      done();
    });
  });

  test("should create a group (teacher only)", (done) => {
    const groupData = {
      teacherId: "teacher-123",
      groupName: "Math Class",
    };

    clientSocket.emit("createGroup", groupData);

    clientSocket.on("groupCreated", (group: any) => {
      expect(group.name).toBe(groupData.groupName);
      expect(group.adminId).toBe(groupData.teacherId);
      done();
    });
  });

  test("should add a user to a group", (done) => {
    const addUserData = {
      adminId: "teacher-123",
      groupId: "group-123",
      userId: "student-456",
    };

    clientSocket.emit("addUserToGroup", addUserData);

    clientSocket.on("userAddedToGroup", (data: any) => {
      expect(data.groupId).toBe(addUserData.groupId);
      expect(data.userId).toBe(addUserData.userId);
      done();
    });
  });

  test("should fetch group messages", (done) => {
    const groupId = "group-123";
    clientSocket.emit("fetchGroupMessages", groupId);

    clientSocket.on("groupMessageHistory", (messages: any[]) => {
      expect(Array.isArray(messages)).toBe(true);
      done();
    });
  });

  test("should send a group message", (done) => {
    const messageData = {
      content: "Hello group!",
      senderId: "user-123",
      groupId: "group-123",
    };

    clientSocket.emit("sendGroupMessage", messageData);

    clientSocket.on("newGroupMessage", (message: any) => {
      expect(message.content).toBe(messageData.content);
      expect(message.senderId).toBe(messageData.senderId);
      expect(message.groupId).toBe(messageData.groupId);
      done();
    });
  });

  test("should kick a user from a group", (done) => {
    const kickData = {
      adminId: "teacher-123",
      groupId: "group-123",
      userId: "student-456",
    };

    clientSocket.emit("kickUserFromGroup", kickData);

    clientSocket.on("userKickedFromGroup", (data: any) => {
      expect(data.groupId).toBe(kickData.groupId);
      expect(data.userId).toBe(kickData.userId);
      done();
    });
  });

  test("should leave a group", (done) => {
    const leaveData = {
      userId: "user-123",
      groupId: "group-123",
    };

    clientSocket.emit("leaveGroup", leaveData);

    clientSocket.on("userLeftGroup", (data: any) => {
      expect(data.groupId).toBe(leaveData.groupId);
      expect(data.userId).toBe(leaveData.userId);
      done();
    });
  });

  test("should rename a group", (done) => {
    const renameData = {
      adminId: "teacher-123",
      groupId: "group-123",
      newGroupName: "Advanced Math Class",
    };

    clientSocket.emit("renameGroup", renameData);

    clientSocket.on("groupRenamed", (data: any) => {
      expect(data.groupId).toBe(renameData.groupId);
      expect(data.newGroupName).toBe(renameData.newGroupName);
      done();
    });
  });

  // Direct Message Tests
  test("should fetch direct messages", (done) => {
    const fetchData = {
      senderId: "user-123",
      receiverId: "user-456",
    };

    clientSocket.emit("fetchMessages", fetchData);

    clientSocket.on("messageHistory", (messages: any[]) => {
      expect(Array.isArray(messages)).toBe(true);
      done();
    });
  });

  test("should send a direct message", (done) => {
    const messageData = {
      content: "Hello, this is a direct message",
      senderId: "user-123",
      receiverId: "user-456",
    };

    clientSocket.emit("sendMessage", messageData);

    clientSocket.on("newMessage", (message: any) => {
      expect(message.content).toBe(messageData.content);
      expect(message.senderId).toBe(messageData.senderId);
      expect(message.receiverId).toBe(messageData.receiverId);
      done();
    });
  });

  // File Message Tests
  test("should send a file in a direct message", (done) => {
    const fileData = {
      fileName: "document.pdf",
      fileType: "pdf",
      fileData: "base64_encoded_file_data",
      senderId: "user-123",
      receiverId: "user-456",
      groupId: null,
    };

    clientSocket.emit("sendFile", fileData);

    clientSocket.on("newFileMessage", (message: any) => {
      expect(message.fileUrl).toBeDefined();
      expect(message.fileType).toBe(fileData.fileType);
      expect(message.senderId).toBe(fileData.senderId);
      expect(message.receiverId).toBe(fileData.receiverId);
      done();
    });
  });

  test("should send a file in a group message", (done) => {
    const fileData = {
      fileName: "document.pdf",
      fileType: "pdf",
      fileData: "base64_encoded_file_data",
      senderId: "user-123",
      receiverId: null,
      groupId: "group-123",
    };

    clientSocket.emit("sendFile", fileData);

    clientSocket.on("newFileMessage", (message: any) => {
      expect(message.fileUrl).toBeDefined();
      expect(message.fileType).toBe(fileData.fileType);
      expect(message.senderId).toBe(fileData.senderId);
      expect(message.groupId).toBe(fileData.groupId);
      done();
    });
  });

  // Message Status Tests
  test("should mark a message as read", (done) => {
    const messageId = "message-123";
    clientSocket.emit("markAsRead", messageId);

    clientSocket.on("messageRead", (id: string) => {
      expect(id).toBe(messageId);
      done();
    });
  });

  test("should fetch unseen messages", (done) => {
    const userId = "user-123";
    clientSocket.emit("fetchUnseenMessages", userId);

    clientSocket.on("unseenMessages", (messages: any[]) => {
      expect(Array.isArray(messages)).toBe(true);
      done();
    });
  });
});
