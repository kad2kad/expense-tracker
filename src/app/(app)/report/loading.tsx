import { Skel } from "@/components/skeleton";

export default function Loading() {
  return (
    <div className="mx-auto max-w-3xl p-5 md:p-8">
      <header className="mb-6">
        <Skel className="h-7 w-32" />
        <Skel className="mt-2 h-4 w-56" />
      </header>

      {/* Month nav */}
      <div className="flex items-center justify-between">
        <Skel className="h-8 w-20 rounded-xl" />
        <Skel className="h-4 w-24" />
        <Skel className="h-8 w-20 rounded-xl" />
      </div>

      {/* KPI tiles */}
      <section className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="lg-card p-4">
            <Skel className="h-3 w-14" />
            <Skel className="mt-2 h-5 w-20" />
          </div>
        ))}
      </section>

      {/* Comparison bar */}
      <div className="lg-card mt-4 px-4 py-3">
        <Skel className="h-4 w-3/4" />
      </div>

      {/* Charts */}
      <section className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="lg-card p-4">
            <Skel className="mb-4 h-4 w-40" />
            <div className="flex h-[280px] items-center justify-center">
              {i === 0 ? (
                <Skel className="h-44 w-44 rounded-full" />
              ) : (
                <div className="flex h-full w-full items-end justify-around gap-3 px-4 pb-6">
                  {[40, 65, 30, 80, 55, 90].map((h, j) => (
                    <Skel key={j} className="w-6" style={{ height: `${h}%` }} />
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
