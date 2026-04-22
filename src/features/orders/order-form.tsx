"use client";

import { AssetType } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import { useActionState, useEffect, useMemo, useState } from "react";
import { ChevronRight, MoreHorizontal, Search, Star } from "lucide-react";
import { AssetLiveChart } from "@/features/assets/asset-live-chart";
import { SubmitButton } from "@/components/forms/submit-button";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { placeMarketOrderAction } from "@/features/orders/actions";
import { initialActionState } from "@/lib/errors";
import { formatMoney, formatPercent, formatQuantity } from "@/lib/format";
import type {
  AssetLookupResult,
  HistoricalPrice,
  MarketQuote,
  PriceRange
} from "@/server/market-data/types";

type OrderPosition = {
  symbol: string;
  quantity: number;
  value: number;
  unrealizedPnl?: number;
};

type ClientQuote = Omit<MarketQuote, "timestamp"> & { timestamp: string | Date };
type ClientHistory = Array<
  Omit<HistoricalPrice, "timestamp"> & { timestamp: string | Date }
>;

const chartRanges: Array<{ value: PriceRange; label: string }> = [
  { value: "1D", label: "1J" },
  { value: "1W", label: "1S" },
  { value: "1M", label: "1M" },
  { value: "6M", label: "6M" },
  { value: "1Y", label: "1A" },
  { value: "5Y", label: "5A" },
  { value: "MAX", label: "Max" }
];

