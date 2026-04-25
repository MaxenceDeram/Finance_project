import { Bell, LogOut, Plus, Search } from "lucide-react";
import Link from "next/link";
import type { UserRole } from "@prisma/client";
import { WarenLogo } from "@/components/brand/waren-logo";
import { UserAvatar } from "@/components/users/user-avatar";
import { appNavigation } from "@/config/navigation";
import { logoutAction } from "@/features/auth/actions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AppNavLink } from "./app-nav-link";

export function AppShell({
  userEmail,
  userDisplayName,
  userAvatarUrl,
  userRole,
  children
}: {
  userEmail: string;
  userDisplayName?: string | null;
  userAvatarUrl?: string | null;
  userRole: UserRole;
  children: React.ReactNode;
}) {
  const navigation = appNavigation;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-[284px] flex-col border-r border-white/10 bg-[linear-gradient(180deg,#101626_0%,#131a2d_100%)] px-5 py-6 text-white shadow-[0_24px_60px_rgba(2,6,23,0.28)] lg:flex">
        <Link href="/dashboard" className="block rounded-2xl">
          <WarenLogo
            size="xl"
            surface="dark"
            className="items-end"
            wordmarkClassName="text-white"
          />
          <span className="mt-2 block text-sm text-white/55">
            Suivi premium des candidatures
          </span>
        </Link>

        <nav className="mt-10 space-y-2">
          {navigation.map((item) => (
            <AppNavLink
              key={item.href}
              href={item.href}
              label={item.label}
              icon={item.icon}
            />
          ))}
        </nav>

        <div className="mt-8 rounded-[24px] border border-white/10 bg-white/[0.055] p-4 shadow-[0_1px_0_rgba(255,255,255,0.05)_inset]">
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-white/45">
            Focus du jour
          </p>
          <h2 className="mt-3 text-sm font-semibold leading-6">
            Gardez les relances visibles et votre pipeline toujours a jour.
          </h2>
          <p className="mt-2 text-sm leading-6 text-white/55">
            Une bonne hygiene de suivi vaut souvent autant qu&apos;une bonne candidature.
          </p>
        </div>

        <div className="mt-auto rounded-[24px] border border-white/10 bg-white/[0.055] p-4 shadow-[0_1px_0_rgba(255,255,255,0.05)_inset]">
          <div className="flex items-center gap-3">
            <UserAvatar
              avatarUrl={userAvatarUrl}
              name={userDisplayName}
              email={userEmail}
              className="size-11 rounded-2xl border-white/10 bg-white/10 text-white shadow-none"
              fallbackClassName="text-white"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">
                {userDisplayName || userEmail}
              </p>
              <p className="text-xs text-white/50">Espace personnel</p>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between gap-3">
            <Badge variant={userRole === "USER" ? "secondary" : "success"}>
              {userRole}
            </Badge>
            <form action={logoutAction}>
              <Button
                type="submit"
                variant="ghost"
                size="sm"
                className="text-white/70 hover:bg-white/10 hover:text-white"
              >
                <LogOut aria-hidden="true" />
                Sortir
              </Button>
            </form>
          </div>
        </div>
      </aside>

      <div className="lg:pl-[284px]">
        <header className="sticky top-0 z-10 border-b border-border/70 bg-[#f7f9fd]/88 backdrop-blur-xl">
          <div className="flex min-h-20 flex-wrap items-center gap-3 px-4 py-4 sm:px-6 lg:px-8">
            <Link
              href="/dashboard"
              className="text-lg font-semibold tracking-normal lg:hidden"
            >
              <WarenLogo size="md" surface="light" />
            </Link>

            <form
              action="/applications"
              className="relative hidden min-w-0 flex-1 lg:block"
            >
              <Search
                className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <input
                type="search"
                name="q"
                placeholder="Rechercher une candidature, une entreprise, un poste..."
                className="h-12 w-full rounded-2xl border border-border bg-white pl-11 pr-4 text-sm text-foreground shadow-[0_1px_2px_rgba(16,24,40,0.04)] outline-none transition-all focus:border-ring focus:ring-4 focus:ring-ring/10"
              />
            </form>

            <div className="ml-auto flex items-center gap-3">
              <Button asChild variant="secondary" size="sm">
                <Link href="/applications/new">
                  <Plus aria-hidden="true" />
                  Nouvelle candidature
                </Link>
              </Button>
              <Button variant="outline" size="icon" aria-label="Notifications">
                <Bell aria-hidden="true" />
              </Button>
              <div className="hidden items-center gap-3 rounded-2xl border border-border bg-white px-3 py-2 shadow-[0_1px_2px_rgba(16,24,40,0.04)] sm:flex">
                <UserAvatar
                  avatarUrl={userAvatarUrl}
                  name={userDisplayName}
                  email={userEmail}
                  className="size-9 rounded-xl"
                />
                <div className="max-w-[180px]">
                  <p className="truncate text-sm font-semibold">
                    {userDisplayName || userEmail}
                  </p>
                  <p className="text-xs text-muted-foreground">Suivi candidatures</p>
                </div>
              </div>
            </div>
          </div>

          <nav className="flex gap-2 overflow-x-auto border-t border-border/70 px-4 py-3 lg:hidden">
            {navigation.map((item) => (
              <AppNavLink
                key={item.href}
                href={item.href}
                label={item.label}
                icon={item.icon}
                mobile
              />
            ))}
          </nav>
        </header>

        <main className="px-4 py-7 sm:px-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  );
}
