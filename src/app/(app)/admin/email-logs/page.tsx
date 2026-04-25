import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { EmailLogStatusBadge } from "@/features/emails/email-log-status-badge";
import { listEmailLogs } from "@/features/admin/service";
import { formatDateTime } from "@/lib/dates";
import { requireAdmin } from "@/server/security/sessions";

export default async function AdminEmailLogsPage() {
  await requireAdmin();
  const logs = await listEmailLogs();

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-normal text-muted-foreground">
          Administration
        </p>
        <h1 className="mt-2 text-4xl font-semibold tracking-normal">Emails Waren</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Journal des emails</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Utilisateur</TableHead>
                <TableHead>Categorie</TableHead>
                <TableHead>Provider</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Destination</TableHead>
                <TableHead>Sujet</TableHead>
                <TableHead>Candidature</TableHead>
                <TableHead>Erreur</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>{formatDateTime(log.sentAt ?? log.createdAt)}</TableCell>
                  <TableCell>{log.user.email}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{log.category}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{log.provider}</Badge>
                  </TableCell>
                  <TableCell>
                    <EmailLogStatusBadge status={log.status} />
                  </TableCell>
                  <TableCell>{log.toEmail}</TableCell>
                  <TableCell>{log.subject}</TableCell>
                  <TableCell className="max-w-xs">
                    {log.application
                      ? `${log.application.companyName} • ${log.application.roleTitle}`
                      : log.template?.name || "-"}
                  </TableCell>
                  <TableCell className="max-w-xs truncate">
                    {log.errorMessage ?? "-"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
