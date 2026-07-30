"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Wallet } from "lucide-react";
import { signup, type SignupState } from "./actions";

const initial: SignupState = {};

export default function SignupPage() {
  const [state, formAction, pending] = useActionState(signup, initial);

  return (
    <main className="flex min-h-dvh items-center justify-center p-4">
      <div className="lg-card w-full max-w-sm p-8">
        <div className="mb-5 flex items-center gap-2">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl lg-primary">
            <Wallet size={20} />
          </span>
          <span className="text-lg font-bold tracking-tight text-ink">Cashflow</span>
        </div>

        <h1 className="text-2xl font-bold tracking-tight text-ink">Create account</h1>
        <p className="mt-1 text-sm text-ink-muted">Start tracking your cash flow.</p>

        {state.error && (
          <p className="mt-4 rounded-xl bg-danger/10 px-3 py-2 text-sm font-medium text-danger">
            {state.error}
          </p>
        )}

        <form action={formAction} className="mt-6 space-y-4">
          <Field
            label="Name"
            name="name"
            type="text"
            autoComplete="name"
            required
            error={state.fieldErrors?.name?.[0]}
          />
          <Field
            label="Email"
            name="email"
            type="email"
            autoComplete="email"
            required
            error={state.fieldErrors?.email?.[0]}
          />
          <Field
            label="Password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            error={state.fieldErrors?.password?.[0]}
          />
          <button
            type="submit"
            disabled={pending}
            className="lg-primary w-full rounded-xl px-4 py-2.5 text-sm font-bold"
          >
            {pending ? "Creating…" : "Create account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-ink-muted">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-primary hover:text-primary-dark">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}

function Field({
  label,
  error,
  ...props
}: {
  label: string;
  error?: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold text-ink">{label}</span>
      <input {...props} className="lg-input w-full px-3 py-2.5 text-sm" />
      {error && <span className="mt-1 block text-xs font-medium text-danger">{error}</span>}
    </label>
  );
}
