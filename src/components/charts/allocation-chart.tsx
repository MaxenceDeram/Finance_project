"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { formatMoney, formatPercent } from "@/lib/format";

const colors = ["#0f7a55", "#11110f", "#6f6f67", "#b8b8ac", "#8f8f82", "#d7d7cf"];

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
          <Pie
            data={data}
            dataKey="value"
            nameKey="label"
            innerRadius={62}
            outerRadius={94}
            paddingAngle={2}
          >
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
            contentStyle={{
              borderRadius: 6,
              borderColor: "#deded6",
              boxShadow: "0 12px 32px rgb(17 17 15 / 0.1)"
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
