import {
  ArrowRight,
  BriefcaseBusiness,
  CalendarClock,
  CheckCircle2,
  MailCheck,
  Sparkles
} from "lucide-react";
import Link from "next/link";
import type { ApplicationStatus } from "@prisma/client";
import type { LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ApplicationStatusBadge } from "@/features/applications/application-status-badge";
import { CompanyAvatar } from "@/features/applications/company-avatar";

const metrics = [
  ["Candidatures", "24"],
  ["Entretiens", "5"],
  ["Offres", "1"]
];

const previewRows = [
  ["Linear", "Product Design Intern", "Entretien RH"],
  ["Notion", "Growth Intern", "Candidature envoyee"],
  ["Alan", "BizOps Intern", "A postuler"]
] as const;

const previewMetrics: ReadonlyArray<[string, string, LucideIcon]> = [
  ["Total", "24", BriefcaseBusiness],
  ["Relances", "7", CalendarClock],
  ["Entretiens", "5", MailCheck]
];

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="mx-auto max-w-7xl px-4 pb-10 pt-5 sm:px-6 lg:px-8">
        <nav className="flex items-center justify-between rounded-[28px] border border-white/70 bg-white/80 px-4 py-3 shadow-[0_12px_32px_rgba(15,23,42,0.06)] backdrop-blur-xl sm:px-5">
          <Link
            href="/"
            className="flex items-center gap-3 text-xl font-semibold tracking-normal"
          >
            <span className="inline-flex size-10 items-center justify-center rounded-2xl bg-[linear-gradient(180deg,#7c83ff_0%,#4f46e5_100%)] text-sm font-bold text-white shadow-[0_12px_28px_rgba(79,70,229,0.28)]">
              W
            </span>
            Waren
          </Link>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm">
              <Link href="/login">Connexion</Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/register">Creer un compte</Link>
            </Button>
          </div>
        </nav>

        <div className="grid gap-10 py-12 lg:grid-cols-[minmax(0,1fr)_540px] lg:items-center">
          <div className="max-w-2xl">
            <Badge>Suivi de candidatures premium</Badge>
            <h1 className="mt-6 text-5xl font-semibold leading-[1.02] tracking-normal text-foreground sm:text-6xl">
              Un espace clair pour piloter offres, relances et entretiens.
            </h1>
            <p className="mt-6 max-w-xl text-base leading-8 text-muted-foreground sm:text-lg">
              Waren remplace les tableurs brouillons par une experience sobre, rapide et
              elegante pour suivre votre recherche de stage, alternance ou emploi.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href="/register">
                  Demarrer
                  <ArrowRight aria-hidden="true" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/login">Voir mon espace</Link>
              </Button>
            </div>

            <div className="mt-12 grid gap-4 sm:grid-cols-3">
              {metrics.map(([label, value], index) => (
                <div
                  key={label}
                  className={
                    index === 0
                      ? "premium-dark-card rounded-[28px] border border-transparent px-5 py-5 text-white"
                      : "premium-card rounded-[28px] border border-border/80 px-5 py-5"
                  }
                >
                  <p
                    className={
                      index === 0
                        ? "text-sm text-white/62"
                        : "text-sm text-muted-foreground"
                    }
                  >
                    {label}
                  </p>
                  <p className="mt-3 text-4xl font-semibold tracking-normal">{value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-x-10 top-0 h-24 rounded-full bg-[#e0e6ff] blur-3xl" />
            <div className="premium-card relative overflow-hidden rounded-[34px] border border-white/80 p-4 shadow-[0_28px_70px_rgba(15,23,42,0.12)]">
              <div className="rounded-[28px] border border-border/80 bg-[#fbfcff] p-4">
                <div className="flex items-center justify-between gap-4 rounded-[24px] border border-border/80 bg-white px-4 py-4">
                  <div>
                    <p className="text-sm font-semibold">Pipeline du jour</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Suivi propre, relances visibles, decisions plus nettes.
                    </p>
                  </div>
                  <div className="inline-flex size-11 items-center justify-center rounded-2xl bg-[#eef2ff] text-[#4f46e5]">
                    <Sparkles className="size-5" aria-hidden="true" />
                  </div>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  {previewMetrics.map(([label, value, Icon]) => (
                    <div
                      key={label}
                      className="rounded-[24px] border border-border/80 bg-white px-4 py-4"
                    >
                      <div className="inline-flex size-9 items-center justify-center rounded-2xl bg-[#f3f5fb] text-muted-foreground">
                        <Icon className="size-4" aria-hidden="true" />
                      </div>
                      <p className="mt-4 text-sm text-muted-foreground">{label}</p>
                      <p className="mt-2 text-2xl font-semibold">{value}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-4 rounded-[28px] border border-border/80 bg-white p-4">
                  <div className="flex items-center justify-between gap-4 border-b border-border/80 pb-4">
                    <div>
                      <p className="text-base font-semibold">Candidatures recentes</p>
                      <p className="text-sm text-muted-foreground">
                        Une vue rapide sur votre pipeline actif.
                      </p>
                    </div>
                    <Button asChild variant="outline" size="sm">
                      <Link href="/login">Ouvrir</Link>
                    </Button>
                  </div>

                  <div className="mt-4 space-y-3">
                    {previewRows.map(([company, role, status]) => (
                      <div
                        key={`${company}-${role}`}
                        className="flex items-center justify-between gap-3 rounded-[22px] border border-border/80 bg-[#fbfcff] px-4 py-3"
                      >
                        <div className="flex items-center gap-3">
                          <CompanyAvatar
                            companyName={company}
                            className="size-10 rounded-xl text-xs"
                          />
                          <div>
                            <p className="text-sm font-semibold">{company}</p>
                            <p className="text-sm text-muted-foreground">{role}</p>
                          </div>
                        </div>
                        <ApplicationStatusBadge status={mapStatus(status)} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {[
            [
              "Visibilite",
              "Retrouvez vite ce qui a ete envoye, ce qui attend une relance et ce qui entre dans une phase plus serieuse."
            ],
            [
              "Organisation",
              "Conservez vos liens d'offres, vos contacts RH, vos notes et vos documents directement sur la bonne fiche."
            ],
            [
              "Rigueur",
              "Gardez un historique propre de votre pipeline pour piloter votre recherche sans friction."
            ]
          ].map(([title, description]) => (
            <div
              key={title}
              className="premium-card rounded-[28px] border border-border/80 px-6 py-6"
            >
              <div className="inline-flex size-10 items-center justify-center rounded-2xl bg-[#eef2ff] text-[#4f46e5]">
                <CheckCircle2 className="size-4" aria-hidden="true" />
              </div>
              <h2 className="mt-5 text-lg font-semibold">{title}</h2>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">
                {description}
              </p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

function mapStatus(label: (typeof previewRows)[number][2]): ApplicationStatus {
  switch (label) {
    case "Entretien RH":
      return "HR_INTERVIEW";
    case "Candidature envoyee":
      return "APPLIED";
    default:
      return "TO_APPLY";
  }
}
