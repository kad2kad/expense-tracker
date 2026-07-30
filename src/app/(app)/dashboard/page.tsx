import Link from "next/link";
import {
  ArrowDownCircle,
  ArrowUpCircle,
  Plus,
  Scale,
  Wallet,
} from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { formatIDR } from "@/lib/money";
import { monthRange } from "@/lib/tx";
import { type TxKind } from "@/lib/constants";
import { TxRow } from "@/components/tx-row";

export default async function DashboardPage() {
  const session = await auth();
  const userId = session!.user.id;
  const name = session?.user?.name?.split(" ")[0] ?? "there";

  const { start, end } = monthRange();

  const [byKind, recent] = await Promise.all([
    prisma.transaction.groupBy({
      by: ["kind"],
      where: { userId, date: { gte: start, lt: end } },
      _sum: { amount: true },
    }),
    prisma.transaction.findMany({
      where: { userId },
      orderBy: [{ date: "desc" }, { createdAt: "desc" }],
      take: 8,
      include: { category: { select: { name: true, icon: true, color: true } } },
    }),
  ]);

  const sumOf = (k: TxKind) =>
    Number(byKind.find((r) => r.kind === k)?._sum.amount ?? 0);
  const income = sumOf("INCOME");
  const expense = sumOf("EXPENSE");
  const net = income - expense;

  const recentRows = recent.map((t) => ({
    id: t.id,
    kind: t.kind,
    amount: Number(t.amount),
    note: t.note,
    date: t.date,
    counterparty: t.counterparty,
    category: t.category,
  }));

  return (
    <div className="mx-auto max-w-3xl p-5 md:p-8">
      <header className="mb-7">
        <h1 className="text-2xl font-bold tracking-tight text-ink">Hi {name}</h1>
        <p className="mt-1 text-sm text-ink-muted">Your cash flow this month.</p>
      </header>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="This month — In" value={formatIDR(income)} tone="in" />
        <StatCard label="This month — Out" value={formatIDR(expense)} tone="out" />
        <StatCard label="Net" value={formatIDR(net)} tone="net" />
      </section>

      <section className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-bold text-ink">Recent</h2>
          <Link
            href="/add"
            className="flex items-center gap-1 text-sm font-semibold text-primary hover:text-primary-dark"
          >
            <Plus size={16} strokeWidth={2.5} />
            Add
          </Link>
        </div>

        {recentRows.length === 0 ? (
          <div className="lg-card flex flex-col items-center p-10 text-center">
            <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl lg-inset text-ink-muted">
              <Wallet size={22} />
            </span>
            <p className="text-sm text-ink-muted">No transactions yet.</p>
            <Link
              href="/add"
              className="lg-primary mt-4 inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold"
            >
              <Plus size={16} strokeWidth={2.5} />
              Add your first transaction
            </Link>
          </div>
        ) : (
          <ul className="lg-card divide-y divide-black/5 overflow-hidden py-1">
            {recentRows.map((t) => (
              <TxRow key={t.id} tx={t} href={`/transactions/${t.id}`} />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function StatCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "in" | "out" | "net";
}) {
  const config = {
    in: { color: "text-success", Icon: ArrowUpCircle, tint: "#22b07d" },
    out: { color: "text-danger", Icon: ArrowDownCircle, tint: "#ef5f5f" },
    net: { color: "text-ink", Icon: Scale, tint: "#2196f3" },
  }[tone];
  const { Icon } = config;

  return (
    <div className="lg-card p-5">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-ink-muted">{label}</p>
        <span
          className="flex h-8 w-8 items-center justify-center rounded-xl"
          style={{
            color: config.tint,
            background: `color-mix(in srgb, ${config.tint} 14%, white)`,
          }}
        >
          <Icon size={16} strokeWidth={2.4} />
        </span>
      </div>
      <p className={`mt-3 text-2xl font-bold ${config.color}`}>{value}</p>
    </div>
  );
}
