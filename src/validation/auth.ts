import { z } from "zod";
import { emailSchema } from "./common";

export const registerSchema = z
  .object({
    email: emailSchema,
    password: z.string().min(1),
    confirmPassword: z.string().min(1)
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Les mots de passe ne correspondent pas."
  });

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1),
  next: z.string().optional()
});

export const resendConfirmationSchema = z.object({
  email: emailSchema
});

export const confirmEmailSchema = z.object({
  token: z.string().min(32).max(512)
});
