import { Building2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { PropertyItem } from '../types';

export function PropertyCard({ property }: { property: PropertyItem }) {
  return (
    <Card>
      <CardContent className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-slate-100 p-3">
              <Building2 className="h-5 w-5 text-slate-700" />
            </div>
            <div>
              <p className="font-medium text-slate-900">{property.name}</p>
              <p className="text-sm text-slate-500">{property.city || '-'} / {property.state || '-'}</p>
            </div>
          </div>
          <Badge variant={property.is_active ? 'success' : 'secondary'}>{property.type}</Badge>
        </div>
        <p className="text-sm text-slate-500">{property.total_rooms || 0} quartos</p>
      </CardContent>
    </Card>
  );
}
