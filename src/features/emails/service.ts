import {
  AuditAction,
  EmailCategory,
  EmailLogStatus,
  type Prisma
} from "@prisma/client";
import { getEnv } from "@/config/env";
import { getSafeErrorMessage, AppError } from "@/lib/errors";
import { prisma } from "@/server/db/prisma";
import { sendEmail, getConfiguredEmailProvider } from "@/server/email/mailer";
import { createEmailLog } from "@/server/email/logs";
import { applicationFollowUpEmailTemplate } from "@/server/email/templates/follow-up-email";
import { writeAuditLog } from "@/server/security/audit";
import { getPreferredUserName } from "@/features/users/service";
import {
  getFollowUpTemplateTokens,
  renderTemplateString,
  type FollowUpTemplateContext
} from "@/features/applications/follow-up-template-engine";
import {
  createEmailTemplateSchema,
  deleteEmailTemplateSchema,
  sendFollowUpEmailSchema,
  updateEmailTemplateSchema
} from "@/validation/email";

const defaultFollowUpTemplates = [
  {
    name: "Relance candidature",
    isDefault: true,
    subjectTemplate: "Relance - {{roleTitle}} chez {{companyName}}",
    bodyTemplate: [
      "Bonjour {{contactName}},",
      "",
      "Je me permets de revenir vers vous concernant ma candidature au poste de {{roleTitle}} chez {{companyName}}, envoyee le {{applicationDate}}.",
      "",
      "Je reste tres interesse par cette opportunite et je serais ravi d'echanger si le process est toujours en cours.",
      "",
      "Bien a vous,",
      "{{userName}}"
    ].join("\n")
  },
  {
    name: "Relance apres entretien",
    isDefault: false,
    subjectTemplate: "Suite a notre echange - {{roleTitle}} chez {{companyName}}",
    bodyTemplate: [
      "Bonjour {{contactName}},",
      "",
      "Merci encore pour notre echange au sujet du poste de {{roleTitle}} chez {{companyName}}.",
      "",
      "Je voulais vous renouveler mon interet pour le role et savoir si vous aviez une visibilite sur les prochaines etapes du process.",
      "",
      "Merci par avance pour votre retour.",
      "",
      "Bien cordialement,",
      "{{userName}}"
    ].join("\n")
  },
  {
    name: "Relance courte",
    isDefault: false,
    subjectTemplate: "Point rapide - {{roleTitle}}",
    bodyTemplate: [
      "Bonjour {{contactName}},",
      "",
      "Petit message pour savoir si vous aviez une mise a jour concernant ma candidature au poste de {{roleTitle}} chez {{companyName}}.",
      "",
      "Je reste disponible si vous avez besoin d'un complement.",
      "",
      "{{userName}}"
    ].join("\n")
  }
] as const;

export async function listEmailTemplatesForUser(userId: string) {
  await ensureDefaultEmailTemplates(userId);

  return prisma.emailTemplate.findMany({
    where: { userId },
    orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }]
  });
}

export async function listRecentEmailLogsForUser(userId: string, take = 20) {
  return prisma.emailLog.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take,
    include: {
      application: {
        select: {
          companyName: true,
          roleTitle: true
        }
      },
      template: {
        select: {
          name: true
        }
      }
    }
  });
}

export async function createEmailTemplate(input: {
  userId: string;
  values: unknown;
  ipHash?: string | null;
}) {
  const parsed = createEmailTemplateSchema.parse(input.values);

  const template = await prisma.$transaction(async (tx) => {
    if (parsed.isDefault) {
      await tx.emailTemplate.updateMany({
        where: { userId: input.userId, isDefault: true },
        data: { isDefault: false }
      });
    }

    const existingCount = await tx.emailTemplate.count({
      where: { userId: input.userId }
    });

    return tx.emailTemplate.create({
      data: {
        userId: input.userId,
        name: parsed.name,
        subjectTemplate: parsed.subjectTemplate,
        bodyTemplate: parsed.bodyTemplate,
        isDefault: parsed.isDefault || existingCount === 0
      }
    });
  });

  await writeAuditLog({
    userId: input.userId,
    action: AuditAction.FOLLOW_UP_TEMPLATE_CREATED,
    metadata: { templateId: template.id, isDefault: template.isDefault },
    ipHash: input.ipHash
  });

  return template;
}

export async function updateEmailTemplate(input: {
  userId: string;
  values: unknown;
  ipHash?: string | null;
}) {
  const parsed = updateEmailTemplateSchema.parse(input.values);
  const existing = await assertTemplateOwner(parsed.templateId, input.userId);

  const template = await prisma.$transaction(async (tx) => {
    if (parsed.isDefault) {
      await tx.emailTemplate.updateMany({
        where: { userId: input.userId, isDefault: true },
        data: { isDefault: false }
      });
    }

    const updated = await tx.emailTemplate.update({
      where: { id: existing.id },
      data: {
        name: parsed.name,
        subjectTemplate: parsed.subjectTemplate,
        bodyTemplate: parsed.bodyTemplate,
        isDefault: parsed.isDefault
      }
    });

    if (!updated.isDefault) {
      const defaultCount = await tx.emailTemplate.count({
        where: { userId: input.userId, isDefault: true }
      });

      if (defaultCount === 0) {
        await tx.emailTemplate.update({
          where: { id: updated.id },
          data: { isDefault: true }
        });

        return {
          ...updated,
          isDefault: true
        };
      }
    }

    return updated;
  });

  await writeAuditLog({
    userId: input.userId,
    action: AuditAction.FOLLOW_UP_TEMPLATE_UPDATED,
    metadata: { templateId: template.id, isDefault: template.isDefault },
    ipHash: input.ipHash
  });

  return template;
}

