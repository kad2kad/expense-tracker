import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { formatIDR } from "@/lib/money";
import { HistoryControls } from "@/components/history-controls";
import { ExportButtons } from "@/components/export-buttons";
import { TxRow, type TxRowData } from "@/components/tx-row";
import {
  bucketFor,
  isView,
  parseAnchor,
  subtotals,
  toISODate,
  windowFor,
  type View,
} from "@/lib/history";

type SearchParams = Promise<{ view?: string; anchor?: string }>;

export default async function HistoryPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const view: View = isView(sp.view) ? sp.view : "monthly";
  const anchor = parseAnchor(sp.anchor);
  const anchorISO = toISODate(anchor);
  const win = windowFor(view, anchor);

  const session = await auth();
  const userId = session!.user.id;

  const txs = await prisma.transaction.findMany({
    where: { userId, date: { gte: win.start, lt: win.end } },
    orderBy: { date: "desc" },
    include: { category: { select: { name: true, icon: true } } },
  });

  // Group into ordered buckets (input is already date-desc).
  const buckets: {
    key: string;
    label: string;
    items: TxRowData[];
  }[] = [];
  const index = new Map<string, number>();
  for (const t of txs) {
    const { key, label } = bucketFor(view, t.date);
    let i = index.get(key);
    if (i === undefined) {
      i = buckets.length;
      index.set(key, i);
      buckets.push({ key, label, items: [] });
    }
    buckets[i].items.push({
      id: t.id,
      kind: t.kind,
      amount: t.amount,
      note: t.note,
      date: t.date,
      counterparty: t.counterparty,
      category: t.category,
    });
  }

  // In daily view the card title is the day, so rows don't repeat the date.
  const showRowDate = view !== "daily";

  return (
    <div className="mx-auto max-w-3xl p-6">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">History</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Grouped by {view === "daily" ? "day" : view === "monthly" ? "month" : "year"}.
        </p>
      </header>

      <HistoryControls
        view={view}
        anchor={anchorISO}
        label={win.label}
        prev={win.prev}
        next={win.next}
      />

      <div className="mt-4 flex justify-end">
        <ExportButtons view={view} anchor={anchorISO} disabled={txs.length === 0} />
      </div>

      <div className="mt-2 space-y-4">
        {buckets.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-neutral-300 p-8 text-center text-sm text-neutral-500 dark:border-neutral-700">
            No transactions in this period.
          </div>
        ) : (
          buckets.map((b) => {
            const st = subtotals(b.items);
            return (
              <section
                key={b.key}
                className="overflow-hidden rounded-2xl border border-neutral-200 dark:border-neutral-800"
              >
                <header className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-200 bg-neutral-50 px-4 py-3 dark:border-neutral-800 dark:bg-neutral-900/60">
                  <h2 className="text-sm font-semibold">{b.label}</h2>
                  <div className="flex items-center gap-3 text-xs font-medium">
                    <span className="text-emerald-600">+{formatIDR(st.income)}</span>
                    <span className="text-red-600">−{formatIDR(st.expense)}</span>
                    <span
                      className={
                        st.net >= 0 ? "text-neutral-700 dark:text-neutral-200" : "text-red-600"
                      }
                    >
                      net {formatIDR(st.net)}
                    </span>
                  </div>
                </header>
                <ul className="divide-y divide-neutral-200 dark:divide-neutral-800">
                  {b.items.map((t) => (
                    <TxRow
                      key={t.id}
                      tx={t}
                      showDate={showRowDate}
                      href={`/transactions/${t.id}`}
                    />
                  ))}
                </ul>
              </section>
            );
          })
        )}
      </div>
    </div>
  );
}
