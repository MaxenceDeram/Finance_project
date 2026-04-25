type BrandSurface = "light" | "dark";

type CompanyBrandEntry = {
  domain?: string;
  fallbackSrc?: string;
  fallbackBgClassName?: string;
  fallbackImgClassName?: string;
};

const knownCompanyBrands: Record<string, CompanyBrandEntry> = {
  airbnb: {
    domain: "airbnb.com",
    fallbackSrc: "https://cdn.simpleicons.org/airbnb/ff5a5f",
    fallbackBgClassName: "bg-white"
  },
  canalplus: {
    domain: "canalplus.com",
    fallbackSrc: "/company-logos/canalplus.svg",
    fallbackBgClassName: "bg-white"
  },
  carrefour: {
    domain: "carrefour.com",
    fallbackSrc: "https://cdn.simpleicons.org/carrefour/004e9f",
    fallbackBgClassName: "bg-white"
  },
  doctolib: {
    domain: "doctolib.fr",
    fallbackSrc: "https://cdn.simpleicons.org/doctolib/0596de",
    fallbackBgClassName: "bg-white"
  },
  google: {
    domain: "google.com",
    fallbackSrc: "https://cdn.simpleicons.org/google",
    fallbackBgClassName: "bg-white"
  },
  linear: {
    domain: "linear.app",
    fallbackSrc: "https://cdn.simpleicons.org/linear/111827",
    fallbackBgClassName: "bg-white"
  },
  mistral: {
    domain: "mistral.ai",
    fallbackSrc: "https://cdn.simpleicons.org/mistralai/f97316",
    fallbackBgClassName: "bg-white"
  },
  qonto: {
    domain: "qonto.com",
    fallbackSrc: "https://cdn.simpleicons.org/qonto/4a6cf7",
    fallbackBgClassName: "bg-white"
  },
  revolut: {
    domain: "revolut.com",
    fallbackSrc: "https://cdn.simpleicons.org/revolut/111111",
    fallbackBgClassName: "bg-white"
  },
  spotify: {
    domain: "spotify.com",
    fallbackSrc: "https://cdn.simpleicons.org/spotify/1ed760",
    fallbackBgClassName: "bg-white"
  },
  stripe: {
    domain: "stripe.com",
    fallbackSrc: "https://cdn.simpleicons.org/stripe/635bff",
    fallbackBgClassName: "bg-white"
  },
  vercel: {
    domain: "vercel.com",
    fallbackSrc: "https://cdn.simpleicons.org/vercel/111111",
    fallbackBgClassName: "bg-white"
  }
};

const jobBoardHosts = new Set([
  "jobs.ashbyhq.com",
  "jobs.eu.lever.co",
  "jobs.lever.co",
  "boards.greenhouse.io",
  "job-boards.greenhouse.io",
  "careers.smartrecruiters.com",
  "jobs.smartrecruiters.com",
  "jobs.jobvite.com",
  "jobs.eu.jobvite.com",
  "jobs.workable.com",
  "jobs.eu.workable.com",
  "careers.welcometothejungle.com",
  "welcometothejungle.com",
  "app.welcometothejungle.com"
]);

export function normalizeCompanyName(value: string) {
  const normalized = value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9+]+/g, "");

  if (normalized.includes("doctolib")) {
    return "doctolib";
  }

  if (normalized.includes("mistral")) {
    return "mistral";
  }

  if (normalized.includes("canal")) {
    return "canalplus";
  }

  return normalized;
}

export function getCompanyBrandEntry(companyName: string) {
  return knownCompanyBrands[normalizeCompanyName(companyName)];
}

export function getCompanyDomain(input: {
  companyName: string;
  listingUrl?: string | null;
}) {
  const known = getCompanyBrandEntry(input.companyName);

  if (known?.domain) {
    return known.domain;
  }

  const extractedFromUrl = extractDomainFromListingUrl(input.listingUrl);
  if (extractedFromUrl) {
    return extractedFromUrl;
  }

  return null;
}

