// Transaction kinds. Stored as strings in the DB (SQLite has no enums).
export const TX_KINDS = ["EXPENSE", "INCOME", "DEBT_LOAN"] as const;
export type TxKind = (typeof TX_KINDS)[number];

export const TX_KIND_LABELS: Record<TxKind, string> = {
  EXPENSE: "Expense",
  INCOME: "Income",
  DEBT_LOAN: "Debt / Loan",
};

export type DefaultCategory = {
  name: string;
  icon: string;
  color: string;
};

// Seeded per-user on signup. Users can add their own ("Custom") on top of these.
export const DEFAULT_CATEGORIES: Record<TxKind, DefaultCategory[]> = {
  EXPENSE: [
    { name: "Food", icon: "🍔", color: "#f97316" },
    { name: "Subscriptions", icon: "🔁", color: "#8b5cf6" },
    { name: "Family", icon: "👨‍👩‍👧", color: "#ec4899" },
    { name: "Impulsive", icon: "⚡", color: "#ef4444" },
    { name: "Transport", icon: "🚗", color: "#3b82f6" },
    { name: "Saving", icon: "🏦", color: "#22c55e" },
    { name: "Shopping", icon: "🛍️", color: "#eab308" },
  ],
  INCOME: [
    { name: "Salary", icon: "💼", color: "#22c55e" },
    { name: "Freelance", icon: "🧑‍💻", color: "#14b8a6" },
    { name: "Gift", icon: "🎁", color: "#ec4899" },
    { name: "Investment", icon: "📈", color: "#3b82f6" },
    { name: "Refund", icon: "↩️", color: "#a3a3a3" },
  ],
  DEBT_LOAN: [
    { name: "Borrowed", icon: "📥", color: "#ef4444" },
    { name: "Lent", icon: "📤", color: "#f59e0b" },
    { name: "Repayment", icon: "✅", color: "#22c55e" },
  ],
};

export const DEFAULT_CURRENCY = "IDR";
