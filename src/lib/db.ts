import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

// Avoid instantiating a new PrismaClient every time in development
export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ["query"], // Optional: Logs the database queries to the console for debugging
  });
console.log("Database connected");

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// const db = prisma; // Remove this line
