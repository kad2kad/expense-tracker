"use client";

import { useRouter } from "next/navigation";

export function ReportControls({
  label,
  prev,
  next,
}: {
  label: string;
  prev: string;
  next: string;
}) {
  const router = useRouter();
  const go = (month: string) => router.push(`/report?month=${month}`);

  return (
    <div className="flex items-center justify-between gap-3">
      <button
        type="button"
        onClick={() => go(prev)}
        className="rounded-lg border border-neutral-300 px-3 py-1.5 text-sm hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800"
        aria-label="Previous month"
      >
        ‹ Prev
      </button>
      <span className="text-sm font-semibold">{label}</span>
      <button
        type="button"
        onClick={() => go(next)}
        className="rounded-lg border border-neutral-300 px-3 py-1.5 text-sm hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800"
        aria-label="Next month"
      >
        Next ›
      </button>
    </div>
  );
}
