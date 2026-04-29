"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSafeErrorMessage, type ActionState } from "@/lib/errors";
import { assertRateLimit } from "@/server/security/rate-limit";
import { assertSameOrigin, getRequestMetadata } from "@/server/security/request";
import { requireUser } from "@/server/security/sessions";
import {
  createApplicationSchema,
  deleteApplicationSchema,
  updateApplicationSchema
} from "@/validation/applications";
import {
  createJobApplication,
  deleteJobApplication,
  updateJobApplication
} from "./service";

export async function createJobApplicationAction(
  _state: ActionState,
  formData: FormData
): Promise<ActionState> {
  const user = await requireUser();
  let redirectTo: string | null = null;

  try {
    await assertSameOrigin();
    const request = await getRequestMetadata();
    assertRateLimit({
      key: `application:create:${user.id}`,
      limit: 40,
      windowMs: 60 * 60 * 1000
    });

    const raw = {
      companyName: formData.get("companyName"),
      roleTitle: formData.get("roleTitle"),
      contractType: formData.get("contractType"),
      location: formData.get("location"),
      applicationDate: formData.get("applicationDate"),
      status: formData.get("status"),
      listingUrl: formData.get("listingUrl"),
      hrContact: formData.get("hrContact"),
      compensation: formData.get("compensation"),
      notes: formData.get("notes"),
      followUpDate: formData.get("followUpDate")
    };
    const parsed = createApplicationSchema.safeParse(raw);

    if (!parsed.success) {
      return {
        ok: false,
        message: "Verifiez les champs de la candidature.",
        fieldErrors: parsed.error.flatten().fieldErrors
      };
    }

    const application = await createJobApplication({
      userId: user.id,
      values: parsed.data,
      ipHash: request.ipHash
    });

    revalidatePath("/dashboard");
    revalidatePath("/applications");
    redirectTo = `/applications/${application.id}/edit?created=1`;
  } catch (error) {
    return { ok: false, message: getSafeErrorMessage(error) };
  }

  redirect(redirectTo ?? "/applications");
}

export async function updateJobApplicationAction(
  _state: ActionState,
  formData: FormData
): Promise<ActionState> {
  const user = await requireUser();

  try {
    await assertSameOrigin();
    const request = await getRequestMetadata();
    assertRateLimit({
      key: `application:update:${user.id}`,
      limit: 100,
      windowMs: 60 * 60 * 1000
    });

    const raw = {
      applicationId: formData.get("applicationId"),
      companyName: formData.get("companyName"),
      roleTitle: formData.get("roleTitle"),
      contractType: formData.get("contractType"),
      location: formData.get("location"),
      applicationDate: formData.get("applicationDate"),
      status: formData.get("status"),
      listingUrl: formData.get("listingUrl"),
      hrContact: formData.get("hrContact"),
      compensation: formData.get("compensation"),
      notes: formData.get("notes"),
      followUpDate: formData.get("followUpDate")
    };
    const parsed = updateApplicationSchema.safeParse(raw);

    if (!parsed.success) {
      return {
        ok: false,
        message: "Verifiez les champs de la candidature.",
        fieldErrors: parsed.error.flatten().fieldErrors
      };
    }

    const application = await updateJobApplication({
      userId: user.id,
      values: parsed.data,
      ipHash: request.ipHash
    });

    revalidatePath("/dashboard");
    revalidatePath("/applications");
    revalidatePath(`/applications/${application.id}/edit`);

    return { ok: true, message: "Candidature mise a jour." };
  } catch (error) {
    return { ok: false, message: getSafeErrorMessage(error) };
  }
}

export async function deleteJobApplicationAction(
  _state: ActionState,
  formData: FormData
): Promise<ActionState> {
  const user = await requireUser();
  let redirectTo: string | null = null;

  try {
    await assertSameOrigin();
    const request = await getRequestMetadata();
    assertRateLimit({
      key: `application:delete:${user.id}`,
      limit: 30,
      windowMs: 60 * 60 * 1000
    });

    const raw = {
      applicationId: formData.get("applicationId")
    };
    const parsed = deleteApplicationSchema.safeParse(raw);

    if (!parsed.success) {
      return {
        ok: false,
        message: "Suppression invalide.",
        fieldErrors: parsed.error.flatten().fieldErrors
      };
    }

    await deleteJobApplication({
      userId: user.id,
      values: parsed.data,
      ipHash: request.ipHash
    });

    revalidatePath("/dashboard");
    revalidatePath("/applications");
    redirectTo = "/applications";
  } catch (error) {
    return { ok: false, message: getSafeErrorMessage(error) };
  }

  redirect(redirectTo ?? "/applications");
}
