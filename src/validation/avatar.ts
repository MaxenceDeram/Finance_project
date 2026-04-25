import { z } from "zod";

const allowedAvatarMimeTypes = [
  "image/jpeg",
  "image/png",
  "image/webp"
] as const;

export const MAX_AVATAR_FILE_SIZE_BYTES = 3 * 1024 * 1024;

export const avatarUploadRequestSchema = z.object({
  filename: z.string().trim().min(1).max(180),
  contentType: z.enum(allowedAvatarMimeTypes),
  size: z.coerce.number().int().positive().max(MAX_AVATAR_FILE_SIZE_BYTES)
});

export const avatarUploadCompleteSchema = z.object({
  storageKey: z.string().trim().min(1).max(500),
  contentType: z.enum(allowedAvatarMimeTypes)
});

export const avatarRemoveSchema = z.object({
  confirm: z.literal(true).optional().default(true)
});

export function isAllowedAvatarMimeType(value: string) {
  return allowedAvatarMimeTypes.includes(value as (typeof allowedAvatarMimeTypes)[number]);
}
