import Link from "next/link";
import { formatIDR } from "@/lib/money";
import { categoryIcon } from "@/lib/category-icons";
import { TX_KIND_LABELS, type TxKind } from "@/lib/constants";

export type TxRowData = {
  id: string;
  kind: string;
  amount: number;
  note: string | null;
  date: Date;
  counterparty?: string | null;
  customName?: string | null;
  category: { name: string; icon: string | null; color?: string | null } | null;
};

export function TxRow({
  tx,
  showDate = true,
  href,
}: {
  tx: TxRowData;
  showDate?: boolean;
  href?: string;
}) {
  const label = tx.category?.name ?? tx.customName ?? "Custom";
  const Icon = categoryIcon(label);
  const tint = tx.category?.color ?? "#2196f3";

  const sign = tx.kind === "INCOME" ? "+" : tx.kind === "EXPENSE" ? "−" : "";
  const color =
    tx.kind === "INCOME"
      ? "text-success"
      : tx.kind === "EXPENSE"
        ? "text-danger"
        : "text-ink-muted";

  const meta = [
    TX_KIND_LABELS[tx.kind as TxKind],
    tx.counterparty || null,
    showDate
      ? tx.date.toLocaleDateString("id-ID", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      : null,
  ]
    .filter(Boolean)
    .join(" · ");

  const inner = (
    <>
      <span
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl"
        style={{
          color: tint,
          background: `color-mix(in srgb, ${tint} 14%, white)`,
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.9)",
        }}
      >
        <Icon size={18} strokeWidth={2.2} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-ink">
          {label}
          {tx.note ? (
            <span className="font-normal text-ink-muted"> · {tx.note}</span>
          ) : null}
        </p>
        <p className="text-xs text-ink-muted">{meta}</p>
      </div>
      <span className={`shrink-0 text-sm font-bold ${color}`}>
        {sign}
        {formatIDR(tx.amount)}
      </span>
    </>
  );

  const base =
    "flex items-center gap-3 px-4 py-3 transition-colors";

  return (
    <li>
      {href ? (
        <Link href={href} className={`${base} hover:bg-primary-light/40`}>
          {inner}
        </Link>
      ) : (
        <div className={base}>{inner}</div>
      )}
    </li>
  );
}
