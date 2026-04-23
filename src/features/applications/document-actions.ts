"use server";

import { revalidatePath } from "next/cache";
import { getSafeErrorMessage, type ActionState } from "@/lib/errors";
import { assertRateLimit } from "@/server/security/rate-limit";
import { assertSameOrigin, getRequestMetadata } from "@/server/security/request";
import { requireUser } from "@/server/security/sessions";
import { deleteApplicationDocument, uploadApplicationDocument } from "./document-service";

export async function uploadApplicationDocumentAction(
  _state: ActionState,
  formData: FormData
): Promise<ActionState> {
  const user = await requireUser();

  try {
    await assertSameOrigin();
    const request = await getRequestMetadata();
    assertRateLimit({
      key: `application:document:upload:${user.id}`,
      limit: 40,
      windowMs: 60 * 60 * 1000
    });

    const applicationId =
      typeof formData.get("applicationId") === "string"
        ? (formData.get("applicationId") as string)
        : "";

    await uploadApplicationDocument({
      userId: user.id,
      values: {
        applicationId,
        documentType: formData.get("documentType")
      },
      file: formData.get("file") as File,
      ipHash: request.ipHash
    });

    revalidatePath(`/applications/${applicationId}/edit`);
    revalidatePath("/applications");
    return { ok: true, message: "Document ajoute." };
  } catch (error) {
    return { ok: false, message: getSafeErrorMessage(error) };
  }
}

export async function deleteApplicationDocumentAction(
  _state: ActionState,
  formData: FormData
): Promise<ActionState> {
  const user = await requireUser();

  try {
    await assertSameOrigin();
    const request = await getRequestMetadata();
    assertRateLimit({
      key: `application:document:delete:${user.id}`,
      limit: 80,
      windowMs: 60 * 60 * 1000
    });

    const applicationId =
      typeof formData.get("applicationId") === "string"
        ? (formData.get("applicationId") as string)
        : "";

    await deleteApplicationDocument({
      userId: user.id,
      values: {
        documentId: formData.get("documentId")
      },
      ipHash: request.ipHash
    });

    revalidatePath(`/applications/${applicationId}/edit`);
    revalidatePath("/applications");
    return { ok: true, message: "Document supprime." };
  } catch (error) {
    return { ok: false, message: getSafeErrorMessage(error) };
  }
}
