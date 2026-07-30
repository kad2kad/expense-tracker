"use client";

import { FileText, FileSpreadsheet, FileType, type LucideIcon } from "lucide-react";
import type { View } from "@/lib/history";

const FORMATS: { key: string; label: string; icon: LucideIcon }[] = [
  { key: "csv", label: "CSV", icon: FileText },
  { key: "xlsx", label: "Excel", icon: FileSpreadsheet },
  { key: "pdf", label: "PDF", icon: FileType },
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
      <span className="text-xs font-medium text-ink-muted">Export:</span>
      {FORMATS.map((f) => {
        const Icon = f.icon;
        const href = `/api/export?format=${f.key}&view=${view}&anchor=${anchor}`;
        if (disabled) {
          return (
            <span
              key={f.key}
              className="flex cursor-not-allowed items-center gap-1 rounded-lg px-2.5 py-1 text-xs text-ink-muted/40"
            >
              <Icon size={13} /> {f.label}
            </span>
          );
        }
        return (
          <a
            key={f.key}
            href={href}
            download
            className="lg-raised flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold text-ink"
          >
            <Icon size={13} strokeWidth={2.2} /> {f.label}
          </a>
        );
      })}
    </div>
  );
}
