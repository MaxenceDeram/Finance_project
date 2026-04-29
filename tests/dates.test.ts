import assert from "node:assert/strict";
import test from "node:test";
import {
  getZonedDateParts,
  isValidTimeZone,
  startOfZonedDayAsUtcDate
} from "../src/lib/dates";

test("validates IANA time zones", () => {
  assert.equal(isValidTimeZone("Europe/Paris"), true);
  assert.equal(isValidTimeZone("Not/AZone"), false);
});

test("reads the local hour in a target time zone", () => {
  const date = new Date("2026-04-29T20:15:00.000Z");
  const parts = getZonedDateParts(date, "Europe/Paris");

  assert.equal(parts.year, 2026);
  assert.equal(parts.month, 4);
  assert.equal(parts.day, 29);
  assert.equal(parts.hour, 22);
});

test("stores a local day as a stable UTC date key", () => {
  const date = new Date("2026-04-29T20:15:00.000Z");
  const periodDate = startOfZonedDayAsUtcDate(date, "Europe/Paris");

  assert.equal(periodDate.toISOString(), "2026-04-29T00:00:00.000Z");
});
