import Link from "next/link";
import { formatIDR } from "@/lib/money";
import { TX_KIND_LABELS, type TxKind } from "@/lib/constants";

export type TxRowData = {
  id: string;
  kind: string;
  amount: number;
  note: string | null;
  date: Date;
  counterparty?: string | null;
  category: { name: string; icon: string | null };
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
  const sign = tx.kind === "INCOME" ? "+" : tx.kind === "EXPENSE" ? "−" : "";
  const color =
    tx.kind === "INCOME"
      ? "text-emerald-600"
      : tx.kind === "EXPENSE"
        ? "text-red-600"
        : "text-neutral-500";

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
      <span className="text-xl">{tx.category.icon ?? "•"}</span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">
          {tx.category.name}
          {tx.note ? (
            <span className="font-normal text-neutral-500"> · {tx.note}</span>
          ) : null}
        </p>
        <p className="text-xs text-neutral-400">{meta}</p>
      </div>
      <span className={`shrink-0 text-sm font-semibold ${color}`}>
        {sign}
        {formatIDR(tx.amount)}
      </span>
    </>
  );

  const base = "flex items-center gap-3 bg-white px-4 py-3 dark:bg-neutral-900";

  return (
    <li>
      {href ? (
        <Link
          href={href}
          className={`${base} transition hover:bg-neutral-50 dark:hover:bg-neutral-800/60`}
        >
          {inner}
        </Link>
      ) : (
        <div className={base}>{inner}</div>
      )}
    </li>
  );
}
