import assert from "node:assert/strict";
import test from "node:test";
import { createApplicationSchema } from "../src/validation/applications";

test("normalizes common job URL input", () => {
  const parsed = createApplicationSchema.parse({
    companyName: "Qonto",
    roleTitle: "Growth Analyst",
    contractType: "INTERNSHIP",
    status: "TO_APPLY",
    listingUrl: "qonto.com/careers/123"
  });

  assert.equal(parsed.listingUrl, "https://qonto.com/careers/123");
});

test("rejects invalid contact email", () => {
  const parsed = createApplicationSchema.safeParse({
    companyName: "Qonto",
    roleTitle: "Growth Analyst",
    contractType: "INTERNSHIP",
    status: "TO_APPLY",
    contactEmail: "not-an-email"
  });

  assert.equal(parsed.success, false);
});
