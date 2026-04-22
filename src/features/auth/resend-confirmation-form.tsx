"use client";

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
    <form action={action} className="space-y-4">
      {state.message ? <Alert>{state.message}</Alert> : null}
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" defaultValue={email} required />
      </div>
      <SubmitButton className="w-full">Renvoyer le lien</SubmitButton>
    </form>
  );
}
