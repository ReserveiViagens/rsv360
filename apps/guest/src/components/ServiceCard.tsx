/**
 * RSV360 PMS/CRM — Reservei Viagens
 * Copyright (c) 2024-2026 Reservei Viagens LTDA. Todos os direitos reservados.
 * Desenvolvido por Douglas P. Figueiredo <douglas@reserveiviagens.com.br>
 * @author Douglas P. Figueiredo
 * @license UNLICENSED
 */
import { CarFront, Clock3, Package, Sparkles, Sparkle, UtensilsCrossed } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { formatCurrency } from '@/lib/format';

const iconMap = {
  room_service: UtensilsCrossed,
  spa: Sparkles,
  transfer: CarFront,
  late_checkout: Clock3,
  cleaning: Sparkle,
  amenities: Package,
} as const;

export function ServiceCard({
  service,
  onRequest,
}: {
  service: {
    id: string;
    name: string;
    description: string;
    category: string;
    icon: string;
    price?: number;
    featured?: boolean;
  };
  onRequest: () => void;
}) {
  const Icon = iconMap[service.id as keyof typeof iconMap] || iconMap[service.icon as keyof typeof iconMap];

  return (
    <Card className="h-full">
      <CardContent>
        <div className="flex h-full flex-col gap-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-900">
              {Icon ? <Icon className="h-5 w-5" /> : <span className="text-lg">✦</span>}
            </div>
            {service.featured ? <Badge variant="success">Recomendado</Badge> : null}
          </div>

          <div className="space-y-2">
            <div>
              <h3 className="text-base font-semibold text-slate-900">{service.name}</h3>
              <p className="text-sm text-slate-500">{service.description}</p>
            </div>
            <Badge variant="outline">{service.category}</Badge>
          </div>

          <div className="mt-auto flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-slate-900">
              {service.price ? formatCurrency(service.price) : 'Sob consulta'}
            </p>
            <Button size="sm" onClick={onRequest}>
              Solicitar
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
