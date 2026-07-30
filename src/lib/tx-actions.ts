"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { parseAmount } from "@/lib/money";
import { saveReceiptImage, UploadError } from "@/lib/upload";
import { DEFAULT_CURRENCY, type TxKind } from "@/lib/constants";
import {
  readTxForm,
  toDate,
  toDateOrNull,
  type TxFormState,
} from "@/lib/tx-form";

async function requireUserId(): Promise<string> {
  const session = await auth();
  if (!session?.user) redirect("/login");
  return session.user.id;
}

type ResolvedCategory =
  | { categoryId: string; customName: null }
  | { categoryId: null; customName: string }
  | { error: string };

/**
 * Resolve the category for a transaction.
 * - A typed custom name is stored as a one-off `customName` on the transaction
 *   (NOT saved as a reusable Category).
 * - Otherwise the picked category id is validated against the user + kind.
 */
async function resolveCategory(
  userId: string,
  kind: TxKind,
  categoryId: string | undefined,
  customCategory: string | undefined,
): Promise<ResolvedCategory> {
  if (customCategory) {
    return { categoryId: null, customName: customCategory };
  }
  const owned = await prisma.category.findFirst({
    where: { id: categoryId, userId, kind },
    select: { id: true },
  });
  if (!owned) return { error: "Invalid category for this type" };
  return { categoryId: owned.id, customName: null };
}

export async function createTransaction(
  _prev: TxFormState,
  formData: FormData,
): Promise<TxFormState> {
  const userId = await requireUserId();

  const parsed = readTxForm(formData);
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }
  const data = parsed.data;
  const kind = data.kind as TxKind;

  const cat = await resolveCategory(userId, kind, data.categoryId, data.customCategory);
  if ("error" in cat) return { fieldErrors: { categoryId: [cat.error] } };

  let imageUrl: string | null = null;
  try {
    imageUrl = await saveReceiptImage(formData.get("image") as File | null);
  } catch (e) {
    if (e instanceof UploadError) return { fieldErrors: { image: [e.message] } };
    throw e;
  }

  await prisma.transaction.create({
    data: {
      userId,
      kind,
      amount: parseAmount(data.amountRaw)!,
      currency: DEFAULT_CURRENCY,
      categoryId: cat.categoryId,
      customName: cat.customName,
      note: data.note ?? null,
      date: toDate(data.date),
      imageUrl,
      location: data.location ?? null,
      withWhom: data.withWhom ?? null,
      counterparty: kind === "DEBT_LOAN" ? data.counterparty ?? null : null,
      dueDate: kind === "DEBT_LOAN" ? toDateOrNull(data.dueDate) : null,
      isSettled: kind === "DEBT_LOAN" ? Boolean(data.isSettled) : false,
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/history");
  redirect("/dashboard");
}

export async function updateTransaction(
  _prev: TxFormState,
  formData: FormData,
): Promise<TxFormState> {
  const userId = await requireUserId();
  const id = String(formData.get("transactionId") ?? "");
  if (!id) return { error: "Missing transaction id." };

  // Ownership check.
  const existing = await prisma.transaction.findFirst({
    where: { id, userId },
    select: { id: true, imageUrl: true },
  });
  if (!existing) return { error: "Transaction not found." };

  const parsed = readTxForm(formData);
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }
  const data = parsed.data;
  const kind = data.kind as TxKind;

  const cat = await resolveCategory(userId, kind, data.categoryId, data.customCategory);
  if ("error" in cat) return { fieldErrors: { categoryId: [cat.error] } };

  // Keep the existing image unless a new one is uploaded.
  let imageUrl = existing.imageUrl;
  try {
    const uploaded = await saveReceiptImage(formData.get("image") as File | null);
    if (uploaded) imageUrl = uploaded;
  } catch (e) {
    if (e instanceof UploadError) return { fieldErrors: { image: [e.message] } };
    throw e;
  }

  await prisma.transaction.update({
    where: { id },
    data: {
      kind,
      amount: parseAmount(data.amountRaw)!,
      categoryId: cat.categoryId,
      customName: cat.customName,
      note: data.note ?? null,
      date: toDate(data.date),
      imageUrl,
      location: data.location ?? null,
      withWhom: data.withWhom ?? null,
      counterparty: kind === "DEBT_LOAN" ? data.counterparty ?? null : null,
      dueDate: kind === "DEBT_LOAN" ? toDateOrNull(data.dueDate) : null,
      isSettled: kind === "DEBT_LOAN" ? Boolean(data.isSettled) : false,
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/history");
  redirect("/history");
}

export async function deleteTransaction(formData: FormData): Promise<void> {
  const userId = await requireUserId();
  const id = String(formData.get("transactionId") ?? "");
  if (!id) return;

  // deleteMany scoped by userId so a user can only delete their own.
  await prisma.transaction.deleteMany({ where: { id, userId } });

  revalidatePath("/dashboard");
  revalidatePath("/history");
  redirect("/history");
}
