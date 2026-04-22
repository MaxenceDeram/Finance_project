export function startOfUtcDay(input = new Date()) {
  return new Date(
    Date.UTC(input.getUTCFullYear(), input.getUTCMonth(), input.getUTCDate(), 0, 0, 0, 0)
  );
}

export function addDaysUtc(input: Date, days: number) {
  const date = new Date(input);
  date.setUTCDate(date.getUTCDate() + days);
  return startOfUtcDay(date);
}

export function formatDateTime(value: Date) {
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(value);
}

export function formatDateOnly(value: Date) {
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium"
  }).format(value);
}
