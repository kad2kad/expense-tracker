"use client";

import type { View } from "@/lib/history";

const FORMATS: { key: string; label: string; icon: string }[] = [
  { key: "csv", label: "CSV", icon: "📄" },
  { key: "xlsx", label: "Excel", icon: "📊" },
  { key: "pdf", label: "PDF", icon: "📕" },
];

export function ExportButtons({
  view,
  anchor,
  disabled,
}: {
  view: View;
  anchor: string;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-neutral-500">Export:</span>
      {FORMATS.map((f) => {
        const href = `/api/export?format=${f.key}&view=${view}&anchor=${anchor}`;
        if (disabled) {
          return (
            <span
              key={f.key}
              className="cursor-not-allowed rounded-lg border border-neutral-200 px-2.5 py-1 text-xs text-neutral-300 dark:border-neutral-800 dark:text-neutral-600"
            >
              {f.icon} {f.label}
            </span>
          );
        }
        return (
          <a
            key={f.key}
            href={href}
            download
            className="rounded-lg border border-neutral-300 px-2.5 py-1 text-xs font-medium transition hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800"
          >
            {f.icon} {f.label}
          </a>
        );
      })}
    </div>
  );
}
