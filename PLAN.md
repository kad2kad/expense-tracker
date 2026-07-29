# Expense Tracker — Design & Plan

A personal cash-flow app to track expenses, income, and debt/loans, with history
and spending reports. Multi-user.

---

## 1. Stack

| Layer      | Choice                                             | Why |
|------------|----------------------------------------------------|-----|
| Framework  | **Next.js (App Router, TypeScript)**               | One codebase, server actions for mutations, RSC for data fetching |
| Styling    | **Tailwind CSS + shadcn/ui**                       | Fast, consistent, accessible components |
| DB         | **PostgreSQL** (SQLite for local dev)              | Relational data, easy hosting later (Neon/Supabase) |
| ORM        | **Prisma**                                         | Type-safe queries, migrations, matches TS end-to-end |
| Auth       | **Auth.js (NextAuth v5)** — Credentials + Google   | Self-hosted, multi-user; `userId` FK isolates data |
| Charts     | **Recharts**                                       | Declarative, good for the report screen |
| Exports    | CSV (hand-rolled), **SheetJS** (xlsx), **@react-pdf/renderer** (pdf) | Cover all three export formats |
| Image upl. | Local disk (dev) → **UploadThing / S3-R2** (prod)  | Receipt photos; swap driver by env |
| Validation | **Zod**                                            | Shared schema for forms + server actions |

**Decision recap:** Next.js full-stack over a separate Go API — the app is CRUD +
reporting with no workload that needs Go, and one codebase ships fastest. A Go
"reports/analytics" service can be carved out later if desired.

---

## 2. Data Model

Money is stored as **integer minor units** (e.g. cents). Never floats.

### Auth.js tables
`User`, `Account`, `Session`, `VerificationToken` (standard Auth.js schema).
`User` gets `passwordHash` for credentials login.

### `Category`
```
id        String   @id @default(cuid())
userId    String?          // null = system default, seeded per user on signup
kind      TxKind           // EXPENSE | INCOME | DEBT_LOAN
name      String
icon      String?          // emoji or lucide icon name
color     String?
isDefault Boolean @default(false)
@@unique([userId, kind, name])
```

Seeded defaults per kind:
- **Expense:** Food, Subscriptions, Family, Impulsive, Transport, Saving, Shopping
- **Income:** Salary, Freelance, Gift, Investment, Refund
- **Debt/Loan:** Borrowed, Lent, Repayment

Every kind also supports a free-form **Custom** category the user creates.

### `Transaction`
```
id          String   @id @default(cuid())
userId      String                       // owner, indexed
kind        TxKind                       // EXPENSE | INCOME | DEBT_LOAN
amount      Int                          // minor units, always positive
currency    String   @default("USD")
categoryId  String
note        String?
date        DateTime                     // user-chosen tx date (indexed)
imageUrl    String?                      // receipt photo

// optional "Add details" fields
location    String?
withWhom    String?
details     Json?                        // extensible extra key/values

// debt/loan-specific (nullable, used only when kind = DEBT_LOAN)
counterparty String?                     // who
dueDate      DateTime?
isSettled    Boolean  @default(false)

createdAt   DateTime @default(now())
updatedAt   DateTime @updatedAt
@@index([userId, date])
```

`enum TxKind { EXPENSE INCOME DEBT_LOAN }`

**Cash-flow sign convention (for reports):** Income = +, Expense = −.
Debt/Loan: *Borrowed* = + (cash in now, owed later), *Lent* = − (cash out now).
Repayments flip accordingly. Signs are derived at query time from kind/category,
not stored, so raw `amount` stays positive.

---

## 3. Screens & Features

### A. Add Transaction  `/add`
- Segmented control: **Expense / Income / Debt·Loan** → swaps the category list.
- Amount (numeric keypad-friendly), Category (chips + "Custom" to add inline).
- Note, Date picker (defaults today), Receipt photo upload.
- **"Add details" toggle** → reveals Location, With who, and for Debt/Loan:
  Counterparty, Due date, Settled checkbox.
- Submit via a Zod-validated **server action**.

### B. Transaction History  `/history`
- Timeframe switch: **Daily / Monthly / Yearly**, with quick nav
  (this / last period + a date picker to jump anywhere).
- Grouped **cards**: card title = the period (date / month / year),
  card body = transactions in it, with per-card subtotal (in / out / net).
