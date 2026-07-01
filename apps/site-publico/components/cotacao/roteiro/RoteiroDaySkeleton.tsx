'use client';

import { Skeleton } from '@/components/ui/skeleton';

export function RoteiroDaySkeleton() {
  return (
    <div className="space-y-4" aria-hidden="true">
      <Skeleton className="h-40 w-full rounded-2xl md:h-48" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  );
}
