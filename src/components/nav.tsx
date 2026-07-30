"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  PlusCircle,
  ScrollText,
  BarChart3,
  Settings,
  LogOut,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { signOutAction } from "@/app/(app)/actions";

const LINKS: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/dashboard", label: "Home", icon: LayoutDashboard },
  { href: "/add", label: "Add", icon: PlusCircle },
  { href: "/history", label: "History", icon: ScrollText },
  { href: "/report", label: "Report", icon: BarChart3 },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Nav({ userLabel }: { userLabel: string }) {
  const pathname = usePathname();
  const isActive = (href: string) => pathname.startsWith(href);

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="lg-card sticky top-4 m-4 hidden w-56 shrink-0 flex-col self-start p-4 md:flex" style={{ height: "calc(100dvh - 2rem)" }}>
        <div className="flex items-center gap-2 px-2 py-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl lg-primary">
            <Wallet size={18} />
          </span>
          <span className="text-lg font-bold tracking-tight text-ink">Cashflow</span>
        </div>

        <nav className="mt-4 flex flex-col gap-1.5">
          {LINKS.map((l) => {
            const Icon = l.icon;
            const active = isActive(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                  active
                    ? "lg-primary"
                    : "text-ink-muted hover:bg-primary-light/50 hover:text-ink"
                }`}
              >
                <Icon size={18} strokeWidth={2.2} />
                {l.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto">
          <div className="lg-inset flex items-center gap-2 px-3 py-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-xs font-bold text-white">
              {userLabel.charAt(0).toUpperCase()}
            </span>
            <p className="truncate text-xs font-medium text-ink-muted">{userLabel}</p>
          </div>
          <form action={signOutAction}>
            <button className="mt-2 flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-medium text-ink-muted transition hover:bg-danger/10 hover:text-danger">
              <LogOut size={16} strokeWidth={2.2} />
              Sign out
            </button>
          </form>
        </div>
      </aside>

      {/* Mobile bottom tab bar */}
      <nav className="lg-card fixed inset-x-3 bottom-3 z-10 flex justify-around rounded-2xl px-1 py-1.5 md:hidden">
        {LINKS.map((l) => {
          const Icon = l.icon;
          const active = isActive(l.href);
          return (
            <Link
              key={l.href}
              href={l.href}
              className={`flex flex-1 flex-col items-center gap-0.5 rounded-xl py-1.5 text-[11px] font-medium transition ${
                active ? "lg-primary" : "text-ink-muted"
              }`}
            >
              <Icon size={18} strokeWidth={2.2} />
              {l.label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
