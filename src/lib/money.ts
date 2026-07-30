// IDR amounts are stored as Decimal rupiah and may include cents
// (e.g. 300000.20). Indonesian locale uses "." for thousands and "," for the
// decimal separator, so "Rp300.000,20" means 300,000 rupiah and 20 cents.
// These helpers keep all money formatting/parsing in one place.

const idGroup = new Intl.NumberFormat("id-ID");

/** Format a rupiah amount as e.g. "Rp1.234.567" or "Rp1.234.567,20".
 * Cents are only shown when the amount actually has a fractional part. */
export function formatIDR(amount: number): string {
  const rounded = Math.round(amount * 100) / 100;
  const hasCents = Math.round(rounded * 100) % 100 !== 0;
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: hasCents ? 2 : 0,
    maximumFractionDigits: hasCents ? 2 : 0,
  }).format(rounded);
}

/** Format without the currency symbol, e.g. "1.234.567". */
export function formatNumber(amount: number): string {
  return idGroup.format(amount);
}

/**
 * Parse a user-typed amount (id-ID format) into a rupiah number.
 * Accepts "Rp", thousands dots, spaces, and an optional ",dd" cents part.
 * Returns null when there are no digits.
 *   "300.000,20" -> 300000.2   "1.500"  -> 1500   "50000" -> 50000
 */
export function parseAmount(input: string): number | null {
  if (!input) return null;
  const commaIdx = input.lastIndexOf(",");
  let intStr: string;
  let decStr: string;
  if (commaIdx >= 0) {
    intStr = input.slice(0, commaIdx).replace(/\D/g, "");
    decStr = input.slice(commaIdx + 1).replace(/\D/g, "").slice(0, 2);
  } else {
    intStr = input.replace(/\D/g, "");
    decStr = "";
  }
  if (!intStr && !decStr) return null;
  const value = parseFloat(`${intStr || "0"}.${decStr.padEnd(2, "0")}`);
  return Number.isFinite(value) ? Math.round(value * 100) / 100 : null;
}

/**
 * Reformat a raw input string as the user types: group the integer part with
 * dots and keep up to two decimal digits after a comma.
 *   "300000,2" -> "300.000,2"   "1500000" -> "1.500.000"
 */
export function formatAmountInput(raw: string): string {
  const commaIdx = raw.lastIndexOf(",");
  if (commaIdx >= 0) {
    const intDigits = raw.slice(0, commaIdx).replace(/\D/g, "");
    const decDigits = raw.slice(commaIdx + 1).replace(/\D/g, "").slice(0, 2);
    const grouped = intDigits ? idGroup.format(parseInt(intDigits, 10)) : "0";
    return `${grouped},${decDigits}`;
  }
  const digits = raw.replace(/\D/g, "");
  return digits ? idGroup.format(parseInt(digits, 10)) : "";
}

/** Turn a stored rupiah number into an input-ready string (for editing). */
export function amountToInput(value: number): string {
  const [intPart, decPart] = value.toFixed(2).split(".");
  const grouped = idGroup.format(parseInt(intPart, 10));
  return decPart === "00" ? grouped : `${grouped},${decPart}`;
}
