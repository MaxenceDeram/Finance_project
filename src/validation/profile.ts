import { z } from "zod";
import { emailSchema } from "./common";

export const updateProfileIdentitySchema = z.object({
  displayName: z.string().trim().max(80).optional().or(z.literal(""))
});

export const updateProfileEmailSchema = z.object({
  email: emailSchema,
  currentPassword: z.string().min(1)
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1),
    newPassword: z.string().min(1),
    confirmPassword: z.string().min(1)
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Les mots de passe ne correspondent pas."
  });
