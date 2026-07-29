import { z } from "zod";
import { TX_KINDS } from "./constants";
import { parseAmount } from "./money";

// Shared Zod schema + parsing for the add/edit transaction forms.
// Kept separate from the "use server" action files so it can be imported by both.

export const txSchema = z
  .object({
    kind: z.enum(TX_KINDS),
    amountRaw: z.string(),
    categoryId: z.string().optional(),
    customCategory: z.string().trim().max(40).optional(),
    note: z.string().trim().max(500).optional(),
    date: z.string().min(1, "Date is required"),
    location: z.string().trim().max(120).optional(),
    withWhom: z.string().trim().max(120).optional(),
    counterparty: z.string().trim().max(120).optional(),
    dueDate: z.string().optional(),
    isSettled: z.boolean().optional(),
  })
  .refine(
    (v) => parseAmount(v.amountRaw) !== null && parseAmount(v.amountRaw)! > 0,
    { message: "Enter an amount greater than 0", path: ["amountRaw"] },
  )
  .refine(
    (v) => !!v.categoryId || !!(v.customCategory && v.customCategory.length > 0),
    { message: "Pick or add a category", path: ["categoryId"] },
  );

export type TxFormState = {
  error?: string;
  fieldErrors?: Record<string, string[] | undefined>;
};

export function emptyToUndef(v: FormDataEntryValue | null): string | undefined {
  const s = typeof v === "string" ? v.trim() : "";
  return s.length ? s : undefined;
}

/** Parse "YYYY-MM-DD" as local midnight to avoid timezone drift. */
export function toDate(s: string): Date {
  return new Date(`${s}T00:00:00`);
}

export function toDateOrNull(s?: string): Date | null {
  return s ? toDate(s) : null;
}

/** Pull the transaction fields out of a submitted FormData. */
export function readTxForm(formData: FormData) {
  return txSchema.safeParse({
    kind: formData.get("kind"),
    amountRaw: String(formData.get("amount") ?? ""),
    categoryId: emptyToUndef(formData.get("categoryId")),
    customCategory: emptyToUndef(formData.get("customCategory")),
    note: emptyToUndef(formData.get("note")),
    date: String(formData.get("date") ?? ""),
    location: emptyToUndef(formData.get("location")),
    withWhom: emptyToUndef(formData.get("withWhom")),
    counterparty: emptyToUndef(formData.get("counterparty")),
    dueDate: emptyToUndef(formData.get("dueDate")),
    isSettled: formData.get("isSettled") === "on",
  });
}
