'use client';

import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { PricingPageHeader } from './PricingPageHeader';
import { fetchPricingItems, type PricingItem } from './pricing-items';

type PricingModuleShellProps = {
  title: string;
  description: string;
  children: (ctx: { itemId: string; item: PricingItem | undefined }) => React.ReactNode;
  action?: React.ReactNode;
};

export function PricingModuleShell({
  title,
  description,
  children,
  action,
}: PricingModuleShellProps) {
  const [itemId, setItemId] = useState<string>('');

  const { data: items, isLoading } = useQuery({
    queryKey: ['pricing-items'],
    queryFn: fetchPricingItems,
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (items?.length && !itemId) {
      setItemId(items[0].id);
    }
  }, [items, itemId]);

  const selected = items?.find((i) => i.id === itemId);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PricingPageHeader title={title} description={description} action={action} />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="w-full sm:max-w-xs">
          <label className="mb-1 block text-sm text-slate-600">Propriedade</label>
          {isLoading ? (
            <Skeleton className="h-10 w-full" />
          ) : (
            <Select value={itemId} onValueChange={setItemId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a propriedade" />
              </SelectTrigger>
              <SelectContent>
                {(items || []).map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      {itemId ? children({ itemId, item: selected }) : (
        <p className="text-sm text-slate-500">Selecione uma propriedade para continuar.</p>
      )}
    </div>
  );
}
