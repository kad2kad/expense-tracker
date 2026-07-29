import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { TX_KINDS, type TxKind } from "@/lib/constants";
import {
  AddTransactionForm,
  type CategoryOption,
} from "@/components/add-transaction-form";

export default async function AddPage() {
  const session = await auth();
  const userId = session!.user.id;

  const categories = await prisma.category.findMany({
    where: { userId },
    orderBy: [{ isDefault: "desc" }, { name: "asc" }],
    select: { id: true, kind: true, name: true, icon: true },
  });

  // Group by kind for the client form.
  const grouped = {} as Record<TxKind, CategoryOption[]>;
  for (const k of TX_KINDS) grouped[k] = [];
  for (const c of categories) {
    grouped[c.kind as TxKind].push({ id: c.id, name: c.name, icon: c.icon });
  }

  return (
    <div className="mx-auto max-w-lg p-6">
      <h1 className="text-2xl font-semibold tracking-tight">Add transaction</h1>
      <p className="mt-1 text-sm text-neutral-500">
        Record an expense, income, or debt / loan.
      </p>
      <div className="mt-6">
        <AddTransactionForm categoriesByKind={grouped} />
      </div>
    </div>
  );
}
