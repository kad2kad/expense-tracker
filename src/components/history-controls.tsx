"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { VIEWS, type View } from "@/lib/history";

const VIEW_LABELS: Record<View, string> = {
  daily: "Daily",
  monthly: "Monthly",
  yearly: "Yearly",
};

export function HistoryControls({
  view,
  anchor,
  label,
  prev,
  next,
}: {
  view: View;
  anchor: string;
  label: string;
  prev: string | null;
  next: string | null;
}) {
  const router = useRouter();

  const go = (params: { view?: View; anchor?: string }) => {
    const v = params.view ?? view;
    const a = params.anchor ?? anchor;
    router.push(`/history?view=${v}&anchor=${a}`);
  };

  return (
    <div className="space-y-4">
      {/* View tabs */}
      <div className="lg-inset grid grid-cols-3 gap-1 p-1">
        {VIEWS.map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => go({ view: v })}
            className={`rounded-lg px-2 py-2 text-sm font-semibold transition ${
              view === v ? "lg-raised text-ink" : "text-ink-muted hover:text-ink"
            }`}
          >
            {VIEW_LABELS[v]}
          </button>
        ))}
      </div>

      {/* Period nav */}
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          disabled={!prev}
          onClick={() => prev && go({ anchor: prev })}
          className="lg-raised flex items-center gap-1 rounded-xl px-3 py-1.5 text-sm font-medium text-ink disabled:opacity-40"
          aria-label="Previous period"
        >
          <ChevronLeft size={16} /> Prev
        </button>

        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-ink">{label}</span>
          {view !== "yearly" && (
            <input
              type="date"
              value={anchor}
              onChange={(e) => e.target.value && go({ anchor: e.target.value })}
              className="lg-input px-2 py-1 text-xs"
              aria-label="Jump to date"
            />
          )}
        </div>

        <button
          type="button"
          disabled={!next}
          onClick={() => next && go({ anchor: next })}
          className="lg-raised flex items-center gap-1 rounded-xl px-3 py-1.5 text-sm font-medium text-ink disabled:opacity-40"
          aria-label="Next period"
        >
          Next <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
