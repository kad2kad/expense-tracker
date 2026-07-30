"use client";

import { useActionState, useRef, useState } from "react";
import {
  ArrowDownCircle,
  ArrowUpCircle,
  Repeat,
  Plus,
  ChevronDown,
  ChevronUp,
  Trash2,
  Check,
  type LucideIcon,
} from "lucide-react";
import {
  createTransaction,
  updateTransaction,
  deleteTransaction,
} from "@/lib/tx-actions";
import type { TxFormState } from "@/lib/tx-form";
import { TX_KINDS, TX_KIND_LABELS, type TxKind } from "@/lib/constants";
import { categoryIcon } from "@/lib/category-icons";
import { amountToInput, formatAmountInput } from "@/lib/money";

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

const KIND_ICON: Record<TxKind, LucideIcon> = {
  EXPENSE: ArrowDownCircle,
  INCOME: ArrowUpCircle,
  DEBT_LOAN: Repeat,
};

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
  const [amount, setAmount] = useState(initial ? amountToInput(initial.amount) : "");
  const [showDetails, setShowDetails] = useState(
    !!initial &&
      !!(initial.location || initial.withWhom || initial.counterparty || initial.dueDate),
  );
  const [preview, setPreview] = useState<string | null>(initial?.imageUrl ?? null);
  const fileRef = useRef<HTMLInputElement>(null);

  const categories = categoriesByKind[kind] ?? [];
  const err = state.fieldErrors;

  function switchKind(k: TxKind) {
    setKind(k);
    setCategoryId("");
    setCustomMode(false);
  }

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="kind" value={kind} />
      <input type="hidden" name="categoryId" value={customMode ? "" : categoryId} />
      {isEdit && <input type="hidden" name="transactionId" value={initial!.id} />}

      {state.error && (
        <p className="rounded-xl bg-danger/10 px-3 py-2 text-sm font-medium text-danger">
          {state.error}
        </p>
      )}

      {/* Kind segmented control */}
      <div className="lg-inset grid grid-cols-3 gap-1 p-1">
        {TX_KINDS.map((k) => {
          const Icon = KIND_ICON[k];
          return (
            <button
              key={k}
              type="button"
              onClick={() => switchKind(k)}
              className={`flex items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-sm font-semibold transition ${
                kind === k ? "lg-raised text-ink" : "text-ink-muted hover:text-ink"
              }`}
            >
              <Icon size={15} strokeWidth={2.3} />
              {TX_KIND_LABELS[k]}
            </button>
          );
        })}
      </div>

      {/* Amount */}
      <div>
        <label className="mb-1.5 block text-sm font-semibold text-ink">Amount</label>
        <div className="lg-input flex items-center px-1">
          <span className="pl-3 text-sm font-medium text-ink-muted">Rp</span>
          <input
            name="amount"
            inputMode="decimal"
            autoComplete="off"
            placeholder="0"
            value={amount}
            onChange={(e) => setAmount(formatAmountInput(e.target.value))}
            className="w-full bg-transparent px-2 py-2.5 text-lg font-bold text-ink outline-none"
          />
        </div>
        <FieldError msg={err?.amountRaw?.[0]} />
      </div>

      {/* Category chips */}
      <div>
        <label className="mb-2 block text-sm font-semibold text-ink">Category</label>
        <div className="flex flex-wrap gap-2">
          {categories.map((c) => {
            const active = !customMode && categoryId === c.id;
            const Icon = categoryIcon(c.name);
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => {
                  setCategoryId(c.id);
                  setCustomMode(false);
                }}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition ${
                  active ? "lg-primary" : "lg-raised text-ink-muted hover:text-ink"
                }`}
              >
                <Icon size={15} strokeWidth={2.2} />
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
            className={`flex items-center gap-1 rounded-full px-3 py-1.5 text-sm font-medium transition ${
              customMode ? "lg-primary" : "lg-raised text-ink-muted hover:text-ink"
            }`}
          >
            <Plus size={15} strokeWidth={2.4} />
            Custom
          </button>
        </div>
        {customMode && (
          <input
            name="customCategory"
            autoFocus
            placeholder="New category name"
            maxLength={40}
            className="lg-input mt-3 w-full px-3 py-2.5 text-sm"
          />
        )}
        <FieldError msg={err?.categoryId?.[0]} />
      </div>

      {/* Note */}
      <div>
        <label className="mb-1.5 block text-sm font-semibold text-ink">Note</label>
        <textarea
          name="note"
          rows={2}
          maxLength={500}
          defaultValue={initial?.note ?? ""}
          placeholder="What was this for?"
          className="lg-input w-full resize-none px-3 py-2.5 text-sm"
        />
      </div>

      {/* Date */}
      <div>
        <label className="mb-1.5 block text-sm font-semibold text-ink">Date</label>
        <input
          name="date"
          type="date"
          defaultValue={initial?.date ?? todayISO()}
          className="lg-input w-full px-3 py-2.5 text-sm"
        />
      </div>

      {/* Receipt image */}
      <div>
        <label className="mb-1.5 block text-sm font-semibold text-ink">
          Receipt <span className="font-normal text-ink-muted">(optional)</span>
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
          className="block w-full text-sm text-ink-muted file:mr-3 file:rounded-lg file:border-0 file:bg-primary file:px-3 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-primary-dark"
        />
        {preview && (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={preview}
              alt="Receipt preview"
              className="mt-3 h-32 w-auto rounded-xl object-cover shadow-md"
            />
            {isEdit && preview === initial?.imageUrl && (
              <p className="mt-1 text-xs text-ink-muted">
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
          className="flex items-center gap-1 text-sm font-semibold text-primary hover:text-primary-dark"
        >
          {showDetails ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          {showDetails ? "Hide details" : "Add details"}
        </button>

        {showDetails && (
          <div className="lg-inset mt-4 space-y-4 p-4">
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
                  <label className="mb-1.5 block text-sm font-semibold text-ink">
                    Due date
                  </label>
                  <input
                    name="dueDate"
                    type="date"
                    defaultValue={initial?.dueDate ?? ""}
                    className="lg-input w-full px-3 py-2.5 text-sm"
                  />
                </div>
                <label className="flex items-center gap-2 text-sm font-medium text-ink">
                  <input
                    name="isSettled"
                    type="checkbox"
                    defaultChecked={initial?.isSettled ?? false}
                    className="h-4 w-4 accent-primary"
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
        className="lg-primary flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold"
      >
        <Check size={17} strokeWidth={2.5} />
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
      className="flex w-full items-center justify-center gap-2 rounded-xl border border-danger/40 bg-danger/5 px-4 py-2.5 text-sm font-semibold text-danger transition hover:bg-danger/10"
    >
      <Trash2 size={16} strokeWidth={2.2} />
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
      <label className="mb-1.5 block text-sm font-semibold text-ink">{label}</label>
      <input
        name={name}
        type="text"
        placeholder={placeholder}
        defaultValue={defaultValue ?? ""}
        className="lg-input w-full px-3 py-2.5 text-sm"
      />
    </div>
  );
}

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <p className="mt-1 text-xs font-medium text-danger">{msg}</p>;
}
