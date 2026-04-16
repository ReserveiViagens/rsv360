import { useEffect, useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Building2, ChevronDown } from 'lucide-react';
import { api } from '@/src/lib/api';
import { Card } from './ui/card';
import { Select } from './ui/select';

type PropertyOption = {
  id: number;
  name: string;
  type?: string;
};

export function PropertySwitcher() {
  const queryClient = useQueryClient();
  const [propertyId, setPropertyId] = useState<string>('1');

  useEffect(() => {
    setPropertyId(window.localStorage.getItem('propertyId') || '1');
  }, []);

  const { data } = useQuery({
    queryKey: ['properties', 'switcher'],
    queryFn: () => api.get<PropertyOption[] | { data: PropertyOption[] }>('/api/properties'),
    staleTime: 60_000,
  });

  const properties = useMemo(() => {
    if (Array.isArray(data)) return data;
    return data?.data || [];
  }, [data]);

  const handleChange = async (nextId: string) => {
    window.localStorage.setItem('propertyId', nextId);
    setPropertyId(nextId);
    await queryClient.invalidateQueries();
  };

  return (
    <Card className="flex items-center gap-3 border-slate-200 bg-white px-3 py-2 shadow-sm">
      <Building2 className="h-4 w-4 text-slate-500" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-medium text-slate-500">Propriedade ativa</p>
        <Select value={propertyId} onChange={(event) => void handleChange(event.target.value)} className="border-0 bg-transparent px-0 py-0 text-sm font-semibold shadow-none focus:ring-0">
          {(properties.length ? properties : [{ id: 1, name: 'Propriedade Principal' }]).map((property) => (
            <option key={property.id} value={property.id}>
              {property.name}
            </option>
          ))}
        </Select>
      </div>
      <ChevronDown className="h-4 w-4 text-slate-400" />
    </Card>
  );
}
