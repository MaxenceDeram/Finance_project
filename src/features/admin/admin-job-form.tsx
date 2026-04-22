"use client";

import { Play } from "lucide-react";
import { useActionState } from "react";
import { adminRunDailySummaryAction } from "@/features/admin/actions";
import { initialActionState } from "@/lib/errors";
import { SubmitButton } from "@/components/forms/submit-button";
import { Alert } from "@/components/ui/alert";

export function AdminDailySummaryJobForm() {
  const [state, action] = useActionState(adminRunDailySummaryAction, initialActionState);

  return (
    <form action={action} className="space-y-4">
      {state.message ? <Alert>{state.message}</Alert> : null}
      <p className="text-sm leading-6 text-muted-foreground">
        Lance le recalcul des snapshots et l'envoi des emails quotidiens aux utilisateurs eligibles.
        L'action est auditee.
      </p>
      <SubmitButton>
        <Play aria-hidden="true" />
        Lancer maintenant
      </SubmitButton>
    </form>
  );
}
