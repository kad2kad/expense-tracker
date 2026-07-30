import { Skel } from "@/components/skeleton";

export default function Loading() {
  return (
    <div className="mx-auto max-w-3xl p-5 md:p-8">
      <header className="mb-7">
        <Skel className="h-7 w-40" />
        <Skel className="mt-2 h-4 w-52" />
      </header>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="lg-card p-5">
            <div className="flex items-center justify-between">
              <Skel className="h-3 w-24" />
              <Skel className="h-8 w-8 rounded-xl" />
            </div>
            <Skel className="mt-4 h-7 w-28" />
          </div>
        ))}
      </section>

      <section className="mt-8">
        <Skel className="mb-3 h-4 w-20" />
        <div className="lg-card divide-y divide-black/5 py-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-3">
              <Skel className="h-10 w-10 rounded-2xl" />
              <div className="flex-1">
                <Skel className="h-4 w-40" />
                <Skel className="mt-1.5 h-3 w-24" />
              </div>
              <Skel className="h-4 w-20" />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
