import Link from "next/link";
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
      include: { category: { select: { name: true, icon: true } } },
    }),
  ]);

  const sumOf = (k: TxKind) =>
    byKind.find((r) => r.kind === k)?._sum.amount ?? 0;
  const income = sumOf("INCOME");
  const expense = sumOf("EXPENSE");
  const net = income - expense;

  return (
    <div className="mx-auto max-w-3xl p-6">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">Hi {name} 👋</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Your cash flow this month.
        </p>
      </header>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="This month — In" value={formatIDR(income)} tone="in" />
        <StatCard label="This month — Out" value={formatIDR(expense)} tone="out" />
        <StatCard label="Net" value={formatIDR(net)} tone="net" />
      </section>

      <section className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold">Recent</h2>
          <Link href="/add" className="text-sm font-medium text-neutral-500 hover:underline">
            + Add
          </Link>
        </div>

        {recent.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-neutral-300 p-8 text-center dark:border-neutral-700">
            <p className="text-sm text-neutral-500">No transactions yet.</p>
            <Link
              href="/add"
              className="mt-4 inline-block rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
            >
              ➕ Add your first transaction
            </Link>
          </div>
        ) : (
          <ul className="divide-y divide-neutral-200 overflow-hidden rounded-2xl border border-neutral-200 dark:divide-neutral-800 dark:border-neutral-800">
            {recent.map((t) => (
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
  const color =
    tone === "in"
      ? "text-emerald-600"
      : tone === "out"
        ? "text-red-600"
        : "text-neutral-900 dark:text-white";
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
      <p className="text-xs font-medium text-neutral-500">{label}</p>
      <p className={`mt-2 text-2xl font-semibold ${color}`}>{value}</p>
    </div>
  );
}
