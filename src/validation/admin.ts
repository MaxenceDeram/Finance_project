import { z } from "zod";
import { idSchema } from "./common";

export const adminUserIdSchema = z.object({
  userId: idSchema
});

export const updateUserRoleSchema = z.object({
  userId: idSchema,
  role: z.enum(["USER", "ADMIN"])
});

export const updateUserStatusSchema = z.object({
  userId: idSchema,
  status: z.enum(["ACTIVE", "SUSPENDED"])
});
