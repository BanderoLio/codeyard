import { Skeleton } from '@/components/ui/skeleton';

export function CatalogSkeleton() {
  return (
    <div className="container mx-auto max-w-7xl px-4 py-4 sm:py-8">
      <Skeleton className="mb-4 h-6 w-64" />
      <Skeleton className="mb-6 h-10 w-48" />
      <div className="mb-6 grid gap-4 sm:grid-cols-2 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-48 w-full" />
        ))}
      </div>
    </div>
  );
}
