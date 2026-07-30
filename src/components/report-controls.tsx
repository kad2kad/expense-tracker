"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";

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
        className="lg-raised flex items-center gap-1 rounded-xl px-3 py-1.5 text-sm font-medium text-ink"
        aria-label="Previous month"
      >
        <ChevronLeft size={16} /> Prev
      </button>
      <span className="text-sm font-bold text-ink">{label}</span>
      <button
        type="button"
        onClick={() => go(next)}
        className="lg-raised flex items-center gap-1 rounded-xl px-3 py-1.5 text-sm font-medium text-ink"
        aria-label="Next month"
      >
        Next <ChevronRight size={16} />
      </button>
    </div>
  );
}
