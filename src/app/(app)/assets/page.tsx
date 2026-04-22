import Link from "next/link";
import { Search, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getMarketNews } from "@/server/market-data/price-service";
import { searchAssets } from "@/features/assets/service";

export default async function AssetsPage({
  searchParams
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  const query = params.q ?? "";
  const [assets, news] = await Promise.all([
    searchAssets(query),
    getMarketNews({ limit: 8 })
  ]);

  return (
    <div className="-mx-4 -my-7 min-h-[calc(100vh-4rem)] bg-[#090a09] px-4 py-7 text-white sm:-mx-6 sm:px-6 lg:-mx-10 lg:-my-10 lg:px-10 lg:py-10">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="grid gap-8 xl:grid-cols-[1fr_360px]">
          <section>
            <p className="text-sm font-semibold uppercase tracking-normal text-white/45">
              Marchés Waren
            </p>
            <h1 className="mt-3 max-w-4xl text-5xl font-semibold tracking-normal">
              Explorez actions, ETF, crypto et indices avec des données connectées.
            </h1>
            <form className="relative mt-8 max-w-2xl">
              <Search className="pointer-events-none absolute left-5 top-1/2 size-5 -translate-y-1/2 text-white/45" />
              <input
                name="q"
                defaultValue={query}
                placeholder="Ticker, nom, secteur, ETF, crypto..."
                className="h-15 w-full rounded-full border border-white/10 bg-white/10 pl-14 pr-36 text-sm font-semibold text-white outline-none placeholder:text-white/40 focus:border-white/25"
              />
              <Button className="absolute right-2 top-2 rounded-full bg-white text-black hover:bg-white/90">
                Rechercher
              </Button>
            </form>
          </section>

          <aside className="rounded-[1.5rem] border border-white/10 bg-white/[0.06] p-6">
            <div className="flex items-center gap-3">
              <Sparkles className="size-5 text-[#32d46b]" />
              <h2 className="text-xl font-semibold">Live layer</h2>
            </div>
            <p className="mt-4 text-sm font-semibold leading-6 text-white/55">
              Waren interroge les providers configurés, met en cache les réponses et
              persiste les prix pour les portefeuilles et snapshots.
            </p>
          </aside>
        </div>

        <section>
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-3xl font-semibold">Résultats</h2>
              <p className="mt-2 text-sm font-semibold text-white/45">
                {assets.length} actifs trouvés
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {assets.map((asset) => (
              <Link
                key={`${asset.symbol}-${asset.exchange}-${asset.currency}-${asset.providerId}`}
                href={`/assets/${asset.symbol}`}
                className="rounded-[1.25rem] border border-white/10 bg-white/[0.05] p-5 transition hover:border-white/20 hover:bg-white/[0.08]"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xl font-semibold">{asset.symbol}</p>
                    <p className="mt-2 line-clamp-2 text-sm font-semibold leading-6 text-white/60">
                      {asset.name}
                    </p>
                  </div>
                  <Badge
                    className="border-white/10 bg-white/10 text-white/70"
                    variant="outline"
                  >
                    {asset.assetType}
                  </Badge>
                </div>
                <div className="mt-6 flex flex-wrap gap-2">
                  {[asset.exchange, asset.currency, asset.sector, asset.provider]
                    .filter(Boolean)
                    .map((item) => (
                      <span
                        key={String(item)}
                        className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white/50"
                      >
                        {item}
                      </span>
                    ))}
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-3xl font-semibold">Actualités de marché</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {news.map((item) => (
              <a
                key={item.id}
                href={item.url ?? "#"}
                target={item.url ? "_blank" : undefined}
                rel="noreferrer"
                className="rounded-[1.25rem] border border-white/10 bg-white/[0.05] p-5 transition hover:bg-white/[0.08]"
              >
                <p className="text-xs font-semibold uppercase text-white/40">
                  {item.source ?? item.provider}
                </p>
                <h3 className="mt-4 line-clamp-3 text-base font-semibold leading-7">
                  {item.title}
                </h3>
                <p className="mt-4 text-xs font-semibold text-white/40">
                  {new Intl.DateTimeFormat("fr-FR", {
                    dateStyle: "medium",
                    timeStyle: "short"
                  }).format(new Date(item.publishedAt))}
                </p>
              </a>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
