import {
  EmailCategory,
  EmailLogStatus,
  type EmailProvider
} from "@prisma/client";
import { prisma } from "@/server/db/prisma";

export async function createEmailLog(input: {
  userId: string;
  applicationId?: string | null;
  templateId?: string | null;
  category: EmailCategory;
  provider: EmailProvider;
  status: EmailLogStatus;
  toEmail: string;
  fromEmail: string;
  subject: string;
  htmlBody: string;
  textBody: string;
  providerMessageId?: string | null;
  errorMessage?: string | null;
  sentAt?: Date | null;
}) {
  return prisma.emailLog.create({
    data: {
      userId: input.userId,
      applicationId: input.applicationId ?? null,
      templateId: input.templateId ?? null,
      category: input.category,
      provider: input.provider,
      status: input.status,
      toEmail: input.toEmail,
      fromEmail: input.fromEmail,
      subject: input.subject,
      htmlBody: input.htmlBody,
      textBody: input.textBody,
      providerMessageId: input.providerMessageId ?? null,
      errorMessage: input.errorMessage ?? null,
      sentAt: input.sentAt ?? null
    }
  });
}
