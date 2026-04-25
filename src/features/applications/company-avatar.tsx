"use client";

import { cn } from "@/lib/utils";
import { useMemo, useState } from "react";
import {
  getCompanyAvatarClasses,
  getCompanyLogoSources
} from "./company-branding";

export function CompanyAvatar({
  companyName,
  listingUrl,
  className,
  surface = "light"
}: {
  companyName: string;
  listingUrl?: string | null;
  className?: string;
  surface?: "light" | "dark";
}) {
  return (
    <CompanyAvatarInner
      key={`${companyName}:${listingUrl ?? ""}:${surface}`}
      companyName={companyName}
      listingUrl={listingUrl}
      className={className}
      surface={surface}
    />
  );
}

function CompanyAvatarInner({
  companyName,
  listingUrl,
  className,
  surface
}: {
  companyName: string;
  listingUrl?: string | null;
  className?: string;
  surface: "light" | "dark";
}) {
  const initials = companyName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
  const avatarClasses = getCompanyAvatarClasses(companyName);
  const sources = useMemo(
    () => getCompanyLogoSources({ companyName, listingUrl, surface }),
    [companyName, listingUrl, surface]
  );
  const [sourceIndex, setSourceIndex] = useState(0);

  const currentSrc = sources[sourceIndex] ?? null;

  return (
    <div
      className={cn(
        "inline-flex size-11 items-center justify-center overflow-hidden rounded-2xl border border-white/80 text-sm font-semibold shadow-[0_1px_2px_rgba(16,24,40,0.05)] transition-transform duration-300 group-hover:scale-[1.03]",
        avatarClasses.bgClassName,
        className
      )}
      aria-hidden="true"
    >
      {currentSrc ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={currentSrc}
          alt=""
          loading="lazy"
          referrerPolicy="no-referrer"
          className={cn("size-[72%] object-contain", avatarClasses.imgClassName)}
          onError={() => {
            setSourceIndex((current) => current + 1);
          }}
        />
      ) : (
        initials || "?"
      )}
    </div>
  );
}
