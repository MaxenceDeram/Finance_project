import { ApplicationDocumentType } from "@prisma/client";
import { z } from "zod";
import { idSchema } from "./common";

export const uploadApplicationDocumentSchema = z.object({
  applicationId: idSchema,
  documentType: z.nativeEnum(ApplicationDocumentType)
});

export const deleteApplicationDocumentSchema = z.object({
  documentId: idSchema
});