export function getCompanyLogoSources(input: {
  companyName: string;
  listingUrl?: string | null;
  surface?: BrandSurface;
}) {
  const surface = input.surface ?? "light";
  const domain = getCompanyDomain(input);
  const known = getCompanyBrandEntry(input.companyName);
  const sources: string[] = [];

  if (domain) {
    const logoDevDomain = buildLogoDevDomainUrl(domain, surface);
    if (logoDevDomain) {
      sources.push(logoDevDomain);
    }

    const brandfetch = buildBrandfetchUrl(domain);
    if (brandfetch) {
      sources.push(brandfetch);
    }

    sources.push(`https://icon.horse/icon/${domain}`);
  }

  const logoDevName = buildLogoDevNameUrl(input.companyName, surface);
  if (logoDevName) {
    sources.push(logoDevName);
  }

  if (known?.fallbackSrc) {
    sources.push(known.fallbackSrc);
  }

  return [...new Set(sources)];
}

export function getCompanyAvatarClasses(companyName: string) {
  const known = getCompanyBrandEntry(companyName);

  if (known?.fallbackBgClassName) {
    return {
      bgClassName: known.fallbackBgClassName,
      imgClassName: known.fallbackImgClassName ?? "size-[72%] object-contain"
    };
  }

  return {
    bgClassName: `bg-gradient-to-br ${hashToTone(companyName)}`,
    imgClassName: "size-[72%] object-contain"
  };
}

function buildLogoDevDomainUrl(domain: string, surface: BrandSurface) {
  const params = new URLSearchParams({
    format: "png",
    size: "96",
    retina: "true",
    fallback: "404",
    theme: surface === "dark" ? "dark" : "light"
  });
  const token = process.env.NEXT_PUBLIC_LOGO_DEV_TOKEN;
  if (token) {
    params.set("token", token);
  }

  return `https://img.logo.dev/${domain}?${params.toString()}`;
}

function buildLogoDevNameUrl(companyName: string, surface: BrandSurface) {
  const encodedName = encodeURIComponent(companyName.trim());
  if (!encodedName) {
    return null;
  }

  const params = new URLSearchParams({
    format: "png",
    size: "96",
    retina: "true",
    fallback: "404",
    theme: surface === "dark" ? "dark" : "light"
  });
  const token = process.env.NEXT_PUBLIC_LOGO_DEV_TOKEN;
  if (token) {
    params.set("token", token);
  }

  return `https://img.logo.dev/name/${encodedName}?${params.toString()}`;
}

function buildBrandfetchUrl(domain: string) {
  const clientId = process.env.NEXT_PUBLIC_BRANDFETCH_CLIENT_ID;
  if (!clientId) {
    return null;
  }

  return `https://cdn.brandfetch.io/${domain}/h/128/w/128/icon.png?c=${encodeURIComponent(clientId)}`;
}

function extractDomainFromListingUrl(listingUrl?: string | null) {
  if (!listingUrl) {
    return null;
  }

  const preparedUrl = listingUrl.startsWith("http://") || listingUrl.startsWith("https://")
    ? listingUrl
    : `https://${listingUrl}`;

  try {
    const hostname = new URL(preparedUrl).hostname.replace(/^www\./, "").toLowerCase();

    if (jobBoardHosts.has(hostname)) {
      return null;
    }

    return hostname;
  } catch {
    return null;
  }
}

function hashToTone(value: string) {
  const tones = [
    "from-[#e8edff] to-[#dce6ff] text-[#4f46e5]",
    "from-[#e9f7ff] to-[#d9ecff] text-[#2563eb]",
    "from-[#f4ecff] to-[#eadfff] text-[#7c3aed]",
    "from-[#eefbf3] to-[#def5e8] text-[#15803d]"
  ];

  const hash = [...value].reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return tones[hash % tones.length];
}
