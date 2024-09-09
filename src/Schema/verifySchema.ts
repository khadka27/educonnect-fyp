import { z } from "zod";

export const verifySchema = z.object({
  code: z
    .string()
    .length(6, { message: "Invalid code your code must be in 6 characters " }),
});
