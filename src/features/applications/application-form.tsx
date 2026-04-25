"use client";

import type { ApplicationStatus, ContractType } from "@prisma/client";
import Link from "next/link";
import { CalendarRange, Link2, NotebookPen, Sparkles, UserRound } from "lucide-react";
import { useActionState } from "react";
import type { ActionState } from "@/lib/errors";
import { initialActionState } from "@/lib/errors";
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
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createJobApplicationAction, updateJobApplicationAction } from "./actions";
import { applicationStatusOptions, contractTypeOptions } from "./constants";
import { DeleteApplicationButton } from "./delete-application-button";

type ApplicationFormValues = {
  id?: string;
  companyName: string;
  roleTitle: string;
  contractType: ContractType;
  location?: string | null;
  applicationDate?: string | null;
  status: ApplicationStatus;
  listingUrl?: string | null;
  hrContact?: string | null;
  compensation?: string | null;
  notes?: string | null;
  followUpDate?: string | null;
};

export function ApplicationForm({
  mode,
  values,
  backHref = "/applications"
}: {
  mode: "create" | "edit";
  values?: Partial<ApplicationFormValues>;
  backHref?: string;
}) {
  const action =
    mode === "create" ? createJobApplicationAction : updateJobApplicationAction;
  const [state, formAction] = useActionState<ActionState, FormData>(
    action,
    initialActionState
  );

  return (
    <form action={formAction} className="space-y-6">
      {mode === "edit" && values?.id ? (
        <input type="hidden" name="applicationId" value={values.id} />
      ) : null}

      {state.message ? <Alert>{state.message}</Alert> : null}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.28fr)_360px]">
        <div className="space-y-6">
          <SectionCard
            title="Informations principales"
            description="Le coeur de la candidature: entreprise, role, type de contrat et localisation."
          >
            <div className="grid gap-4 md:grid-cols-2">
              <Field
                label="Entreprise"
                name="companyName"
                defaultValue={values?.companyName}
                error={state.fieldErrors?.companyName?.[0]}
                required
                placeholder="ex. Notion"
              />
              <Field
                label="Poste"
                name="roleTitle"
                defaultValue={values?.roleTitle}
                error={state.fieldErrors?.roleTitle?.[0]}
                required
                placeholder="ex. Product Designer Intern"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <SelectField
                label="Type de contrat"
                name="contractType"
                defaultValue={values?.contractType ?? "INTERNSHIP"}
                options={contractTypeOptions}
                error={state.fieldErrors?.contractType?.[0]}
              />
              <Field
                label="Localisation"
                name="location"
                defaultValue={values?.location}
                error={state.fieldErrors?.location?.[0]}
                placeholder="Paris, Remote, Londres..."
              />
              <Field
                label="Remuneration"
                name="compensation"
                defaultValue={values?.compensation}
                error={state.fieldErrors?.compensation?.[0]}
                placeholder="1500 EUR / mois, 45k EUR..."
              />
            </div>
          </SectionCard>

          <SectionCard
            title="Contact et offre"
            description="Centralisez l'offre originale et le meilleur point de contact pour cette opportunite."
            icon={Link2}
          >
            <div className="grid gap-4 md:grid-cols-2">
              <Field
                label="Lien de l'offre"
                name="listingUrl"
                type="url"
                defaultValue={values?.listingUrl}
                error={state.fieldErrors?.listingUrl?.[0]}
                placeholder="jobs.lever.co/... ou https://..."
                description="Vous pouvez coller un lien complet, un www. ou un domaine simple: Waren complete https:// si besoin."
              />
              <Field
                label="Contact RH"
                name="hrContact"
                defaultValue={values?.hrContact}
                error={state.fieldErrors?.hrContact?.[0]}
                placeholder="prenom.nom@entreprise.com"
                description="Email, nom du recruteur ou contact LinkedIn."
              />
            </div>
          </SectionCard>

          <SectionCard
            title="Notes et preparation"
            description="Gardez ici vos notes utiles: version du CV envoyee, points a preparer, contexte du role."
            icon={NotebookPen}
          >
            <div className="grid gap-2">
              <Label htmlFor="notes">Notes personnelles</Label>
              <Textarea
                id="notes"
                name="notes"
                defaultValue={values?.notes ?? ""}
                placeholder="Contexte de l'offre, points forts a mettre en avant, sujets a preparer pour l'entretien..."
              />
              <FieldError error={state.fieldErrors?.notes?.[0]} />
            </div>
          </SectionCard>
        </div>

        <div className="space-y-6">
          <SectionCard
            title="Suivi du process"
            description="Statut actuel, date d'envoi et prochaine relance pour garder le momentum."
            icon={CalendarRange}
          >
            <div className="grid gap-4">
              <SelectField
                label="Statut"
                name="status"
                defaultValue={values?.status ?? "TO_APPLY"}
                options={applicationStatusOptions}
                error={state.fieldErrors?.status?.[0]}
              />
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-1">
                <Field
                  label="Date de candidature"
                  name="applicationDate"
                  type="date"
                  defaultValue={values?.applicationDate}
                  error={state.fieldErrors?.applicationDate?.[0]}
                />
                <Field
                  label="Date de relance"
                  name="followUpDate"
                  type="date"
                  defaultValue={values?.followUpDate}
                  error={state.fieldErrors?.followUpDate?.[0]}
                />
              </div>
            </div>
          </SectionCard>

          <Card className="premium-dark-card overflow-hidden border-transparent text-white">
            <CardHeader>
              <div className="inline-flex size-10 items-center justify-center rounded-2xl bg-white/10 text-white">
                <Sparkles className="size-4" aria-hidden="true" />
              </div>
              <CardTitle className="mt-4 text-white">
                Un pipeline propre fait gagner du temps
              </CardTitle>
              <CardDescription className="text-white/68">
                Un dossier propre vous aide a voir vite ce qui merite une relance et ce
                qui demande une preparation plus profonde.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-white/72">
              <ChecklistItem>
                Verifiez que le lien de l'offre et le contact RH sont faciles a retrouver.
              </ChecklistItem>
              <ChecklistItem>
                Notez la prochaine action concrete, pas seulement l'etat general.
              </ChecklistItem>
              <ChecklistItem>
                Attachez ensuite le CV et la lettre reellement envoyes depuis l'ecran
                d'edition.
              </ChecklistItem>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="inline-flex size-10 items-center justify-center rounded-2xl border border-border bg-[#f8faff] text-muted-foreground">
                <UserRound className="size-4" aria-hidden="true" />
              </div>
              <CardTitle className="mt-4">Actions</CardTitle>
              <CardDescription>
                Revenez a la liste, enregistrez ou supprimez cette fiche.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col gap-3">
                <SubmitButton className="w-full">
                  {mode === "create"
                    ? "Ajouter la candidature"
                    : "Enregistrer les modifications"}
                </SubmitButton>
                <Button asChild type="button" variant="outline" className="w-full">
                  <Link href={backHref}>Retour a la liste</Link>
                </Button>
                {mode === "edit" && values?.id && values.companyName ? (
                  <DeleteApplicationButton
                    applicationId={values.id}
                    companyName={values.companyName}
                  />
                ) : null}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}

