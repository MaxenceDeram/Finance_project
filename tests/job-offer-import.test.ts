import assert from "node:assert/strict";
import test from "node:test";
import { extractJobOfferFromHtml } from "../src/features/applications/job-offer-import";

test("extracts structured JobPosting data from JSON-LD", () => {
  const html = `
    <html>
      <head>
        <script type="application/ld+json">
          {
            "@context": "https://schema.org",
            "@type": "JobPosting",
            "title": "Product Designer Intern",
            "employmentType": "INTERN",
            "hiringOrganization": { "name": "Linear" },
            "jobLocation": {
              "address": {
                "addressLocality": "Paris",
                "addressCountry": "FR"
              }
            }
          }
        </script>
      </head>
    </html>
  `;

  assert.deepEqual(extractJobOfferFromHtml(html, "https://linear.app/jobs/design"), {
    companyName: "Linear",
    roleTitle: "Product Designer Intern",
    location: "Paris, FR",
    contractType: "INTERNSHIP"
  });
});

test("falls back to page title and URL hostname", () => {
  const html = "<title>Growth Analyst - Qonto</title>";

  assert.deepEqual(extractJobOfferFromHtml(html, "https://qonto.com/careers/123"), {
    companyName: "Qonto",
    roleTitle: "Growth Analyst"
  });
});
