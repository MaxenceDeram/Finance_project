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

export type AssetChartPoint = {
  timestamp: string | Date;
  close?: number;
  price?: number;
};

export function AssetLiveChart({
  data,
  currency,
  height = 360
}: {
  data: AssetChartPoint[];
  currency: string;
  height?: number;
}) {
  const normalized = data.map((point) => {
    const date = new Date(point.timestamp);
    return {
      label: new Intl.DateTimeFormat("fr-FR", {
        day: "2-digit",
        month: "short"
      }).format(date),
      price: point.close ?? point.price ?? 0
    };
  });

  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={normalized} margin={{ top: 12, right: 18, left: 0, bottom: 8 }}>
          <defs>
            <linearGradient id="warenLiveChart" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#32d46b" stopOpacity={0.18} />
              <stop offset="90%" stopColor="#32d46b" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="rgba(255,255,255,0.07)" vertical={false} />
          <XAxis
            dataKey="label"
            axisLine={false}
            tickLine={false}
            interval="preserveStartEnd"
            tick={{ fill: "rgba(255,255,255,0.38)", fontSize: 12, fontWeight: 700 }}
          />
          <YAxis
            orientation="right"
            axisLine={false}
            tickLine={false}
            width={74}
            tickFormatter={(value) => Number(value).toFixed(2)}
            tick={{ fill: "rgba(255,255,255,0.38)", fontSize: 12, fontWeight: 700 }}
            domain={["dataMin", "dataMax"]}
          />
          <Tooltip
            formatter={(value) => [formatMoney(Number(value), currency), "Prix"]}
            contentStyle={{
              border: "1px solid rgba(255,255,255,.12)",
              background: "#1b1d1b",
              borderRadius: 14,
              color: "#fff",
              boxShadow: "0 16px 50px rgba(0,0,0,.35)"
            }}
          />
          <Area
            type="monotone"
            dataKey="price"
            stroke="#32d46b"
            strokeWidth={2.4}
            fill="url(#warenLiveChart)"
            dot={false}
            activeDot={{ r: 5, fill: "#32d46b", stroke: "#132516", strokeWidth: 4 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
