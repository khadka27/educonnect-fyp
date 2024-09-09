import { z } from "zod";

export const SignInSchema = z.object({
  identifire: z.string(),
  password: z.string(),
  email: z.string().email(),
});
