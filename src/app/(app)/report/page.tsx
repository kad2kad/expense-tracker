import { ArrowUp, ArrowDown } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { formatIDR } from "@/lib/money";
import { ReportControls } from "@/components/report-controls";
import {
  CategoryDonut,
  TrendBars,
  type CategorySlice,
  type TrendPoint,
} from "@/components/report-charts";
import {
  addMonths,
  monthBounds,
  monthKey,
  monthLabel,
  parseMonth,
  pctChange,
  shortMonthLabel,
} from "@/lib/report";

type SearchParams = Promise<{ month?: string }>;

export default async function ReportPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const month = parseMonth(sp.month);
  const { start, end } = monthBounds(month);
  const prevMonth = addMonths(month, -1);
  const prevBounds = monthBounds(prevMonth);

  const session = await auth();
  const userId = session!.user.id;

  // Trend window: last 6 months up to and including the selected month.
  const trendStart = addMonths(month, -5);

  const [curr, prev, expenseByCat, trendRows] = await Promise.all([
    prisma.transaction.groupBy({
      by: ["kind"],
      where: { userId, date: { gte: start, lt: end } },
      _sum: { amount: true },
    }),
    prisma.transaction.groupBy({
      by: ["kind"],
      where: { userId, date: { gte: prevBounds.start, lt: prevBounds.end } },
      _sum: { amount: true },
    }),
    prisma.transaction.groupBy({
      by: ["categoryId"],
      where: { userId, kind: "EXPENSE", date: { gte: start, lt: end } },
      _sum: { amount: true },
    }),
    prisma.transaction.findMany({
      where: { userId, date: { gte: trendStart, lt: end } },
      select: { kind: true, amount: true, date: true },
    }),
  ]);

  const sumKind = (rows: typeof curr, kind: string) =>
    rows.find((r) => r.kind === kind)?._sum.amount ?? 0;

  const income = sumKind(curr, "INCOME");
  const expense = sumKind(curr, "EXPENSE");
  const net = income - expense;
  const prevExpense = sumKind(prev, "EXPENSE");
  const prevIncome = sumKind(prev, "INCOME");
  const spendDelta = pctChange(expense, prevExpense);
  const savingsRate = income > 0 ? Math.round((net / income) * 100) : null;

  // Resolve category names/colors for the expense breakdown.
  const catIds = expenseByCat.map((r) => r.categoryId);
  const cats = await prisma.category.findMany({
    where: { id: { in: catIds } },
    select: { id: true, name: true, color: true },
  });
  const catMap = new Map(cats.map((c) => [c.id, c]));
  const slices: CategorySlice[] = expenseByCat
    .map((r) => ({
      name: catMap.get(r.categoryId)?.name ?? "Other",
      color: catMap.get(r.categoryId)?.color ?? null,
      value: r._sum.amount ?? 0,
    }))
    .sort((a, b) => b.value - a.value);

  const biggest = slices[0] ?? null;

  // Build the 6-month trend series.
  const trend: TrendPoint[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = addMonths(month, -i);
    trend.push({ label: shortMonthLabel(d), income: 0, expense: 0 });
  }
  const trendIndex = new Map(
    trend.map((t, i) => [t.label, i] as const),
  );
  for (const r of trendRows) {
    const key = shortMonthLabel(new Date(r.date.getFullYear(), r.date.getMonth(), 1));
    const i = trendIndex.get(key);
    if (i === undefined) continue;
    if (r.kind === "INCOME") trend[i].income += r.amount;
    else if (r.kind === "EXPENSE") trend[i].expense += r.amount;
  }

  return (
    <div className="mx-auto max-w-3xl p-5 md:p-8">
      <header className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-ink">Report</h1>
        <p className="mt-1 text-sm text-ink-muted">
          Spending insights for {monthLabel(month)}.
        </p>
      </header>

      <ReportControls
        label={monthLabel(month)}
        prev={monthKey(prevMonth)}
        next={monthKey(addMonths(month, 1))}
      />

      {/* KPI tiles */}
      <section className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Kpi label="In" value={formatIDR(income)} tone="in" />
        <Kpi label="Out" value={formatIDR(expense)} tone="out" />
        <Kpi label="Net" value={formatIDR(net)} tone={net >= 0 ? "net" : "out"} />
        <Kpi
          label="Savings rate"
          value={savingsRate === null ? "—" : `${savingsRate}%`}
          tone="net"
        />
      </section>

      {/* Comparison line */}
      <div className="lg-card mt-4 flex flex-wrap gap-x-6 gap-y-1 px-4 py-3 text-sm">
        <Delta label="Spending vs last month" pct={spendDelta} invert />
        <Delta label="Income vs last month" pct={pctChange(income, prevIncome)} />
        {biggest && (
          <span className="text-ink-muted">
            Biggest:{" "}
            <span className="font-semibold text-ink">{biggest.name}</span>{" "}
            ({formatIDR(biggest.value)})
          </span>
        )}
      </div>

      {/* Charts */}
      <section className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card title="Expenses by category">
          <CategoryDonut data={slices} />
        </Card>
        <Card title="Income vs expense (6 months)">
          <TrendBars data={trend} />
        </Card>
      </section>
    </div>
  );
}

function Kpi({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "in" | "out" | "net";
}) {
  const color =
    tone === "in" ? "text-success" : tone === "out" ? "text-danger" : "text-ink";
  return (
    <div className="lg-card p-4">
      <p className="text-xs font-semibold text-ink-muted">{label}</p>
      <p className={`mt-1 text-lg font-bold ${color}`}>{value}</p>
    </div>
  );
}

function Delta({
  label,
  pct,
  invert = false,
}: {
  label: string;
  pct: number | null;
  invert?: boolean;
}) {
  if (pct === null) {
    return <span className="text-ink-muted">{label}: —</span>;
  }
  const up = pct >= 0;
  // For spending, up is bad (invert the color meaning).
  const good = invert ? !up : up;
  const Arrow = up ? ArrowUp : ArrowDown;
  return (
    <span className="text-ink-muted">
      {label}:{" "}
      <span
        className={`inline-flex items-center gap-0.5 font-semibold ${
          good ? "text-success" : "text-danger"
        }`}
      >
        <Arrow size={13} strokeWidth={2.5} />
        {Math.abs(pct).toFixed(0)}%
      </span>
    </span>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="lg-card p-4">
      <h2 className="mb-2 text-sm font-bold text-ink">{title}</h2>
      {children}
    </div>
  );
}
