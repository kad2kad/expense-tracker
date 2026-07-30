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
    include: { category: { select: { name: true, icon: true, color: true } } },
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
      amount: Number(t.amount),
      note: t.note,
      date: t.date,
      counterparty: t.counterparty,
      category: t.category,
    });
  }

  // In daily view the card title is the day, so rows don't repeat the date.
  const showRowDate = view !== "daily";

  return (
    <div className="mx-auto max-w-3xl p-5 md:p-8">
      <header className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-ink">History</h1>
        <p className="mt-1 text-sm text-ink-muted">
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
          <div className="lg-card p-10 text-center text-sm text-ink-muted">
            No transactions in this period.
          </div>
        ) : (
          buckets.map((b) => {
            const st = subtotals(b.items);
            return (
              <section key={b.key} className="lg-card overflow-hidden">
                <header className="flex flex-wrap items-center justify-between gap-2 border-b border-black/5 px-4 py-3">
                  <h2 className="text-sm font-bold text-ink">{b.label}</h2>
                  <div className="flex items-center gap-3 text-xs font-semibold">
                    <span className="text-success">+{formatIDR(st.income)}</span>
                    <span className="text-danger">−{formatIDR(st.expense)}</span>
                    <span className={st.net >= 0 ? "text-ink" : "text-danger"}>
                      net {formatIDR(st.net)}
                    </span>
                  </div>
                </header>
                <ul className="divide-y divide-black/5">
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
