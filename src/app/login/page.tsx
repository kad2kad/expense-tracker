"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Wallet } from "lucide-react";
import { login, type LoginState } from "./actions";

const initial: LoginState = {};

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(login, initial);

  return (
    <main className="flex min-h-dvh items-center justify-center p-4">
      <div className="lg-card w-full max-w-sm p-8">
        <div className="mb-5 flex items-center gap-2">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl lg-primary">
            <Wallet size={20} />
          </span>
          <span className="text-lg font-bold tracking-tight text-ink">Cashflow</span>
        </div>

        <h1 className="text-2xl font-bold tracking-tight text-ink">Welcome back</h1>
        <p className="mt-1 text-sm text-ink-muted">Sign in to your expense tracker.</p>

        {state.error && (
          <p className="mt-4 rounded-xl bg-danger/10 px-3 py-2 text-sm font-medium text-danger">
            {state.error}
          </p>
        )}

        <form action={formAction} className="mt-6 space-y-4">
          <Field label="Email" name="email" type="email" autoComplete="email" required />
          <Field
            label="Password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
          />
          <button
            type="submit"
            disabled={pending}
            className="lg-primary w-full rounded-xl px-4 py-2.5 text-sm font-bold"
          >
            {pending ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-ink-muted">
          No account?{" "}
          <Link href="/signup" className="font-semibold text-primary hover:text-primary-dark">
            Sign up
          </Link>
        </p>
      </div>
    </main>
  );
}

function Field({
  label,
  ...props
}: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold text-ink">{label}</span>
      <input {...props} className="lg-input w-full px-3 py-2.5 text-sm" />
    </label>
  );
}