export function OrderForm({
  portfolioId,
  defaultCurrency,
  cashValue,
  positions,
  initialAssets
}: {
  portfolioId: string;
  defaultCurrency: string;
  cashValue: number;
  positions: OrderPosition[];
  initialAssets: AssetLookupResult[];
}) {
  const [state, action] = useActionState(placeMarketOrderAction, initialActionState);
  const [query, setQuery] = useState("");
  const [assets, setAssets] = useState(initialAssets);
  const [selectedKey, setSelectedKey] = useState(() => assetKey(initialAssets[0]));
  const [range, setRange] = useState<PriceRange>("1D");
  const [side, setSide] = useState<"BUY" | "SELL">("BUY");
  const [inputMode, setInputMode] = useState<"amount" | "quantity">("amount");
  const [amount, setAmount] = useState("");
  const [quantityInput, setQuantityInput] = useState("");
  const [quote, setQuote] = useState<ClientQuote | null>(null);
  const [history, setHistory] = useState<ClientHistory>([]);
  const [isLoadingMarket, setIsLoadingMarket] = useState(false);

  const selectedAsset =
    assets.find((asset) => assetKey(asset) === selectedKey) ??
    assets[0] ??
    fallbackAsset();

  useEffect(() => {
    const controller = new AbortController();
    const timeout = setTimeout(async () => {
      const response = await fetch(`/api/market/search?q=${encodeURIComponent(query)}`, {
        signal: controller.signal
      });
      if (!response.ok) {
        return;
      }
      const payload = (await response.json()) as { assets: AssetLookupResult[] };
      if (payload.assets.length > 0) {
        setAssets(payload.assets);
        setSelectedKey((current) =>
          payload.assets.some((asset) => assetKey(asset) === current)
            ? current
            : assetKey(payload.assets[0])
        );
      }
    }, 250);

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [query]);

  useEffect(() => {
    const controller = new AbortController();

    async function loadMarket() {
      setIsLoadingMarket(true);
      try {
        const params = toMarketParams(selectedAsset);
        const [quoteResponse, historyResponse] = await Promise.all([
          fetch(`/api/market/quote?${params.toString()}`, { signal: controller.signal }),
          fetch(`/api/market/history?${params.toString()}&range=${range}`, {
            signal: controller.signal
          })
        ]);

        if (quoteResponse.ok) {
          const payload = (await quoteResponse.json()) as { quote: ClientQuote };
          setQuote(payload.quote);
        }

        if (historyResponse.ok) {
          const payload = (await historyResponse.json()) as { history: ClientHistory };
          setHistory(payload.history);
        }
      } finally {
        setIsLoadingMarket(false);
      }
    }

    loadMarket();
    const interval = setInterval(loadMarket, 45_000);
    return () => {
      controller.abort();
      clearInterval(interval);
    };
  }, [range, selectedAsset]);

  const groupedAssets = useMemo(() => groupAssets(assets), [assets]);
  const heldPosition = positions.find(
    (position) => position.symbol === selectedAsset.symbol
  );
  const heldQuantity = heldPosition?.quantity ?? 0;
  const price = quote?.price ?? history.at(-1)?.close ?? 0;
  const changeAmount = quote?.change ?? calculateHistoryMove(history).amount;
  const changePercent = quote?.changePercent ?? calculateHistoryMove(history).percent;
  const amountValue = Number(amount);
  const quantityValue =
    inputMode === "amount"
      ? price > 0
        ? amountValue / price
        : 0
      : Number(quantityInput);
  const orderGrossValue = quantityValue * price;
  const canBuy = side === "BUY" && quantityValue > 0 && cashValue >= orderGrossValue;
  const canSell = side === "SELL" && quantityValue > 0 && heldQuantity >= quantityValue;
  const canSubmit = (canBuy || canSell) && price > 0;
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
                placeholder="Rechercher ticker, nom, ETF, crypto..."
                className="h-14 w-full rounded-full border border-white/10 bg-white/10 pl-14 pr-5 text-sm font-semibold text-white outline-none placeholder:text-white/40 focus:border-white/25"
              />
            </div>
          </div>

          <nav className="flex items-center gap-6 text-sm font-semibold text-white/70">
            <Link href={`/portfolios/${portfolioId}`} className="hover:text-white">
              Portefeuille
            </Link>
            <Link href="/assets" className="hover:text-white">
              Marchés
            </Link>
            <Link href="/orders" className="hover:text-white">
              Ordres
            </Link>
            <Link href="/profile" className="hover:text-white">
              Profil
            </Link>
          </nav>
        </header>

        <div className="grid gap-8 xl:grid-cols-[340px_1fr_360px]">
          <aside>
            <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.08] p-5 shadow-[0_24px_80px_rgb(0_0_0_/_0.25)]">
              {Object.entries(groupedAssets).map(([category, items]) => (
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
                    {items.map((asset) => (
                      <AssetSearchRow
                        key={assetKey(asset)}
                        asset={asset}
                        active={assetKey(asset) === assetKey(selectedAsset)}
                        onSelect={() => setSelectedKey(assetKey(asset))}
                      />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </aside>

          <main className="min-w-0 space-y-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <AssetLogo asset={selectedAsset} size="lg" />
                <h1 className="mt-8 text-4xl font-semibold tracking-normal sm:text-5xl">
                  {cleanAssetName(selectedAsset.name)}
                </h1>
                <p className="mt-3 text-5xl font-semibold tabular-nums">
                  {price > 0
                    ? formatMoney(price, selectedAsset.currency)
                    : "Prix indisponible"}
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-3 text-sm font-semibold">
                  <span
                    className={changeAmount >= 0 ? "text-[#32d46b]" : "text-[#ff5a61]"}
                  >
                    {changeAmount >= 0 ? "+" : ""}
                    {formatMoney(changeAmount, selectedAsset.currency)} ·{" "}
                    {formatPercent(changePercent)}
                  </span>
                  <span className="text-white/40">
                    {quote?.isRealtime ? "Live/quasi live" : "Fallback"}
                    {quote?.provider ? ` · ${quote.provider}` : null}
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

            <div className="rounded-[1.5rem] border border-white/10 bg-[#0d0f0d] p-4">
              <AssetLiveChart
                data={history}
                currency={selectedAsset.currency}
                height={440}
              />
              {isLoadingMarket ? (
                <p className="px-2 pb-2 text-xs font-semibold text-white/40">
                  Mise à jour des données de marché...
                </p>
              ) : null}
            </div>

            <AssetInformation asset={selectedAsset} quote={quote} />
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

              <OrderHiddenFields
                portfolioId={portfolioId}
                side={side}
                quantity={quantityForSubmit}
                asset={selectedAsset}
              />

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

                <OrderLine
                  label="Au marché"
                  value={`${formatQuantity(quantityForSubmit)} ${selectedAsset.symbol}`}
                />
                <OrderLine
                  label="Estimation"
                  value={formatMoney(orderGrossValue, selectedAsset.currency)}
                />
                {side === "SELL" ? (
                  <OrderLine
                    label="Détenu"
                    value={`${formatQuantity(heldQuantity)} ${selectedAsset.symbol}`}
                  />
                ) : null}
              </div>

              {!canSubmit ? (
                <p className="mt-6 text-sm leading-6 text-white/50">
                  {side === "BUY"
                    ? "Saisissez un montant inférieur au cash disponible et attendez un prix valide."
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
              <h2 className="text-xl font-semibold">Position Waren</h2>
              <p className="mt-4 text-sm font-semibold leading-6 text-white/50">
                {heldQuantity > 0
                  ? `Vous détenez ${formatQuantity(heldQuantity)} ${selectedAsset.symbol} dans ce portefeuille fictif.`
                  : "Vous ne détenez pas encore cet actif dans ce portefeuille fictif."}
              </p>
              <Link
                href={`/assets/${selectedAsset.symbol}`}
                className="mt-6 inline-flex h-12 w-full items-center justify-center rounded-full bg-white/10 text-sm font-semibold text-white/70 hover:bg-white/15"
              >
                Ouvrir la fiche complète
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function OrderHiddenFields({
  portfolioId,
  side,
  quantity,
  asset
}: {
  portfolioId: string;
  side: "BUY" | "SELL";
  quantity: number;
  asset: AssetLookupResult;
}) {
  return (
    <>
      <input type="hidden" name="portfolioId" value={portfolioId} />
      <input type="hidden" name="side" value={side} />
      <input type="hidden" name="orderType" value="MARKET" />
      <input type="hidden" name="quantity" value={quantity.toFixed(8)} />
      <input type="hidden" name="symbol" value={asset.symbol} />
      <input type="hidden" name="name" value={asset.name} />
      <input type="hidden" name="assetType" value={asset.assetType} />
      <input type="hidden" name="exchange" value={asset.exchange ?? ""} />
      <input type="hidden" name="currency" value={asset.currency} />
      <input type="hidden" name="sector" value={asset.sector ?? ""} />
      <input type="hidden" name="country" value={asset.country ?? ""} />
      <input type="hidden" name="provider" value={asset.provider ?? ""} />
      <input type="hidden" name="providerId" value={asset.providerId ?? ""} />
      <input type="hidden" name="exchangeName" value={asset.exchangeName ?? ""} />
      <input type="hidden" name="industry" value={asset.industry ?? ""} />
      <input type="hidden" name="isin" value={asset.isin ?? ""} />
      <input type="hidden" name="description" value={asset.description ?? ""} />
      <input type="hidden" name="logoUrl" value={asset.logoUrl ?? ""} />
      <input type="hidden" name="website" value={asset.website ?? ""} />
      <input type="hidden" name="marketCap" value={asset.marketCap ?? ""} />
    </>
  );
}

function AssetSearchRow({
  asset,
  active,
  onSelect
}: {
  asset: AssetLookupResult;
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
          {cleanAssetName(asset.name)}
        </span>
        <span className="mt-1 block truncate text-xs font-semibold text-white/50">
          {asset.symbol}, {asset.exchange ?? asset.assetType}, {asset.sector ?? "Marché"}
        </span>
      </span>
    </button>
  );
}

function AssetLogo({
  asset,
  size = "md"
}: {
  asset: AssetLookupResult;
  size?: "md" | "lg";
}) {
  return (
    <span
      className={[
        "flex shrink-0 items-center justify-center overflow-hidden rounded-md border border-white/10 bg-white/10 font-black text-white",
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
        asset.symbol.slice(0, 2)
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

function OrderLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-sm font-semibold text-white/50">
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}

function AssetInformation({
  asset,
  quote
}: {
  asset: AssetLookupResult;
  quote: ClientQuote | null;
}) {
  return (
    <div className="space-y-12 pb-10">
      <section>
        <h2 className="text-3xl font-semibold">Informations</h2>
        <div className="mt-7 flex flex-wrap gap-3">
          {[
            asset.country,
            asset.sector,
            asset.exchangeName ?? asset.exchange,
            asset.assetType
          ]
            .filter(Boolean)
            .map((tag) => (
              <Badge
                key={String(tag)}
                variant="secondary"
                className="border-white/10 bg-white/10 px-4 py-2 text-white/70"
              >
                {tag}
              </Badge>
            ))}
        </div>
        <p className="mt-7 max-w-4xl text-base font-semibold leading-8 text-white/80">
          {asset.description ??
            "Fiche connectée à la couche market data Waren. Les métadonnées avancées se rempliront selon le provider configuré."}
        </p>
        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          <InfoStat label="Symbole" value={asset.symbol} />
          <InfoStat label="Exchange" value={asset.exchange ?? "-"} />
          <InfoStat label="Devise" value={asset.currency} />
        </div>
      </section>

      <section>
        <h2 className="text-3xl font-semibold">Marché</h2>
        <div className="mt-8 grid gap-x-16 gap-y-8 lg:grid-cols-2">
          <Metric
            label="Ouverture"
            value={formatOptionalMoney(quote?.open, asset.currency)}
          />
          <Metric
            label="Plus haut"
            value={formatOptionalMoney(quote?.high, asset.currency)}
          />
          <Metric
            label="Plus bas"
            value={formatOptionalMoney(quote?.low, asset.currency)}
          />
          <Metric
            label="Clôture précédente"
            value={formatOptionalMoney(quote?.previousClose, asset.currency)}
          />
          <Metric label="Volume" value={formatOptionalNumber(quote?.volume)} />
          <Metric label="Provider" value={quote?.provider ?? asset.provider ?? "-"} />
        </div>
      </section>
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

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-sm font-semibold text-white/50">{label}</p>
      <p className="mt-3 text-xl font-semibold">{value}</p>
    </div>
  );
}

function groupAssets(assets: AssetLookupResult[]) {
  return assets.reduce<Record<string, AssetLookupResult[]>>((groups, asset) => {
    const key =
      asset.assetType === AssetType.CRYPTO
        ? "Cryptomonnaies"
        : asset.assetType === AssetType.ETF
          ? "ETF"
          : asset.assetType === AssetType.INDEX
            ? "Indices"
            : "Actions";
    groups[key] = [...(groups[key] ?? []), asset];
    return groups;
  }, {});
}

function toMarketParams(asset: AssetLookupResult) {
  const params = new URLSearchParams({
    symbol: asset.symbol,
    name: asset.name,
    assetType: asset.assetType,
    currency: asset.currency
  });

  for (const key of [
    "exchange",
    "sector",
    "country",
    "provider",
    "providerId"
  ] as const) {
    const value = asset[key];
    if (value) {
      params.set(key, String(value));
    }
  }

  return params;
}

function assetKey(asset?: AssetLookupResult) {
  if (!asset) {
    return "empty";
  }
  return `${asset.symbol}:${asset.exchange ?? ""}:${asset.currency}:${asset.assetType}:${asset.providerId ?? ""}`;
}

function fallbackAsset(): AssetLookupResult {
  return {
    symbol: "AAPL",
    name: "Apple Inc.",
    assetType: AssetType.STOCK,
    exchange: "NASDAQ",
    currency: "USD",
    sector: "Technology",
    country: "United States",
    provider: "mock"
  };
}

function calculateHistoryMove(history: ClientHistory) {
  const first = history[0]?.close ?? 0;
  const last = history.at(-1)?.close ?? first;
  const amount = last - first;
  return {
    amount,
    percent: first > 0 ? (amount / first) * 100 : 0
  };
}

function cleanAssetName(name: string) {
  return name.replace(" Corporation", "").replace(" Inc.", "");
}

function formatOptionalMoney(value: number | null | undefined, currency: string) {
  return value == null || value === 0 ? "-" : formatMoney(value, currency);
}

function formatOptionalNumber(value: number | null | undefined) {
  if (value == null || value === 0) {
    return "-";
  }
  return new Intl.NumberFormat("fr-FR", { notation: "compact" }).format(value);
}
