import { EmailPreferencesForm } from "@/features/users/email-preferences-form";
import { getUserPreferences } from "@/features/users/service";
import { requireUser } from "@/server/security/sessions";

export default async function EmailSettingsPage() {
  const user = await requireUser();
  const preferences = await getUserPreferences(user.id);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-normal text-muted-foreground">
          Notifications
        </p>
        <h1 className="mt-2 text-4xl font-semibold tracking-normal">Emails quotidiens</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Ces preferences pilotent l'envoi automatique du recapitulatif Waren apres
          cloture du marche.
        </p>
      </div>
      <EmailPreferencesForm preferences={preferences} />
    </div>
  );
}
