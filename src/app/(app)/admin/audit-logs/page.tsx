import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { listAuditLogs } from "@/features/admin/service";
import { formatDateTime } from "@/lib/dates";
import { requireAdmin } from "@/server/security/sessions";

export default async function AdminAuditLogsPage() {
  await requireAdmin();
  const logs = await listAuditLogs();

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          Administration
        </p>
        <h1 className="mt-1 text-3xl font-semibold tracking-normal">Audit logs</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Actions sensibles</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Utilisateur</TableHead>
                <TableHead>Metadata</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>{formatDateTime(log.createdAt)}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{log.action}</Badge>
                  </TableCell>
                  <TableCell>{log.user?.email ?? "-"}</TableCell>
                  <TableCell className="max-w-xl truncate text-xs text-muted-foreground">
                    {log.metadata ? JSON.stringify(log.metadata) : "-"}
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
