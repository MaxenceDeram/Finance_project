import { LogOut } from "lucide-react";
import Link from "next/link";
import type { UserRole } from "@prisma/client";
import { adminNavigationItem, appNavigation } from "@/config/navigation";
import { logoutAction } from "@/features/auth/actions";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function AppShell({
  userEmail,
  userRole,
  children
}: {
  userEmail: string;
  userRole: UserRole;
  children: React.ReactNode;
}) {
  const navigation =
    userRole === "ADMIN" || userRole === "OWNER"
      ? [...appNavigation, adminNavigationItem]
      : appNavigation;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-72 border-r border-white/10 bg-[#0d0f0d] px-4 py-5 lg:flex lg:flex-col">
        <Link href="/dashboard" className="block rounded-md px-3 py-2">
          <span className="block text-xl font-semibold tracking-normal">Waren</span>
          <span className="mt-1 block text-xs font-medium text-white/45">
            Simulation live personnelle
          </span>
        </Link>
        <nav className="mt-8 space-y-1">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-semibold text-white/55 transition hover:bg-white/10 hover:text-white"
              )}
            >
              <item.icon className="size-4" aria-hidden="true" />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto rounded-md border border-white/10 bg-white/[0.04] p-4">
          <p className="text-xs font-semibold uppercase tracking-normal text-white/40">
            Compte
          </p>
          <p className="mt-2 truncate text-sm font-semibold">{userEmail}</p>
          <div className="mt-3 flex items-center justify-between gap-3">
            <Badge variant={userRole === "USER" ? "secondary" : "success"}>
              {userRole}
            </Badge>
            <span className="text-xs text-white/45">Fictif uniquement</span>
          </div>
        </div>
      </aside>
      <div className="lg:pl-72">
        <header className="sticky top-0 z-10 border-b border-white/10 bg-[#090a09]/90 backdrop-blur-xl">
          <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
            <Link
              href="/dashboard"
              className="text-lg font-semibold tracking-normal lg:hidden"
            >
              Waren
            </Link>
            <div className="hidden text-sm text-white/45 lg:block">
              Données live/quasi live. Aucun ordre réel n'est envoyé.
            </div>
            <form action={logoutAction}>
              <Button type="submit" variant="outline" size="sm">
                <LogOut aria-hidden="true" />
                Se deconnecter
              </Button>
            </form>
          </div>
          <nav className="flex gap-1 overflow-x-auto border-t border-white/10 px-4 py-2 lg:hidden">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex shrink-0 items-center gap-2 rounded-md px-3 py-2 text-xs font-semibold text-white/55 hover:bg-white/10 hover:text-white"
              >
                <item.icon className="size-4" aria-hidden="true" />
                {item.label}
              </Link>
            ))}
          </nav>
        </header>
        <main className="px-4 py-7 sm:px-6 lg:px-10 lg:py-10">{children}</main>
      </div>
    </div>
  );
}
