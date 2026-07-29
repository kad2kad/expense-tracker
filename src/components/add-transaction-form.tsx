"use client";

import { useActionState, useMemo, useRef, useState } from "react";
import {
  createTransaction,
  updateTransaction,
  deleteTransaction,
} from "@/lib/tx-actions";
import type { TxFormState } from "@/lib/tx-form";
import { TX_KINDS, TX_KIND_LABELS, type TxKind } from "@/lib/constants";
import { formatNumber, parseAmount } from "@/lib/money";

export type CategoryOption = { id: string; name: string; icon: string | null };

export type InitialTx = {
  id: string;
  kind: TxKind;
  amount: number;
  categoryId: string;
  note: string;
  date: string; // YYYY-MM-DD
  imageUrl: string | null;
  location: string;
  withWhom: string;
  counterparty: string;
  dueDate: string; // YYYY-MM-DD or ""
  isSettled: boolean;
};

const emptyState: TxFormState = {};

function todayISO() {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

export function AddTransactionForm({
  categoriesByKind,
  initial,
}: {
  categoriesByKind: Record<TxKind, CategoryOption[]>;
  initial?: InitialTx;
}) {
  const isEdit = !!initial;
  const [state, formAction, pending] = useActionState(
    isEdit ? updateTransaction : createTransaction,
    emptyState,
  );

  const [kind, setKind] = useState<TxKind>(initial?.kind ?? "EXPENSE");
  const [categoryId, setCategoryId] = useState<string>(initial?.categoryId ?? "");
  const [customMode, setCustomMode] = useState(false);
  const [amount, setAmount] = useState(
    initial ? String(initial.amount) : "",
  ); // digits only
  const [showDetails, setShowDetails] = useState(
    !!initial &&
      !!(initial.location || initial.withWhom || initial.counterparty || initial.dueDate),
  );
  const [preview, setPreview] = useState<string | null>(initial?.imageUrl ?? null);
  const fileRef = useRef<HTMLInputElement>(null);

  const categories = categoriesByKind[kind] ?? [];
  const err = state.fieldErrors;

  const formatted = useMemo(
    () => (amount ? formatNumber(parseAmount(amount) ?? 0) : ""),
    [amount],
  );

  function switchKind(k: TxKind) {
    setKind(k);
    setCategoryId("");
    setCustomMode(false);
  }

  return (
    <form action={formAction} className="space-y-6">
      {/* hidden controlled values */}
      <input type="hidden" name="kind" value={kind} />
      <input type="hidden" name="categoryId" value={customMode ? "" : categoryId} />
      {isEdit && <input type="hidden" name="transactionId" value={initial!.id} />}

      {state.error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-950/50 dark:text-red-400">
          {state.error}
        </p>
      )}

      {/* Kind segmented control */}
      <div className="grid grid-cols-3 gap-1 rounded-xl bg-neutral-100 p-1 dark:bg-neutral-800">
        {TX_KINDS.map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => switchKind(k)}
            className={`rounded-lg px-2 py-2 text-sm font-medium transition ${
              kind === k
                ? "bg-white text-neutral-900 shadow-sm dark:bg-neutral-950 dark:text-white"
                : "text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200"
            }`}
          >
            {TX_KIND_LABELS[k]}
          </button>
        ))}
      </div>

      {/* Amount */}
      <div>
        <label className="mb-1 block text-sm font-medium">Amount</label>
        <div className="flex items-center rounded-lg border border-neutral-300 focus-within:border-neutral-900 focus-within:ring-2 focus-within:ring-neutral-900/10 dark:border-neutral-700 dark:focus-within:border-white">
          <span className="pl-3 text-sm text-neutral-500">Rp</span>
          <input
            name="amount"
            inputMode="numeric"
            autoComplete="off"
            placeholder="0"
            value={formatted}
            onChange={(e) => setAmount(e.target.value.replace(/[^\d]/g, ""))}
            className="w-full bg-transparent px-2 py-2 text-lg font-semibold outline-none"
          />
        </div>
        <FieldError msg={err?.amountRaw?.[0]} />
      </div>

      {/* Category chips */}
      <div>
        <label className="mb-2 block text-sm font-medium">Category</label>
        <div className="flex flex-wrap gap-2">
          {categories.map((c) => {
            const active = !customMode && categoryId === c.id;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => {
                  setCategoryId(c.id);
                  setCustomMode(false);
                }}
                className={`rounded-full border px-3 py-1.5 text-sm transition ${
                  active
                    ? "border-neutral-900 bg-neutral-900 text-white dark:border-white dark:bg-white dark:text-neutral-900"
                    : "border-neutral-300 hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800"
                }`}
              >
                {c.icon ? `${c.icon} ` : ""}
                {c.name}
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => {
              setCustomMode(true);
              setCategoryId("");
            }}
            className={`rounded-full border border-dashed px-3 py-1.5 text-sm transition ${
              customMode
                ? "border-neutral-900 bg-neutral-100 dark:border-white dark:bg-neutral-800"
                : "border-neutral-400 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800"
            }`}
          >
            + Custom
          </button>
        </div>
        {customMode && (
          <input
            name="customCategory"
            autoFocus
            placeholder="New category name"
            maxLength={40}
            className="mt-3 w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-neutral-900 dark:border-neutral-700 dark:bg-neutral-950 dark:focus:border-white"
          />
        )}
        <FieldError msg={err?.categoryId?.[0]} />
      </div>

      {/* Note */}
      <div>
        <label className="mb-1 block text-sm font-medium">Note</label>
        <textarea
          name="note"
          rows={2}
          maxLength={500}
          defaultValue={initial?.note ?? ""}
          placeholder="What was this for?"
          className="w-full resize-none rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-neutral-900 dark:border-neutral-700 dark:bg-neutral-950 dark:focus:border-white"
        />
      </div>

      {/* Date */}
      <div>
        <label className="mb-1 block text-sm font-medium">Date</label>
        <input
          name="date"
          type="date"
          defaultValue={initial?.date ?? todayISO()}
          className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-neutral-900 dark:border-neutral-700 dark:bg-neutral-950 dark:focus:border-white"
        />
      </div>

      {/* Receipt image */}
      <div>
        <label className="mb-1 block text-sm font-medium">
          Receipt <span className="text-neutral-400">(optional)</span>
        </label>
        <input
          ref={fileRef}
          name="image"
          type="file"
          accept="image/*"
          onChange={(e) => {
            const f = e.target.files?.[0];
            setPreview(f ? URL.createObjectURL(f) : null);
          }}
          className="block w-full text-sm text-neutral-500 file:mr-3 file:rounded-lg file:border-0 file:bg-neutral-100 file:px-3 file:py-2 file:text-sm file:font-medium hover:file:bg-neutral-200 dark:file:bg-neutral-800 dark:hover:file:bg-neutral-700"
        />
        {preview && (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={preview}
              alt="Receipt preview"
              className="mt-3 h-32 w-auto rounded-lg border border-neutral-200 object-cover dark:border-neutral-800"
            />
            {isEdit && preview === initial?.imageUrl && (
              <p className="mt-1 text-xs text-neutral-400">
                Current receipt — upload a new file to replace it.
              </p>
            )}
          </>
        )}
        <FieldError msg={err?.image?.[0]} />
      </div>

      {/* Add details toggle */}
      <div>
        <button
          type="button"
          onClick={() => setShowDetails((s) => !s)}
          className="text-sm font-medium text-neutral-600 underline underline-offset-4 dark:text-neutral-300"
        >
          {showDetails ? "− Hide details" : "+ Add details"}
        </button>

        {showDetails && (
          <div className="mt-4 space-y-4 rounded-xl border border-neutral-200 p-4 dark:border-neutral-800">
            <TextField
              name="location"
              label="Location"
              placeholder="e.g. Jakarta"
              defaultValue={initial?.location}
            />
            <TextField
              name="withWhom"
              label="With who"
              placeholder="e.g. Family"
              defaultValue={initial?.withWhom}
            />

            {kind === "DEBT_LOAN" && (
              <>
                <TextField
                  name="counterparty"
                  label="Counterparty"
                  placeholder="Who owes / is owed"
                  defaultValue={initial?.counterparty}
                />
                <div>
                  <label className="mb-1 block text-sm font-medium">Due date</label>
                  <input
                    name="dueDate"
                    type="date"
                    defaultValue={initial?.dueDate ?? ""}
                    className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-neutral-900 dark:border-neutral-700 dark:bg-neutral-950 dark:focus:border-white"
                  />
                </div>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    name="isSettled"
                    type="checkbox"
                    defaultChecked={initial?.isSettled ?? false}
                    className="h-4 w-4"
                  />
                  Already settled
                </label>
              </>
            )}
          </div>
        )}
      </div>

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-neutral-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-neutral-700 disabled:opacity-60 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
      >
        {pending ? "Saving…" : isEdit ? "Save changes" : "Save transaction"}
      </button>

      {isEdit && <DeleteButton />}
    </form>
  );
}

function DeleteButton() {
  // The parent form already carries a hidden `transactionId`, which
  // deleteTransaction reads. No name/value here (React reserves those for
  // encoding the formAction).
  return (
    <button
      type="submit"
      formAction={deleteTransaction}
      formNoValidate
      onClick={(e) => {
        if (!confirm("Delete this transaction? This can't be undone.")) {
          e.preventDefault();
        }
      }}
      className="w-full rounded-lg border border-red-300 px-4 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-950/40"
    >
      Delete transaction
    </button>
  );
}

function TextField({
  name,
  label,
  placeholder,
  defaultValue,
}: {
  name: string;
  label: string;
  placeholder?: string;
  defaultValue?: string;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium">{label}</label>
      <input
        name={name}
        type="text"
        placeholder={placeholder}
        defaultValue={defaultValue ?? ""}
        className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-neutral-900 dark:border-neutral-700 dark:bg-neutral-950 dark:focus:border-white"
      />
    </div>
  );
}

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <p className="mt-1 text-xs text-red-600">{msg}</p>;
}
