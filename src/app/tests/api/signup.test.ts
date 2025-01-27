import handler from "@/app/api/sign-up/route"; 
import { createMocks } from "node-mocks-http";
import { db } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { sendVerificationEmail } from "@/utils/sendVerificationEmail";

jest.mock("@/lib/prisma", () => ({
  db: {
    user: {
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  },
}));

jest.mock("@/utils/sendVerificationEmail", () => ({
  sendVerificationEmail: jest.fn(),
}));

describe("Sign-Up API", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return 400 for invalid email address", async () => {
    const { req, res } = createMocks({
      method: "POST",
      body: {
        username: "testuser",
        email: "invalid-email",
        password: "password123",
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    expect(res._getData()).toEqual(
      JSON.stringify({ message: "Invalid email address" })
    );
  });

  it("should return 409 if username already exists", async () => {
    (db.user.findFirst as jest.Mock).mockResolvedValue({
      username: "testuser",
      email: "test@example.com",
    });

    const { req, res } = createMocks({
      method: "POST",
      body: {
        username: "testuser",
        email: "newemail@example.com",
        password: "password123",
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(409);
    expect(res._getData()).toEqual(
      JSON.stringify({ user: null, message: "Username already exists" })
    );
  });

  it("should update an existing unverified user", async () => {
    (db.user.findFirst as jest.Mock).mockResolvedValue({
      username: "testuser",
      email: "test@example.com",
      isVerified: false,
    });

    const hashedPassword = await bcrypt.hash("password123", 10);

    (db.user.update as jest.Mock).mockResolvedValue({
      username: "testuser",
      email: "test@example.com",
      password: hashedPassword,
    });

    const { req, res } = createMocks({
      method: "POST",
      body: {
        username: "testuser",
        email: "test@example.com",
        password: "password123",
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    expect(res._getData()).toEqual(
      JSON.stringify({
        user: null,
        message: "User updated. Please verify your email",
      })
    );

    expect(sendVerificationEmail).toHaveBeenCalledWith(
      "test@example.com",
      expect.any(String), 
      "testuser"
    );
  });

  it("should create a new user successfully", async () => {
    (db.user.findFirst as jest.Mock).mockResolvedValue(null);

    (db.user.create as jest.Mock).mockResolvedValue({
      username: "testuser",
      email: "test@example.com",
      isVerified: false,
    });

    const { req, res } = createMocks({
      method: "POST",
      body: {
        username: "testuser",
        email: "test@example.com",
        password: "password123",
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(201);
    expect(res._getData()).toEqual(
      JSON.stringify({
        user: {
          username: "testuser",
          email: "test@example.com",
          isVerified: false,
        },
        message: "User registered successfully. Please verify your email",
      })
    );

    expect(sendVerificationEmail).toHaveBeenCalledWith(
      "test@example.com",
      expect.any(String), 
      "testuser"
    );
  });

  it("should return 500 for unexpected errors", async () => {
    (db.user.findFirst as jest.Mock).mockRejectedValue(new Error("Database error"));

    const { req, res } = createMocks({
      method: "POST",
      body: {
        username: "testuser",
        email: "test@example.com",
        password: "password123",
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(500);
    expect(res._getData()).toEqual(
      JSON.stringify({ message: "Error registering user" })
    );
  });
});
