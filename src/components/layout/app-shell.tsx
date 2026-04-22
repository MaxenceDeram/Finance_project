import { LogOut } from "lucide-react";
import Link from "next/link";
import { appNavigation } from "@/config/navigation";
import { logoutAction } from "@/features/auth/actions";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function AppShell({
  userEmail,
  children
}: {
  userEmail: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-72 border-r bg-card px-4 py-5 lg:block">
        <Link href="/dashboard" className="block px-3 text-sm font-bold tracking-[0.18em]">
          PAPER INVEST
        </Link>
        <p className="mt-2 px-3 text-xs leading-5 text-muted-foreground">
          Simulation d'investissement avec argent fictif.
        </p>
        <nav className="mt-8 space-y-1">
          {appNavigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <item.icon className="size-4" aria-hidden="true" />
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <div className="lg:pl-72">
        <header className="sticky top-0 z-10 border-b bg-background/92 backdrop-blur">
          <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
            <Link href="/dashboard" className="text-sm font-bold tracking-[0.16em] lg:hidden">
              PAPER INVEST
            </Link>
            <div className="hidden text-sm text-muted-foreground lg:block">
              Compte: <span className="font-medium text-foreground">{userEmail}</span>
            </div>
            <form action={logoutAction}>
              <Button type="submit" variant="outline" size="sm">
                <LogOut aria-hidden="true" />
                Deconnexion
              </Button>
            </form>
          </div>
          <nav className="flex gap-1 overflow-x-auto border-t px-4 py-2 lg:hidden">
            {appNavigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex shrink-0 items-center gap-2 rounded-md px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              >
                <item.icon className="size-4" aria-hidden="true" />
                {item.label}
              </Link>
            ))}
          </nav>
        </header>
        <main className="px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
