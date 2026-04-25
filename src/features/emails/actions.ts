"use server";

import { revalidatePath } from "next/cache";
import type { ActionState } from "@/lib/errors";
import { getSafeErrorMessage } from "@/lib/errors";
import { assertRateLimit } from "@/server/security/rate-limit";
import { assertSameOrigin, getRequestMetadata } from "@/server/security/request";
import { requireUser } from "@/server/security/sessions";
import {
  createEmailTemplateSchema,
  deleteEmailTemplateSchema,
  sendFollowUpEmailSchema,
  updateEmailTemplateSchema
} from "@/validation/email";
import {
  createEmailTemplate,
  deleteEmailTemplate,
  sendApplicationFollowUpEmail,
  updateEmailTemplate
} from "./service";

export async function createEmailTemplateAction(
  _state: ActionState,
  formData: FormData
): Promise<ActionState> {
  const user = await requireUser();

  try {
    await assertSameOrigin();
    const request = await getRequestMetadata();
    assertRateLimit({
      key: `email-template:create:${user.id}`,
      limit: 30,
      windowMs: 60 * 60 * 1000
    });

    const raw = {
      name: formData.get("name"),
      subjectTemplate: formData.get("subjectTemplate"),
      bodyTemplate: formData.get("bodyTemplate"),
      isDefault: formData.get("isDefault") === "on"
    };
    const parsed = createEmailTemplateSchema.safeParse(raw);

    if (!parsed.success) {
      return {
        ok: false,
        message: "Verifiez les champs du template.",
        fieldErrors: parsed.error.flatten().fieldErrors
      };
    }

    await createEmailTemplate({
      userId: user.id,
      values: parsed.data,
      ipHash: request.ipHash
    });

    revalidatePath("/settings/email");
    return { ok: true, message: "Template cree." };
  } catch (error) {
    return { ok: false, message: getSafeErrorMessage(error) };
  }
}

export async function updateEmailTemplateAction(
  _state: ActionState,
  formData: FormData
): Promise<ActionState> {
  const user = await requireUser();

  try {
    await assertSameOrigin();
    const request = await getRequestMetadata();
    assertRateLimit({
      key: `email-template:update:${user.id}`,
      limit: 60,
      windowMs: 60 * 60 * 1000
    });

    const raw = {
      templateId: formData.get("templateId"),
      name: formData.get("name"),
      subjectTemplate: formData.get("subjectTemplate"),
      bodyTemplate: formData.get("bodyTemplate"),
      isDefault: formData.get("isDefault") === "on"
    };
    const parsed = updateEmailTemplateSchema.safeParse(raw);

    if (!parsed.success) {
      return {
        ok: false,
        message: "Verifiez les champs du template.",
        fieldErrors: parsed.error.flatten().fieldErrors
      };
    }

    await updateEmailTemplate({
      userId: user.id,
      values: parsed.data,
      ipHash: request.ipHash
    });

    revalidatePath("/settings/email");
    return { ok: true, message: "Template mis a jour." };
  } catch (error) {
    return { ok: false, message: getSafeErrorMessage(error) };
  }
}

export async function deleteEmailTemplateAction(
  _state: ActionState,
  formData: FormData
): Promise<ActionState> {
  const user = await requireUser();

  try {
    await assertSameOrigin();
    const request = await getRequestMetadata();
    assertRateLimit({
      key: `email-template:delete:${user.id}`,
      limit: 30,
      windowMs: 60 * 60 * 1000
    });

    const raw = {
      templateId: formData.get("templateId")
    };
    const parsed = deleteEmailTemplateSchema.safeParse(raw);

    if (!parsed.success) {
      return {
        ok: false,
        message: "Suppression invalide.",
        fieldErrors: parsed.error.flatten().fieldErrors
      };
    }

    await deleteEmailTemplate({
      userId: user.id,
      values: parsed.data,
      ipHash: request.ipHash
    });

    revalidatePath("/settings/email");
    return { ok: true, message: "Template supprime." };
  } catch (error) {
    return { ok: false, message: getSafeErrorMessage(error) };
  }
}

export async function sendApplicationFollowUpEmailAction(
  _state: ActionState,
  formData: FormData
): Promise<ActionState> {
  const user = await requireUser();

  try {
    await assertSameOrigin();
    const request = await getRequestMetadata();
    assertRateLimit({
      key: `follow-up:send:${user.id}`,
      limit: 25,
      windowMs: 60 * 60 * 1000
    });

    const raw = {
      applicationId: formData.get("applicationId"),
      templateId: formData.get("templateId"),
      toEmail: formData.get("toEmail"),
      subject: formData.get("subject"),
      message: formData.get("message")
    };
    const parsed = sendFollowUpEmailSchema.safeParse(raw);

    if (!parsed.success) {
      return {
        ok: false,
        message: "Verifiez le message avant envoi.",
        fieldErrors: parsed.error.flatten().fieldErrors
      };
    }

    await sendApplicationFollowUpEmail({
      userId: user.id,
      values: parsed.data,
      ipHash: request.ipHash
    });

    revalidatePath(`/applications/${parsed.data.applicationId}/edit`);
    revalidatePath("/settings/email");
    revalidatePath("/admin/email-logs");

    return { ok: true, message: "Email de relance envoye." };
  } catch (error) {
    return { ok: false, message: getSafeErrorMessage(error) };
  }
}
