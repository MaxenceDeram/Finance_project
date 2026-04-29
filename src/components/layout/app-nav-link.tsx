"use client";

import {
  Briefcase,
  ListChecks,
  LayoutDashboard,
  Settings,
  UserRound,
  type LucideIcon
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const iconMap = {
  actions: ListChecks,
  dashboard: LayoutDashboard,
  briefcase: Briefcase,
  settings: Settings,
  user: UserRound
} satisfies Record<string, LucideIcon>;

export type AppNavIconName = keyof typeof iconMap;

export function AppNavLink({
  href,
  label,
  icon,
  mobile = false
}: {
  href: string;
  label: string;
  icon: AppNavIconName;
  mobile?: boolean;
}) {
  const pathname = usePathname();
  const Icon = iconMap[icon];
  const isActive =
    pathname === href || (href !== "/dashboard" && pathname.startsWith(`${href}/`));

  return (
    <Link
      href={href}
      data-active={isActive ? "true" : "false"}
      data-motion-nav-item
      className={cn(
        "app-nav-link relative overflow-hidden",
        mobile
          ? "flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold transition-all"
          : "group flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-semibold transition-all",
        mobile
          ? isActive
            ? "border border-[#d8ddff] bg-[#eef2ff] text-[#312e81]"
            : "border border-transparent text-muted-foreground hover:bg-white hover:text-foreground"
          : isActive
            ? "border border-white/10 bg-white/10 text-white shadow-[0_1px_0_rgba(255,255,255,0.06)_inset]"
            : "border border-transparent text-white/55 hover:border-white/8 hover:bg-white/[0.045] hover:text-white"
      )}
    >
      <span
        className={cn(
          "flex items-center justify-center rounded-lg transition-colors",
          mobile ? "size-6" : "size-7",
          isActive
            ? "bg-[#eef2ff] text-[#4f46e5]"
            : "bg-white/[0.05] text-current group-hover:bg-white/[0.08]"
        )}
      >
        <Icon className={mobile ? "size-4" : "size-4"} aria-hidden="true" />
      </span>
      {label}
    </Link>
  );
}
