/**
 * ✅ SKELETON LOADERS MELHORADOS
 * 
 * Componentes de skeleton para diferentes tipos de conteúdo:
 * - Cards, tabelas, listas, formulários
 */

"use client";

import React from 'react';
import { Skeleton, SkeletonCard, SkeletonText } from './skeleton-loader';
import { cn } from '@/lib/utils';

/**
 * Skeleton para card de propriedade
 */
export function PropertyCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('border rounded-lg overflow-hidden', className)}>
      <Skeleton variant="rectangular" height={200} className="w-full" />
      <div className="p-4 space-y-3">
        <Skeleton variant="text" width="70%" height={20} />
        <Skeleton variant="text" width="50%" height={16} />
        <SkeletonText lines={2} />
        <div className="flex gap-2">
          <Skeleton variant="rectangular" width={80} height={24} />
          <Skeleton variant="rectangular" width={80} height={24} />
        </div>
      </div>
    </div>
  );
}

/**
 * Skeleton para tabela
 */
export function TableSkeleton({ rows = 5, columns = 4, className }: { rows?: number; columns?: number; className?: string }) {
  return (
    <div className={cn('space-y-2', className)}>
      {/* Header */}
      <div className="flex gap-4 pb-2 border-b">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} variant="text" width="100%" height={20} />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex gap-4 py-2">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton key={colIndex} variant="text" width="100%" height={16} />
          ))}
        </div>
      ))}
    </div>
  );
}

/**
 * Skeleton para lista
 */
export function ListSkeleton({ items = 5, className }: { items?: number; className?: string }) {
  return (
    <div className={cn('space-y-3', className)}>
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="flex gap-4 items-center">
          <Skeleton variant="circular" width={48} height={48} />
          <div className="flex-1 space-y-2">
            <Skeleton variant="text" width="60%" height={18} />
            <Skeleton variant="text" width="40%" height={14} />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Skeleton para formulário
 */
export function FormSkeleton({ fields = 4, className }: { fields?: number; className?: string }) {
  return (
    <div className={cn('space-y-4', className)}>
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton variant="text" width="30%" height={16} />
          <Skeleton variant="rectangular" width="100%" height={40} />
        </div>
      ))}
      <div className="flex gap-2 pt-4">
        <Skeleton variant="rectangular" width={100} height={40} />
        <Skeleton variant="rectangular" width={100} height={40} />
      </div>
    </div>
  );
}

/**
 * Skeleton para dashboard
 */
export function DashboardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('space-y-6', className)}>
      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SkeletonCard />
        <SkeletonCard />
      </div>
      {/* Table */}
      <SkeletonCard>
        <TableSkeleton rows={5} columns={5} />
      </SkeletonCard>
    </div>
  );
}

