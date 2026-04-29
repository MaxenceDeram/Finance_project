import { Plus, Search } from "lucide-react";
import Link from "next/link";
import { WarenLogo } from "@/components/brand/waren-logo";
import { EmptyState } from "@/components/dashboard/empty-state";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { ApplicationStatusBadge } from "@/features/applications/application-status-badge";
import { ApplicationsKanban } from "@/features/applications/applications-kanban";
import { ApplicationsTable } from "@/features/applications/applications-table";
import { CompanyAvatar } from "@/features/applications/company-avatar";
import {
  applicationDateRangeOptions,
  applicationStatusOptions,
  getApplicationStatusLabel,
  interviewStatuses,
  isApplicationDateRange,
  isApplicationStatus
} from "@/features/applications/constants";
import { getBrandToneForApplicationStatus } from "@/features/applications/status-brand";
import { listJobApplications } from "@/features/applications/service";
import { formatDateOnly } from "@/lib/dates";
import { requireUser } from "@/server/security/sessions";

const quickFilters = [
  { label: "Toutes", value: "ALL" },
  { label: "A postuler", value: "TO_APPLY" },
  { label: "Envoyees", value: "APPLIED" },
  { label: "Entretien RH", value: "HR_INTERVIEW" },
  { label: "Offres", value: "OFFER_RECEIVED" },
  { label: "Refusees", value: "REJECTED" }
] as const;

