import type { TxKind } from "./constants";

export const VIEWS = ["daily", "monthly", "yearly"] as const;
export type View = (typeof VIEWS)[number];

export function isView(v: string | undefined): v is View {
  return !!v && (VIEWS as readonly string[]).includes(v);
}

/** Parse a "YYYY-MM-DD" anchor, falling back to today on bad input. */
export function parseAnchor(s: string | undefined): Date {
  if (s) {
    const d = new Date(`${s}T00:00:00`);
    if (!Number.isNaN(d.getTime())) return d;
  }
  return new Date();
}

export function toISODate(d: Date): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

export type HistoryWindow = {
  start: Date; // inclusive
  end: Date; // exclusive
  label: string; // e.g. "July 2026", "2026", "All time"
  prev: string | null; // anchor ISO for previous window
  next: string | null; // anchor ISO for next window
};

/** The outer window (and nav) for a given view + anchor date. */
export function windowFor(view: View, anchor: Date): HistoryWindow {
  const y = anchor.getFullYear();
  const m = anchor.getMonth();

  if (view === "daily") {
    // one month of day-cards
    return {
      start: new Date(y, m, 1),
      end: new Date(y, m + 1, 1),
      label: anchor.toLocaleDateString("id-ID", { month: "long", year: "numeric" }),
      prev: toISODate(new Date(y, m - 1, 1)),
      next: toISODate(new Date(y, m + 1, 1)),
    };
  }

  if (view === "monthly") {
    // one year of month-cards
    return {
      start: new Date(y, 0, 1),
      end: new Date(y + 1, 0, 1),
      label: String(y),
      prev: toISODate(new Date(y - 1, 0, 1)),
      next: toISODate(new Date(y + 1, 0, 1)),
    };
  }

  // yearly: all time, one card per year
  return {
    start: new Date(1970, 0, 1),
    end: new Date(y + 100, 0, 1),
    label: "All time",
    prev: null,
    next: null,
  };
}

/** Bucket key + display label for a transaction date under a given view. */
export function bucketFor(view: View, date: Date): { key: string; label: string } {
  if (view === "daily") {
    return {
      key: toISODate(date),
      label: date.toLocaleDateString("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
    };
  }
  if (view === "monthly") {
    return {
      key: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`,
      label: date.toLocaleDateString("id-ID", { month: "long", year: "numeric" }),
    };
  }
  return { key: String(date.getFullYear()), label: String(date.getFullYear()) };
}

export type TxLike = {
  kind: string;
  amount: number;
};

/** in = income, out = expense, net = in − out. Debt/loan is excluded here
 * (handled in reports, M4) but such transactions still appear in the list. */
export function subtotals(txs: TxLike[]) {
  let income = 0;
  let expense = 0;
  for (const t of txs) {
    if (t.kind === ("INCOME" satisfies TxKind)) income += t.amount;
    else if (t.kind === ("EXPENSE" satisfies TxKind)) expense += t.amount;
  }
  return { income, expense, net: income - expense };
}
