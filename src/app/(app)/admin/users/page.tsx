import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { listAdminUsers } from "@/features/admin/service";
import { formatDateOnly } from "@/lib/dates";
import { requireAdmin } from "@/server/security/sessions";

export default async function AdminUsersPage({
  searchParams
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  await requireAdmin();
  const params = await searchParams;
  const users = await listAdminUsers(params.q);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-normal text-muted-foreground">
          Administration
        </p>
        <h1 className="mt-2 text-4xl font-semibold tracking-normal">Utilisateurs</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recherche</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="flex gap-3">
            <Input
              name="q"
              defaultValue={params.q ?? ""}
              placeholder="email@domaine.com"
            />
            <Button type="submit" variant="outline">
              Chercher
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Confirme</TableHead>
                <TableHead>Portefeuilles</TableHead>
                <TableHead>Sessions</TableHead>
                <TableHead>Creation</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.email}</TableCell>
                  <TableCell>
                    <Badge variant={user.role === "OWNER" ? "success" : "outline"}>
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.status === "ACTIVE" ? "success" : "destructive"}>
                      {user.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{user.emailVerified ? "Oui" : "Non"}</TableCell>
                  <TableCell>{user._count.portfolios}</TableCell>
                  <TableCell>{user._count.sessions}</TableCell>
                  <TableCell>{formatDateOnly(user.createdAt)}</TableCell>
                  <TableCell>
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/admin/users/${user.id}`}>Ouvrir</Link>
                    </Button>
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
