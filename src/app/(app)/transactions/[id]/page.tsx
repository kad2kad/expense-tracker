import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { TX_KINDS, type TxKind } from "@/lib/constants";
import { toISODate } from "@/lib/history";
import {
  AddTransactionForm,
  type CategoryOption,
  type InitialTx,
} from "@/components/add-transaction-form";

export default async function EditTransactionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  const userId = session!.user.id;

  const [tx, categories] = await Promise.all([
    prisma.transaction.findFirst({ where: { id, userId } }),
    prisma.category.findMany({
      where: { userId },
      orderBy: [{ isDefault: "desc" }, { name: "asc" }],
      select: { id: true, kind: true, name: true, icon: true },
    }),
  ]);

  if (!tx) notFound();

  const grouped = {} as Record<TxKind, CategoryOption[]>;
  for (const k of TX_KINDS) grouped[k] = [];
  for (const c of categories) {
    grouped[c.kind as TxKind].push({ id: c.id, name: c.name, icon: c.icon });
  }

  const initial: InitialTx = {
    id: tx.id,
    kind: tx.kind as TxKind,
    amount: tx.amount,
    categoryId: tx.categoryId,
    note: tx.note ?? "",
    date: toISODate(tx.date),
    imageUrl: tx.imageUrl,
    location: tx.location ?? "",
    withWhom: tx.withWhom ?? "",
    counterparty: tx.counterparty ?? "",
    dueDate: tx.dueDate ? toISODate(tx.dueDate) : "",
    isSettled: tx.isSettled,
  };

  return (
    <div className="mx-auto max-w-lg p-6">
      <div className="mb-2">
        <Link href="/history" className="text-sm text-neutral-500 hover:underline">
          ‹ Back to history
        </Link>
      </div>
      <h1 className="text-2xl font-semibold tracking-tight">Edit transaction</h1>
      <p className="mt-1 text-sm text-neutral-500">Update or delete this entry.</p>
      <div className="mt-6">
        <AddTransactionForm categoriesByKind={grouped} initial={initial} />
      </div>
    </div>
  );
}
