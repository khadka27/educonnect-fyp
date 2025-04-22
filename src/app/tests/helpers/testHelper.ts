import { createMocks } from "node-mocks-http";
import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();

export const createMockRequestResponse = (
  method: string = "GET",
  body: any = {},
  query: any = {}
) => {
  const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
    method,
    body,
    query,
  });

  return { req, res };
};

export const cleanupDatabase = async () => {
  const tablenames = await prisma.$queryRaw<
    Array<{ tablename: string }>
  >`SELECT tablename FROM pg_tables WHERE schemaname='public'`;

  const tables = tablenames
    .map(({ tablename }) => tablename)
    .filter((name) => name !== "_prisma_migrations")
    .map((name) => `"public"."${name}"`)
    .join(", ");

  try {
    await prisma.$executeRawUnsafe(`TRUNCATE TABLE ${tables} CASCADE;`);
  } catch (error) {
    console.log({ error });
  }
};

export const mockSession = {
  user: {
    id: "test-user-id",
    email: "test@example.com",
    name: "Test User",
    role: "USER",
  },
  expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
};
