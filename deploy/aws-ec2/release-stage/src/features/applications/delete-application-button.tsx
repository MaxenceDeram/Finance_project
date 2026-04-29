"use client";

import { Trash2 } from "lucide-react";
import { useActionState } from "react";
import { initialActionState } from "@/lib/errors";
import { SubmitButton } from "@/components/forms/submit-button";
import { deleteJobApplicationAction } from "./actions";

export function DeleteApplicationButton({
  applicationId,
  companyName,
  compact = false
}: {
  applicationId: string;
  companyName: string;
  compact?: boolean;
}) {
  const [state, action] = useActionState(deleteJobApplicationAction, initialActionState);

  return (
    <form
      action={action}
      className="inline-flex items-center gap-2"
      onSubmit={(event) => {
        const confirmed = window.confirm(
          `Supprimer la candidature ${companyName} ? Cette action est definitive.`
        );

        if (!confirmed) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="applicationId" value={applicationId} />
      <SubmitButton
        type="submit"
        variant="ghost"
        size={compact ? "sm" : "default"}
        aria-label={`Supprimer ${companyName}`}
        className="text-muted-foreground hover:text-[color:var(--negative)]"
      >
        <Trash2 aria-hidden="true" />
        {compact ? <span className="sr-only">Supprimer</span> : "Supprimer la candidature"}
      </SubmitButton>
      {state.message && !state.ok ? (
        <span className="text-xs text-[color:var(--negative)]">{state.message}</span>
      ) : null}
    </form>
  );
}
