import { Skel } from "@/components/skeleton";

export default function Loading() {
  return (
    <div className="mx-auto max-w-3xl p-5 md:p-8">
      <header className="mb-6">
        <Skel className="h-7 w-32" />
        <Skel className="mt-2 h-4 w-40" />
      </header>

      {/* View tabs */}
      <div className="lg-inset grid grid-cols-3 gap-1 p-1">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skel key={i} className="h-9" />
        ))}
      </div>

      {/* Period nav */}
      <div className="mt-4 flex items-center justify-between">
        <Skel className="h-8 w-20 rounded-xl" />
        <Skel className="h-4 w-28" />
        <Skel className="h-8 w-20 rounded-xl" />
      </div>

      {/* Group cards */}
      <div className="mt-6 space-y-4">
        {Array.from({ length: 2 }).map((_, c) => (
          <section key={c} className="lg-card overflow-hidden">
            <div className="flex items-center justify-between border-b border-black/5 px-4 py-3">
              <Skel className="h-4 w-32" />
              <Skel className="h-3 w-40" />
            </div>
            <div className="divide-y divide-black/5">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-3">
                  <Skel className="h-10 w-10 rounded-2xl" />
                  <div className="flex-1">
                    <Skel className="h-4 w-44" />
                    <Skel className="mt-1.5 h-3 w-24" />
                  </div>
                  <Skel className="h-4 w-20" />
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
