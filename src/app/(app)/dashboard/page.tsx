import {
  ArrowRight,
  BriefcaseBusiness,
  CalendarClock,
  CirclePercent,
  Clock3,
  MessagesSquare,
  Plus,
  ShieldX,
  Sparkles,
  Target
} from "lucide-react";
import Link from "next/link";
import { WarenLogo } from "@/components/brand/waren-logo";
import { EmptyState } from "@/components/dashboard/empty-state";
import { StatCard } from "@/components/dashboard/stat-card";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { ApplicationStatusBadge } from "@/features/applications/application-status-badge";
import { CompanyAvatar } from "@/features/applications/company-avatar";
import { getApplicationStatusLabel } from "@/features/applications/constants";
import { getBrandToneForApplicationStatus } from "@/features/applications/status-brand";
import { getApplicationDashboard } from "@/features/applications/service";
import { formatDateOnly } from "@/lib/dates";
import { requireUser } from "@/server/security/sessions";

export default async function DashboardPage() {
  const user = await requireUser();
  const dashboard = await getApplicationDashboard(user.id);
  const statusBreakdown = dashboard.statusBreakdown
    .filter((item) => item.count > 0)
    .sort((left, right) => right.count - left.count);
  const maxBreakdown = statusBreakdown[0]?.count ?? 1;

  if (dashboard.totalApplications === 0) {
    return (
      <EmptyState
        icon={BriefcaseBusiness}
        title="Aucune candidature pour le moment"
        description="Ajoutez votre premiere candidature pour transformer Waren en cockpit de suivi: pipeline, relances, entretiens et documents associes."
        action={
          <Button asChild data-motion-action>
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
            Vue d'ensemble
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-normal text-foreground sm:text-5xl">
            Votre pipeline, propre et lisible.
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-muted-foreground sm:text-base">
            Visualisez les candidatures actives, les relances a venir et la sante globale
            de votre recherche dans un espace pense pour un usage quotidien.
          </p>
        </div>
        <Button asChild size="lg" data-motion-action>
          <Link href="/applications/new">
            <Plus aria-hidden="true" />
            Nouvelle candidature
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.55fr)_360px]">
        <section className="space-y-6">
          <div
            className="premium-dark-card panel-glow overflow-hidden rounded-[32px] border border-transparent px-7 py-7 text-white sm:px-8"
            data-motion-panel
          >
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-medium text-white/75">
                  <Sparkles className="size-3.5" aria-hidden="true" />
                  Vue quotidienne
                </div>
                <h2 className="mt-5 text-3xl font-semibold leading-tight tracking-normal sm:text-[2.1rem]">
                  {dashboard.activePipelineCount} candidatures encore en mouvement.
                </h2>
                <p className="mt-3 max-w-xl text-sm leading-7 text-white/68">
                  {dashboard.toApplyCount} opportunites restent a traiter et votre taux de
                  reponse actuel atteint {Math.round(dashboard.responseRate)} %.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3 lg:min-w-[360px]">
                {[
                  ["Actives", String(dashboard.activePipelineCount)],
                  ["A preparer", String(dashboard.toApplyCount)],
                  ["Relances proches", String(dashboard.upcomingFollowUps.length)]
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="surface-hover-lift rounded-[24px] border border-white/10 bg-white/[0.06] px-4 py-4 shadow-[0_1px_0_rgba(255,255,255,0.05)_inset]"
                    data-motion-card
                    data-motion-float
                  >
                    <p className="text-xs font-medium uppercase tracking-[0.1em] text-white/55">
                      {label}
                    </p>
                    <p className="mt-3 text-3xl font-semibold text-white">{value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild variant="secondary" size="sm">
                <Link href="/applications">
                  Voir toutes les candidatures
                  <ArrowRight aria-hidden="true" />
                </Link>
              </Button>
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="text-white/75 hover:bg-white/10 hover:text-white"
              >
                <Link href="/applications/new">Ajouter une opportunite</Link>
              </Button>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <StatCard
              label="Total"
              value={String(dashboard.totalApplications)}
              icon={BriefcaseBusiness}
              detail="Toutes les opportunites enregistrees dans votre espace."
              highlight
            />
            <StatCard
              label="Envoyees"
              value={String(dashboard.sentApplications)}
              icon={Target}
              detail="Candidatures deja envoyees."
            />
            <StatCard
              label="Entretiens"
              value={String(dashboard.interviewsCount)}
              icon={MessagesSquare}
              marker={
                <div className="rounded-2xl border border-[#f0deb6] bg-[#fff6e8] px-3 py-2">
                  <WarenLogo
                    tone="in-progress"
                    withWordmark={false}
                    markClassName="h-5 w-5"
                  />
                </div>
              }
              detail="Entretiens RH, techniques et cas pratiques."
            />
            <StatCard
              label="Offres"
              value={String(dashboard.offersCount)}
              icon={CirclePercent}
              tone={dashboard.offersCount > 0 ? "positive" : "neutral"}
              marker={
                <div className="rounded-2xl border border-[#ccebd8] bg-[#eaf9f1] px-3 py-2">
                  <WarenLogo
                    tone="accepted"
                    withWordmark={false}
                    markClassName="h-5 w-5"
                  />
                </div>
              }
              detail="Opportunites arrivant a la decision."
            />
            <StatCard
              label="Refus"
              value={String(dashboard.refusalsCount)}
              icon={ShieldX}
              tone={dashboard.refusalsCount > 0 ? "negative" : "neutral"}
              marker={
                <div className="rounded-2xl border border-[#f5d3d7] bg-[#fff1f3] px-3 py-2">
                  <WarenLogo
                    tone="rejected"
                    withWordmark={false}
                    markClassName="h-5 w-5"
                  />
                </div>
              }
              detail="Historique des refus recueillis."
            />
            <StatCard
              label="Taux de reponse"
              value={`${Math.round(dashboard.responseRate)}%`}
              icon={CalendarClock}
              tone={dashboard.responseRate > 0 ? "positive" : "neutral"}
              detail="Base sur les candidatures deja envoyees."
            />
          </div>

          <Card>
            <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <CardTitle>Candidatures recentes</CardTitle>
                <CardDescription>
                  Les dossiers les plus recemment mis a jour dans votre pipeline.
                </CardDescription>
              </div>
              <Button asChild variant="outline" size="sm">
                <Link href="/applications">Ouvrir la liste complete</Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {dashboard.recentApplications.map((application) => (
                <Link
                  key={application.id}
                  href={`/applications/${application.id}/edit`}
                  className="surface-hover-lift flex flex-col gap-4 rounded-[24px] border border-border/80 bg-[#fbfcff] px-4 py-4 transition hover:border-[#d8ddff] hover:bg-white sm:flex-row sm:items-center sm:justify-between"
                  data-motion-row
                >
                  <div className="flex items-center gap-4">
                    <CompanyAvatar
                      companyName={application.companyName}
                      listingUrl={application.listingUrl}
                    />
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        {application.companyName}
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {application.roleTitle}
                        {application.location ? ` · ${application.location}` : ""}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 sm:gap-6">
                    <div className="text-sm text-muted-foreground">
                      {application.followUpDate
                        ? `Relance ${formatDateOnly(application.followUpDate)}`
                        : "Aucune relance"}
                    </div>
                    <ApplicationStatusBadge status={application.status} />
                  </div>
                </Link>
              ))}
            </CardContent>
          </Card>
        </section>

        <aside className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Prochaines relances</CardTitle>
              <CardDescription>
                Les prochaines actions a ne pas laisser sortir du radar.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {dashboard.upcomingFollowUps.length > 0 ? (
                dashboard.upcomingFollowUps.map((application) => (
                  <Link
                    key={application.id}
                    href={`/applications/${application.id}/edit`}
                    className="surface-hover-lift block rounded-[24px] border border-border/80 bg-[#fbfcff] px-4 py-4 transition hover:border-[#d8ddff] hover:bg-white"
                    data-motion-row
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-foreground">
                          {application.companyName}
                        </p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {application.roleTitle}
                        </p>
                      </div>
                      <ApplicationStatusBadge status={application.status} />
                    </div>
                    <p className="mt-4 inline-flex items-center gap-2 text-xs font-medium text-muted-foreground">
                      <Clock3 className="size-3.5" aria-hidden="true" />
                      {application.followUpDate
                        ? formatDateOnly(application.followUpDate)
                        : "Date a definir"}
                    </p>
                  </Link>
                ))
              ) : (
                <p className="rounded-[24px] border border-dashed border-border bg-[#fbfcff] px-4 py-8 text-sm text-muted-foreground">
                  Aucune relance planifiee pour le moment.
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Activite recente</CardTitle>
              <CardDescription>
                Dernieres fiches mises a jour dans votre espace.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {dashboard.recentActivity.map((application) => (
                <div key={application.id} className="flex gap-3" data-motion-row>
                  <div className="mt-0.5 inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-[#f6f8ff]">
                    <WarenLogo
                      tone={getBrandToneForApplicationStatus(application.status)}
                      withWordmark={false}
                      markClassName="h-3.5 w-3.5"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground">
                      {application.companyName}{" "}
                      <span className="font-normal text-muted-foreground">
                        · {application.roleTitle}
                      </span>
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Statut actuel: {getApplicationStatusLabel(application.status)} ·
                      mise a jour le {formatDateOnly(application.updatedAt)}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Repartition des statuts</CardTitle>
              <CardDescription>
                Repartition de votre pipeline pour comprendre ou se situe l&apos;effort.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {statusBreakdown.map((item) => (
                <div key={item.status} className="space-y-2" data-motion-row>
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <WarenLogo
                        tone={getBrandToneForApplicationStatus(item.status)}
                        withWordmark={false}
                        markClassName="h-[18px] w-[18px]"
                      />
                      <ApplicationStatusBadge status={item.status} />
                    </div>
                    <span className="text-sm font-semibold text-foreground">
                      {item.count}
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-[#edf1f7]">
                    <div
                      className="progress-fill-animated h-full rounded-full bg-[linear-gradient(90deg,#6366f1_0%,#8b5cf6_100%)]"
                      style={{ width: `${(item.count / maxBreakdown) * 100}%` }}
                      data-motion-progress
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}