export async function deleteEmailTemplate(input: {
  userId: string;
  values: unknown;
  ipHash?: string | null;
}) {
  const parsed = deleteEmailTemplateSchema.parse(input.values);
  const template = await assertTemplateOwner(parsed.templateId, input.userId);

  await prisma.$transaction(async (tx) => {
    await tx.emailTemplate.delete({
      where: { id: template.id }
    });

    if (template.isDefault) {
      const replacement = await tx.emailTemplate.findFirst({
        where: { userId: input.userId },
        orderBy: [{ createdAt: "asc" }]
      });

      if (replacement) {
        await tx.emailTemplate.update({
          where: { id: replacement.id },
          data: { isDefault: true }
        });
      }
    }
  });

  await writeAuditLog({
    userId: input.userId,
    action: AuditAction.FOLLOW_UP_TEMPLATE_DELETED,
    metadata: { templateId: template.id, templateName: template.name },
    ipHash: input.ipHash
  });
}

export async function sendApplicationFollowUpEmail(input: {
  userId: string;
  values: unknown;
  ipHash?: string | null;
}) {
  const parsed = sendFollowUpEmailSchema.parse(input.values);
  const env = getEnv();

  const [application, user, template] = await Promise.all([
    prisma.jobApplication.findFirst({
      where: {
        id: parsed.applicationId,
        userId: input.userId
      }
    }),
    prisma.user.findUnique({
      where: { id: input.userId },
      select: {
        id: true,
        email: true,
        displayName: true
      }
    }),
    parsed.templateId
      ? prisma.emailTemplate.findFirst({
          where: {
            id: parsed.templateId,
            userId: input.userId
          }
        })
      : Promise.resolve(null)
  ]);

  if (!application) {
    throw new AppError("NOT_FOUND", "Candidature introuvable.", 404);
  }

  if (!user) {
    throw new AppError("NOT_FOUND", "Utilisateur introuvable.", 404);
  }

  if (parsed.templateId && !template) {
    throw new AppError("NOT_FOUND", "Template introuvable.", 404);
  }

  const context = buildFollowUpContext({
    application,
    user
  });

  const renderedSubject = renderTemplateString(parsed.subject, context);
  const renderedMessage = renderTemplateString(parsed.message, context);
  const emailContent = applicationFollowUpEmailTemplate({
    subject: renderedSubject,
    message: renderedMessage,
    companyName: application.companyName,
    roleTitle: application.roleTitle,
    applicationUrl: `${env.APP_URL}/applications/${application.id}/edit`
  });

  try {
    const delivery = await sendEmail({
      to: parsed.toEmail,
      replyTo: user.email,
      ...emailContent
    });

    const log = await createEmailLog({
      userId: input.userId,
      applicationId: application.id,
      templateId: template?.id ?? null,
      category: EmailCategory.APPLICATION_FOLLOW_UP,
      provider: delivery.provider,
      status: EmailLogStatus.SENT,
      toEmail: parsed.toEmail,
      fromEmail: delivery.from,
      subject: renderedSubject,
      htmlBody: emailContent.html,
      textBody: emailContent.text,
      providerMessageId: delivery.messageId,
      sentAt: new Date()
    });

    await writeAuditLog({
      userId: input.userId,
      action: AuditAction.FOLLOW_UP_EMAIL_SENT,
      metadata: {
        applicationId: application.id,
        emailLogId: log.id,
        toEmail: parsed.toEmail
      } satisfies Prisma.JsonObject,
      ipHash: input.ipHash
    });

    return log;
  } catch (error) {
    await createEmailLog({
      userId: input.userId,
      applicationId: application.id,
      templateId: template?.id ?? null,
      category: EmailCategory.APPLICATION_FOLLOW_UP,
      provider: getConfiguredEmailProvider(),
      status: EmailLogStatus.FAILED,
      toEmail: parsed.toEmail,
      fromEmail: env.SMTP_FROM,
      subject: renderedSubject,
      htmlBody: emailContent.html,
      textBody: emailContent.text,
      errorMessage: getSafeErrorMessage(
        error,
        "Impossible d'envoyer l'email de relance."
      )
    });

    throw error;
  }
}

export function getFollowUpTokens() {
  return getFollowUpTemplateTokens();
}

function buildFollowUpContext(input: {
  application: {
    companyName: string;
    roleTitle: string;
    hrContact: string | null;
    contactEmail: string | null;
    applicationDate: Date | null;
  };
  user: {
    email: string;
    displayName: string | null;
  };
}): FollowUpTemplateContext {
  return {
    companyName: input.application.companyName,
    roleTitle: input.application.roleTitle,
    contactName: input.application.hrContact,
    contactEmail: input.application.contactEmail,
    applicationDate: input.application.applicationDate,
    userName: getPreferredUserName(input.user.displayName, input.user.email),
    userEmail: input.user.email,
    today: new Date()
  };
}

async function ensureDefaultEmailTemplates(userId: string) {
  const count = await prisma.emailTemplate.count({
    where: { userId }
  });

  if (count > 0) {
    return;
  }

  await prisma.emailTemplate.createMany({
    data: defaultFollowUpTemplates.map((template) => ({
      userId,
      name: template.name,
      subjectTemplate: template.subjectTemplate,
      bodyTemplate: template.bodyTemplate,
      isDefault: template.isDefault
    }))
  });
}

async function assertTemplateOwner(templateId: string, userId: string) {
  const template = await prisma.emailTemplate.findFirst({
    where: {
      id: templateId,
      userId
    }
  });

  if (!template) {
    throw new AppError("NOT_FOUND", "Template introuvable.", 404);
  }

  return template;
}
