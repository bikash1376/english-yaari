import { z } from "zod";

export const createUserSchema = z.object({
  fullName: z.string().trim().min(1, "fullName is required"),
  email: z.email("email must be a valid email").trim().toLowerCase(),
  phone: z
    .string()
    .trim()
    .regex(/^\+?[0-9\s-]{7,20}$/, "phone must be a valid phone number"),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
