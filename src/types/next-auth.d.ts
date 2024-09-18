import "next-auth";
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      email: string;
      id?: string;
      isVerified?: boolean;
      role?: string; // Add role to session user
      username?: string;
    } & DefaultSession["user"];
  }

  interface User {
    id?: string;
    isVerified?: boolean;
    role?: string; // Add role to user
    username?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    isVerified?: boolean;
    role?: string; // Add role to JWT token
    username?: string;
  }
}
