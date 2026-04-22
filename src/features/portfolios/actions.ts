"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getSafeErrorMessage, type ActionState } from "@/lib/errors";
import { assertRateLimit } from "@/server/security/rate-limit";
import { assertSameOrigin, getRequestMetadata } from "@/server/security/request";
import { requireUser } from "@/server/security/sessions";
import { createPortfolioSchema, deletePortfolioSchema, updatePortfolioSchema } from "@/validation/portfolio";
import { createPortfolio, deletePortfolio, updatePortfolio } from "./service";

export async function createPortfolioAction(
  _state: ActionState,
  formData: FormData
): Promise<ActionState> {
  const user = await requireUser();
  let redirectTo: string | null = null;

  try {
    await assertSameOrigin();
    const request = await getRequestMetadata();
    assertRateLimit({
      key: `portfolio:create:${user.id}`,
      limit: 20,
      windowMs: 60 * 60 * 1000
    });

    const raw = {
      name: formData.get("name"),
      baseCurrency: formData.get("baseCurrency"),
      initialCash: formData.get("initialCash"),
      benchmarkSymbol: formData.get("benchmarkSymbol"),
      description: formData.get("description"),
      strategy: formData.get("strategy")
    };
    const parsed = createPortfolioSchema.safeParse(raw);

    if (!parsed.success) {
      return {
        ok: false,
        message: "Verifiez les champs du portefeuille.",
        fieldErrors: parsed.error.flatten().fieldErrors
      };
    }

    const portfolio = await createPortfolio({
      userId: user.id,
      values: parsed.data,
      ipHash: request.ipHash
    });

    redirectTo = `/portfolios/${portfolio.id}`;
  } catch (error) {
    return { ok: false, message: getSafeErrorMessage(error) };
  }

  redirect(redirectTo ?? "/portfolios");
}

export async function updatePortfolioAction(
  _state: ActionState,
  formData: FormData
): Promise<ActionState> {
  const user = await requireUser();

  try {
    await assertSameOrigin();
    const request = await getRequestMetadata();
    assertRateLimit({
      key: `portfolio:update:${user.id}`,
      limit: 60,
      windowMs: 60 * 60 * 1000
    });

    const portfolioId = formData.get("portfolioId");
    const raw = {
      name: formData.get("name"),
      benchmarkSymbol: formData.get("benchmarkSymbol"),
      description: formData.get("description"),
      strategy: formData.get("strategy")
    };
    const parsed = updatePortfolioSchema.safeParse(raw);

    if (typeof portfolioId !== "string" || !parsed.success) {
      return {
        ok: false,
        message: "Verifiez les champs du portefeuille.",
        fieldErrors: parsed.success ? undefined : parsed.error.flatten().fieldErrors
      };
    }

    await updatePortfolio({
      userId: user.id,
      portfolioId,
      values: parsed.data,
      ipHash: request.ipHash
    });

    revalidatePath(`/portfolios/${portfolioId}`);
    revalidatePath("/portfolios");

    return { ok: true, message: "Portefeuille mis a jour." };
  } catch (error) {
    return { ok: false, message: getSafeErrorMessage(error) };
  }
}

export async function deletePortfolioAction(
  _state: ActionState,
  formData: FormData
): Promise<ActionState> {
  const user = await requireUser();
  let redirectTo: string | null = null;

  try {
    await assertSameOrigin();
    const request = await getRequestMetadata();
    assertRateLimit({
      key: `portfolio:delete:${user.id}`,
      limit: 20,
      windowMs: 60 * 60 * 1000
    });

    const raw = {
      portfolioId: formData.get("portfolioId"),
      confirmationName: formData.get("confirmationName")
    };
    const parsed = deletePortfolioSchema.safeParse(raw);

    if (!parsed.success) {
      return {
        ok: false,
        message: "Confirmation invalide.",
        fieldErrors: parsed.error.flatten().fieldErrors
      };
    }

    await deletePortfolio({
      userId: user.id,
      values: parsed.data,
      ipHash: request.ipHash
    });

    revalidatePath("/dashboard");
    revalidatePath("/portfolios");
    redirectTo = "/portfolios";
  } catch (error) {
    return { ok: false, message: getSafeErrorMessage(error) };
  }

  redirect(redirectTo ?? "/portfolios");
}
