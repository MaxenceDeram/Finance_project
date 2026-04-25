"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSafeErrorMessage, type ActionState } from "@/lib/errors";
import { assertRateLimit } from "@/server/security/rate-limit";
import { assertSameOrigin, getRequestMetadata } from "@/server/security/request";
import { destroyCurrentSession, requireUser } from "@/server/security/sessions";
import { updateEmailPreferencesSchema } from "@/validation/preferences";
import {
  changePasswordSchema,
  updateProfileEmailSchema,
  updateProfileIdentitySchema
} from "@/validation/profile";
import {
  changeUserPassword,
  updateProfileEmail,
  updateProfileIdentity,
  updateUserPreferences
} from "./service";

export async function updateEmailPreferencesAction(
  _state: ActionState,
  formData: FormData
): Promise<ActionState> {
  const user = await requireUser();

  try {
    await assertSameOrigin();
    const raw = {
      dailyEmailEnabled: formData.get("dailyEmailEnabled") === "on",
      timezone: formData.get("timezone"),
      dailyEmailHour: formData.get("dailyEmailHour")
    };
    const parsed = updateEmailPreferencesSchema.safeParse(raw);

    if (!parsed.success) {
      return {
        ok: false,
        message: "Preferences invalides.",
        fieldErrors: parsed.error.flatten().fieldErrors
      };
    }

    await updateUserPreferences(user.id, parsed.data);
    revalidatePath("/settings/email");

    return { ok: true, message: "Preferences enregistrees." };
  } catch (error) {
    return { ok: false, message: getSafeErrorMessage(error) };
  }
}

export async function updateProfileIdentityAction(
  _state: ActionState,
  formData: FormData
): Promise<ActionState> {
  const user = await requireUser();

  try {
    await assertSameOrigin();
    const raw = {
      displayName: formData.get("displayName")
    };
    const parsed = updateProfileIdentitySchema.safeParse(raw);

    if (!parsed.success) {
      return {
        ok: false,
        message: "Verifiez les champs du formulaire.",
        fieldErrors: parsed.error.flatten().fieldErrors
      };
    }

    await updateProfileIdentity({
      userId: user.id,
      values: parsed.data
    });

    revalidatePath("/profile");
    revalidatePath("/dashboard");

    return { ok: true, message: "Profil mis a jour." };
  } catch (error) {
    return { ok: false, message: getSafeErrorMessage(error) };
  }
}

export async function updateProfileEmailAction(
  _state: ActionState,
  formData: FormData
): Promise<ActionState> {
  const user = await requireUser();
  let redirectTo: string | null = null;

  try {
    await assertSameOrigin();
    const request = await getRequestMetadata();
    assertRateLimit({
      key: `profile:email:${user.id}`,
      limit: 5,
      windowMs: 60 * 60 * 1000
    });

    const raw = {
      email: formData.get("email"),
      currentPassword: formData.get("currentPassword")
    };
    const parsed = updateProfileEmailSchema.safeParse(raw);

    if (!parsed.success) {
      return {
        ok: false,
        message: "Verifiez les champs du formulaire.",
        fieldErrors: parsed.error.flatten().fieldErrors
      };
    }

    const result = await updateProfileEmail({
      userId: user.id,
      values: parsed.data,
      ipHash: request.ipHash
    });

    if (!result.changed) {
      return { ok: true, message: "Adresse email inchangee." };
    }

    redirectTo = `/auth/resend-confirmation?email=${encodeURIComponent(result.email)}&sent=1`;
  } catch (error) {
    return { ok: false, message: getSafeErrorMessage(error) };
  }

  redirect(redirectTo ?? "/profile");
}

export async function changePasswordAction(
  _state: ActionState,
  formData: FormData
): Promise<ActionState> {
  const user = await requireUser();
  let redirectTo: string | null = null;

  try {
    await assertSameOrigin();
    const request = await getRequestMetadata();
    assertRateLimit({
      key: `profile:password:${user.id}`,
      limit: 5,
      windowMs: 60 * 60 * 1000
    });

    const raw = {
      currentPassword: formData.get("currentPassword"),
      newPassword: formData.get("newPassword"),
      confirmPassword: formData.get("confirmPassword")
    };
    const parsed = changePasswordSchema.safeParse(raw);

    if (!parsed.success) {
      return {
        ok: false,
        message: "Verifiez les champs du formulaire.",
        fieldErrors: parsed.error.flatten().fieldErrors
      };
    }

    await changeUserPassword({
      userId: user.id,
      values: parsed.data,
      ipHash: request.ipHash
    });

    await destroyCurrentSession();
    redirectTo = "/login";
  } catch (error) {
    return { ok: false, message: getSafeErrorMessage(error) };
  }

  redirect(redirectTo ?? "/login");
}