function SectionCard({
  title,
  description,
  icon: Icon,
  children
}: {
  title: string;
  description: string;
  icon?: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader>
        {Icon ? (
          <div className="inline-flex size-10 items-center justify-center rounded-2xl border border-border bg-[#f8faff] text-muted-foreground">
            <Icon className="size-4" aria-hidden />
          </div>
        ) : null}
        <CardTitle className={Icon ? "mt-4" : ""}>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-5">{children}</CardContent>
    </Card>
  );
}

function Field({
  label,
  name,
  type = "text",
  defaultValue,
  error,
  required,
  placeholder,
  description
}: {
  label: string;
  name: string;
  type?: string;
  defaultValue?: string | null;
  error?: string;
  required?: boolean;
  placeholder?: string;
  description?: string;
}) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={name}>{label}</Label>
      <Input
        id={name}
        name={name}
        type={type}
        defaultValue={defaultValue ?? ""}
        required={required}
        placeholder={placeholder}
      />
      {description ? (
        <p className="text-xs text-muted-foreground">{description}</p>
      ) : null}
      <FieldError error={error} />
    </div>
  );
}

function SelectField({
  label,
  name,
  defaultValue,
  options,
  error
}: {
  label: string;
  name: string;
  defaultValue: string;
  options: ReadonlyArray<{ value: string; label: string }>;
  error?: string;
}) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={name}>{label}</Label>
      <Select id={name} name={name} defaultValue={defaultValue}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </Select>
      <FieldError error={error} />
    </div>
  );
}

function ChecklistItem({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-[20px] border border-white/10 bg-white/8 px-4 py-3">
      {children}
    </div>
  );
}

function FieldError({ error }: { error?: string }) {
  return error ? <p className="text-xs text-[color:var(--negative)]">{error}</p> : null;
}
