import { z } from "zod";

export const createTeacherSchema = z.object({
  fullName: z.string().trim().min(1, "fullName is required"),
  email: z.email("email must be a valid email").trim().toLowerCase(),
  specialization: z.string().trim().min(1, "specialization is required"),
  experience: z.number("experience must be a number").min(0, "experience cannot be negative"),
});

export type CreateTeacherInput = z.infer<typeof createTeacherSchema>;
