import { cn } from "@/lib/utils";

/**
 * Base skeleton primitive — animated shimmer block.
 */
export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-[#F1F2F4]", className)}
      aria-hidden="true"
      {...props}
    />
  );
}

/**
 * Generic skeleton for a table with N rows.
 */
export function SkeletonTable({
  rows = 6,
  columns = 5,
  className,
}: {
  rows?: number;
  columns?: number;
  className?: string;
}) {
  return (
    <div className={cn("w-full space-y-2", className)} role="status" aria-label="Loading">
      <div className="flex gap-3 border-b border-[#EEF0F2] pb-2">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={`h-${i}`} className="h-4 flex-1" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, r) => (
        <div key={`r-${r}`} className="flex items-center gap-3 py-2">
          {Array.from({ length: columns }).map((_, c) => (
            <Skeleton key={`r-${r}-c-${c}`} className="h-3.5 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}

/**
 * Skeleton for a stat / KPI card.
 */
export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-lg border border-[#EEF0F2] bg-white p-4",
        className,
      )}
      role="status"
      aria-label="Loading"
    >
      <Skeleton className="h-3 w-1/3" />
      <Skeleton className="h-7 w-1/2" />
      <Skeleton className="h-3 w-2/3" />
    </div>
  );
}

/**
 * Skeleton for a list of stat cards in a grid.
 */
export function SkeletonStatGrid({
  count = 4,
  className,
}: {
  count?: number;
  className?: string;
}) {
  return (
    <div className={cn("grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}
