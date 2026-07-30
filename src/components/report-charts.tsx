"use client";

import {
  Bar,
  BarChart,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatIDR } from "@/lib/money";

const FALLBACK_COLORS = [
  "#f97316", "#8b5cf6", "#ec4899", "#ef4444",
  "#3b82f6", "#22c55e", "#eab308", "#14b8a6", "#a3a3a3",
];

export type CategorySlice = { name: string; value: number; color: string | null };
export type TrendPoint = { label: string; income: number; expense: number };

const compact = (n: number) =>
  new Intl.NumberFormat("id-ID", { notation: "compact", maximumFractionDigits: 1 }).format(n);

export function CategoryDonut({ data }: { data: CategorySlice[] }) {
  if (data.length === 0) {
    return <Empty>No expenses in this period.</Empty>;
  }
  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={data.length > 1 ? 2 : 0}
          startAngle={90}
          endAngle={-269.99}
          isAnimationActive={false}
        >
          {data.map((d, i) => (
            <Cell
              key={d.name}
              fill={d.color ?? FALLBACK_COLORS[i % FALLBACK_COLORS.length]}
            />
          ))}
        </Pie>
        <Tooltip
          formatter={(v) => formatIDR(Number(v))}
          contentStyle={tooltipStyle}
        />
        <Legend
          verticalAlign="bottom"
          height={36}
          formatter={(value) => <span className="text-xs">{value}</span>}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function TrendBars({ data }: { data: TrendPoint[] }) {
  if (data.every((d) => d.income === 0 && d.expense === 0)) {
    return <Empty>No activity in this range.</Empty>;
  }
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} barGap={4}>
        <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={12} />
        <YAxis
          tickFormatter={(v) => compact(v)}
          tickLine={false}
          axisLine={false}
          width={44}
          fontSize={11}
        />
        <Tooltip
          formatter={(v) => formatIDR(Number(v))}
          contentStyle={tooltipStyle}
          cursor={{ fill: "rgba(120,120,120,0.08)" }}
        />
        <Legend formatter={(value) => <span className="text-xs capitalize">{value}</span>} />
        <Bar dataKey="income" fill="#22c55e" radius={[4, 4, 0, 0]} />
        <Bar dataKey="expense" fill="#ef4444" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

const tooltipStyle: React.CSSProperties = {
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,0.9)",
  fontSize: 12,
  background: "rgba(255,255,255,0.96)",
  color: "#212121",
  boxShadow: "0 10px 30px -12px rgba(28,55,110,0.35)",
};

function Empty({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-[280px] items-center justify-center text-sm text-neutral-400">
      {children}
    </div>
  );
}
