import { prisma } from "./prisma";
import { TX_KIND_LABELS, type TxKind } from "./constants";
import { toISODate, windowFor, type View } from "./history";

export type ExportRow = {
  date: string; // YYYY-MM-DD
  kind: string; // human label
  category: string;
  note: string;
  amount: number; // positive whole rupiah
  direction: "in" | "out" | "neutral";
  counterparty: string;
  location: string;
  withWhom: string;
};

export type ExportBundle = {
  rows: ExportRow[];
  periodLabel: string;
  filenameBase: string; // no extension
};

const directionOf = (kind: string): ExportRow["direction"] =>
  kind === "INCOME" ? "in" : kind === "EXPENSE" ? "out" : "neutral";

/** Fetch and shape the transactions for a history window (view + anchor). */
export async function getExportData(
  userId: string,
  view: View,
  anchor: Date,
): Promise<ExportBundle> {
  const win = windowFor(view, anchor);

  const txs = await prisma.transaction.findMany({
    where: { userId, date: { gte: win.start, lt: win.end } },
    orderBy: { date: "asc" },
    include: { category: { select: { name: true } } },
  });

  const rows: ExportRow[] = txs.map((t) => ({
    date: toISODate(t.date),
    kind: TX_KIND_LABELS[t.kind as TxKind] ?? t.kind,
    category: t.category?.name ?? t.customName ?? "Custom",
    note: t.note ?? "",
    amount: Number(t.amount),
    direction: directionOf(t.kind),
    counterparty: t.counterparty ?? "",
    location: t.location ?? "",
    withWhom: t.withWhom ?? "",
  }));

  const scope = view === "yearly" ? "all-time" : toISODate(win.start).slice(0, view === "daily" ? 7 : 4);

  return {
    rows,
    periodLabel: win.label,
    filenameBase: `transactions-${scope}`,
  };
}
