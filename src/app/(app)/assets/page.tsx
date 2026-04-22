import { BarChart3 } from "lucide-react";
import { EmptyState } from "@/components/dashboard/empty-state";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { listAssets } from "@/features/assets/service";
import { formatMoney } from "@/lib/format";

export default async function AssetsPage() {
  const assets = await listAssets();

  if (assets.length === 0) {
    return (
      <EmptyState
        icon={BarChart3}
        title="Aucun actif local"
        description="Les actifs sont ajoutes automatiquement lors du premier ordre simule."
      />
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          Referentiel
        </p>
        <h1 className="mt-1 text-3xl font-semibold tracking-normal">Actifs</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Bibliotheque locale</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Symbole</TableHead>
                <TableHead>Nom</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Exchange</TableHead>
                <TableHead>Devise</TableHead>
                <TableHead>Dernier prix</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assets.map((asset) => (
                <TableRow key={asset.id}>
                  <TableCell className="font-medium">{asset.symbol}</TableCell>
                  <TableCell>{asset.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{asset.assetType}</Badge>
                  </TableCell>
                  <TableCell>{asset.exchange ?? "-"}</TableCell>
                  <TableCell>{asset.currency}</TableCell>
                  <TableCell>
                    {asset.prices[0]
                      ? formatMoney(Number(asset.prices[0].close), asset.currency)
                      : "-"}
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
