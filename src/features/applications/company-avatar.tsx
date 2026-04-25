import Image from "next/image";
import { cn } from "@/lib/utils";

const knownCompanyLogos: Record<
  string,
  {
    src: string;
    bgClassName: string;
  }
> = {
  google: {
    src: "https://cdn.simpleicons.org/google",
    bgClassName: "bg-white"
  },
  stripe: {
    src: "https://cdn.simpleicons.org/stripe/635bff",
    bgClassName: "bg-white"
  },
  notion: {
    src: "https://cdn.simpleicons.org/notion/111111",
    bgClassName: "bg-white"
  },
  linear: {
    src: "https://cdn.simpleicons.org/linear/111827",
    bgClassName: "bg-white"
  },
  airbnb: {
    src: "https://cdn.simpleicons.org/airbnb/ff5a5f",
    bgClassName: "bg-white"
  },
  alan: {
    src: "https://cdn.simpleicons.org/alan/5b5bd6",
    bgClassName: "bg-white"
  },
  vercel: {
    src: "https://cdn.simpleicons.org/vercel/111111",
    bgClassName: "bg-white"
  },
  spotify: {
    src: "https://cdn.simpleicons.org/spotify/1ed760",
    bgClassName: "bg-white"
  },
  revolut: {
    src: "https://cdn.simpleicons.org/revolut/111111",
    bgClassName: "bg-white"
  },
  qonto: {
    src: "https://cdn.simpleicons.org/qonto/4a6cf7",
    bgClassName: "bg-white"
  },
  doctolib: {
    src: "https://cdn.simpleicons.org/doctolib/0596de",
    bgClassName: "bg-white"
  },
  mistral: {
    src: "https://cdn.simpleicons.org/mistralai/f97316",
    bgClassName: "bg-white"
  }
};

function normalizeCompanyName(value: string) {
  const normalized = value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");

  if (normalized.includes("doctolib")) {
    return "doctolib";
  }

  if (normalized.includes("mistral")) {
    return "mistral";
  }

  return normalized;
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

export function CompanyAvatar({
  companyName,
  className
}: {
  companyName: string;
  className?: string;
}) {
  const initials = companyName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
  const knownLogo = knownCompanyLogos[normalizeCompanyName(companyName)];

  return (
    <div
      className={cn(
        "inline-flex size-11 items-center justify-center rounded-2xl border border-white/80 text-sm font-semibold shadow-[0_1px_2px_rgba(16,24,40,0.05)]",
        knownLogo
          ? knownLogo.bgClassName
          : `bg-gradient-to-br ${hashToTone(companyName)}`,
        className
      )}
      aria-hidden="true"
    >
      {knownLogo ? (
        <Image
          src={knownLogo.src}
          alt=""
          width={20}
          height={20}
          unoptimized
          className="size-5 object-contain"
        />
      ) : (
        initials || "?"
      )}
    </div>
  );
}
