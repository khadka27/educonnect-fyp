require("@testing-library/jest-dom");

// Mock Socket.IO client
jest.mock("socket.io-client", () => ({
  connect: jest.fn(() => ({
    on: jest.fn(),
    emit: jest.fn(),
    connect: jest.fn(),
    disconnect: jest.fn(),
    close: jest.fn(),
  })),
}));

// Mock environment variables
process.env.NEXT_PUBLIC_API_URL = "http://localhost:3000";
process.env.NEXT_PUBLIC_SOCKET_URL = "http://localhost:3000";

// Global test timeout
jest.setTimeout(10000);
