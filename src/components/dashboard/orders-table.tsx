import type { OrderSide } from "@prisma/client";
import { formatDateTime } from "@/lib/dates";
import { formatMoney, formatQuantity } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type OrderRow = {
  id: string;
  side: OrderSide;
  status: string;
  quantity: unknown;
  createdAt: Date;
  asset: { symbol: string; name: string; currency: string };
  portfolio: { name: string; baseCurrency: string };
  executions: Array<{ executedPrice: unknown; fees: unknown; realizedPnl: unknown }>;
};

export function OrdersTable({ orders }: { orders: OrderRow[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Portefeuille</TableHead>
          <TableHead>Actif</TableHead>
          <TableHead>Sens</TableHead>
          <TableHead>Quantite</TableHead>
          <TableHead>Prix</TableHead>
          <TableHead>Frais</TableHead>
          <TableHead>Statut</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {orders.map((order) => {
          const execution = order.executions[0];
          return (
            <TableRow key={order.id}>
              <TableCell>{formatDateTime(order.createdAt)}</TableCell>
              <TableCell>{order.portfolio.name}</TableCell>
              <TableCell>
                <div className="font-medium">{order.asset.symbol}</div>
                <div className="text-xs text-muted-foreground">{order.asset.name}</div>
              </TableCell>
              <TableCell>
                <Badge variant={order.side === "BUY" ? "success" : "warning"}>
                  {order.side === "BUY" ? "Achat" : "Vente"}
                </Badge>
              </TableCell>
              <TableCell>{formatQuantity(Number(order.quantity))}</TableCell>
              <TableCell>
                {execution
                  ? formatMoney(Number(execution.executedPrice), order.portfolio.baseCurrency)
                  : "-"}
              </TableCell>
              <TableCell>
                {execution ? formatMoney(Number(execution.fees), order.portfolio.baseCurrency) : "-"}
              </TableCell>
              <TableCell>{order.status}</TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
