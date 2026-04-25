import { z } from "zod";
import { emailSchema, idSchema } from "./common";

export const emailTemplateInputSchema = z.object({
  name: z.string().trim().min(1, "Nom requis.").max(80),
  subjectTemplate: z.string().trim().min(1, "Sujet requis.").max(200),
  bodyTemplate: z.string().trim().min(1, "Message requis.").max(6000),
  isDefault: z.boolean().optional().default(false)
});

export const createEmailTemplateSchema = emailTemplateInputSchema;

export const updateEmailTemplateSchema = emailTemplateInputSchema.extend({
  templateId: idSchema
});

export const deleteEmailTemplateSchema = z.object({
  templateId: idSchema
});

export const sendFollowUpEmailSchema = z.object({
  applicationId: idSchema,
  templateId: idSchema.optional().or(z.literal("")).transform((value) => value || undefined),
  toEmail: emailSchema,
  subject: z.string().trim().min(1, "Sujet requis.").max(200),
  message: z.string().trim().min(1, "Message requis.").max(6000)
});
