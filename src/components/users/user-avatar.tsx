"use client";

import { cn } from "@/lib/utils";

export function UserAvatar({
  avatarUrl,
  name,
  email,
  className,
  fallbackClassName
}: {
  avatarUrl?: string | null;
  name?: string | null;
  email: string;
  className?: string;
  fallbackClassName?: string;
}) {
  const initials = getInitials(name || email);

  return (
    <div
      className={cn(
        "inline-flex items-center justify-center overflow-hidden rounded-2xl border border-white/80 bg-[#eef2ff] text-sm font-semibold text-[#4f46e5] shadow-[0_6px_20px_rgba(79,70,229,0.12)]",
        className
      )}
      aria-label={name || email}
    >
      {avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={avatarUrl}
          alt={name || email}
          className="h-full w-full object-cover"
        />
      ) : (
        <span className={cn("select-none", fallbackClassName)}>{initials}</span>
      )}
    </div>
  );
}

function getInitials(value: string) {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((segment) => segment.charAt(0).toUpperCase())
    .join("");
}
