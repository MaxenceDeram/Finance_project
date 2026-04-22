"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { formatMoney, formatPercent } from "@/lib/format";

const colors = ["#2563eb", "#0f766e", "#b45309", "#7c3aed", "#be123c", "#475569"];

export function AllocationChart({
  data,
  currency
}: {
  data: Array<{ label: string; value: number; weight: number }>;
  currency: string;
}) {
  if (data.length === 0) {
    return (
      <div className="flex h-[260px] items-center justify-center text-sm text-muted-foreground">
        Aucune allocation disponible.
      </div>
    );
  }

  return (
    <div className="h-[260px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="label" innerRadius={58} outerRadius={92}>
            {data.map((entry, index) => (
              <Cell key={entry.label} fill={colors[index % colors.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value, _name, item) => [
              `${formatMoney(Number(value), currency)} (${formatPercent(
                (item.payload as { weight: number }).weight
              )})`,
              "Valeur"
            ]}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
