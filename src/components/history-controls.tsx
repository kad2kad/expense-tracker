"use client";

import { useRouter } from "next/navigation";
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
      <div className="grid grid-cols-3 gap-1 rounded-xl bg-neutral-100 p-1 dark:bg-neutral-800">
        {VIEWS.map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => go({ view: v })}
            className={`rounded-lg px-2 py-2 text-sm font-medium transition ${
              view === v
                ? "bg-white text-neutral-900 shadow-sm dark:bg-neutral-950 dark:text-white"
                : "text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200"
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
          className="rounded-lg border border-neutral-300 px-3 py-1.5 text-sm disabled:opacity-40 hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800"
          aria-label="Previous period"
        >
          ‹ Prev
        </button>

        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold">{label}</span>
          {view !== "yearly" && (
            <input
              type="date"
              value={anchor}
              onChange={(e) => e.target.value && go({ anchor: e.target.value })}
              className="rounded-lg border border-neutral-300 bg-white px-2 py-1 text-xs outline-none focus:border-neutral-900 dark:border-neutral-700 dark:bg-neutral-950 dark:focus:border-white"
              aria-label="Jump to date"
            />
          )}
        </div>

        <button
          type="button"
          disabled={!next}
          onClick={() => next && go({ anchor: next })}
          className="rounded-lg border border-neutral-300 px-3 py-1.5 text-sm disabled:opacity-40 hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800"
          aria-label="Next period"
        >
          Next ›
        </button>
      </div>
    </div>
  );
}
