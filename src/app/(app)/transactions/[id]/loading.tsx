import { Skel } from "@/components/skeleton";

export default function Loading() {
  return (
    <div className="mx-auto max-w-lg p-5 md:p-8">
      <Skel className="h-4 w-28" />
      <Skel className="mt-3 h-7 w-48" />
      <Skel className="mt-2 h-4 w-56" />

      <div className="lg-card mt-6 space-y-6 p-5 md:p-6">
        <div className="lg-inset grid grid-cols-3 gap-1 p-1">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skel key={i} className="h-9" />
          ))}
        </div>
        <div>
          <Skel className="mb-2 h-4 w-16" />
          <Skel className="h-11 w-full rounded-xl" />
        </div>
        <div>
          <Skel className="mb-2 h-4 w-20" />
          <div className="flex flex-wrap gap-2">
            {[20, 16, 22, 18].map((w, i) => (
              <Skel key={i} className="h-8 rounded-full" style={{ width: `${w * 4}px` }} />
            ))}
          </div>
        </div>
        <div>
          <Skel className="mb-2 h-4 w-14" />
          <Skel className="h-16 w-full rounded-xl" />
        </div>
        <Skel className="h-12 w-full rounded-xl" />
      </div>
    </div>
  );
}
