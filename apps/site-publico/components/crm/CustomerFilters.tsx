'use client';

/**
 * Componente: Filtros de Clientes (CRM)
 * Permite filtrar a lista de clientes por tier, valor gasto, número de reservas, tags, etc.
 */

import { useState } from 'react';
import { Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

interface CustomerFiltersProps {
  filters: {
    loyalty_tier?: string;
    min_total_spent?: number;
    max_total_spent?: number;
    min_bookings?: number;
    tags?: string[];
  };
  onFiltersChange: (filters: any) => void;
  onReset: () => void;
}

export function CustomerFilters({ filters, onFiltersChange, onReset }: CustomerFiltersProps) {
  const [localMinSpent, setLocalMinSpent] = useState(
    filters.min_total_spent?.toString() || ''
  );
  const [localMaxSpent, setLocalMaxSpent] = useState(
    filters.max_total_spent?.toString() || ''
  );
  const [localMinBookings, setLocalMinBookings] = useState(
    filters.min_bookings?.toString() || ''
  );

  const handleFilterChange = (key: string, value: string | number | undefined) => {
    onFiltersChange({
      ...filters,
      [key]: value || undefined
    });
  };

  const handleMinSpentChange = (value: string) => {
    setLocalMinSpent(value);
    const numValue = value ? parseFloat(value) : undefined;
    handleFilterChange('min_total_spent', numValue);
  };

  const handleMaxSpentChange = (value: string) => {
    setLocalMaxSpent(value);
    const numValue = value ? parseFloat(value) : undefined;
    handleFilterChange('max_total_spent', numValue);
  };

  const handleMinBookingsChange = (value: string) => {
    setLocalMinBookings(value);
    const numValue = value ? parseInt(value) : undefined;
    handleFilterChange('min_bookings', numValue);
  };

  const hasActiveFilters = 
    filters.loyalty_tier || 
    filters.min_total_spent !== undefined || 
    filters.max_total_spent !== undefined || 
    filters.min_bookings !== undefined ||
    (filters.tags && filters.tags.length > 0);

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <h3 className="font-semibold">Filtros</h3>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onReset}
                className="ml-auto"
              >
                <X className="h-4 w-4 mr-1" />
                Limpar
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Filtro por Tier */}
            <div className="space-y-2">
              <Label htmlFor="loyalty_tier">Tier de Fidelidade</Label>
              <Select
                value={filters.loyalty_tier || 'all'}
                onValueChange={(value) => 
                  handleFilterChange('loyalty_tier', value === 'all' ? undefined : value)
                }
              >
                <SelectTrigger id="loyalty_tier">
                  <SelectValue placeholder="Todos os tiers" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os tiers</SelectItem>
                  <SelectItem value="bronze">Bronze</SelectItem>
                  <SelectItem value="silver">Silver</SelectItem>
                  <SelectItem value="gold">Gold</SelectItem>
                  <SelectItem value="platinum">Platinum</SelectItem>
                  <SelectItem value="diamond">Diamond</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Filtro por Valor Mínimo Gasto */}
            <div className="space-y-2">
              <Label htmlFor="min_total_spent">Valor Mínimo Gasto (R$)</Label>
              <Input
                id="min_total_spent"
                type="number"
                placeholder="0.00"
                value={localMinSpent}
                onChange={(e) => handleMinSpentChange(e.target.value)}
                min="0"
                step="0.01"
              />
            </div>

            {/* Filtro por Valor Máximo Gasto */}
            <div className="space-y-2">
              <Label htmlFor="max_total_spent">Valor Máximo Gasto (R$)</Label>
              <Input
                id="max_total_spent"
                type="number"
                placeholder="999999.99"
                value={localMaxSpent}
                onChange={(e) => handleMaxSpentChange(e.target.value)}
                min="0"
                step="0.01"
              />
            </div>

            {/* Filtro por Número Mínimo de Reservas */}
            <div className="space-y-2">
              <Label htmlFor="min_bookings">Mínimo de Reservas</Label>
              <Input
                id="min_bookings"
                type="number"
                placeholder="0"
                value={localMinBookings}
                onChange={(e) => handleMinBookingsChange(e.target.value)}
                min="0"
                step="1"
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

