import Link from "next/link";
import { auth } from "@/auth";

export default async function DashboardPage() {
  const session = await auth();
  const name = session?.user?.name?.split(" ")[0] ?? "there";

  return (
    <div className="mx-auto max-w-3xl p-6">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">
          Hi {name} 👋
        </h1>
        <p className="mt-1 text-sm text-neutral-500">
          Here&apos;s your cash flow at a glance. (Numbers arrive once you start
          adding transactions.)
        </p>
      </header>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="This month — In" value="Rp0" tone="in" />
        <StatCard label="This month — Out" value="Rp0" tone="out" />
        <StatCard label="Net" value="Rp0" tone="net" />
      </section>

      <div className="mt-8 rounded-2xl border border-dashed border-neutral-300 p-8 text-center dark:border-neutral-700">
        <p className="text-sm text-neutral-500">
          No transactions yet.
        </p>
        <Link
          href="/add"
          className="mt-4 inline-block rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
        >
          ➕ Add your first transaction
        </Link>
      </div>
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
