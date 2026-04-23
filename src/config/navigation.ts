import {
  Briefcase,
  LayoutDashboard,
  Settings,
  UserRound
} from "lucide-react";

export const appNavigation = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/applications", label: "Candidatures", icon: Briefcase },
  { href: "/settings", label: "Parametres", icon: Settings },
  { href: "/profile", label: "Profil", icon: UserRound }
] as const;
