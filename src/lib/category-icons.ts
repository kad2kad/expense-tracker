import {
  Utensils,
  Repeat,
  Users,
  Zap,
  Car,
  PiggyBank,
  ShoppingBag,
  Briefcase,
  Laptop,
  Gift,
  TrendingUp,
  Undo2,
  ArrowDownLeft,
  ArrowUpRight,
  CheckCircle2,
  Tag,
  type LucideIcon,
} from "lucide-react";

// Map default category names to lucide icons. Custom categories (and anything
// unmapped) fall back to a generic tag icon. Colors come from the DB `color`.
const ICON_BY_NAME: Record<string, LucideIcon> = {
  // Expense
  Food: Utensils,
  Subscriptions: Repeat,
  Family: Users,
  Impulsive: Zap,
  Transport: Car,
  Saving: PiggyBank,
  Shopping: ShoppingBag,
  // Income
  Salary: Briefcase,
  Freelance: Laptop,
  Gift: Gift,
  Investment: TrendingUp,
  Refund: Undo2,
  // Debt / Loan
  Borrowed: ArrowDownLeft,
  Lent: ArrowUpRight,
  Repayment: CheckCircle2,
};

export function categoryIcon(name: string): LucideIcon {
  return ICON_BY_NAME[name] ?? Tag;
}
