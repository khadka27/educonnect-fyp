/* eslint-disable @typescript-eslint/no-explicit-any */
// import { NextAuthOptions } from "next-auth";
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client"; // Import Prisma Client
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";

const prisma = new PrismaClient(); // Initialize Prisma Client

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),

    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      // async authorize(credentials: any): Promise<any> {
      //   try {
      //     const user = await prisma.user.findUnique({
      //       where: {
      //         email: credentials.email, // Use email to find user
      //       },
      //     });

      //     if (!user) {
      //       throw new Error("No user found with this email");
      //     }
      //     if (!user.isVerified) {
      //       throw new Error("Please verify your account before logging in");
      //     }
      //     const isPasswordCorrect = await bcrypt.compare(
      //       credentials.password,
      //       user.password
      //     );
      //     if (isPasswordCorrect) {
      //       return user;
      //     } else {
      //       throw new Error("Incorrect password");
      //     }
      //   } catch (err: any) {
      //     throw new Error(
      //       err.message || "An error occurred during authentication"
      //     );
      //   }
      // },

      async authorize(credentials: any): Promise<any> {
        try {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
          });

          if (!user) {
            console.error("No user found with this email");
            throw new Error("No user found with this email");
          }
          if (!user.isVerified) {
            console.error("Please verify your account before logging in");
            throw new Error("Please verify your account before logging in");
          }
          const isPasswordCorrect = user.password !== null && await bcrypt.compare(
            credentials.password,
            user.password
          );
          if (isPasswordCorrect) {
            return user;
          } else {
            console.error("Incorrect password");
            throw new Error("Incorrect password");
          }
        } catch (err: any) {
          console.error("Authentication error:", err);
          throw new Error(
            err.message || "An error occurred during authentication"
          );
        }
      },
    }),
  ],
  // callbacks: {
  //   async jwt({ token, user }) {
  //     if (user) {
  //       token.id = user.id.toString(); // Convert id to string
  //       token.isVerified = user.isVerified;
  //       token.email = user.email;
  //       token.isAcceptingMessages = user.isAcceptingMessages;
  //       token.username = user.username;
  //     }
  //     return token;
  //   },
  //   async session({ session, token }) {
  //     if (token) {
  //       session.user.id = token.id as string; // Ensure type safety
  //       session.user.isVerified = token.isVerified as boolean;
  //       session.user.isAcceptingMessages = token.isAcceptingMessages as boolean;
  //       session.user.email = token.email as string;
  //       session.user.username = token.username as string;
  //     }
  //     return session;
  //   },
  //   async signIn({ account, profile }) {
  //     // Check if the provider is Google
  //     if (account?.provider === "google") {
  //       // Ensure the email is verified and ends with a specific domain
  //       if (profile?.email_verified && profile?.email?.endsWith("@gmail.com")) {
  //         return true; // Allow sign-in
  //       } else {
  //         // Reject the sign-in attempt if the email is not verified or doesn't match the domain
  //         return false;
  //       }
  //     }

  //     // For other providers, allow sign-in without verification
  //     return true;
  //   },
  // },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        try {
          token.id = user.id.toString(); // Convert id to string
          token.isVerified = user.isVerified;
          token.email = user.email;
          token.isAcceptingMessages = user.isAcceptingMessages;
          token.username = user.username;
          console.log("JWT Callback - Token:", token); // Debugging
        } catch (error) {
          console.error("JWT Callback Error:", error); // Error handling
        }
      }
      return token;
    },
    async session({ session, token }) {
      try {
        if (token) {
          session.user.id = token.id as string; // Ensure type safety
          session.user.isVerified = token.isVerified as boolean;
          session.user.isAcceptingMessages =
          token.isAcceptingMessages as boolean;
          session.user.email = token.email as string;
          session.user.username = token.username as string;
          console.log("Session Callback - Session:", session); // Debugging
        }
      } catch (error) {
        console.error("Session Callback Error:", error); // Error handling
      }
      return session;
    },

    async signIn({ account, profile }) {
      console.log("Sign-In Callback - Account:", account, "Profile:", profile);

      // Check if the provider is Google
      if (account?.provider === "google") {
        // Check if a user exists with the Google account ID or email
        const existingUser = await prisma.user.findUnique({
          where: {
            email: profile?.email ?? "",
          },
        });

        if (existingUser) {
          // User exists, proceed with sign-in
          return true;
        } else {
          // User does not exist, create a new user or handle account linking
          await prisma.user.create({
            data: {
              email: profile?.email,
              username: profile?.name, // or another field if needed
              verifyCode: "", // Add the missing property
              verifyCodeExpiry: new Date(), // Add the missing property
              // Additional user data if required
            },
          });
          return true;
        }
      }

      // For other providers, allow sign-in without verification
      return true;
    },
  },

  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/sign-in",
  },
};