export default async function ApplicationsPage({
  searchParams
}: {
  searchParams: Promise<{
    q?: string;
    status?: string;
    location?: string;
    dateRange?: string;
  }>;
}) {
  const user = await requireUser();
  const params = await searchParams;
  const query = params.q?.trim() ?? "";
  const location = params.location?.trim() ?? "";
  const status = isApplicationStatus(params.status) ? params.status : "ALL";
  const dateRange = isApplicationDateRange(params.dateRange) ? params.dateRange : "ALL";

  const applications = await listJobApplications({
    userId: user.id,
    status,
    query,
    location,
    dateRange
  });

  const upcomingFollowUps = applications
    .filter((application) => application.followUpDate)
    .slice(0, 4);
  const activeInterviews = applications.filter((application) =>
    interviewStatuses.has(application.status)
  );

  if (
    applications.length === 0 &&
    !query &&
    status === "ALL" &&
    !location &&
    dateRange === "ALL"
  ) {
    return (
      <EmptyState
        icon={Search}
        title="Aucune candidature"
        description="Ajoutez votre premiere candidature pour suivre vos relances, entretiens et offres dans Waren."
        action={
          <Button asChild>
            <Link href="/applications/new">
              <Plus aria-hidden="true" />
              Ajouter une candidature
            </Link>
          </Button>
        }
      />
    );
  }

  return (
    <div className="space-y-8" data-motion-page>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div data-motion-intro>
          <p className="text-sm font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            Pipeline
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-normal text-foreground sm:text-5xl">
            Toutes vos candidatures, au meme endroit.
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-muted-foreground sm:text-base">
            Recherchez vite, filtrez proprement et retrouvez chaque poste avec son statut,
            sa relance et son contexte.
          </p>
        </div>
        <Button asChild size="lg" data-motion-action>
          <Link href="/applications/new">
            <Plus aria-hidden="true" />
            Ajouter une candidature
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.55fr)_340px]">
        <section className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recherche et filtres</CardTitle>
              <CardDescription>
                Trouvez une entreprise, affinez par statut, localisation et periode.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <form
                className="grid gap-3 md:grid-cols-2 2xl:grid-cols-[minmax(260px,1.4fr)_190px_190px_190px_auto]"
                data-motion-form
              >
                <div className="relative" data-motion-field>
                  <Search
                    className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                    aria-hidden="true"
                  />
                  <input
                    name="q"
                    defaultValue={query}
                    placeholder="Entreprise, poste, recruteur..."
                    className="h-11 w-full rounded-xl border border-input bg-white pl-11 pr-4 text-sm text-foreground shadow-[0_1px_2px_rgba(16,24,40,0.04)] outline-none transition-all focus:border-ring focus:ring-4 focus:ring-ring/10"
                  />
                </div>
                <Select name="status" defaultValue={status}>
                  <option value="ALL">Tous les statuts</option>
                  {applicationStatusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
                <input
                  name="location"
                  defaultValue={location}
                  placeholder="Localisation"
                  className="h-11 w-full rounded-xl border border-input bg-white px-3.5 text-sm text-foreground shadow-[0_1px_2px_rgba(16,24,40,0.04)] outline-none transition-all focus:border-ring focus:ring-4 focus:ring-ring/10"
                  data-motion-field
                />
                <Select name="dateRange" defaultValue={dateRange}>
                  {applicationDateRangeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
                <Button type="submit" className="w-full 2xl:w-auto" data-motion-field>
                  Appliquer
                </Button>
              </form>

              <div className="flex flex-wrap gap-2">
                {quickFilters.map((filter) => {
                  const href = new URLSearchParams();
                  if (query) {
                    href.set("q", query);
                  }
                  if (location) {
                    href.set("location", location);
                  }
                  if (dateRange !== "ALL") {
                    href.set("dateRange", dateRange);
                  }
                  if (filter.value !== "ALL") {
                    href.set("status", filter.value);
                  }

                  return (
                    <Button
                      key={filter.value}
                      asChild
                      variant={status === filter.value ? "default" : "secondary"}
                      size="sm"
                    >
                      <Link
                        href={`/applications${href.toString() ? `?${href.toString()}` : ""}`}
                        data-motion-action
                      >
                        {filter.label}
                      </Link>
                    </Button>
                  );
                })}
              </div>

              <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                <span>{applications.length} resultat(s)</span>
                {status !== "ALL" ? (
                  <span>• {getApplicationStatusLabel(status)}</span>
                ) : null}
                {location ? <span>• {location}</span> : null}
                {query ? <span>• “{query}”</span> : null}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <CardTitle>Kanban du pipeline</CardTitle>
                <CardDescription>
                  Deplacez une carte pour changer son statut, ou ouvrez rapidement la
                  fiche, les documents et les relances.
                </CardDescription>
              </div>
              <Button asChild variant="outline" size="sm">
                <Link href="/actions">Voir les actions du jour</Link>
              </Button>
            </CardHeader>
            <CardContent>
              {applications.length > 0 ? (
                <ApplicationsKanban
                  applications={applications.map((application) => ({
                    id: application.id,
                    companyName: application.companyName,
                    roleTitle: application.roleTitle,
                    status: application.status,
                    location: application.location,
                    listingUrl: application.listingUrl,
                    followUpDate: application.followUpDate?.toISOString() ?? null
                  }))}
                />
              ) : (
                <EmptyState
                  icon={Search}
                  title="Aucune carte"
                  description="Aucune candidature ne correspond a vos filtres actuels."
                />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <CardTitle>Tableau des candidatures</CardTitle>
                <CardDescription>
                  Un tableau propre pour piloter vos opportunites sans friction.
                </CardDescription>
              </div>
              <Button asChild variant="outline" size="sm">
                <Link href="/applications/new">Nouvelle fiche</Link>
              </Button>
            </CardHeader>
            <CardContent>
              {applications.length > 0 ? (
                <ApplicationsTable applications={applications} />
              ) : (
                <EmptyState
                  icon={Search}
                  title="Aucun resultat"
                  description="Aucune candidature ne correspond a vos filtres actuels."
                />
              )}
            </CardContent>
          </Card>
        </section>

        <aside className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Relances a venir</CardTitle>
              <CardDescription>
                Les prochains dossiers qui demandent une action.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {upcomingFollowUps.length > 0 ? (
                upcomingFollowUps.map((application) => (
                  <Link
                    key={application.id}
                    href={`/applications/${application.id}/edit`}
                    className="surface-hover-lift flex items-center gap-3 rounded-[22px] border border-border/80 bg-[#fbfcff] px-4 py-4 transition hover:border-[#d8ddff] hover:bg-white"
                    data-motion-row
                  >
                    <div className="relative">
                      <CompanyAvatar
                        companyName={application.companyName}
                        listingUrl={application.listingUrl}
                        className="size-10 rounded-xl text-xs"
                      />
                      <span className="absolute -bottom-1 -right-1 inline-flex size-5 items-center justify-center rounded-full border border-white bg-white shadow-[0_1px_2px_rgba(16,24,40,0.12)]">
                        <WarenLogo
                          tone={getBrandToneForApplicationStatus(application.status)}
                          withWordmark={false}
                          markClassName="h-3 w-3"
                        />
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-foreground">
                        {application.companyName}
                      </p>
                      <p className="truncate text-sm text-muted-foreground">
                        {application.roleTitle}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {application.followUpDate
                          ? `Relance ${formatDateOnly(application.followUpDate)}`
                          : "Date a definir"}
                      </p>
                    </div>
                  </Link>
                ))
              ) : (
                <p className="rounded-[22px] border border-dashed border-border bg-[#fbfcff] px-4 py-8 text-sm text-muted-foreground">
                  Aucun rappel imminent sur les filtres courants.
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Focus entretiens</CardTitle>
              <CardDescription>
                Les candidatures deja engagees dans une phase d&apos;entretien.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {activeInterviews.length > 0 ? (
                activeInterviews.slice(0, 4).map((application) => (
                  <div
                    key={application.id}
                    className="surface-hover-lift rounded-[22px] border border-border/80 bg-[#fbfcff] px-4 py-4"
                    data-motion-card
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-foreground">
                          {application.companyName}
                        </p>
                        <p className="truncate text-sm text-muted-foreground">
                          {application.roleTitle}
                        </p>
                      </div>
                      <ApplicationStatusBadge status={application.status} />
                    </div>
                  </div>
                ))
              ) : (
                <p className="rounded-[22px] border border-dashed border-border bg-[#fbfcff] px-4 py-8 text-sm text-muted-foreground">
                  Aucun entretien detecte sur cette vue.
                </p>
              )}
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}
