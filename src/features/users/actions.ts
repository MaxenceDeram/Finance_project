"use server";

import { revalidatePath } from "next/cache";
import { getSafeErrorMessage, type ActionState } from "@/lib/errors";
import { assertSameOrigin } from "@/server/security/request";
import { requireUser } from "@/server/security/sessions";
import { updateEmailPreferencesSchema } from "@/validation/preferences";
import { updateUserPreferences } from "./service";

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
      preferredCurrency: formData.get("preferredCurrency"),
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
