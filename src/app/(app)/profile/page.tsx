import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDateTime } from "@/lib/dates";
import { requireUser } from "@/server/security/sessions";

export default async function ProfilePage() {
  const user = await requireUser();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          Compte
        </p>
        <h1 className="mt-1 text-3xl font-semibold tracking-normal">Profil</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Informations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between gap-4 border-b pb-4">
            <span className="text-sm text-muted-foreground">Email</span>
            <span className="font-medium">{user.email}</span>
          </div>
          <div className="flex items-center justify-between gap-4 border-b pb-4">
            <span className="text-sm text-muted-foreground">Statut</span>
            <Badge variant={user.emailVerified ? "success" : "warning"}>
              {user.emailVerified ? "Confirme" : "Non confirme"}
            </Badge>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-sm text-muted-foreground">Creation</span>
            <span className="font-medium">{formatDateTime(user.createdAt)}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
