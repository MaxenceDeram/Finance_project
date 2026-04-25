"use client";

import { Sparkles, Star, Trash2 } from "lucide-react";
import type { ComponentProps } from "react";
import { useActionState } from "react";
import { SubmitButton } from "@/components/forms/submit-button";
import { Alert } from "@/components/ui/alert";
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
import { Textarea } from "@/components/ui/textarea";
import { initialActionState } from "@/lib/errors";
import {
  createEmailTemplateAction,
  deleteEmailTemplateAction,
  updateEmailTemplateAction
} from "./actions";

type EmailTemplateItem = {
  id: string;
  name: string;
  subjectTemplate: string;
  bodyTemplate: string;
  isDefault: boolean;
};

export function EmailTemplateManager({
  templates,
  tokens
}: {
  templates: EmailTemplateItem[];
  tokens: string[];
}) {
  const [createState, createAction] = useActionState(
    createEmailTemplateAction,
    initialActionState
  );

  return (
    <div className="space-y-6">
      <Card className="premium-dark-card overflow-hidden border-transparent text-white">
        <CardHeader>
          <div className="inline-flex size-11 items-center justify-center rounded-2xl bg-white/10 text-white">
            <Sparkles className="size-4" aria-hidden="true" />
          </div>
          <CardTitle className="mt-4 text-white">Variables de personnalisation</CardTitle>
          <CardDescription className="text-white/72">
            Utilisez ces variables dans vos sujets et messages pour personnaliser une
            relance selon l&apos;entreprise, le poste et votre profil.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {tokens.map((token) => (
            <span
              key={token}
              className="rounded-full border border-white/12 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/88"
            >
              {token}
            </span>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Nouveau template</CardTitle>
          <CardDescription>
            Creez plusieurs trames de relance reutilisables puis adaptez-les avant envoi.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={createAction} className="grid gap-4">
            {createState.message ? <Alert>{createState.message}</Alert> : null}
            <div className="grid gap-4 md:grid-cols-2">
              <TextField
                label="Nom du template"
                name="name"
                placeholder="Relance stage produit"
                error={createState.fieldErrors?.name?.[0]}
              />
              <TextField
                label="Sujet"
                name="subjectTemplate"
                placeholder="Relance - {{roleTitle}} chez {{companyName}}"
                error={createState.fieldErrors?.subjectTemplate?.[0]}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="create-bodyTemplate">Message</Label>
              <Textarea
                id="create-bodyTemplate"
                name="bodyTemplate"
                rows={9}
                placeholder="Bonjour {{contactName}},&#10;&#10;Je me permets de revenir vers vous..."
              />
              <FieldError error={createState.fieldErrors?.bodyTemplate?.[0]} />
            </div>

            <label className="flex items-center gap-3 rounded-2xl border border-border bg-[#fbfcff] px-4 py-3 text-sm text-foreground">
              <input type="checkbox" name="isDefault" className="size-4" />
              Definir comme template par defaut
            </label>

            <SubmitButton>Ajouter le template</SubmitButton>
          </form>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {templates.map((template) => (
          <ExistingTemplateCard key={template.id} template={template} />
        ))}
      </div>
    </div>
  );
}

function ExistingTemplateCard({ template }: { template: EmailTemplateItem }) {
  const [updateState, updateAction] = useActionState(
    updateEmailTemplateAction,
    initialActionState
  );
  const [deleteState, deleteAction] = useActionState(
    deleteEmailTemplateAction,
    initialActionState
  );

  return (
    <Card>
      <CardHeader className="flex flex-col gap-4 border-b border-border/70 pb-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            {template.name}
            {template.isDefault ? (
              <span className="inline-flex items-center gap-1 rounded-full border border-[#d8ddff] bg-[#eef2ff] px-2.5 py-1 text-[11px] font-semibold text-[#474bc8]">
                <Star className="size-3" aria-hidden="true" />
                Defaut
              </span>
            ) : null}
          </CardTitle>
          <CardDescription className="mt-2">
            Ajustez le sujet, le message et le statut par defaut sans quitter l&apos;ecran.
          </CardDescription>
        </div>

        <form
          action={deleteAction}
          onSubmit={(event) => {
            if (!window.confirm("Supprimer ce template de relance ?")) {
              event.preventDefault();
            }
          }}
        >
          <input type="hidden" name="templateId" value={template.id} />
          <Button type="submit" variant="ghost">
            <Trash2 aria-hidden="true" />
            Supprimer
          </Button>
        </form>
      </CardHeader>
      <CardContent className="space-y-4 pt-6">
        {updateState.message ? <Alert>{updateState.message}</Alert> : null}
        {deleteState.message ? <Alert>{deleteState.message}</Alert> : null}

        <form action={updateAction} className="grid gap-4">
          <input type="hidden" name="templateId" value={template.id} />

          <div className="grid gap-4 md:grid-cols-2">
            <TextField
              label="Nom"
              name="name"
              defaultValue={template.name}
              error={updateState.fieldErrors?.name?.[0]}
            />
            <TextField
              label="Sujet"
              name="subjectTemplate"
              defaultValue={template.subjectTemplate}
              error={updateState.fieldErrors?.subjectTemplate?.[0]}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor={`bodyTemplate-${template.id}`}>Message</Label>
            <Textarea
              id={`bodyTemplate-${template.id}`}
              name="bodyTemplate"
              rows={9}
              defaultValue={template.bodyTemplate}
            />
            <FieldError error={updateState.fieldErrors?.bodyTemplate?.[0]} />
          </div>

          <label className="flex items-center gap-3 rounded-2xl border border-border bg-[#fbfcff] px-4 py-3 text-sm text-foreground">
            <input
              type="checkbox"
              name="isDefault"
              defaultChecked={template.isDefault}
              className="size-4"
            />
            Utiliser comme template par defaut
          </label>

          <SubmitButton>Enregistrer</SubmitButton>
        </form>
      </CardContent>
    </Card>
  );
}

function TextField({
  label,
  error,
  ...props
}: ComponentProps<typeof Input> & {
  label: string;
  error?: string;
}) {
  const fieldId = props.id ?? `field-${props.name}`;

  return (
    <div className="grid gap-2">
      <Label htmlFor={fieldId}>{label}</Label>
      <Input id={fieldId} {...props} />
      <FieldError error={error} />
    </div>
  );
}

function FieldError({ error }: { error?: string }) {
  if (!error) {
    return null;
  }

  return <p className="text-sm text-[color:var(--negative)]">{error}</p>;
}
