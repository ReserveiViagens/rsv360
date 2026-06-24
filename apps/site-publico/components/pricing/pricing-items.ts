export type PricingItem = {
  id: string;
  name: string;
  basePrice: number;
};

export async function fetchPricingItems(): Promise<PricingItem[]> {
  try {
    const res = await fetch('/api/properties?limit=50');
    if (res.ok) {
      const json = await res.json();
      const rows = json.data as Array<{ id: number; name: string; base_price_per_night?: number }>;
      if (rows?.length) {
        return rows.map((p) => ({
          id: String(p.id),
          name: p.name,
          basePrice: Number(p.base_price_per_night || 0),
        }));
      }
    }
  } catch {
    /* fallback abaixo */
  }

  const fallback = await fetch('/api/pricing/items');
  if (!fallback.ok) return [{ id: '1', name: 'Propriedade demo', basePrice: 250 }];
  const json = await fallback.json();
  return (json.data as PricingItem[]) || [];
}
