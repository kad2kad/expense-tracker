"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOutAction } from "@/app/(app)/actions";

const LINKS = [
  { href: "/dashboard", label: "Home", icon: "🏠" },
  { href: "/add", label: "Add", icon: "➕" },
  { href: "/history", label: "History", icon: "📜" },
  { href: "/report", label: "Report", icon: "📊" },
  { href: "/settings", label: "Settings", icon: "⚙️" },
];

export function Nav({ userLabel }: { userLabel: string }) {
  const pathname = usePathname();
  const isActive = (href: string) => pathname.startsWith(href);

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden w-56 shrink-0 flex-col border-r border-neutral-200 bg-white p-4 md:flex dark:border-neutral-800 dark:bg-neutral-900">
        <div className="px-2 py-3 text-lg font-semibold tracking-tight">
          💸 Cashflow
        </div>
        <nav className="mt-4 flex flex-col gap-1">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
                isActive(l.href)
                  ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
                  : "text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
              }`}
            >
              <span>{l.icon}</span>
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto border-t border-neutral-200 pt-4 dark:border-neutral-800">
          <p className="truncate px-2 text-xs text-neutral-500">{userLabel}</p>
          <form action={signOutAction}>
            <button className="mt-2 w-full rounded-lg px-3 py-2 text-left text-sm text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800">
              Sign out
            </button>
          </form>
        </div>
      </aside>

      {/* Mobile bottom tab bar */}
      <nav className="fixed inset-x-0 bottom-0 z-10 flex border-t border-neutral-200 bg-white/95 backdrop-blur md:hidden dark:border-neutral-800 dark:bg-neutral-900/95">
        {LINKS.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className={`flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px] ${
              isActive(l.href)
                ? "text-neutral-900 dark:text-white"
                : "text-neutral-400"
            }`}
          >
            <span className="text-lg">{l.icon}</span>
            {l.label}
          </Link>
        ))}
      </nav>
    </>
  );
}
