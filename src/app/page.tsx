import { ArrowRight, BarChart3, LockKeyhole, MailCheck, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[#f8fafc]">
      <section className="grid min-h-[88vh] grid-cols-1 lg:grid-cols-[0.92fr_1.08fr]">
        <div className="flex flex-col justify-between px-6 py-7 sm:px-10 lg:px-14">
          <nav className="flex items-center justify-between">
            <span className="text-sm font-bold tracking-[0.18em]">PAPER INVEST</span>
            <div className="flex items-center gap-2">
              <Button asChild variant="ghost" size="sm">
                <Link href="/login">Connexion</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/register">Creer un compte</Link>
              </Button>
            </div>
          </nav>
          <div className="max-w-2xl py-16">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Simulation uniquement
            </p>
            <h1 className="mt-4 text-5xl font-semibold tracking-normal text-foreground sm:text-6xl">
              Paper Invest Premium
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-muted-foreground">
              Une plateforme personnelle pour tester des strategies, suivre des portefeuilles
              fictifs et recevoir des syntheses quotidiennes sans argent reel.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href="/register">
                  Demarrer la simulation
                  <ArrowRight aria-hidden="true" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/login">Ouvrir mon espace</Link>
              </Button>
            </div>
          </div>
          <p className="max-w-2xl text-xs leading-6 text-muted-foreground">
            Aucun ordre reel, aucune gestion de fonds, aucun conseil financier. L'application est
            concue pour l'apprentissage, le suivi personnel et la simulation.
          </p>
        </div>
        <div className="flex items-center bg-[#111827] px-6 py-10 text-white sm:px-10 lg:px-14">
          <div className="w-full">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg border border-white/10 bg-white/[0.06] p-5">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-white/60">Valeur fictive</p>
                  <BarChart3 className="size-4 text-emerald-300" aria-hidden="true" />
                </div>
                <p className="mt-4 text-3xl font-semibold">128 430 EUR</p>
                <p className="mt-2 text-sm text-emerald-300">+8,42 % total</p>
              </div>
              <div className="rounded-lg border border-white/10 bg-white/[0.06] p-5">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-white/60">Cash disponible</p>
                  <ShieldCheck className="size-4 text-sky-300" aria-hidden="true" />
                </div>
                <p className="mt-4 text-3xl font-semibold">21 760 EUR</p>
                <p className="mt-2 text-sm text-white/50">Capital de simulation</p>
              </div>
            </div>
            <div className="mt-4 rounded-lg border border-white/10 bg-white/[0.06] p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-white/60">Courbe de performance</p>
                  <p className="mt-1 text-sm text-white/40">Snapshots quotidiens</p>
                </div>
                <MailCheck className="size-5 text-amber-300" aria-hidden="true" />
              </div>
              <div className="mt-8 flex h-44 items-end gap-2">
                {[42, 48, 45, 56, 62, 59, 73, 70, 82, 88, 86, 96].map((height, index) => (
                  <div
                    key={index}
                    className="flex-1 rounded-t bg-white/20"
                    style={{ height: `${height}%` }}
                  />
                ))}
              </div>
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              {[
                ["Auth", "Email confirme"],
                ["Ordres", "Achat/vente marche"],
                ["Jobs", "Synthese quotidienne"]
              ].map(([label, value]) => (
                <div key={label} className="rounded-lg border border-white/10 bg-white/[0.06] p-4">
                  <p className="text-xs uppercase tracking-[0.14em] text-white/40">{label}</p>
                  <p className="mt-2 text-sm font-medium">{value}</p>
                </div>
              ))}
            </div>
            <div className="mt-5 flex items-center gap-2 text-xs text-white/45">
              <LockKeyhole className="size-4" aria-hidden="true" />
              Sessions httpOnly, tokens hashes, rate limiting et autorisations par utilisateur.
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
