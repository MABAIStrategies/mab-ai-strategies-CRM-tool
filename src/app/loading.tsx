import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <section className="space-y-8">
      <div className="brand-panel space-y-4 p-8">
        <Skeleton className="h-4 w-44" />
        <Skeleton className="h-10 w-4/5" />
        <Skeleton className="h-4 w-2/3" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="brand-panel space-y-4 p-6">
            <Skeleton className="h-12 w-12 rounded-2xl" />
            <Skeleton className="h-6 w-2/3" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        ))}
      </div>
    </section>
  );
}
