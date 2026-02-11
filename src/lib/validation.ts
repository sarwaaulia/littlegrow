import z from "zod";

export const registerSchema = z.object({
  name: z.string().min(3, "Name minimum 3 characters").max(20),
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password minimum 6 characters"),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, "Password is required"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;