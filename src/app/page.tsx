import { ArrowRight, BarChart3, LockKeyhole, MailCheck, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const bars = [34, 44, 39, 58, 52, 66, 61, 76, 72, 84, 80, 92];

const holdings = [
  ["AAPL", "Apple Inc.", "+1,28 %"],
  ["CW8", "ETF World", "+0,42 %"],
  ["MSFT", "Microsoft", "-0,18 %"]
];

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="border-b border-border bg-card">
        <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-5 py-5 sm:px-8 lg:px-10">
          <nav className="flex items-center justify-between">
            <Link href="/" className="text-xl font-semibold">
              Waren
            </Link>
            <div className="flex items-center gap-2">
              <Button asChild variant="ghost" size="sm">
                <Link href="/login">Connexion</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/register">Compte fictif</Link>
              </Button>
            </div>
          </nav>

          <div className="grid flex-1 items-center gap-10 py-12 lg:grid-cols-2 lg:gap-16">
            <div className="max-w-xl">
              <Badge variant="secondary">Simulation uniquement</Badge>
              <h1 className="mt-6 text-5xl font-semibold leading-none sm:text-6xl">
                Investir sans risquer un euro reel.
              </h1>
              <p className="mt-6 text-lg leading-8 text-muted-foreground">
                Waren vous aide a tester vos decisions, suivre votre discipline et
                comprendre vos performances avec de l'argent fictif.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button asChild size="lg">
                  <Link href="/register">
                    Demarrer
                    <ArrowRight aria-hidden="true" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="/login">Ouvrir mon espace</Link>
                </Button>
              </div>

              <div className="mt-12 grid gap-6 border-t border-border pt-6 sm:grid-cols-3">
                <div>
                  <p className="text-2xl font-semibold">0 EUR</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    capital reel engage
                  </p>
                </div>
                <div>
                  <p className="text-2xl font-semibold text-[color:var(--positive)]">
                    +8,42 %
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    performance fictive
                  </p>
                </div>
                <div>
                  <p className="text-2xl font-semibold">20:30</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    synthese quotidienne
                  </p>
                </div>
              </div>
            </div>

            <div className="mx-auto w-full max-w-md lg:mr-0">
              <div className="rounded-[2rem] border border-border bg-[#11110f] p-3 shadow-[0_24px_80px_rgb(17_17_15_/_0.18)]">
                <div className="overflow-hidden rounded-[1.5rem] bg-[#f7f7f3]">
                  <div className="border-b border-border bg-card px-5 py-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold">Waren Core</p>
                        <p className="text-xs text-muted-foreground">
                          Portefeuille fictif
                        </p>
                      </div>
                      <ShieldCheck className="size-5 text-[color:var(--positive)]" />
                    </div>
                  </div>

                  <div className="px-5 py-6">
                    <p className="text-sm text-muted-foreground">Valeur totale</p>
                    <p className="mt-2 text-4xl font-semibold">128 430 EUR</p>
                    <p className="mt-2 text-sm font-semibold text-[color:var(--positive)]">
                      +9 980 EUR · +8,42 %
                    </p>

                    <div className="mt-7 h-40 border-b border-l border-border px-2 pb-3">
                      <div className="flex h-full items-end gap-2">
                        {bars.map((height, index) => (
                          <div
                            key={index}
                            className="flex-1 rounded-t-sm bg-[color:var(--positive)]"
                            style={{ height: `${height}%`, opacity: 0.35 + index / 22 }}
                          />
                        ))}
                      </div>
                    </div>

                    <div className="mt-7 space-y-3">
                      {holdings.map(([symbol, name, performance]) => {
                        const isNegative = performance.startsWith("-");
                        return (
                          <div
                            key={symbol}
                            className="flex items-center justify-between rounded-md border border-border bg-card px-4 py-3"
                          >
                            <div>
                              <p className="font-semibold">{symbol}</p>
                              <p className="text-xs text-muted-foreground">{name}</p>
                            </div>
                            <p
                              className={
                                isNegative
                                  ? "text-sm font-semibold text-[color:var(--negative)]"
                                  : "text-sm font-semibold text-[color:var(--positive)]"
                              }
                            >
                              {performance}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-4 border-t border-border py-6 text-sm text-muted-foreground md:grid-cols-3">
            <div className="flex items-center gap-3">
              <BarChart3 className="size-4 text-foreground" aria-hidden="true" />
              Tableaux de bord clairs, sans bruit visuel.
            </div>
            <div className="flex items-center gap-3">
              <MailCheck className="size-4 text-foreground" aria-hidden="true" />
              Emails quotidiens apres cloture.
            </div>
            <div className="flex items-center gap-3">
              <LockKeyhole className="size-4 text-foreground" aria-hidden="true" />
              Auth securisee et simulation uniquement.
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-6 px-5 py-14 sm:px-8 md:grid-cols-3 lg:px-10">
        {[
          [
            "Discipline",
            "Construisez une methode d'investissement avant d'engager du capital reel."
          ],
          [
            "Mesure",
            "Suivez P&L, cash, allocation, historique et evolution de chaque portefeuille."
          ],
          [
            "Controle",
            "Tous les ordres restent fictifs. Waren ne fournit ni courtage ni conseil financier."
          ]
        ].map(([title, description]) => (
          <div key={title} className="border-t border-border pt-5">
            <h2 className="text-lg font-semibold">{title}</h2>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">{description}</p>
          </div>
        ))}
      </section>
    </main>
  );
}
