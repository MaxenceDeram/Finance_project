"use client";

import Link from "next/link";
import { LockKeyhole, Mail, MoveRight } from "lucide-react";
import { useActionState } from "react";
import { loginAction } from "@/features/auth/actions";
import { initialActionState } from "@/lib/errors";
import { SubmitButton } from "@/components/forms/submit-button";
import { Alert } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginForm({ next }: { next?: string }) {
  const [state, action] = useActionState(loginAction, initialActionState);

  return (
    <form action={action} className="space-y-5">
      {state.message ? <Alert data-motion-field>{state.message}</Alert> : null}
      <input type="hidden" name="next" value={next ?? "/dashboard"} />

      <div className="space-y-2" data-motion-field>
        <Label htmlFor="email">Email</Label>
        <div className="relative">
          <Mail
            className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="nom@email.com"
            className="pl-11"
          />
        </div>
      </div>

      <div className="space-y-2" data-motion-field>
        <div className="flex items-center justify-between gap-3">
          <Label htmlFor="password">Mot de passe</Label>
          <Link
            href="/auth/resend-confirmation"
            className="text-xs font-medium text-muted-foreground transition hover:text-foreground"
          >
            Renvoyer un lien de confirmation
          </Link>
        </div>
        <div className="relative">
          <LockKeyhole
            className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            placeholder="Votre mot de passe"
            className="pl-11"
          />
        </div>
      </div>

      <SubmitButton className="mt-2 w-full" data-motion-field>
        Se connecter
        <MoveRight aria-hidden="true" />
      </SubmitButton>

      <div
        className="rounded-2xl border border-border bg-[#f8faff] px-4 py-3 text-sm text-muted-foreground"
        data-motion-field
      >
        Acces securise, email verifie et espace prive pour vos candidatures.
      </div>

      <p className="text-center text-sm text-muted-foreground" data-motion-field>
        Nouveau sur Waren ?{" "}
        <Link
          href="/register"
          className="font-semibold text-foreground underline-offset-4 hover:underline"
        >
          Creer un compte
        </Link>
      </p>
    </form>
  );
}
