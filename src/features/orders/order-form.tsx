"use client";

import { useActionState, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { ChevronRight, MoreHorizontal, Search, Star } from "lucide-react";
import { SubmitButton } from "@/components/forms/submit-button";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { placeMarketOrderAction } from "@/features/orders/actions";
import { initialActionState } from "@/lib/errors";
import { formatMoney, formatPercent, formatQuantity } from "@/lib/format";
import {
  assetCatalog,
  catalogCategories,
  type CatalogAsset
} from "@/features/assets/asset-catalog";
import {
  chartRanges,
  deterministicMarketPrice,
  generateMarketSeries,
  getAssetMove,
  type ChartRange
} from "@/features/assets/market-simulation";

type OrderPosition = {
  symbol: string;
  quantity: number;
  value: number;
};

export function OrderForm({
  portfolioId,
  defaultCurrency,
  cashValue,
  positions
}: {
  portfolioId: string;
  defaultCurrency: string;
  cashValue: number;
  positions: OrderPosition[];
}) {
  const [state, action] = useActionState(placeMarketOrderAction, initialActionState);
  const [query, setQuery] = useState("");
  const [selectedSymbol, setSelectedSymbol] = useState("NVDA");
  const [range, setRange] = useState<ChartRange>("1D");
  const [side, setSide] = useState<"BUY" | "SELL">("BUY");
  const [inputMode, setInputMode] = useState<"amount" | "quantity">("amount");
  const [amount, setAmount] = useState("");
  const [quantityInput, setQuantityInput] = useState("");

  const selectedAsset =
    assetCatalog.find((asset) => asset.symbol === selectedSymbol) ?? assetCatalog[0];
  const price = deterministicMarketPrice(selectedAsset.symbol);
  const move = getAssetMove(selectedAsset.symbol, range);
  const chartData = generateMarketSeries(selectedAsset.symbol, range);

  const normalizedQuery = query.trim().toLowerCase();
  const filteredAssets = assetCatalog.filter((asset) => {
    if (!normalizedQuery) {
      return true;
    }

    return [
      asset.symbol,
      asset.name,
      asset.sector,
      asset.country,
      asset.exchange,
      ...asset.tags
    ].some((value) => value.toLowerCase().includes(normalizedQuery));
  });

  const heldPosition = positions.find(
    (position) => position.symbol === selectedAsset.symbol
  );
  const heldQuantity = heldPosition?.quantity ?? 0;
  const amountValue = Number(amount);
  const quantityValue =
    inputMode === "amount" ? amountValue / price : Number(quantityInput);
  const orderGrossValue = quantityValue * price;
  const canBuy = side === "BUY" && quantityValue > 0 && cashValue >= orderGrossValue;
  const canSell = side === "SELL" && quantityValue > 0 && heldQuantity >= quantityValue;
  const canSubmit = canBuy || canSell;
  const quantityForSubmit =
    Number.isFinite(quantityValue) && quantityValue > 0 ? quantityValue : 0;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#090a09] px-4 py-6 text-white sm:px-6 lg:px-10 lg:py-8">
      <div className="mx-auto max-w-[1500px] pb-14">
        <header className="mb-10 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 flex-1 items-center gap-4">
            <Link
              href={`/portfolios/${portfolioId}`}
              className="flex size-11 shrink-0 items-center justify-center rounded-md bg-white text-lg font-black text-black"
              aria-label="Retour au portefeuille"
            >
              W
            </Link>
            <div className="relative w-full max-w-xl">
              <Search className="pointer-events-none absolute left-5 top-1/2 size-5 -translate-y-1/2 text-white/50" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Rechercher une action, crypto, ETF..."
                className="h-14 w-full rounded-full border border-white/10 bg-white/10 pl-14 pr-5 text-sm font-semibold text-white outline-none placeholder:text-white/40 focus:border-white/25"
              />
            </div>
          </div>

          <nav className="flex items-center gap-6 text-sm font-semibold text-white/70">
            <Link href={`/portfolios/${portfolioId}`} className="hover:text-white">
              Portefeuille
            </Link>
            <Link href="/orders" className="hover:text-white">
              Ordres
            </Link>
            <Link href="/profile" className="hover:text-white">
              Profil
            </Link>
            <span className="flex size-11 items-center justify-center rounded-full bg-[#1f5eff] text-base font-semibold text-white">
              W
            </span>
          </nav>
        </header>

        <div className="grid gap-8 xl:grid-cols-[320px_1fr_360px]">
          <aside className="space-y-5">
            <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.08] p-5 shadow-[0_24px_80px_rgb(0_0_0_/_0.25)]">
              {catalogCategories.map((category) => {
                const assets = filteredAssets.filter(
                  (asset) => asset.category === category
                );
                if (assets.length === 0) {
                  return null;
                }

                return (
                  <section
                    key={category}
                    className="border-b border-white/10 py-5 first:pt-0 last:border-b-0 last:pb-0"
                  >
                    <button
                      type="button"
                      className="mb-4 flex w-full items-center justify-between text-left text-xl font-semibold"
                    >
                      {category}
                      <ChevronRight className="size-5 text-white/40" aria-hidden="true" />
                    </button>
                    <div className="space-y-2">
                      {assets.map((asset) => (
                        <AssetSearchRow
                          key={`${asset.symbol}-${asset.exchange}`}
                          asset={asset}
                          active={asset.symbol === selectedAsset.symbol}
                          onSelect={() => setSelectedSymbol(asset.symbol)}
                        />
                      ))}
                    </div>
                  </section>
                );
              })}
            </div>
          </aside>

          <main className="min-w-0 space-y-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <AssetLogo asset={selectedAsset} size="lg" />
                <h1 className="mt-8 text-4xl font-semibold tracking-normal sm:text-5xl">
                  {selectedAsset.name.replace(" Corporation", "")}
                </h1>
                <p className="mt-3 text-5xl font-semibold tabular-nums">
                  {formatMoney(price, selectedAsset.currency)}
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-3 text-sm font-semibold">
                  <span
                    className={move.amount >= 0 ? "text-[#32d46b]" : "text-[#ff5a61]"}
                  >
                    {move.amount >= 0 ? "+" : ""}
                    {formatMoney(move.amount, selectedAsset.currency)} ·{" "}
                    {formatPercent(move.percent)}
                  </span>
                  <span className="text-white/40">
                    Depuis {chartRanges.find((item) => item.value === range)?.label}
                  </span>
                </div>
              </div>
              <button
                type="button"
                className="mt-12 flex size-11 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
                aria-label="Ajouter aux favoris"
              >
                <Star className="size-5" aria-hidden="true" />
              </button>
            </div>

            <div className="flex flex-wrap gap-4">
              {chartRanges.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setRange(item.value)}
                  className={
                    range === item.value
                      ? "rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white"
                      : "rounded-full px-4 py-2 text-sm font-semibold text-white/50 hover:bg-white/10 hover:text-white"
                  }
                >
                  {item.label}
                </button>
              ))}
            </div>

            <div className="h-[440px] rounded-[1.5rem] border border-white/10 bg-[#0d0f0d] p-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={chartData}
                  margin={{ top: 18, right: 18, left: 4, bottom: 10 }}
                >
                  <defs>
                    <linearGradient id="assetLineFill" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="#32d46b" stopOpacity={0.18} />
                      <stop offset="85%" stopColor="#32d46b" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="rgba(255,255,255,0.07)" vertical={false} />
                  <XAxis
                    dataKey="label"
                    axisLine={false}
                    tickLine={false}
                    interval="preserveStartEnd"
                    tick={{
                      fill: "rgba(255,255,255,0.35)",
                      fontSize: 12,
                      fontWeight: 700
                    }}
                  />
                  <YAxis
                    orientation="right"
                    axisLine={false}
                    tickLine={false}
                    width={70}
                    tickFormatter={(value) => Number(value).toFixed(2)}
                    tick={{
                      fill: "rgba(255,255,255,0.35)",
                      fontSize: 12,
                      fontWeight: 700
                    }}
                    domain={["dataMin - 2", "dataMax + 2"]}
                  />
                  <Tooltip
                    formatter={(value) => [
                      formatMoney(Number(value), selectedAsset.currency),
                      selectedAsset.symbol
                    ]}
                    labelFormatter={(label) => `${label}`}
                    contentStyle={{
                      border: "1px solid rgba(255,255,255,.12)",
                      background: "#1b1d1b",
                      borderRadius: 14,
                      color: "#fff",
                      boxShadow: "0 16px 50px rgba(0,0,0,.35)"
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="price"
                    stroke="#32d46b"
                    strokeWidth={2.5}
                    fill="url(#assetLineFill)"
                    dot={false}
                    activeDot={{
                      r: 5,
                      fill: "#32d46b",
                      stroke: "#132516",
                      strokeWidth: 4
                    }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <AssetInformation asset={selectedAsset} />
          </main>

          <aside className="space-y-6 xl:sticky xl:top-8 xl:self-start">
            <form
              action={action}
              className="rounded-[1.5rem] border border-white/10 bg-white/[0.07] p-6"
            >
              {state.message ? (
                <Alert className="mb-4 border-white/10 bg-white/10 text-white">
                  {state.message}
                </Alert>
              ) : null}

              <input type="hidden" name="portfolioId" value={portfolioId} />
              <input type="hidden" name="side" value={side} />
              <input type="hidden" name="orderType" value="MARKET" />
              <input type="hidden" name="quantity" value={quantityForSubmit.toFixed(8)} />
              <input type="hidden" name="symbol" value={selectedAsset.symbol} />
              <input type="hidden" name="name" value={selectedAsset.name} />
              <input type="hidden" name="assetType" value={selectedAsset.assetType} />
              <input type="hidden" name="exchange" value={selectedAsset.exchange} />
              <input
                type="hidden"
                name="currency"
                value={selectedAsset.currency || defaultCurrency}
              />
              <input type="hidden" name="sector" value={selectedAsset.sector} />
              <input type="hidden" name="country" value={selectedAsset.country} />

              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setSide("BUY")}
                      className={
                        side === "BUY"
                          ? "text-2xl font-semibold text-white"
                          : "text-2xl font-semibold text-white/40"
                      }
                    >
                      Acheter
                    </button>
                    <span className="text-2xl font-semibold text-white/20">/</span>
                    <button
                      type="button"
                      onClick={() => setSide("SELL")}
                      className={
                        side === "SELL"
                          ? "text-2xl font-semibold text-white"
                          : "text-2xl font-semibold text-white/40"
                      }
                    >
                      Vendre
                    </button>
                  </div>
                  <p className="mt-3 text-sm font-semibold text-white/50">
                    {formatMoney(cashValue, defaultCurrency)} disponibles
                  </p>
                </div>
                <MoreHorizontal
                  className="mt-1 size-6 text-white/50"
                  aria-hidden="true"
                />
              </div>

              <div className="mt-8 flex gap-3">
                <button
                  type="button"
                  onClick={() => setInputMode("amount")}
                  className={
                    inputMode === "amount"
                      ? "rounded-full bg-white/10 px-4 py-2 text-sm font-semibold"
                      : "px-4 py-2 text-sm font-semibold text-white/40"
                  }
                >
                  Montant
                </button>
                <button
                  type="button"
                  onClick={() => setInputMode("quantity")}
                  className={
                    inputMode === "quantity"
                      ? "rounded-full bg-white/10 px-4 py-2 text-sm font-semibold"
                      : "px-4 py-2 text-sm font-semibold text-white/40"
                  }
                >
                  Quantité
                </button>
              </div>

              <div className="mt-8 space-y-5">
                {inputMode === "amount" ? (
                  <TradeInput
                    label="Montant"
                    value={amount}
                    suffix={defaultCurrency}
                    onChange={setAmount}
                    placeholder="0"
                  />
                ) : (
                  <TradeInput
                    label="Quantité"
                    value={quantityInput}
                    suffix={selectedAsset.symbol}
                    onChange={setQuantityInput}
                    placeholder="0"
                  />
                )}

                <div className="flex items-center justify-between text-sm font-semibold text-white/50">
                  <span>Au marché</span>
                  <span>
                    {formatQuantity(quantityForSubmit)} {selectedAsset.symbol}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm font-semibold text-white/50">
                  <span>Estimation</span>
                  <span>{formatMoney(orderGrossValue, selectedAsset.currency)}</span>
                </div>
                {side === "SELL" ? (
                  <div className="flex items-center justify-between text-sm font-semibold text-white/50">
                    <span>Détenu</span>
                    <span>
                      {formatQuantity(heldQuantity)} {selectedAsset.symbol}
                    </span>
                  </div>
                ) : null}
              </div>

              {!canSubmit ? (
                <p className="mt-6 text-sm leading-6 text-white/50">
                  {side === "BUY"
                    ? "Saisissez un montant inférieur au cash disponible pour valider l'achat."
                    : "Vous devez détenir une quantité suffisante pour vendre cet actif."}
                </p>
              ) : null}

              <SubmitButton
                disabled={!canSubmit}
                className="mt-6 h-14 w-full rounded-full bg-white text-base font-semibold text-black hover:bg-white/90 disabled:bg-white/20 disabled:text-white/30"
              >
                Valider l'ordre
              </SubmitButton>
            </form>

            <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.05] p-6">
              <h2 className="text-xl font-semibold">Investissez régulièrement</h2>
              <p className="mt-4 text-sm font-semibold leading-6 text-white/50">
                Les plans programmés arriveront plus tard. Pour l'instant, chaque ordre
                Waren reste ponctuel, fictif et contrôlé côté serveur.
              </p>
              <button
                type="button"
                className="mt-6 h-12 w-full rounded-full bg-white/10 text-sm font-semibold text-white/50"
              >
                Créer
              </button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function AssetSearchRow({
  asset,
  active,
  onSelect
}: {
  asset: CatalogAsset;
  active: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={
        active
          ? "flex w-full items-center gap-4 rounded-2xl bg-white/10 p-3 text-left"
          : "flex w-full items-center gap-4 rounded-2xl p-3 text-left hover:bg-white/10"
      }
    >
      <AssetLogo asset={asset} />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-base font-semibold">
          {asset.name.replace(" Corporation", "")}
        </span>
        <span className="mt-1 block truncate text-xs font-semibold text-white/50">
          {asset.country}, {asset.exchange}, {asset.sector}
        </span>
      </span>
    </button>
  );
}

function AssetLogo({ asset, size = "md" }: { asset: CatalogAsset; size?: "md" | "lg" }) {
  return (
    <span
      className={[
        "flex shrink-0 items-center justify-center rounded-md font-black",
        asset.logoClassName,
        size === "lg" ? "size-12 text-lg" : "size-9 text-sm"
      ].join(" ")}
    >
      {asset.logoUrl ? (
        <Image
          src={asset.logoUrl}
          alt=""
          width={32}
          height={32}
          unoptimized
          className={size === "lg" ? "size-8 object-contain" : "size-6 object-contain"}
        />
      ) : (
        asset.logoText
      )}
    </span>
  );
}

function TradeInput({
  label,
  value,
  suffix,
  placeholder,
  onChange
}: {
  label: string;
  value: string;
  suffix: string;
  placeholder: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="grid gap-3">
      <span className="text-sm font-semibold text-white/50">{label}</span>
      <span className="flex h-14 items-center rounded-full bg-white/10 px-5">
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          inputMode="decimal"
          placeholder={placeholder}
          className="min-w-0 flex-1 bg-transparent text-right text-lg font-semibold text-white outline-none placeholder:text-white/25"
        />
        <span className="ml-3 text-sm font-semibold text-white/50">{suffix}</span>
      </span>
    </label>
  );
}

function AssetInformation({ asset }: { asset: CatalogAsset }) {
  return (
    <div className="space-y-14 pb-10">
      <section>
        <h2 className="text-3xl font-semibold">Informations</h2>
        <div className="mt-7 flex flex-wrap gap-3">
          {asset.tags.map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="border-white/10 bg-white/10 px-4 py-2 text-white/70"
            >
              {tag}
            </Badge>
          ))}
        </div>
        <p className="mt-7 max-w-4xl text-base font-semibold leading-8 text-white/80">
          {asset.description}
        </p>
        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          <InfoStat label="ISIN" value={asset.isin} />
          <InfoStat label="WKN" value={asset.wkn} />
          <InfoStat label="Nom" value={asset.name.replace(" Corporation", "")} />
        </div>
      </section>

      <section>
        <h2 className="text-3xl font-semibold">Métriques</h2>
        <div className="mt-8 grid gap-x-16 gap-y-8 lg:grid-cols-2">
          <RangeMetric
            label="Per. 1J"
            low={asset.dayLow}
            high={asset.dayHigh}
            currency={asset.currency}
          />
          <Metric label="Cap. Bours." value={asset.marketCap} />
          <RangeMetric
            label="Per. 52S"
            low={asset.yearLow}
            high={asset.yearHigh}
            currency={asset.currency}
          />
          <Metric label="P/E" value={asset.peRatio} />
          <Metric label="Ouverture" value={formatMoney(asset.open, asset.currency)} />
          <Metric label="Beta 52S" value={asset.beta} />
          <Metric
            label="Cloture"
            value={formatMoney(asset.previousClose, asset.currency)}
          />
          <Metric label="Rend. div." value={asset.dividendYield} />
          <Metric label="Bid" value={formatMoney(asset.bid, asset.currency)} />
          <Metric label="Ask" value={formatMoney(asset.ask, asset.currency)} />
        </div>
      </section>

      <section>
        <h2 className="text-3xl font-semibold">Actualités</h2>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {asset.news.map((item) => (
            <article key={item.title} className="rounded-[1.25rem] bg-white/[0.06] p-6">
              <h3 className="line-clamp-2 text-lg font-semibold leading-7">
                {item.title}
              </h3>
              <p className="mt-4 text-sm font-semibold text-white/40">{item.time}</p>
            </article>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-3xl font-semibold">Analystes</h2>
        <p className="mt-5 text-5xl font-semibold">
          {formatMoney(asset.analystTarget, asset.currency)}
        </p>
        <p className="mt-3 max-w-3xl text-sm font-semibold leading-6 text-white/50">
          Moyenne des estimations actuelles. Données indicatives pour la simulation.
        </p>
        <div className="mt-8 flex h-3 overflow-hidden rounded-full bg-white/20">
          <span className="bg-[#32d46b]" style={{ width: `${asset.analystBuy}%` }} />
          <span className="bg-white/30" style={{ width: `${asset.analystHold}%` }} />
          <span className="bg-[#e4484f]" style={{ width: `${asset.analystSell}%` }} />
        </div>
        <div className="mt-6 grid max-w-xl grid-cols-3 gap-6">
          <Metric label="Acheter" value={`${asset.analystBuy} %`} tone="positive" />
          <Metric label="Conserver" value={`${asset.analystHold} %`} />
          <Metric label="Vendre" value={`${asset.analystSell} %`} tone="negative" />
        </div>
      </section>

      {asset.events.length > 0 ? (
        <section>
          <h2 className="text-3xl font-semibold">Prochains événements</h2>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {asset.events.map((event) => (
              <article
                key={`${event.day}-${event.title}`}
                className="rounded-[1.25rem] bg-white/[0.06] p-6"
              >
                <div className="flex items-start gap-5">
                  <div>
                    <p className="text-3xl font-semibold">{event.day}</p>
                    <p className="text-sm font-semibold text-white/50">{event.month}</p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold leading-6">{event.title}</h3>
                    <p className="mt-4 text-sm font-semibold leading-6 text-white/70">
                      {event.description}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {asset.dividends.length > 0 ? (
        <section>
          <h2 className="text-3xl font-semibold">Dividendes</h2>
          <div className="mt-8 space-y-5">
            {asset.dividends.map((dividend) => (
              <div
                key={dividend.date}
                className="grid grid-cols-[90px_1fr_90px] items-center gap-5"
              >
                <span className="text-sm font-semibold text-white/50">
                  {dividend.date}
                </span>
                <span className="h-3 rounded-full bg-[#32d46b]" />
                <span className="text-right font-semibold">
                  {formatMoney(dividend.amount, asset.currency)}
                </span>
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}

function InfoStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-sm font-semibold text-white/50">{label}</p>
      <p className="mt-3 text-lg font-semibold">{value}</p>
    </div>
  );
}

function Metric({
  label,
  value,
  tone = "neutral"
}: {
  label: string;
  value: string;
  tone?: "neutral" | "positive" | "negative";
}) {
  return (
    <div>
      <p
        className={
          tone === "positive"
            ? "text-sm font-semibold text-[#32d46b]"
            : tone === "negative"
              ? "text-sm font-semibold text-[#e4484f]"
              : "text-sm font-semibold text-white/50"
        }
      >
        {label}
      </p>
      <p className="mt-3 text-xl font-semibold">{value}</p>
    </div>
  );
}

function RangeMetric({
  label,
  low,
  high,
  currency
}: {
  label: string;
  low: number;
  high: number;
  currency: string;
}) {
  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm font-semibold text-white/50">{label}</p>
        <div className="flex min-w-[240px] items-center gap-5">
          <span className="text-lg font-semibold">{formatMoney(low, currency)}</span>
          <span className="h-1 flex-1 overflow-hidden rounded-full bg-white/10">
            <span className="block h-full w-2/3 rounded-full bg-[#32d46b]" />
          </span>
          <span className="text-lg font-semibold">{formatMoney(high, currency)}</span>
        </div>
      </div>
    </div>
  );
}
