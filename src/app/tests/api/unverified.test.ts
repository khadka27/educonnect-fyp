/* eslint-disable @typescript-eslint/no-var-requires */

// Login attempt with unverified user account
it("should throw an error when attempting to log in with an unverified user account", async () => {
  const mockPrismaClient = {
    user: {
      findUnique: jest.fn().mockResolvedValue({
        email: "test@example.com",
        password: "hashed-password",
        isVerified: false,
        role: "USER",
      }),
    },
  };

  jest.mock("@prisma/client", () => ({
    PrismaClient: jest.fn(() => mockPrismaClient),
  }));
  const bcrypt = require("bcryptjs");
  jest.spyOn(bcrypt, "compare").mockResolvedValue(true);
  // const { authOptions } = require("@/api/auth/[...nextauth]");
  const { authOptions } = require("@/api/auth/[...nextauth]");
  const credentials = { email: "test@example.com", password: "password" };

  await expect(authOptions.providers[1].authorize(credentials)).rejects.toThrow(
    "Please verify your account"
  );
});
