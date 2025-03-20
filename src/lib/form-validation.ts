import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

// Common validation schemas
export const emailSchema = z
  .string()
  .min(1, "Email is required")
  .email("Invalid email address");

export const passwordSchema = z
  .string()
  .min(1, "Password is required")
  .min(8, "Password must be at least 8 characters long")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number");

export const usernameSchema = z
  .string()
  .min(3, "Username must be at least 3 characters")
  .max(50, "Username must be less than 50 characters")
  .regex(
    /^[a-zA-Z0-9_]+$/,
    "Username can only contain letters, numbers, and underscores"
  );

// Auth schemas
export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
});

export const signUpSchema = z
  .object({
    username: usernameSchema,
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

// Profile schemas
export const profileSchema = z.object({
  name: z.string().min(1, "Name is required"),
  bio: z.string().max(160, "Bio must be less than 160 characters").optional(),
  website: z
    .string()
    .url("Please enter a valid URL")
    .optional()
    .or(z.literal("")),
  location: z
    .string()
    .max(100, "Location must be less than 100 characters")
    .optional(),
});

// Helper function to get resolver for a schema
export function getFormResolver<T extends z.ZodType>(schema: T) {
  return zodResolver(schema);
}

// Export common resolvers for convenience
export const signInResolver = getFormResolver(signInSchema);
export const signUpResolver = getFormResolver(signUpSchema);
export const forgotPasswordResolver = getFormResolver(forgotPasswordSchema);
export const resetPasswordResolver = getFormResolver(resetPasswordSchema);
export const profileResolver = getFormResolver(profileSchema);

// Types
export type SignInFormValues = z.infer<typeof signInSchema>;
export type SignUpFormValues = z.infer<typeof signUpSchema>;
export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;
export type ProfileFormValues = z.infer<typeof profileSchema>;
