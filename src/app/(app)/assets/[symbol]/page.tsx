import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ExternalLink, ShoppingCart, Star } from "lucide-react";
import { AssetLiveChart } from "@/features/assets/asset-live-chart";
import { getAssetLiveView } from "@/features/assets/service";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatMoney, formatPercent } from "@/lib/format";
import { requireUser } from "@/server/security/sessions";
import { getGlobalDashboard } from "@/features/analytics/service";

export default async function AssetDetailPage({
  params
}: {
  params: Promise<{ symbol: string }>;
}) {
  const user = await requireUser();
  const { symbol } = await params;
  const [live, dashboard] = await Promise.all([
    getAssetLiveView({ symbol, range: "1M", days: 30 }),
    getGlobalDashboard(user.id)
  ]);

  if (!live) {
    notFound();
  }

  const position = dashboard.portfolios
    .flatMap((portfolio) => portfolio.positions)
    .find((item) => item.symbol === live.asset.symbol);
  const firstPortfolioId = dashboard.portfolios[0]?.portfolio.id;
  const changePercent = live.quote.changePercent ?? 0;
  const changeAmount = live.quote.change ?? 0;

  return (
    <div className="-mx-4 -my-7 min-h-[calc(100vh-4rem)] bg-[#090a09] px-4 py-7 text-white sm:-mx-6 sm:px-6 lg:-mx-10 lg:-my-10 lg:px-10 lg:py-10">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
          <div>
            <Link
              href="/assets"
              className="inline-flex items-center gap-2 text-sm font-semibold text-white/50 hover:text-white"
            >
              <ArrowLeft className="size-4" />
              Marchés
            </Link>
            <div className="mt-6 flex items-start gap-4">
              <div className="flex size-14 items-center justify-center rounded-xl border border-white/10 bg-white/10 text-lg font-black">
                {live.asset.symbol.slice(0, 2)}
              </div>
              <div>
                <h1 className="text-5xl font-semibold tracking-normal">
                  {live.asset.name}
                </h1>
                <div className="mt-4 flex flex-wrap gap-2">
                  {[
                    live.asset.symbol,
                    live.asset.assetType,
                    live.asset.exchange,
                    live.asset.currency
                  ]
                    .filter(Boolean)
                    .map((item) => (
                      <Badge
                        key={String(item)}
                        className="border-white/10 bg-white/10 text-white/70"
                        variant="outline"
                      >
                        {item}
                      </Badge>
                    ))}
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button className="rounded-full bg-white text-black hover:bg-white/90">
              <Star className="size-4" />
              Suivre
            </Button>
            {firstPortfolioId ? (
              <Button
                asChild
                className="rounded-full bg-[#32d46b] text-black hover:bg-[#32d46b]/90"
              >
                <Link href={`/portfolios/${firstPortfolioId}/orders/new`}>
                  <ShoppingCart className="size-4" />
                  Acheter / vendre
                </Link>
              </Button>
            ) : null}
          </div>
        </div>

        <div className="grid gap-8 xl:grid-cols-[1fr_360px]">
          <section className="space-y-8">
            <div>
              <p className="text-6xl font-semibold tabular-nums">
                {formatMoney(live.quote.price, live.quote.currency)}
              </p>
              <p
                className={
                  changePercent >= 0
                    ? "mt-3 text-sm font-semibold text-[#32d46b]"
                    : "mt-3 text-sm font-semibold text-[#ff5a61]"
                }
              >
                {changeAmount >= 0 ? "+" : ""}
                {formatMoney(changeAmount, live.quote.currency)} ·{" "}
                {formatPercent(changePercent)}
              </p>
            </div>

            <Card className="border-white/10 bg-white/[0.04] text-white">
              <CardContent className="p-5">
                <AssetLiveChart
                  data={live.history}
                  currency={live.quote.currency}
                  height={420}
                />
              </CardContent>
            </Card>

            <Card className="border-white/10 bg-white/[0.04] text-white">
              <CardHeader>
                <CardTitle>Informations</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="max-w-4xl text-sm font-semibold leading-7 text-white/70">
                  {live.asset.description ??
                    "Les métadonnées enrichies apparaîtront ici selon le provider configuré."}
                </p>
                {live.asset.website ? (
                  <a
                    href={live.asset.website}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#32d46b]"
                  >
                    Site officiel
                    <ExternalLink className="size-4" />
                  </a>
                ) : null}
              </CardContent>
            </Card>

            <section>
              <h2 className="text-3xl font-semibold">Actualités</h2>
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                {live.news.map((item) => (
                  <a
                    key={item.id}
                    href={item.url ?? "#"}
                    target={item.url ? "_blank" : undefined}
                    rel="noreferrer"
                    className="rounded-[1.25rem] border border-white/10 bg-white/[0.05] p-5 transition hover:bg-white/[0.08]"
                  >
                    <p className="text-xs font-semibold uppercase text-white/40">
                      {item.source ?? item.provider} ·{" "}
                      {new Intl.DateTimeFormat("fr-FR", {
                        dateStyle: "medium",
                        timeStyle: "short"
                      }).format(new Date(item.publishedAt))}
                    </p>
                    <h3 className="mt-3 text-lg font-semibold leading-7">{item.title}</h3>
                    {item.summary ? (
                      <p className="mt-3 line-clamp-3 text-sm leading-6 text-white/55">
                        {item.summary}
                      </p>
                    ) : null}
                  </a>
                ))}
              </div>
            </section>
          </section>

          <aside className="space-y-4">
            <Card className="border-white/10 bg-white/[0.06] text-white">
              <CardHeader>
                <CardTitle>Votre position</CardTitle>
              </CardHeader>
              <CardContent>
                {position ? (
                  <div className="space-y-4">
                    <Metric label="Quantité" value={String(position.quantity)} />
                    <Metric
                      label="Valeur"
                      value={formatMoney(position.value, live.quote.currency)}
                    />
                    <Metric
                      label="P&L latent"
                      value={formatMoney(position.unrealizedPnl, live.quote.currency)}
                    />
                  </div>
                ) : (
                  <p className="text-sm font-semibold leading-6 text-white/55">
                    Aucune position ouverte sur cet actif pour le moment.
                  </p>
                )}
              </CardContent>
            </Card>

            <Card className="border-white/10 bg-white/[0.06] text-white">
              <CardHeader>
                <CardTitle>Métriques marché</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Metric
                  label="Ouverture"
                  value={formatNullableMoney(live.quote.open, live.quote.currency)}
                />
                <Metric
                  label="Haut"
                  value={formatNullableMoney(live.quote.high, live.quote.currency)}
                />
                <Metric
                  label="Bas"
                  value={formatNullableMoney(live.quote.low, live.quote.currency)}
                />
                <Metric
                  label="Clôture précédente"
                  value={formatNullableMoney(
                    live.quote.previousClose,
                    live.quote.currency
                  )}
                />
                <Metric
                  label="Volume"
                  value={
                    live.quote.volume
                      ? new Intl.NumberFormat("fr-FR", { notation: "compact" }).format(
                          live.quote.volume
                        )
                      : "-"
                  }
                />
                <Metric label="Source" value={live.quote.provider} />
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-3 last:border-b-0 last:pb-0">
      <span className="text-sm font-semibold text-white/45">{label}</span>
      <span className="text-right text-sm font-semibold">{value}</span>
    </div>
  );
}

function formatNullableMoney(value: number | null | undefined, currency: string) {
  return value ? formatMoney(value, currency) : "-";
}
