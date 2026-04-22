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
import { listDailyEmailLogs } from "@/features/admin/service";
import { formatDateTime } from "@/lib/dates";
import { requireAdmin } from "@/server/security/sessions";

export default async function AdminEmailLogsPage() {
  await requireAdmin();
  const logs = await listDailyEmailLogs();

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
          <CardTitle>Emails quotidiens</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Utilisateur</TableHead>
                <TableHead>Portefeuille</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Sujet</TableHead>
                <TableHead>Erreur</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>{formatDateTime(log.sentAt)}</TableCell>
                  <TableCell>{log.user.email}</TableCell>
                  <TableCell>{log.portfolio?.name ?? "-"}</TableCell>
                  <TableCell>
                    <Badge variant={log.status === "SENT" ? "success" : "destructive"}>
                      {log.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{log.subject}</TableCell>
                  <TableCell className="max-w-xs truncate">{log.error ?? "-"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
