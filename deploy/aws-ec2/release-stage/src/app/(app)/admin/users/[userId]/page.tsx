import Link from "next/link";
import { AdminUserManagementForms } from "@/features/admin/admin-user-forms";
import { getAdminUserDetails } from "@/features/admin/service";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { formatDateTime } from "@/lib/dates";
import { getApplicationStatusLabel } from "@/features/applications/constants";
import { requireAdmin } from "@/server/security/sessions";

export default async function AdminUserDetailPage({
  params
}: {
  params: Promise<{ userId: string }>;
}) {
  const actor = await requireAdmin();
  const { userId } = await params;
  const user = await getAdminUserDetails(userId);

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-semibold uppercase tracking-normal text-muted-foreground">
            Utilisateur
          </p>
          <h1 className="mt-2 text-4xl font-semibold tracking-normal">{user.email}</h1>
          <div className="mt-3 flex flex-wrap gap-2">
            <Badge variant={user.role === "OWNER" ? "success" : "outline"}>
              {user.role}
            </Badge>
            <Badge variant={user.status === "ACTIVE" ? "success" : "destructive"}>
              {user.status}
            </Badge>
            <Badge variant={user.emailVerified ? "success" : "warning"}>
              {user.emailVerified ? "Email confirme" : "Email non confirme"}
            </Badge>
          </div>
        </div>
        <Button asChild variant="outline">
          <Link href="/admin/users">Retour</Link>
        </Button>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
        <Card>
          <CardHeader>
            <CardTitle>Informations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="flex justify-between gap-4 border-b pb-3">
              <span className="text-muted-foreground">Creation</span>
              <span>{formatDateTime(user.createdAt)}</span>
            </div>
            <div className="flex justify-between gap-4 border-b pb-3">
              <span className="text-muted-foreground">Mise a jour</span>
              <span>{formatDateTime(user.updatedAt)}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Preferences email</span>
              <span>
                {user.preferences?.dailyEmailEnabled ? "Activees" : "Desactivees"}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <AdminUserManagementForms
              userId={user.id}
              userEmail={user.email}
              userRole={user.role}
              userStatus={user.status}
              emailVerified={user.emailVerified}
              actorRole={actor.role}
              actorUserId={actor.id}
            />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Candidatures recentes</CardTitle>
        </CardHeader>
        <CardContent>
          {user.jobApplications.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Entreprise</TableHead>
                  <TableHead>Poste</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Relance</TableHead>
                  <TableHead>Maj</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {user.jobApplications.map((application) => (
                  <TableRow key={application.id}>
                    <TableCell className="font-medium">{application.companyName}</TableCell>
                    <TableCell>{application.roleTitle}</TableCell>
                    <TableCell>{getApplicationStatusLabel(application.status)}</TableCell>
                    <TableCell>
                      {application.followUpDate
                        ? formatDateTime(application.followUpDate)
                        : "-"}
                    </TableCell>
                    <TableCell>{formatDateTime(application.updatedAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="py-6 text-center text-sm text-muted-foreground">
              Aucune candidature.
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Dernieres sessions</CardTitle>
        </CardHeader>
        <CardContent>
          {user.sessions.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Creation</TableHead>
                  <TableHead>Derniere activite</TableHead>
                  <TableHead>Expiration</TableHead>
                  <TableHead>User agent</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {user.sessions.map((session) => (
                  <TableRow key={session.id}>
                    <TableCell>{formatDateTime(session.createdAt)}</TableCell>
                    <TableCell>{formatDateTime(session.lastSeenAt)}</TableCell>
                    <TableCell>{formatDateTime(session.expiresAt)}</TableCell>
                    <TableCell className="max-w-xs truncate">
                      {session.userAgent ?? "-"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="py-6 text-center text-sm text-muted-foreground">
              Aucune session active.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
