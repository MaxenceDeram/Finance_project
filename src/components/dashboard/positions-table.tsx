import { formatMoney, formatPercent, formatQuantity } from "@/lib/format";
import type { PositionOverview } from "@/features/analytics/service";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";

export function PositionsTable({
  positions,
  currency
}: {
  positions: PositionOverview[];
  currency: string;
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Actif</TableHead>
          <TableHead>Quantite</TableHead>
          <TableHead>Prix moyen</TableHead>
          <TableHead>Prix actuel</TableHead>
          <TableHead>Valeur</TableHead>
          <TableHead>P&L latent</TableHead>
          <TableHead>Poids</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {positions.map((position) => (
          <TableRow key={position.id}>
            <TableCell>
              <div className="font-medium">{position.symbol}</div>
              <div className="text-xs text-muted-foreground">{position.name}</div>
            </TableCell>
            <TableCell className="font-medium tabular-nums">
              {formatQuantity(position.quantity)}
            </TableCell>
            <TableCell className="tabular-nums">
              {formatMoney(position.averageCost, currency)}
            </TableCell>
            <TableCell className="tabular-nums">
              {formatMoney(position.currentPrice, currency)}
            </TableCell>
            <TableCell className="font-medium tabular-nums">
              {formatMoney(position.value, currency)}
            </TableCell>
            <TableCell>
              <Badge variant={position.unrealizedPnl >= 0 ? "success" : "destructive"}>
                {formatMoney(position.unrealizedPnl, currency)} ·{" "}
                {formatPercent(position.unrealizedPnlPercent)}
              </Badge>
            </TableCell>
            <TableCell className="tabular-nums">
              {formatPercent(position.weight)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
