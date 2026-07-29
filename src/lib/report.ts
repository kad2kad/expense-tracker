/** Report period helpers. A report period is a calendar month. */

export function parseMonth(s: string | undefined): Date {
  if (s && /^\d{4}-\d{2}$/.test(s)) {
    const [y, m] = s.split("-").map(Number);
    const d = new Date(y, m - 1, 1);
    if (!Number.isNaN(d.getTime())) return d;
  }
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

export function monthKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export function monthLabel(d: Date): string {
  return d.toLocaleDateString("id-ID", { month: "long", year: "numeric" });
}

export function shortMonthLabel(d: Date): string {
  return d.toLocaleDateString("id-ID", { month: "short", year: "2-digit" });
}

export function addMonths(d: Date, n: number): Date {
  return new Date(d.getFullYear(), d.getMonth() + n, 1);
}

export function monthBounds(d: Date): { start: Date; end: Date } {
  return { start: new Date(d.getFullYear(), d.getMonth(), 1), end: addMonths(d, 1) };
}

/** Percent change from `prev` to `curr`; null when prev is 0 (undefined base). */
export function pctChange(curr: number, prev: number): number | null {
  if (prev === 0) return null;
  return ((curr - prev) / prev) * 100;
}
