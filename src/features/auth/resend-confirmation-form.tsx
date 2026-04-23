"use client";

import { Mail, MoveRight } from "lucide-react";
import { useActionState } from "react";
import { resendConfirmationAction } from "@/features/auth/actions";
import { initialActionState } from "@/lib/errors";
import { SubmitButton } from "@/components/forms/submit-button";
import { Alert } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ResendConfirmationForm({ email }: { email?: string }) {
  const [state, action] = useActionState(resendConfirmationAction, initialActionState);

  return (
    <form action={action} className="space-y-5">
      {state.message ? <Alert>{state.message}</Alert> : null}
      <div className="space-y-2">
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
            defaultValue={email}
            required
            className="pl-11"
          />
        </div>
      </div>
      <SubmitButton className="w-full">
        Renvoyer le lien de confirmation
        <MoveRight aria-hidden="true" />
      </SubmitButton>
    </form>
  );
}
