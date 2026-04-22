import { UserRole, UserStatus } from "@prisma/client";
import { z } from "zod";
import { idSchema } from "./common";

export const adminUserIdSchema = z.object({
  userId: idSchema
});

export const updateUserRoleSchema = z.object({
  userId: idSchema,
  role: z.enum([UserRole.USER, UserRole.ADMIN])
});

export const updateUserStatusSchema = z.object({
  userId: idSchema,
  status: z.enum([UserStatus.ACTIVE, UserStatus.SUSPENDED])
});
