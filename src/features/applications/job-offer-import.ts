import type { ContractType } from "@prisma/client";

export type ImportedJobOffer = {
  companyName?: string;
  roleTitle?: string;
  location?: string;
  contractType?: ContractType;
};

const jobBoardHosts = new Set([
  "jobs.ashbyhq.com",
  "jobs.eu.lever.co",
  "jobs.lever.co",
  "boards.greenhouse.io",
  "job-boards.greenhouse.io",
  "careers.smartrecruiters.com",
  "jobs.smartrecruiters.com",
  "careers.welcometothejungle.com",
  "welcometothejungle.com"
]);

export async function fetchJobOfferPreview(listingUrl: string) {
  const url = new URL(listingUrl);
  const fallback = inferJobOfferFromUrl(url);

  if (isBlockedFetchHost(url.hostname)) {
    return fallback;
  }

  try {
    const response = await fetch(url, {
      headers: {
        accept: "text/html,application/xhtml+xml",
        "user-agent": "WarenBot/1.0 (+https://waren.local)"
      },
      signal: AbortSignal.timeout(7000)
    });

    if (!response.ok) {
      return fallback;
    }

    const contentType = response.headers.get("content-type") ?? "";
    if (!contentType.includes("text/html")) {
      return fallback;
    }

    const html = await response.text();
    return {
      ...fallback,
      ...extractJobOfferFromHtml(html, listingUrl)
    };
  } catch {
    return fallback;
  }
}

export function extractJobOfferFromHtml(html: string, listingUrl: string) {
  const fromJsonLd = extractJobPostingJsonLd(html);

  if (fromJsonLd) {
    return fromJsonLd;
  }

  const pageTitle =
    getMetaContent(html, "property", "og:title") ??
    getMetaContent(html, "name", "twitter:title") ??
    getTitle(html);
  const fallback = inferJobOfferFromUrl(new URL(listingUrl));

  if (!pageTitle) {
    return fallback;
  }

  return {
    ...fallback,
    roleTitle: cleanTitle(pageTitle, fallback.companyName)
  };
}

function extractJobPostingJsonLd(html: string): ImportedJobOffer | null {
  const scripts = html.matchAll(
    /<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi
  );

  for (const script of scripts) {
    const rawJson = decodeHtmlEntities(script[1]?.trim() ?? "");

    if (!rawJson) {
      continue;
    }

    try {
      const parsed = JSON.parse(rawJson);
      const jobPosting = findJobPosting(parsed);

      if (jobPosting) {
        return mapJobPosting(jobPosting);
      }
    } catch {
      continue;
    }
  }

  return null;
}

function findJobPosting(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      const found = findJobPosting(item);
      if (found) {
        return found;
      }
    }
    return null;
  }

  const record = value as Record<string, unknown>;
  const type = record["@type"];
  const types = Array.isArray(type) ? type : [type];

  if (types.some((item) => String(item).toLowerCase() === "jobposting")) {
    return record;
  }

  return findJobPosting(record["@graph"]);
}

function mapJobPosting(jobPosting: Record<string, unknown>): ImportedJobOffer {
  return {
    companyName: getOrganizationName(jobPosting.hiringOrganization),
    roleTitle: getString(jobPosting.title),
    location: getLocationLabel(jobPosting.jobLocation),
    contractType: mapEmploymentType(jobPosting.employmentType)
  };
}

function inferJobOfferFromUrl(url: URL): ImportedJobOffer {
  const hostname = url.hostname.replace(/^www\./, "").toLowerCase();

  if (jobBoardHosts.has(hostname)) {
    return {};
  }

  const rootDomain = hostname.split(".").slice(-2, -1)[0] ?? hostname.split(".")[0];

  return {
    companyName: rootDomain
      ? rootDomain.charAt(0).toUpperCase() + rootDomain.slice(1)
      : undefined
  };
}

function getOrganizationName(value: unknown) {
  if (Array.isArray(value)) {
    return getOrganizationName(value[0]);
  }

  if (!value || typeof value !== "object") {
    return undefined;
  }

  return getString((value as Record<string, unknown>).name);
}

function getLocationLabel(value: unknown): string | undefined {
  if (Array.isArray(value)) {
    return value.map(getLocationLabel).filter(Boolean).join(", ") || undefined;
  }

  if (!value || typeof value !== "object") {
    return getString(value);
  }

  const record = value as Record<string, unknown>;
  const address = record.address;

  if (typeof address === "string") {
    return address;
  }

  if (address && typeof address === "object") {
    const addressRecord = address as Record<string, unknown>;
    return [
      getString(addressRecord.addressLocality),
      getString(addressRecord.addressRegion),
      getString(addressRecord.addressCountry)
    ]
      .filter(Boolean)
      .join(", ");
  }

  return getString(record.name);
}

function mapEmploymentType(value: unknown): ContractType | undefined {
  const values = (Array.isArray(value) ? value : [value])
    .map((item) => String(item ?? "").toUpperCase())
    .join(" ");

  if (values.includes("INTERN")) {
    return "INTERNSHIP";
  }
  if (values.includes("PART_TIME")) {
    return "PART_TIME";
  }
  if (values.includes("FREELANCE") || values.includes("CONTRACTOR")) {
    return "FREELANCE";
  }
  if (values.includes("TEMPORARY")) {
    return "TEMPORARY";
  }
  if (values.includes("FULL_TIME") || values.includes("PERMANENT")) {
    return "FULL_TIME";
  }

  return undefined;
}

function getMetaContent(html: string, attribute: "name" | "property", value: string) {
  const pattern = new RegExp(
    `<meta\\b(?=[^>]*\\b${attribute}=["']${escapeRegExp(value)}["'])(?=[^>]*\\bcontent=["']([^"']+)["'])[^>]*>`,
    "i"
  );
  const match = html.match(pattern);
  return match?.[1] ? decodeHtmlEntities(match[1]).trim() : undefined;
}

function getTitle(html: string) {
  const match = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return match?.[1] ? decodeHtmlEntities(match[1]).trim() : undefined;
}

function cleanTitle(title: string, companyName?: string) {
  const withoutCompany = companyName
    ? title.replace(new RegExp(`\\s*[-|–—]\\s*${escapeRegExp(companyName)}\\s*$`, "i"), "")
    : title;

  return withoutCompany.replace(/\s+/g, " ").trim().slice(0, 160);
}

function decodeHtmlEntities(value: string) {
  return value
    .replace(/&quot;/g, '"')
    .replace(/&#34;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&#38;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'");
}

function getString(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function isBlockedFetchHost(hostname: string) {
  const normalized = hostname.toLowerCase();
  return (
    normalized === "localhost" ||
    normalized === "127.0.0.1" ||
    normalized === "::1" ||
    normalized.startsWith("10.") ||
    normalized.startsWith("192.168.") ||
    /^172\.(1[6-9]|2\d|3[0-1])\./.test(normalized)
  );
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
