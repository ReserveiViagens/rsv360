'use client';

import { useState, useEffect } from 'react';
import {
  Building2,
  MapPin,
  Users,
  DollarSign,
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  Hotel,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { OccupancyChart } from '@/components/dashboard/OccupancyChart';
import { useToast } from '@/components/providers/toast-wrapper';
import { getToken } from '@/lib/auth';
import { ErrorBoundary } from '@/components/ui/error-boundary';

interface Property {
  id: number;
  name: string;
  property_type: string;
  address_city?: string;
  address_state?: string;
  max_guests?: number;
  base_price_per_night?: number;
  status?: string;
}

function HotelsPageContent() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [occupancyData, setOccupancyData] = useState<Array<{ date: string; rate: number }>>([]);
  const [loading, setLoading] = useState(true);
  const [chartsLoading, setChartsLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    loadProperties();
    loadOccupancy();
  }, []);

  const loadProperties = async () => {
    setLoading(true);
    try {
      const token = getToken();
      const params = new URLSearchParams({ property_type: 'hotel' });
      const response = await fetch(`/api/properties?${params}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const result = await response.json();
      if (result.success && result.data) {
        setProperties(result.data);
      } else {
        setProperties([]);
      }
    } catch {
      setProperties([
        {
          id: 1,
          name: 'Hotel Exemplo',
          property_type: 'hotel',
          address_city: 'São Paulo',
          address_state: 'SP',
          max_guests: 50,
          base_price_per_night: 350,
          status: 'active',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const loadOccupancy = async () => {
    setChartsLoading(true);
    try {
      const token = getToken();
      const end = new Date();
      const start = new Date();
      start.setDate(start.getDate() - 14);
      const params = new URLSearchParams({
        date_from: start.toISOString().split('T')[0],
        date_to: end.toISOString().split('T')[0],
      });
      const response = await fetch(`/api/analytics/occupancy?${params}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const result = await response.json();
      if (result.success && result.data?.length) {
        setOccupancyData(
          result.data.map((d: any) => ({
            date: d.date || d.day,
            rate: parseFloat(d.rate || d.occupancy_rate || 0),
          }))
        );
      } else {
        setOccupancyData([]);
      }
    } catch {
      setOccupancyData([]);
    } finally {
      setChartsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 bg-gray-200 rounded-xl animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Meus Hotéis</h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1">
              Gerencie suas propriedades do tipo hotel
            </p>
          </div>
          <Button className="w-full sm:w-auto">
            <Plus className="w-4 h-4 mr-2" />
            Novo Hotel
          </Button>
        </div>

        {properties.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Hotel className="w-16 h-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum hotel cadastrado</h3>
              <p className="text-muted-foreground text-center mb-4 max-w-md">
                Cadastre seu primeiro hotel para começar a gerenciar reservas e ocupação.
              </p>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Cadastrar Hotel
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {properties.map((prop) => (
                <Card key={prop.id} className="overflow-hidden">
                  <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                    <CardTitle className="text-base font-semibold line-clamp-1">
                      {prop.name}
                    </CardTitle>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Edit className="w-4 h-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="w-4 h-4 mr-2" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {(prop.address_city || prop.address_state) && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="w-4 h-4 shrink-0" />
                        <span>
                          {[prop.address_city, prop.address_state].filter(Boolean).join(', ')}
                        </span>
                      </div>
                    )}
                    <div className="flex flex-wrap gap-2">
                      {prop.max_guests && (
                        <div className="flex items-center gap-1 text-sm">
                          <Users className="w-4 h-4" />
                          <span>{prop.max_guests} hóspedes</span>
                        </div>
                      )}
                      {prop.base_price_per_night && (
                        <div className="flex items-center gap-1 text-sm">
                          <DollarSign className="w-4 h-4" />
                          <span>R$ {prop.base_price_per_night}/noite</span>
                        </div>
                      )}
                    </div>
                    {prop.status && (
                      <Badge variant={prop.status === 'active' ? 'default' : 'secondary'}>
                        {prop.status === 'active' ? 'ativo' : prop.status}
                      </Badge>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Taxa de Ocupação</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Últimos 14 dias
                </p>
              </CardHeader>
              <CardContent>
                <OccupancyChart data={occupancyData} loading={chartsLoading} />
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}

export default function HotelsDashboardPage() {
  return (
    <ErrorBoundary>
      <HotelsPageContent />
    </ErrorBoundary>
  );
}
