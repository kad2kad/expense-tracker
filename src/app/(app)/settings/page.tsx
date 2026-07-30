import { Settings as SettingsIcon } from "lucide-react";

export default function Page() {
  return (
    <div className="mx-auto max-w-3xl p-5 md:p-8">
      <h1 className="text-2xl font-bold tracking-tight text-ink">Settings</h1>
      <p className="mt-1 text-sm text-ink-muted">Manage your account and categories.</p>

      <div className="lg-card mt-6 flex flex-col items-center p-10 text-center">
        <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl lg-inset text-ink-muted">
          <SettingsIcon size={22} />
        </span>
        <p className="text-sm text-ink-muted">Settings are coming soon.</p>
      </div>
    </div>
  );
}
