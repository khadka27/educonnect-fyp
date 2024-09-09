import { z } from "zod";

export const usernameValidation = z
  .string()
  .min(3)
  .max(20)
  .regex(/^[a-zA-Z0-9_]*$/);

export const userSchema = z.object({
  username: usernameValidation,
  email: z.string().email("Invalid email address."),
  password: z.string().min(6, "Password must be at least 6 characters long."),
  role: z.enum(["USER", "ADMIN", "TEACHER"]).optional(),
});
