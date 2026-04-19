interface SkeletonProps {
  className?: string;
}

export default function Skeleton({ className = "" }: SkeletonProps) {
  return <div className={`animate-pulse rounded bg-gray-200 ${className}`} />;
}

export function ArticleCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
      <Skeleton className="h-48 w-full rounded-none" />
      <div className="p-5">
        <Skeleton className="mb-3 h-4 w-20" />
        <Skeleton className="mb-2 h-6 w-full" />
        <Skeleton className="mb-4 h-4 w-3/4" />
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
    </div>
  );
}

export function TableRowSkeleton({ cols = 5 }: { cols?: number }) {
  return (
    <tr>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <Skeleton className="h-4 w-full" />
        </td>
      ))}
    </tr>
  );
}
