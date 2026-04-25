import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmailLogStatusBadge } from "@/features/emails/email-log-status-badge";
import { EmailTemplateManager } from "@/features/emails/email-template-manager";
import { getFollowUpTokens, listEmailTemplatesForUser, listRecentEmailLogsForUser } from "@/features/emails/service";
import { EmailPreferencesForm } from "@/features/users/email-preferences-form";
import { getUserPreferences } from "@/features/users/service";
import { formatDateTime } from "@/lib/dates";
import { requireUser } from "@/server/security/sessions";

export default async function EmailSettingsPage() {
  const user = await requireUser();
  const [preferences, templates, recentLogs] = await Promise.all([
    getUserPreferences(user.id),
    listEmailTemplatesForUser(user.id),
    listRecentEmailLogsForUser(user.id, 10)
  ]);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-normal text-muted-foreground">
          Notifications
        </p>
        <h1 className="mt-2 text-4xl font-semibold tracking-normal">Rappels email</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Configurez le recap quotidien, vos templates de relance et consultez les
          derniers emails envoyes depuis Waren.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_360px]">
        <div className="space-y-6">
          <EmailPreferencesForm preferences={preferences} />
          <EmailTemplateManager
            templates={templates.map((template) => ({
              id: template.id,
              name: template.name,
              subjectTemplate: template.subjectTemplate,
              bodyTemplate: template.bodyTemplate,
              isDefault: template.isDefault
            }))}
            tokens={getFollowUpTokens()}
          />
        </div>

        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Activite email recente</CardTitle>
            <CardDescription>
              Historique recent des confirmations, recaps quotidiens et relances envoyees.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentLogs.length > 0 ? (
              recentLogs.map((log) => (
                <div
                  key={log.id}
                  className="rounded-[22px] border border-border/70 bg-[#fbfcff] p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="space-y-1">
                      <p className="text-sm font-semibold">{log.subject}</p>
                      <p className="text-xs text-muted-foreground">
                        {log.category} • {log.provider} • {log.toEmail}
                      </p>
                    </div>
                    <EmailLogStatusBadge status={log.status} />
                  </div>
                  <p className="mt-3 text-xs text-muted-foreground">
                    {formatDateTime(log.sentAt ?? log.createdAt)}
                  </p>
                  {log.application ? (
                    <Link
                      href={`/applications/${log.applicationId}/edit`}
                      className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-foreground hover:text-[color:var(--brand-primary)]"
                    >
                      {log.application.companyName} • {log.application.roleTitle}
                      <ArrowUpRight className="size-4" aria-hidden="true" />
                    </Link>
                  ) : null}
                  {log.errorMessage ? (
                    <p className="mt-2 text-sm text-[color:var(--negative)]">
                      {log.errorMessage}
                    </p>
                  ) : null}
                </div>
              ))
            ) : (
              <p className="text-sm leading-6 text-muted-foreground">
                Aucun email n&apos;a encore ete emis depuis votre espace.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
