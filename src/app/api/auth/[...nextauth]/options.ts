import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";

// Initialize Prisma Client
const prisma = new PrismaClient();

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(
        credentials: Record<"email" | "password", string> | undefined
      ) {
        try {
          if (!credentials || !credentials.email || !credentials.password) {
            throw new Error("Email and password are required");
          }

          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
          });

          if (!user) throw new Error("No user found with this email");
          if (!user.isVerified) throw new Error("Please verify your account");

          if (
            user.password &&
            (await bcrypt.compare(credentials.password, user.password))
          ) {
            // Ensure that null values are converted to undefined
            return {
              id: user.id,
              email: user.email,
              username: user.username ?? undefined, // Convert null to undefined
              isVerified: user.isVerified,
              role: user.role, // Assuming Role is an enum or correct type
            };
          } else {
            throw new Error("Incorrect password");
          }
        } catch (err) {
          console.error("Authentication error:", err);
          throw new Error("An error occurred during authentication");
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
        token.isVerified = user.isVerified;
        token.email = user.email;
        token.username = user.username;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.role = token.role;
      session.user.id = token.id as string;
      session.user.isVerified = token.isVerified as boolean;
      session.user.email = token.email as string;
      session.user.username = token.username as string;
      return session;
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 60, // Session will expire after 30 minutes of inactivity
    updateAge: 5 * 60, // Session will be updated every 5 minutes
  },
  jwt: {
    secret: process.env.NEXTAUTH_SECRET || "",
  },
  pages: {
    signIn: "/sign-in",
  },
  secret: process.env.NEXTAUTH_SECRET || "",
};

