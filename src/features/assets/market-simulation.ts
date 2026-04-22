export type ChartRange = "1D" | "1W" | "1M" | "6M" | "1Y" | "5Y" | "MAX";

export const chartRanges: Array<{
  value: ChartRange;
  label: string;
  points: number;
  stepHours: number;
}> = [
  { value: "1D", label: "1J", points: 54, stepHours: 0.25 },
  { value: "1W", label: "1S", points: 56, stepHours: 3 },
  { value: "1M", label: "1M", points: 60, stepHours: 12 },
  { value: "6M", label: "6M", points: 72, stepHours: 60 },
  { value: "1Y", label: "1A", points: 80, stepHours: 110 },
  { value: "5Y", label: "5A", points: 90, stepHours: 480 },
  { value: "MAX", label: "Max", points: 96, stepHours: 760 }
];

const referenceDate = new Date("2026-04-22T20:30:00.000Z");

export function deterministicMarketPrice(symbol: string, date = referenceDate) {
  const seed = getSymbolSeed(symbol);
  const day = Math.floor(date.getTime() / 86_400_000);
  const trend = Math.sin((day + seed) / 9) * 4 + Math.cos((day + seed) / 21) * 2;
  const base = 20 + (seed % 420);
  return Number((base + trend + (day % 17) * 0.11).toFixed(2));
}

export function generateMarketSeries(symbol: string, range: ChartRange) {
  const config = chartRanges.find((item) => item.value === range) ?? chartRanges[2];
  const seed = getSymbolSeed(symbol);
  const base = deterministicMarketPrice(symbol, referenceDate);

  return Array.from({ length: config.points }, (_, index) => {
    const distance = index - config.points + 1;
    const timestamp = new Date(
      referenceDate.getTime() + distance * config.stepHours * 60 * 60 * 1000
    );
    const wave =
      Math.sin((index + seed) / 4.3) * 0.012 + Math.cos((index + seed) / 11) * 0.009;
    const drift =
      (index / Math.max(config.points - 1, 1) - 0.5) * getRangeDrift(range, seed);
    const shock =
      range === "1D" && index > config.points * 0.68 ? Math.sin(index) * 0.004 : 0;
    const price = base * (1 + wave + drift + shock);

    return {
      label: formatPointLabel(timestamp, range),
      timestamp: timestamp.toISOString(),
      price: Number(price.toFixed(2))
    };
  });
}

export function getAssetMove(symbol: string, range: ChartRange) {
  const series = generateMarketSeries(symbol, range);
  const first = series[0]?.price ?? 0;
  const last = series.at(-1)?.price ?? first;
  const amount = last - first;
  const percent = first > 0 ? (amount / first) * 100 : 0;

  return {
    amount,
    percent
  };
}

function getSymbolSeed(symbol: string) {
  return Array.from(symbol.toUpperCase()).reduce(
    (sum, char) => sum + char.charCodeAt(0),
    0
  );
}

function getRangeDrift(range: ChartRange, seed: number) {
  const direction = seed % 5 === 0 ? -1 : 1;
  const strength = {
    "1D": 0.012,
    "1W": 0.024,
    "1M": 0.05,
    "6M": 0.12,
    "1Y": 0.18,
    "5Y": 0.55,
    MAX: 0.82
  }[range];

  return direction * strength;
}

function formatPointLabel(date: Date, range: ChartRange) {
  if (range === "1D") {
    return new Intl.DateTimeFormat("fr-FR", {
      hour: "2-digit",
      minute: "2-digit"
    }).format(date);
  }

  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short"
  }).format(date);
}
