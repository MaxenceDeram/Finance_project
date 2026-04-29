import { z } from "zod";
import { idSchema } from "./common";

export const uploadApplicationDocumentSchema = z.object({
  applicationId: idSchema,
  documentType: z.enum(["RESUME", "COVER_LETTER", "OTHER"])
});

export const deleteApplicationDocumentSchema = z.object({
  documentId: idSchema
});
