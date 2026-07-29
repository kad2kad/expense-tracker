# Deploying to Vercel + Neon

The app is deploy-ready: PostgreSQL schema, Vercel Blob receipt storage (with
local-disk fallback for dev), and a build that runs migrations automatically.

## Overview of what you'll set up
1. **Neon** — free serverless Postgres (the database).
2. **Vercel** — hosting for the Next.js app.
3. **Vercel Blob** — stores receipt images in production.

You create the accounts (free tiers are fine); the app is already wired for all three.

---

## Step 1 — Create the database (Neon)
1. Sign up at https://neon.tech and create a project (any region near you).
2. Copy the **connection string** (pooled). It looks like:
   `postgresql://user:pass@ep-xxx-pooler.region.aws.neon.tech/neondb?sslmode=require`

## Step 2 — Point local dev at Neon and create the tables
1. Copy `.env.example` → `.env` and set:
   - `DATABASE_URL` = the Neon connection string
   - `AUTH_SECRET` = run `npx auth secret` (or `openssl rand -base64 32`)
   - keep `AUTH_TRUST_HOST=true`
2. Create the schema on Neon:
   ```bash
   npx prisma migrate dev --name init
   ```
   This generates `prisma/migrations/` and creates all tables. Commit the migration.

At this point `npm run dev` runs locally against Neon.

## Step 3 — Push to GitHub
```bash
git add -A && git commit -m "Deploy-ready: Postgres + Blob"
git push
```
(Push to a new GitHub repo if you haven't already.)

## Step 4 — Import into Vercel
1. Sign in at https://vercel.com with GitHub and **Import** the repo.
2. Framework preset: **Next.js** (auto-detected). Leave build settings — `vercel.json`
   already sets the build command to `prisma migrate deploy && next build`.
3. Add **Environment Variables** (Project → Settings → Environment Variables):
   - `DATABASE_URL` — the Neon connection string
   - `AUTH_SECRET` — the same secret (or a fresh one)
   - `AUTH_TRUST_HOST` = `true`
4. Deploy.

## Step 5 — Enable receipt image storage (Vercel Blob)
1. In the Vercel project → **Storage** → **Create** → **Blob** store → connect it to
   this project. Vercel injects `BLOB_READ_WRITE_TOKEN` automatically.
2. Redeploy (Deployments → ⋯ → Redeploy) so the token is present.

Without Blob configured, uploads fall back to local disk — which does **not** persist
on Vercel — so set this up if you want receipts in production.

---

## Notes
- **Migrations**: `prisma migrate deploy` runs on every Vercel build and applies any new
  migrations in `prisma/migrations/`. Always create migrations locally with
  `prisma migrate dev` and commit them.
- **Same DB for dev & prod?** Fine for a personal app. For isolation, create a separate
  Neon branch/database and use its URL for `DATABASE_URL` in production.
- **Auth on a custom domain**: no extra config needed — `AUTH_TRUST_HOST=true` handles it.
