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
              <stop offset="5%" stopColor="#2563eb" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="benchmarkValue" x1="0" x2="0" y1="0" y2="1">
              <stop offset="5%" stopColor="#0f766e" stopOpacity={0.18} />
              <stop offset="95%" stopColor="#0f766e" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#e5e7eb" vertical={false} />
          <XAxis dataKey="date" tickLine={false} axisLine={false} fontSize={12} />
          <YAxis
            tickLine={false}
            axisLine={false}
            fontSize={12}
            tickFormatter={(value) => formatMoney(Number(value), currency)}
            width={86}
          />
          <Tooltip
            formatter={(value) => formatMoney(Number(value), currency)}
            contentStyle={{
              borderRadius: 8,
              borderColor: "#d7dee8",
              boxShadow: "0 10px 30px rgb(15 23 42 / 0.12)"
            }}
          />
          <Area
            type="monotone"
            dataKey="totalValue"
            name="Portefeuille"
            stroke="#2563eb"
            strokeWidth={2}
            fill="url(#portfolioValue)"
          />
          <Area
            type="monotone"
            dataKey="benchmark"
            name="Benchmark"
            stroke="#0f766e"
            strokeWidth={2}
            fill="url(#benchmarkValue)"
            connectNulls
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
