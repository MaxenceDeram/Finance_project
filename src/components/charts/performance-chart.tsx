"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { formatMoney } from "@/lib/format";

export function PerformanceChart({
  data,
  currency
}: {
  data: Array<{ date: string; totalValue: number; benchmark?: number }>;
  currency: string;
}) {
  return (
    <div className="h-[320px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="portfolioValue" x1="0" x2="0" y1="0" y2="1">
              <stop offset="5%" stopColor="#0f7a55" stopOpacity={0.18} />
              <stop offset="95%" stopColor="#0f7a55" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="benchmarkValue" x1="0" x2="0" y1="0" y2="1">
              <stop offset="5%" stopColor="#11110f" stopOpacity={0.1} />
              <stop offset="95%" stopColor="#11110f" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#e3e3db" vertical={false} />
          <XAxis
            dataKey="date"
            tickLine={false}
            axisLine={false}
            fontSize={12}
            stroke="#6f6f67"
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            fontSize={12}
            stroke="#6f6f67"
            tickFormatter={(value) => formatMoney(Number(value), currency)}
            width={86}
          />
          <Tooltip
            formatter={(value) => formatMoney(Number(value), currency)}
            contentStyle={{
              borderRadius: 6,
              borderColor: "#deded6",
              color: "#11110f",
              boxShadow: "0 12px 32px rgb(17 17 15 / 0.1)"
            }}
          />
          <Area
            type="monotone"
            dataKey="totalValue"
            name="Portefeuille"
            stroke="#0f7a55"
            strokeWidth={2}
            fill="url(#portfolioValue)"
          />
          <Area
            type="monotone"
            dataKey="benchmark"
            name="Benchmark"
            stroke="#11110f"
            strokeWidth={1.6}
            fill="url(#benchmarkValue)"
            connectNulls
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
