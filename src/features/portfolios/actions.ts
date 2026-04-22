"use server";

import { redirect } from "next/navigation";
import { getSafeErrorMessage, type ActionState } from "@/lib/errors";
import { assertRateLimit } from "@/server/security/rate-limit";
import { assertSameOrigin, getRequestMetadata } from "@/server/security/request";
import { requireUser } from "@/server/security/sessions";
import { createPortfolioSchema } from "@/validation/portfolio";
import { createPortfolio } from "./service";

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
