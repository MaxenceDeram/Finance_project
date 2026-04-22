"use server";

import { revalidatePath } from "next/cache";
import { getSafeErrorMessage, type ActionState } from "@/lib/errors";
import { assertRateLimit } from "@/server/security/rate-limit";
import { assertSameOrigin, getRequestMetadata } from "@/server/security/request";
import { requireAdmin } from "@/server/security/sessions";
import {
  resendUserConfirmationFromAdmin,
  triggerDailySummaryFromAdmin,
  updateUserRoleFromAdmin,
  updateUserStatusFromAdmin
} from "./service";

export async function adminResendConfirmationAction(
  _state: ActionState,
  formData: FormData
): Promise<ActionState> {
  const actor = await requireAdmin();

  try {
    await assertSameOrigin();
    const request = await getRequestMetadata();
    assertRateLimit({
      key: `admin:resend:${actor.id}`,
      limit: 20,
      windowMs: 60 * 60 * 1000
    });

    await resendUserConfirmationFromAdmin({
      actor,
      values: { userId: formData.get("userId") },
      ipHash: request.ipHash
    });

    revalidatePath("/admin/users");
    return { ok: true, message: "Email de confirmation renvoye." };
  } catch (error) {
    return { ok: false, message: getSafeErrorMessage(error) };
  }
}

export async function adminUpdateUserRoleAction(
  _state: ActionState,
  formData: FormData
): Promise<ActionState> {
  const actor = await requireAdmin();

  try {
    await assertSameOrigin();
    const request = await getRequestMetadata();
    await updateUserRoleFromAdmin({
      actor,
      values: {
        userId: formData.get("userId"),
        role: formData.get("role")
      },
      ipHash: request.ipHash
    });

    revalidatePath("/admin/users");
    return { ok: true, message: "Role mis a jour." };
  } catch (error) {
    return { ok: false, message: getSafeErrorMessage(error) };
  }
}

export async function adminUpdateUserStatusAction(
  _state: ActionState,
  formData: FormData
): Promise<ActionState> {
  const actor = await requireAdmin();

  try {
    await assertSameOrigin();
    const request = await getRequestMetadata();
    await updateUserStatusFromAdmin({
      actor,
      values: {
        userId: formData.get("userId"),
        status: formData.get("status")
      },
      ipHash: request.ipHash
    });

    revalidatePath("/admin/users");
    return { ok: true, message: "Statut mis a jour." };
  } catch (error) {
    return { ok: false, message: getSafeErrorMessage(error) };
  }
}

export async function adminRunDailySummaryAction(
  _state: ActionState,
  _formData: FormData
): Promise<ActionState> {
  void _state;
  void _formData;

  const actor = await requireAdmin();

  try {
    await assertSameOrigin();
    const request = await getRequestMetadata();
    assertRateLimit({
      key: `admin:job:daily-summary:${actor.id}`,
      limit: 5,
      windowMs: 60 * 60 * 1000
    });

    const result = await triggerDailySummaryFromAdmin({
      actor,
      ipHash: request.ipHash
    });

    revalidatePath("/admin/jobs");
    revalidatePath("/admin/email-logs");
    return {
      ok: true,
      message: `Job execute: ${result.processedPortfolios} portefeuille(s) traite(s).`
    };
  } catch (error) {
    return { ok: false, message: getSafeErrorMessage(error) };
  }
}
