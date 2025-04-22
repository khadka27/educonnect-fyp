import {
  createMockRequestResponse,
  prisma,
  cleanupDatabase,
} from "../../helpers/testHelper";
import handler from "@/app/api/auth/login/route";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

jest.mock("bcryptjs");
jest.mock("jsonwebtoken");
jest.mock("@prisma/client");

describe("Login API", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await cleanupDatabase();
    await prisma.$disconnect();
  });

  it("should login user successfully", async () => {
    const mockUser = {
      id: "test-id",
      email: "test@example.com",
      password: "hashedPassword123",
      name: "Test User",
    };

    (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    (jwt.sign as jest.Mock).mockReturnValue("mock-token");

    const { req, res } = createMockRequestResponse("POST", {
      email: "test@example.com",
      password: "password123",
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    expect(JSON.parse(res._getData())).toEqual({
      token: "mock-token",
      user: {
        id: mockUser.id,
        email: mockUser.email,
        name: mockUser.name,
      },
    });
  });

  it("should return 400 if required fields are missing", async () => {
    const { req, res } = createMockRequestResponse("POST", {
      email: "test@example.com",
      // Missing password
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    expect(JSON.parse(res._getData())).toEqual({
      error: "Missing required fields",
    });
  });

  it("should return 401 if user does not exist", async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

    const { req, res } = createMockRequestResponse("POST", {
      email: "nonexistent@example.com",
      password: "password123",
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(401);
    expect(JSON.parse(res._getData())).toEqual({
      error: "Invalid credentials",
    });
  });

  it("should return 401 if password is incorrect", async () => {
    const mockUser = {
      id: "test-id",
      email: "test@example.com",
      password: "hashedPassword123",
    };

    (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    const { req, res } = createMockRequestResponse("POST", {
      email: "test@example.com",
      password: "wrongpassword",
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(401);
    expect(JSON.parse(res._getData())).toEqual({
      error: "Invalid credentials",
    });
  });

  it("should handle server errors gracefully", async () => {
    (prisma.user.findUnique as jest.Mock).mockRejectedValue(
      new Error("Database error")
    );

    const { req, res } = createMockRequestResponse("POST", {
      email: "test@example.com",
      password: "password123",
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(500);
    expect(JSON.parse(res._getData())).toEqual({
      error: "Internal server error",
    });
  });
});
