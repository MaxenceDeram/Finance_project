export function formatMoney(value: number, currency = "EUR") {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency,
    maximumFractionDigits: 2
  }).format(Number.isFinite(value) ? value : 0);
}

export function formatQuantity(value: number) {
  return new Intl.NumberFormat("fr-FR", {
    maximumFractionDigits: 8
  }).format(Number.isFinite(value) ? value : 0);
}

export function formatPercent(value: number) {
  return new Intl.NumberFormat("fr-FR", {
    style: "percent",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format((Number.isFinite(value) ? value : 0) / 100);
}

export function formatSignedMoney(value: number, currency = "EUR") {
  const formatted = formatMoney(Math.abs(value), currency);
  if (value > 0) {
    return `+${formatted}`;
  }
  if (value < 0) {
    return `-${formatted}`;
  }
  return formatted;
}
