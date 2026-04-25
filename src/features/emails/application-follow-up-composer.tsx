"use client";

import { Mail, Send, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useMemo, useState } from "react";
import { SubmitButton } from "@/components/forms/submit-button";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { formatDateTime } from "@/lib/dates";
import { initialActionState } from "@/lib/errors";
import { renderTemplateString } from "@/features/applications/follow-up-template-engine";
import { sendApplicationFollowUpEmailAction } from "./actions";
import { EmailLogStatusBadge } from "./email-log-status-badge";

type TemplateItem = {
  id: string;
  name: string;
  subjectTemplate: string;
  bodyTemplate: string;
  isDefault: boolean;
};

type EmailLogItem = {
  id: string;
  status: "SENT" | "FAILED";
  provider: string;
  toEmail: string;
  subject: string;
  templateName?: string | null;
  sentAt?: string | null;
  createdAt: string;
  errorMessage?: string | null;
};

type TemplateContext = {
  companyName: string;
  roleTitle: string;
  contactName?: string | null;
  contactEmail?: string | null;
  applicationDate?: string | null;
  userName: string;
  userEmail: string;
};

export function ApplicationFollowUpComposer({
  applicationId,
  defaultToEmail,
  templates,
  templateTokens,
  templateContext,
  history
}: {
  applicationId: string;
  defaultToEmail?: string | null;
  templates: TemplateItem[];
  templateTokens: string[];
  templateContext: TemplateContext;
  history: EmailLogItem[];
}) {
  const router = useRouter();
  const [state, action] = useActionState(
    sendApplicationFollowUpEmailAction,
    initialActionState
  );
  const templatesById = useMemo(
    () => new Map(templates.map((template) => [template.id, template])),
    [templates]
  );
  const defaultTemplate = templates.find((template) => template.isDefault) ?? templates[0];
  const [selectedTemplateId, setSelectedTemplateId] = useState(defaultTemplate?.id ?? "");
  const [subject, setSubject] = useState(() =>
    defaultTemplate
      ? renderClientTemplate(defaultTemplate.subjectTemplate, templateContext)
      : ""
  );
  const [message, setMessage] = useState(() =>
    defaultTemplate ? renderClientTemplate(defaultTemplate.bodyTemplate, templateContext) : ""
  );

  useEffect(() => {
    if (state.ok) {
      router.refresh();
    }
  }, [router, state.ok]);

  const previewSubject = renderClientTemplate(subject, templateContext);
  const previewMessage = renderClientTemplate(message, templateContext);

  function applySelectedTemplate() {
    const template = templatesById.get(selectedTemplateId);

    if (!template) {
      return;
    }

    setSubject(renderClientTemplate(template.subjectTemplate, templateContext));
    setMessage(renderClientTemplate(template.bodyTemplate, templateContext));
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.08fr)_360px]">
      <Card>
        <CardHeader>
          <CardTitle>Envoyer une relance</CardTitle>
          <CardDescription>
            Chargez un template, ajustez le message puis envoyez-le via Waren avec un
            historique propre de chaque tentative.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {state.message ? <Alert>{state.message}</Alert> : null}

          <form action={action} className="grid gap-5">
            <input type="hidden" name="applicationId" value={applicationId} />
            <input type="hidden" name="templateId" value={selectedTemplateId} />

            <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_160px]">
              <div className="grid gap-2">
                <Label htmlFor="followUpTemplate">Template</Label>
                <Select
                  id="followUpTemplate"
                  value={selectedTemplateId}
                  onChange={(event) => setSelectedTemplateId(event.target.value)}
                >
                  {templates.map((template) => (
                    <option key={template.id} value={template.id}>
                      {template.name}
                      {template.isDefault ? " • Defaut" : ""}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="flex items-end">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={applySelectedTemplate}
                >
                  <Sparkles aria-hidden="true" />
                  Charger
                </Button>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="toEmail">Destinataire</Label>
              <Input
                id="toEmail"
                name="toEmail"
                type="email"
                defaultValue={defaultToEmail ?? ""}
                placeholder="recruteur@entreprise.com"
              />
              <FieldError error={state.fieldErrors?.toEmail?.[0]} />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="subject">Sujet</Label>
              <Input
                id="subject"
                name="subject"
                value={subject}
                onChange={(event) => setSubject(event.target.value)}
                placeholder="Relance - {{roleTitle}} chez {{companyName}}"
              />
              <FieldError error={state.fieldErrors?.subject?.[0]} />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                name="message"
                rows={12}
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="Bonjour {{contactName}}, ..."
              />
              <FieldError error={state.fieldErrors?.message?.[0]} />
            </div>

            <div className="flex flex-wrap gap-2">
              {templateTokens.map((token) => (
                <Badge key={token} variant="secondary">
                  {token}
                </Badge>
              ))}
            </div>

            <SubmitButton>
              <Send aria-hidden="true" />
              Envoyer la relance
            </SubmitButton>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-6">
        <Card className="premium-dark-card overflow-hidden border-transparent text-white">
          <CardHeader>
            <div className="inline-flex size-10 items-center justify-center rounded-2xl bg-white/10 text-white">
              <Mail className="size-4" aria-hidden="true" />
            </div>
            <CardTitle className="mt-4 text-white">Apercu avant envoi</CardTitle>
            <CardDescription className="text-white/68">
              Les variables sont resolues ici exactement comme lors de l&apos;envoi.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-[22px] border border-white/10 bg-white/6 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/55">
                Sujet
              </p>
              <p className="mt-2 text-sm font-semibold text-white">{previewSubject}</p>
            </div>
            <div className="rounded-[22px] border border-white/10 bg-white/6 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/55">
                Message
              </p>
              <div className="mt-3 whitespace-pre-wrap text-sm leading-7 text-white/82">
                {previewMessage || "Le message apparaitra ici."}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Historique des relances</CardTitle>
            <CardDescription>
              Chaque tentative est tracee avec son statut, le provider utilise et le
              sujet envoye.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {history.length > 0 ? (
              history.map((item) => (
                <div
                  key={item.id}
                  className="rounded-[22px] border border-border/70 bg-[#fbfcff] p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="space-y-1">
                      <p className="text-sm font-semibold">{item.subject}</p>
                      <p className="text-xs text-muted-foreground">
                        Vers {item.toEmail} • {item.templateName || "Sans template"} •{" "}
                        {item.provider}
                      </p>
                    </div>
                    <EmailLogStatusBadge status={item.status} />
                  </div>
                  <p className="mt-3 text-xs text-muted-foreground">
                    {item.sentAt
                      ? `Envoye le ${formatDateTime(new Date(item.sentAt))}`
                      : `Tente le ${formatDateTime(new Date(item.createdAt))}`}
                  </p>
                  {item.errorMessage ? (
                    <p className="mt-2 text-sm text-[color:var(--negative)]">
                      {item.errorMessage}
                    </p>
                  ) : null}
                </div>
              ))
            ) : (
              <p className="text-sm leading-6 text-muted-foreground">
                Aucune relance n&apos;a encore ete envoyee pour cette candidature.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function renderClientTemplate(template: string, context: TemplateContext) {
  return renderTemplateString(template, {
    companyName: context.companyName,
    roleTitle: context.roleTitle,
    contactName: context.contactName,
    contactEmail: context.contactEmail,
    applicationDate: context.applicationDate ? new Date(context.applicationDate) : null,
    userName: context.userName,
    userEmail: context.userEmail,
    today: new Date()
  });
}

function FieldError({ error }: { error?: string }) {
  if (!error) {
    return null;
  }

  return <p className="text-sm text-[color:var(--negative)]">{error}</p>;
}
