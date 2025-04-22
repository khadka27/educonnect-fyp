import { PrismaClient } from "@prisma/client";
import { createServer } from "http";
import { Server } from "socket.io";
import { connect } from "socket.io-client";
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
      clientSocket = connect(`http://localhost:${port}`);
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

  test("should join a room", (done) => {
    const userId = "test-user-123";
    clientSocket.emit("joinRoom", userId);

    // Add a small delay to ensure the room join is processed
    setTimeout(() => {
      expect(serverSocket.rooms.has(userId)).toBe(true);
      done();
    }, 100);
  });

  test("should send and receive messages", (done) => {
    const messageData = {
      content: "Hello, this is a test message",
      senderId: "sender-123",
      receiverId: "receiver-456",
      groupId: null,
    };

    clientSocket.emit("sendMessage", messageData);

    clientSocket.on("newMessage", (message: any) => {
      expect(message.content).toBe(messageData.content);
      expect(message.senderId).toBe(messageData.senderId);
      expect(message.receiverId).toBe(messageData.receiverId);
      done();
    });
  });

  test("should fetch message history", (done) => {
    const fetchData = {
      senderId: "sender-123",
      receiverId: "receiver-456",
    };

    clientSocket.emit("fetchMessages", fetchData);

    clientSocket.on("messageHistory", (messages: any[]) => {
      expect(Array.isArray(messages)).toBe(true);
      done();
    });
  });
});
