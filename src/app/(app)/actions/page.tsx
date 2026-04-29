import {
  AlertCircle,
  ArrowRight,
  CalendarClock,
  Clock3,
  ListChecks,
  Plus
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { EmptyState } from "@/components/dashboard/empty-state";
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
import { getTodayApplicationActions } from "@/features/applications/service";
import { getUserPreferences } from "@/features/users/service";
import { formatDateOnly } from "@/lib/dates";
import { requireUser } from "@/server/security/sessions";

type ActionItem = Awaited<
  ReturnType<typeof getTodayApplicationActions>
>["followUpsDue"][number];

export default async function ActionsPage() {
  const user = await requireUser();
  const preferences = await getUserPreferences(user.id);
  const actions = await getTodayApplicationActions({
    userId: user.id,
    timeZone: preferences.timezone
  });

  if (actions.totalActions === 0) {
    return (
      <EmptyState
        icon={ListChecks}
        title="Aucune action urgente aujourd'hui"
        description="Votre pipeline est propre pour le moment. Ajoutez une candidature ou planifiez une relance pour garder le rythme."
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
    <div className="mx-auto max-w-7xl space-y-8" data-motion-page>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div data-motion-intro>
          <p className="text-sm font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            Actions du jour
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-normal sm:text-5xl">
            Ce qui merite votre attention maintenant.
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-muted-foreground sm:text-base">
            Relances dues, candidatures sans prochaine etape et dossiers qui dorment
            depuis plus de {actions.staleAfterDays} jours.
          </p>
        </div>
        <Button asChild size="lg" data-motion-action>
          <Link href="/applications/new">
            <Plus aria-hidden="true" />
            Nouvelle candidature
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <ActionStat label="Relances dues" value={actions.followUpsDue.length} />
        <ActionStat label="Sans relance" value={actions.withoutFollowUp.length} />
        <ActionStat label="À postuler" value={actions.toApply.length} />
        <ActionStat label="Bloquées" value={actions.staleApplications.length} />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <ActionSection
          title="Relances dues"
          description="Les suivis planifies jusqu'a aujourd'hui inclus."
          icon={CalendarClock}
          items={actions.followUpsDue}
          empty="Aucune relance due."
          dateLabel={(item) =>
            item.followUpDate ? `Relance ${formatDateOnly(item.followUpDate)}` : null
          }
        />
        <ActionSection
          title="Candidatures sans relance"
          description="Dossiers actifs qui n'ont pas encore de prochaine action."
          icon={AlertCircle}
          items={actions.withoutFollowUp}
          empty="Toutes les candidatures actives ont une relance."
          dateLabel={(item) => `Mis a jour le ${formatDateOnly(item.updatedAt)}`}
        />
        <ActionSection
          title="Opportunites a postuler"
          description="Offres sauvegardees mais pas encore envoyees."
          icon={Plus}
          items={actions.toApply}
          empty="Aucune opportunite en attente."
          dateLabel={(item) => `Creee le ${formatDateOnly(item.createdAt)}`}
        />
        <ActionSection
          title="Candidatures bloquees"
          description={`Dossiers actifs sans mouvement depuis ${actions.staleAfterDays} jours.`}
          icon={Clock3}
          items={actions.staleApplications}
          empty="Aucun dossier bloque detecte."
          dateLabel={(item) => `Derniere mise a jour ${formatDateOnly(item.updatedAt)}`}
        />
      </div>
    </div>
  );
}

function ActionStat({ label, value }: { label: string; value: number }) {
  return (
    <Card>
      <CardContent className="p-5">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="mt-3 text-3xl font-semibold tracking-normal">{value}</p>
      </CardContent>
    </Card>
  );
}

function ActionSection({
  title,
  description,
  icon: Icon,
  items,
  empty,
  dateLabel
}: {
  title: string;
  description: string;
  icon: LucideIcon;
  items: ActionItem[];
  empty: string;
  dateLabel: (item: ActionItem) => string | null;
}) {
  return (
    <Card>
      <CardHeader>
        <div className="inline-flex size-10 items-center justify-center rounded-2xl border border-border bg-[#f8faff] text-muted-foreground">
          <Icon className="size-4" aria-hidden="true" />
        </div>
        <CardTitle className="mt-4">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.length > 0 ? (
          items.map((item) => (
            <Link
              key={item.id}
              href={`/applications/${item.id}/edit`}
              className="surface-hover-lift flex items-center justify-between gap-4 rounded-[22px] border border-border/80 bg-[#fbfcff] px-4 py-4 transition hover:border-[#d8ddff] hover:bg-white"
              data-motion-row
            >
              <div className="flex min-w-0 items-center gap-3">
                <CompanyAvatar
                  companyName={item.companyName}
                  listingUrl={item.listingUrl}
                  className="size-10 rounded-xl text-xs"
                />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-foreground">
                    {item.companyName}
                  </p>
                  <p className="truncate text-sm text-muted-foreground">
                    {item.roleTitle}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {dateLabel(item) ?? getApplicationStatusLabel(item.status)}
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <ApplicationStatusBadge status={item.status} />
                <ArrowRight className="size-4 text-muted-foreground" aria-hidden="true" />
              </div>
            </Link>
          ))
        ) : (
          <p className="rounded-[22px] border border-dashed border-border bg-[#fbfcff] px-4 py-8 text-sm text-muted-foreground">
            {empty}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
