import { Skeleton } from '@/components/ui/skeleton';

export function TaskCardSkeleton() {
  return (
    <div
      className="bg-card rounded-lg border p-4 shadow-sm"
      role="status"
      aria-label="Loading task"
    >
      <Skeleton className="mb-2 h-6 w-3/4" />
      <Skeleton className="mb-4 h-4 w-full" />
      <Skeleton className="mb-4 h-4 w-2/3" />
      <div className="flex gap-2">
        <Skeleton className="h-6 w-20" />
        <Skeleton className="h-6 w-20" />
      </div>
      <Skeleton className="mt-3 h-4 w-1/2" />
      <span className="sr-only">Loading task card...</span>
    </div>
  );
}