- Per-view **export**: CSV, Excel (.xlsx), PDF (formatted list).

### C. Spending Report  `/report`  (a.k.a. "Insights")
- Period selector; compare **current vs previous** period.
- KPI tiles: total in / total out / net, biggest category, vs-last-period delta.
- Charts (Recharts):
  - Spending by category (donut/bar)
  - Income vs expense over time (line/area)
  - Month-over-month trend
- Optional: budget-vs-actual once budgets are added (see backlog).

### D. Auth  `/login`, `/signup`
- Auth.js: email+password (hashed w/ bcrypt) and Google OAuth.
- On first signup, seed default categories for that user.

### E. Shell
- Responsive nav (bottom tab bar on mobile, sidebar on desktop):
  Home/Dashboard, Add, History, Report, Settings.

---

## 4. Server Actions / API surface

All mutations as **server actions**, guarded by session + Zod:
- `createTransaction`, `updateTransaction`, `deleteTransaction`
- `createCategory`, `deleteCategory`
- Queries (RSC): `getTransactions({ range, groupBy })`, `getReport({ period })`
- Export route handlers: `/api/export/csv|xlsx|pdf?range=...`

Every query is scoped by `where: { userId: session.user.id }`.

---

## 5. Milestones (vertical slices)

1. ✅ **M0 — Scaffold:** Next.js 16 + TS + Tailwind v4, Prisma 6 + SQLite, env setup.
2. ✅ **M1 — Auth:** Auth.js credentials (email/password), signup seeds default
   categories, JWT sessions, protected routes via middleware, nav shell + dashboard.
3. ✅ **M2 — Add Transaction (end-to-end):** kind toggle → dynamic category chips
   (+ inline custom), formatted IDR amount, note, date, receipt upload (local disk),
   expandable details (location / with-who / debt counterparty·due·settled), Zod
   server action, dashboard shows real month totals + recent list.
4. ✅ **M3 — History:** URL-driven daily/monthly/yearly grouping, period nav
   (prev/next + jump-to-date), grouped cards with per-period in/out/net subtotals,
   shared TxRow component. Export buttons deferred to M5.
5. ✅ **M4 — Reports:** month period nav, KPI tiles (in/out/net/savings-rate),
   current-vs-previous deltas + biggest category, Recharts category donut +
   6-month income/expense trend bars (React 19-native Recharts 3).
6. ✅ **M5 — Exports:** CSV (BOM + escaping), Excel (.xlsx via ExcelJS, formatted),
   PDF (server-rendered via @react-pdf/renderer) — one `/api/export` route scoped to
   the current History view/anchor, wired to export buttons on the History screen.
7. **M6 — Polish:** dashboard home, empty states, mobile nav, deploy (Neon + Vercel).  ← in progress
   - ✅ Edit & delete transactions (shared form in create/edit mode, ownership-checked
     update/delete actions, clickable rows → `/transactions/[id]`, confirm-on-delete).
   - ✅ Deploy prep: schema → PostgreSQL, Vercel Blob receipt storage (local-disk
     fallback in dev), `postinstall: prisma generate`, `vercel.json` build runs
     `prisma migrate deploy`, `.env.example`, `DEPLOY.md`. Build passes.
   - ⏳ Deploy execution: needs your Neon + Vercel accounts — see DEPLOY.md.

> **Note — Prisma pinned to v6:** Prisma 7 (released recently) removed the classic
> `url = env(...)` datasource config in favour of driver adapters + `prisma.config.ts`.
> v6 is stable, well-documented, and works cleanly with the Auth.js adapter. Revisit
> the v7 upgrade later if desired.

---

## 6. Backlog / later
- Budgets per category + budget-vs-actual on the report.
- Recurring transactions (rent, subscriptions).
- Multi-currency with FX.
- Debt/loan dedicated view (outstanding balances per counterparty).
- CSV *import* from bank statements.
- Carve reports engine into a Go service (only if desired).

---

## 7. Decisions (locked for v1)
1. **Currency:** **IDR** (Indonesian Rupiah), single currency app-wide. No decimals —
   amounts stored as whole rupiah (minor unit = 1), formatted as `Rp1.234.567`.
2. **Login:** email/password only. Google added later.
3. **Receipt photos:** included, stored on local disk in dev; cloud driver at deploy.
4. **Deploy:** local-first with SQLite; add Vercel + Neon Postgres once core works.

