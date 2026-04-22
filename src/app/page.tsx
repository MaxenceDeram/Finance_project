import {
  ArrowRight,
  BarChart3,
  LockKeyhole,
  MailCheck,
  ShieldCheck,
  TrendingUp
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-background">
      <section className="min-h-[92vh] border-b border-border/80">
        <div className="mx-auto flex min-h-[92vh] max-w-7xl flex-col px-6 py-7 sm:px-10 lg:px-12">
          <nav className="flex items-center justify-between">
            <Link href="/" className="text-xl font-semibold tracking-normal">
              Waren
            </Link>
            <div className="flex items-center gap-2">
              <Button asChild variant="ghost" size="sm">
                <Link href="/login">Connexion</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/register">Ouvrir un compte fictif</Link>
              </Button>
            </div>
          </nav>

          <div className="grid flex-1 items-center gap-12 py-14 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="max-w-2xl">
              <Badge variant="secondary">Simulation uniquement</Badge>
              <h1 className="mt-6 text-5xl font-semibold leading-[1.02] tracking-normal text-foreground sm:text-6xl lg:text-7xl">
                Waren
              </h1>
              <p className="mt-6 max-w-xl text-xl leading-8 text-foreground">
                Pilotez vos portefeuilles fictifs avec la rigueur d'une plateforme
                d'investissement haut de gamme.
              </p>
              <p className="mt-5 max-w-xl text-base leading-7 text-muted-foreground">
                Testez des strategies, passez des ordres simules, suivez le P&L et recevez
                une synthese quotidienne sans engager de capital reel.
              </p>
              <div className="mt-9 flex flex-wrap gap-3">
                <Button asChild size="lg">
                  <Link href="/register">
                    Demarrer sur Waren
                    <ArrowRight aria-hidden="true" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="/login">Ouvrir mon espace</Link>
                </Button>
              </div>
              <div className="mt-10 grid gap-4 text-sm text-muted-foreground sm:grid-cols-3">
                <div className="border-l border-border pl-4">
                  <p className="font-semibold text-foreground">Argent fictif</p>
                  <p className="mt-1 leading-6">Aucun ordre reel.</p>
                </div>
                <div className="border-l border-border pl-4">
                  <p className="font-semibold text-foreground">Email confirme</p>
                  <p className="mt-1 leading-6">Acces securise.</p>
                </div>
                <div className="border-l border-border pl-4">
                  <p className="font-semibold text-foreground">Snapshots</p>
                  <p className="mt-1 leading-6">Suivi quotidien.</p>
                </div>
              </div>
            </div>

            <div className="rounded-md border border-border/80 bg-card p-4 shadow-[var(--shadow-soft)]">
              <div className="rounded-md border border-border/80 bg-[#11110f] p-5 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white/60">Portefeuille fictif</p>
                    <p className="mt-1 text-xl font-semibold">Waren Core</p>
                  </div>
                  <ShieldCheck className="size-5 text-[#70d29e]" aria-hidden="true" />
                </div>
                <div className="mt-8 grid gap-3 sm:grid-cols-3">
                  <div>
                    <p className="text-xs text-white/50">Valeur</p>
                    <p className="mt-1 text-2xl font-semibold">128 430 EUR</p>
                  </div>
                  <div>
                    <p className="text-xs text-white/50">Performance</p>
                    <p className="mt-1 text-2xl font-semibold text-[#70d29e]">+8,42 %</p>
                  </div>
                  <div>
                    <p className="text-xs text-white/50">Cash</p>
                    <p className="mt-1 text-2xl font-semibold">21 760 EUR</p>
                  </div>
                </div>
                <div className="mt-8 h-52 border-t border-white/10 pt-6">
                  <div className="flex h-full items-end gap-2">
                    {[42, 48, 45, 56, 62, 59, 73, 70, 82, 88, 86, 96].map(
                      (height, index) => (
                        <div
                          key={index}
                          className="flex-1 rounded-t-sm bg-white/20"
                          style={{ height: `${height}%` }}
                        />
                      )
                    )}
                  </div>
                </div>
              </div>
              <div className="grid gap-3 border-x border-b border-border/80 bg-card p-5 sm:grid-cols-3">
                {[
                  ["Achat marche", "AAPL", "+1,28 %"],
                  ["Vente marche", "ETF World", "+0,42 %"],
                  ["Snapshot", "Cloture", "20:30"]
                ].map(([label, value, detail]) => (
                  <div
                    key={label}
                    className="rounded-md border border-border/70 bg-[color:var(--surface)] p-4"
                  >
                    <p className="text-xs font-semibold text-muted-foreground">{label}</p>
                    <p className="mt-2 text-sm font-semibold">{value}</p>
                    <p className="mt-1 text-sm text-[color:var(--positive)]">{detail}</p>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-3 border-x border-b border-border/80 bg-card px-5 py-4 text-sm text-muted-foreground">
                <LockKeyhole className="size-4" aria-hidden="true" />
                Sessions httpOnly, tokens hashes, rate limiting et autorisations par
                utilisateur.
              </div>
            </div>
          </div>

          <div className="grid gap-6 border-t border-border/80 py-7 text-sm text-muted-foreground md:grid-cols-3">
            <div className="flex items-center gap-3">
              <BarChart3 className="size-4 text-foreground" aria-hidden="true" />
              Tableau de bord financier net et lisible.
            </div>
            <div className="flex items-center gap-3">
              <MailCheck className="size-4 text-foreground" aria-hidden="true" />
              Syntheses quotidiennes apres marche.
            </div>
            <div className="flex items-center gap-3">
              <TrendingUp className="size-4 text-foreground" aria-hidden="true" />
              Performance, allocation et historique.
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-6 py-16 sm:px-10 lg:grid-cols-3 lg:px-12">
        {[
          [
            "Discipline",
            "Structurez vos theses, suivez vos allocations et comparez vos decisions sans pression."
          ],
          [
            "Securite",
            "Confirmation email, sessions serveur, rate limiting et controles d'acces deny-by-default."
          ],
          [
            "Evolution",
            "Une base modulaire pour ajouter ordres limites, DCA, alertes, benchmarks et exports."
          ]
        ].map(([title, description]) => (
          <div key={title} className="border-t border-border pt-5">
            <h2 className="text-lg font-semibold tracking-normal">{title}</h2>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">{description}</p>
          </div>
        ))}
      </section>
    </main>
  );
}
