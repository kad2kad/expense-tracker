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
    <div className="mx-auto max-w-3xl p-6">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Report</h1>
        <p className="mt-1 text-sm text-neutral-500">
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
      <div className="mt-4 flex flex-wrap gap-x-6 gap-y-1 rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm dark:border-neutral-800 dark:bg-neutral-900">
        <Delta label="Spending vs last month" pct={spendDelta} invert />
        <Delta label="Income vs last month" pct={pctChange(income, prevIncome)} />
        {biggest && (
          <span className="text-neutral-500">
            Biggest: <span className="font-medium text-neutral-800 dark:text-neutral-200">
              {biggest.name}
            </span>{" "}
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
    tone === "in"
      ? "text-emerald-600"
      : tone === "out"
        ? "text-red-600"
        : "text-neutral-900 dark:text-white";
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
      <p className="text-xs font-medium text-neutral-500">{label}</p>
      <p className={`mt-1 text-lg font-semibold ${color}`}>{value}</p>
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
    return <span className="text-neutral-500">{label}: —</span>;
  }
  const up = pct >= 0;
  // For spending, up is bad (invert the color meaning).
  const good = invert ? !up : up;
  return (
    <span className="text-neutral-500">
      {label}:{" "}
      <span className={good ? "font-medium text-emerald-600" : "font-medium text-red-600"}>
        {up ? "▲" : "▼"} {Math.abs(pct).toFixed(0)}%
      </span>
    </span>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
      <h2 className="mb-2 text-sm font-semibold">{title}</h2>
      {children}
    </div>
  );
}
