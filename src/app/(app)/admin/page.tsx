import {
  ClipboardList,
  MailWarning,
  ShieldCheck,
  Users,
  WalletCards
} from "lucide-react";
import Link from "next/link";
import { StatCard } from "@/components/dashboard/stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAdminDashboardStats } from "@/features/admin/service";
import { requireAdmin } from "@/server/security/sessions";

export default async function AdminDashboardPage() {
  const user = await requireAdmin();
  const stats = await getAdminDashboardStats();

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-semibold uppercase tracking-normal text-muted-foreground">
            Administration
          </p>
          <h1 className="mt-2 text-4xl font-semibold tracking-normal">
            Console admin Waren
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Connecte en tant que{" "}
            <span className="font-medium text-foreground">{user.email}</span>{" "}
            <Badge variant={user.role === "OWNER" ? "success" : "outline"}>
              {user.role}
            </Badge>
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/admin/users">Utilisateurs</Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Utilisateurs" value={String(stats.totalUsers)} icon={Users} />
        <StatCard label="Actifs" value={String(stats.activeUsers)} icon={ShieldCheck} />
        <StatCard
          label="Non confirmes"
          value={String(stats.unverifiedUsers)}
          icon={MailWarning}
          tone={stats.unverifiedUsers > 0 ? "negative" : "neutral"}
        />
        <StatCard
          label="Portefeuilles"
          value={String(stats.portfolios)}
          icon={WalletCards}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          {
            href: "/admin/users",
            title: "Utilisateurs",
            description: "Roles, statuts, confirmation email et details de compte."
          },
          {
            href: "/admin/audit-logs",
            title: "Audit logs",
            description: "Actions sensibles et traces de securite."
          },
          {
            href: "/admin/email-logs",
            title: "Emails",
            description: "Historique des syntheses quotidiennes et erreurs."
          },
          {
            href: "/admin/jobs",
            title: "Jobs",
            description: "Declenchement manuel des automatisations."
          }
        ].map((item) => (
          <Link key={item.href} href={item.href}>
            <Card className="h-full transition hover:border-ring">
              <CardContent className="p-5">
                <div className="flex size-10 items-center justify-center rounded-md border border-border/80 bg-[color:var(--surface)]">
                  <ClipboardList
                    className="size-5 text-muted-foreground"
                    aria-hidden="true"
                  />
                </div>
                <h2 className="mt-4 font-semibold tracking-normal">{item.title}</h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {item.description}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Etat global</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 text-sm md:grid-cols-3">
          <div>
            <p className="text-muted-foreground">Comptes suspendus</p>
            <p className="mt-1 text-xl font-semibold">{stats.suspendedUsers}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Ordres simules</p>
            <p className="mt-1 text-xl font-semibold">{stats.orders}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Emails en echec</p>
            <p className="mt-1 text-xl font-semibold">{stats.failedEmails}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
