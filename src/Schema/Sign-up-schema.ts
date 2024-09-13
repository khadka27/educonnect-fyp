import { z } from "zod";

// Validate username with custom error messages
export const usernameValidation = z
  .string()
  .min(3, "Username must be at least 3 characters long.")
  .max(20, "Username must be at most 20 characters long.")
  .regex(
    /^[a-zA-Z0-9_]*$/,
    "Username can only contain letters, numbers, and underscores."
  );

// Define the user schema
export const userSchema = z.object({
  username: usernameValidation,
  email: z.string().email("Invalid email address."),
  password: z.string().min(6, "Password must be at least 6 characters long."),
  role: z.enum(["USER", "ADMIN", "TEACHER"]).optional().default("USER"),
});
