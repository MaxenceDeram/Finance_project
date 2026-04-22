import {
  BarChart3,
  Briefcase,
  ClipboardList,
  LayoutDashboard,
  Settings,
  ShieldCheck,
  UserRound
} from "lucide-react";

export const appNavigation = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/portfolios", label: "Portefeuilles", icon: Briefcase },
  { href: "/orders", label: "Historique", icon: ClipboardList },
  { href: "/assets", label: "Actifs", icon: BarChart3 },
  { href: "/settings", label: "Parametres", icon: Settings },
  { href: "/profile", label: "Profil", icon: UserRound }
] as const;

export const adminNavigationItem = {
  href: "/admin",
  label: "Admin",
  icon: ShieldCheck
} as const;
