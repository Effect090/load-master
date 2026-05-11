"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface BreakdownItem {
  name: string;
  value: number;
}

const COLORS = [
  "#2563eb",
  "#16a34a",
  "#f59e0b",
  "#ef4444",
  "#9333ea",
  "#0891b2",
  "#dc2626",
  "#84cc16",
  "#f97316",
];

export function LoadBreakdownPie({ data }: { data: BreakdownItem[] }) {
  const filtered = data.filter((d) => d.value > 0);
  if (filtered.length === 0) {
    return (
      <div className="h-64 grid place-items-center text-xs text-muted-foreground">
        No load data
      </div>
    );
  }
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={filtered}
            dataKey="value"
            nameKey="name"
            outerRadius={80}
            innerRadius={40}
            paddingAngle={2}
          >
            {filtered.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(v: number) => `${Math.round(v)} W`}
            contentStyle={{
              borderRadius: 8,
              border: "1px solid hsl(var(--border))",
              background: "hsl(var(--card))",
              color: "hsl(var(--foreground))",
              fontSize: 12,
            }}
          />
          <Legend wrapperStyle={{ fontSize: 11 }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export function ZoneCompareBars({
  data,
}: {
  data: { zone: string; heating: number; cooling: number }[];
}) {
  if (data.length === 0) {
    return (
      <div className="h-64 grid place-items-center text-xs text-muted-foreground">
        No zones
      </div>
    );
  }
  return (
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis dataKey="zone" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} />
          <Tooltip
            formatter={(v: number) => `${(v / 1000).toFixed(2)} kW`}
            contentStyle={{
              borderRadius: 8,
              border: "1px solid hsl(var(--border))",
              background: "hsl(var(--card))",
              color: "hsl(var(--foreground))",
              fontSize: 12,
            }}
          />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          <Bar dataKey="heating" name="Heating (W)" fill="#2563eb" radius={4} />
          <Bar dataKey="cooling" name="Cooling (W)" fill="#f59e0b" radius={4} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
