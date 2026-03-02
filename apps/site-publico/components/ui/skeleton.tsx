import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
}

export function Skeleton({ className, variant = 'rectangular' }: SkeletonProps) {
  const baseClasses = 'animate-pulse bg-gray-200 rounded';
  
  const variantClasses = {
    text: 'h-4',
    circular: 'rounded-full',
    rectangular: 'rounded',
  };

  return (
    <div
      className={cn(baseClasses, variantClasses[variant], className)}
      aria-label="Carregando..."
    />
  );
}

// Componentes pré-definidos
export function SkeletonCard() {
  return (
    <div className="p-4 border rounded-lg">
      <Skeleton className="h-4 w-3/4 mb-2" variant="text" />
      <Skeleton className="h-4 w-1/2 mb-4" variant="text" />
      <Skeleton className="h-48 w-full mb-4" />
      <Skeleton className="h-4 w-full mb-2" variant="text" />
      <Skeleton className="h-4 w-2/3" variant="text" />
    </div>
  );
}

export function SkeletonList({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex gap-4">
          <Skeleton className="h-16 w-16" variant="circular" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" variant="text" />
            <Skeleton className="h-4 w-1/2" variant="text" />
          </div>
        </div>
      ))}
    </div>
  );
}
