"use client";

import Link from 'next/link';
import { cn } from '@/lib/utils';

interface MetricCardProps {
  title: string;
  value: string;
  change: string;
  changeType: 'positive' | 'negative' | 'neutral';
  icon: string;
  loading?: boolean;
  href?: string;
  animated?: boolean;
  color?: 'blue' | 'green' | 'red' | 'yellow' | 'purple';
  tooltip?: string;
}

export function MetricCard({
  title,
  value,
  change,
  changeType,
  icon,
  loading = false,
  href,
  animated = false,
  color = 'blue',
  tooltip
}: MetricCardProps) {
  const changeColorClasses = {
    positive: 'text-green-600',
    negative: 'text-red-600',
    neutral: 'text-gray-600'
  };

  const colorClasses = {
    blue: 'border-blue-200 bg-blue-50/50',
    green: 'border-green-200 bg-green-50/50',
    red: 'border-red-200 bg-red-50/50',
    yellow: 'border-yellow-200 bg-yellow-50/50',
    purple: 'border-purple-200 bg-purple-50/50'
  };

  const cardContent = (
    <div
      className={cn(
        'p-6 bg-white rounded-lg border shadow-sm',
        colorClasses[color],
        animated && 'hover:scale-105 transition-transform duration-200',
        'relative'
      )}
      title={tooltip}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">
            {loading ? '...' : value}
          </p>
          <p className={cn('text-sm mt-1', changeColorClasses[changeType])}>
            {loading ? '' : change}
          </p>
        </div>
        <div className="ml-4">
          <span className="text-2xl">{icon}</span>
        </div>
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block">
        {cardContent}
      </Link>
    );
  }

  return cardContent;
}
