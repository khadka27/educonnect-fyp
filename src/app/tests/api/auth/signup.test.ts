import {
  createMockRequestResponse,
  prisma,
  cleanupDatabase,
} from "../../helpers/testHelper";
import handler from "@/app/api/auth/signup/route";
import bcrypt from "bcryptjs";

jest.mock("bcryptjs");
jest.mock("@prisma/client");

describe("Signup API", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await cleanupDatabase();
    await prisma.$disconnect();
  });

  it("should create a new user successfully", async () => {
    const mockHashedPassword = "hashedPassword123";
    (bcrypt.hash as jest.Mock).mockResolvedValue(mockHashedPassword);
    (prisma.user.create as jest.Mock).mockResolvedValue({
      id: "test-id",
      email: "test@example.com",
      name: "Test User",
    });

    const { req, res } = createMockRequestResponse("POST", {
      email: "test@example.com",
      password: "password123",
      name: "Test User",
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(201);
    expect(JSON.parse(res._getData())).toEqual({
      message: "User created successfully",
      user: {
        id: "test-id",
        email: "test@example.com",
        name: "Test User",
      },
    });
  });

  it("should return 400 if required fields are missing", async () => {
    const { req, res } = createMockRequestResponse("POST", {
      email: "test@example.com",
      // Missing password and name
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    expect(JSON.parse(res._getData())).toEqual({
      error: "Missing required fields",
    });
  });

  it("should return 400 if email is invalid", async () => {
    const { req, res } = createMockRequestResponse("POST", {
      email: "invalid-email",
      password: "password123",
      name: "Test User",
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    expect(JSON.parse(res._getData())).toEqual({
      error: "Invalid email format",
    });
  });

  it("should return 409 if user already exists", async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({
      id: "existing-id",
      email: "test@example.com",
    });

    const { req, res } = createMockRequestResponse("POST", {
      email: "test@example.com",
      password: "password123",
      name: "Test User",
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(409);
    expect(JSON.parse(res._getData())).toEqual({
      error: "User already exists",
    });
  });

  it("should handle server errors gracefully", async () => {
    (prisma.user.create as jest.Mock).mockRejectedValue(
      new Error("Database error")
    );

    const { req, res } = createMockRequestResponse("POST", {
      email: "test@example.com",
      password: "password123",
      name: "Test User",
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(500);
    expect(JSON.parse(res._getData())).toEqual({
      error: "Internal server error",
    });
  });
});
