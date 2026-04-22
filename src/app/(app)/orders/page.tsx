import { ClipboardList } from "lucide-react";
import { EmptyState } from "@/components/dashboard/empty-state";
import { OrdersTable } from "@/components/dashboard/orders-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { listOrdersForUser } from "@/features/orders/service";
import { requireUser } from "@/server/security/sessions";

export default async function OrdersPage() {
  const user = await requireUser();
  const orders = await listOrdersForUser(user.id);

  if (orders.length === 0) {
    return (
      <EmptyState
        icon={ClipboardList}
        title="Aucun ordre"
        description="Les achats, ventes, executions et frais simules par Waren apparaitront ici."
      />
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-normal text-muted-foreground">
          Historique
        </p>
        <h1 className="mt-2 text-4xl font-semibold tracking-normal">
          Ordres et executions
        </h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Toutes les operations</CardTitle>
        </CardHeader>
        <CardContent>
          <OrdersTable orders={orders} />
        </CardContent>
      </Card>
    </div>
  );
}
