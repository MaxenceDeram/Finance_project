"use server";

import { AuditAction } from "@prisma/client";
import { redirect } from "next/navigation";
import { getSafeErrorMessage, type ActionState } from "@/lib/errors";
import { safeRedirectPath } from "@/lib/utils";
import { writeAuditLog } from "@/server/security/audit";
import { assertRateLimit } from "@/server/security/rate-limit";
import { assertSameOrigin, getRequestMetadata } from "@/server/security/request";
import { destroyCurrentSession } from "@/server/security/sessions";
import {
  loginSchema,
  registerSchema,
  resendConfirmationSchema
} from "@/validation/auth";
import { loginUser, registerUser, resendConfirmationEmail } from "./service";

export async function registerAction(_state: ActionState, formData: FormData): Promise<ActionState> {
  let redirectTo: string | null = null;

  try {
    await assertSameOrigin();
    const request = await getRequestMetadata();
    assertRateLimit({
      key: `register:${request.ip ?? "unknown"}`,
      limit: 5,
      windowMs: 15 * 60 * 1000
    });

    const parsed = registerSchema.safeParse({
      email: formData.get("email"),
      password: formData.get("password"),
      confirmPassword: formData.get("confirmPassword")
    });

    if (!parsed.success) {
      return {
        ok: false,
        message: "Verifiez les champs du formulaire.",
        fieldErrors: parsed.error.flatten().fieldErrors
      };
    }

    await registerUser({
      email: parsed.data.email,
      password: parsed.data.password,
      ipHash: request.ipHash
    });

    redirectTo = `/auth/resend-confirmation?email=${encodeURIComponent(parsed.data.email)}&sent=1`;
  } catch (error) {
    return { ok: false, message: getSafeErrorMessage(error) };
  }

  redirect(redirectTo);
}

export async function loginAction(_state: ActionState, formData: FormData): Promise<ActionState> {
  let redirectTo: string | null = null;

  try {
    await assertSameOrigin();
    const request = await getRequestMetadata();
    assertRateLimit({
      key: `login:${request.ip ?? "unknown"}`,
      limit: 8,
      windowMs: 15 * 60 * 1000
    });

    const parsed = loginSchema.safeParse({
      email: formData.get("email"),
      password: formData.get("password"),
      next: formData.get("next")
    });

    if (!parsed.success) {
      return {
        ok: false,
        message: "Identifiants invalides.",
        fieldErrors: parsed.error.flatten().fieldErrors
      };
    }

    await loginUser({
      email: parsed.data.email,
      password: parsed.data.password,
      userAgent: request.userAgent,
      ipHash: request.ipHash
    });

    redirectTo = safeRedirectPath(parsed.data.next);
  } catch (error) {
    return { ok: false, message: getSafeErrorMessage(error, "Identifiants invalides.") };
  }

  redirect(redirectTo);
}

export async function resendConfirmationAction(
  _state: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    await assertSameOrigin();
    const request = await getRequestMetadata();
    assertRateLimit({
      key: `resend:${request.ip ?? "unknown"}`,
      limit: 3,
      windowMs: 15 * 60 * 1000
    });

    const parsed = resendConfirmationSchema.safeParse({
      email: formData.get("email")
    });

    if (!parsed.success) {
      return {
        ok: false,
        message: "Adresse email invalide.",
        fieldErrors: parsed.error.flatten().fieldErrors
      };
    }

    await resendConfirmationEmail({ email: parsed.data.email, ipHash: request.ipHash });

    return {
      ok: true,
      message:
        "Si un compte non confirme existe pour cette adresse, un nouvel email vient d'etre envoye."
    };
  } catch (error) {
    return { ok: false, message: getSafeErrorMessage(error) };
  }
}

export async function logoutAction() {
  const request = await getRequestMetadata();
  await destroyCurrentSession();
  await writeAuditLog({
    action: AuditAction.LOGOUT,
    ipHash: request.ipHash
  });
  redirect("/login");
}
