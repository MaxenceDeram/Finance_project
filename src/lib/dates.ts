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

export function assertValidTimeZone(timeZone: string) {
  new Intl.DateTimeFormat("fr-FR", { timeZone }).format(new Date());
  return timeZone;
}

export function isValidTimeZone(timeZone: string) {
  try {
    assertValidTimeZone(timeZone);
    return true;
  } catch {
    return false;
  }
}

export function getZonedDateParts(input: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    hourCycle: "h23"
  }).formatToParts(input);
  const values = Object.fromEntries(
    parts
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, Number(part.value)])
  );

  return {
    year: values.year,
    month: values.month,
    day: values.day,
    hour: values.hour
  };
}

export function startOfZonedDayAsUtcDate(input: Date, timeZone: string) {
  const parts = getZonedDateParts(input, timeZone);
  return new Date(Date.UTC(parts.year, parts.month - 1, parts.day, 0, 0, 0, 0));
}

export function getZonedDayRange(input: Date, timeZone: string) {
  const start = startOfZonedDayAsUtcDate(input, timeZone);
  const end = addDaysUtc(start, 1);

  return { start, end };
}
