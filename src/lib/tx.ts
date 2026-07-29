import type { TxKind } from "./constants";

/** Start (inclusive) and end (exclusive) of the month containing `d`. */
export function monthRange(d = new Date()) {
  const start = new Date(d.getFullYear(), d.getMonth(), 1);
  const end = new Date(d.getFullYear(), d.getMonth() + 1, 1);
  return { start, end };
}

/**
 * Cash-flow sign for a transaction, used for totals.
 *   INCOME    → positive (money in)
 *   EXPENSE   → negative (money out)
 *   DEBT_LOAN → neutral here; handled separately in reports (M4) because
 *               borrowed/lent/repayment each flow differently.
 */
export function cashFlowSign(kind: TxKind): 1 | -1 | 0 {
  if (kind === "INCOME") return 1;
  if (kind === "EXPENSE") return -1;
  return 0;
}
