// IDR has no minor unit, so amounts are stored as whole rupiah integers.
// These helpers keep formatting/parsing in one place so switching currency
// later is a single change.

const IDR = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

/** Format a whole-rupiah integer as e.g. "Rp1.234.567". */
export function formatIDR(amount: number): string {
  return IDR.format(amount);
}

/** Format without the currency symbol, e.g. "1.234.567". */
export function formatNumber(amount: number): string {
  return new Intl.NumberFormat("id-ID").format(amount);
}

/**
 * Parse a user-typed amount string into a whole-rupiah integer.
 * Strips everything except digits (users may type "Rp", dots, spaces).
 * Returns null if there are no digits.
 */
export function parseAmount(input: string): number | null {
  const digits = input.replace(/[^\d]/g, "");
  if (digits.length === 0) return null;
  return parseInt(digits, 10);
}
