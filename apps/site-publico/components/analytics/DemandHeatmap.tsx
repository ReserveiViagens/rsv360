'use client';

/**
 * Componente: Heatmap de Demanda
 * Visualização de demanda por data com filtros e tooltips
 */

import { useState, useEffect } from 'react';
import { 
  Calendar, Loader2, RefreshCw, 
  TrendingUp, Filter
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface HeatmapDataPoint {
  date: string;
  bookings: number;
  revenue: number;
  avg_value: number;
  demand_level: number;
  intensity: 'low' | 'medium' | 'high';
}

interface DemandHeatmapData {
  heatmap: HeatmapDataPoint[];
  max_demand: number;
  date_range: {
    start: string;
    end: string;
  };
}

interface DemandHeatmapProps {
  propertyId?: number;
  className?: string;
}

export function DemandHeatmap({ propertyId, className }: DemandHeatmapProps) {
  const [data, setData] = useState<DemandHeatmapData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<string>(
    new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState<string>(
    new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  useEffect(() => {
    fetchHeatmap();
  }, [propertyId, startDate, endDate]);

  const fetchHeatmap = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      params.append('start_date', startDate);
      params.append('end_date', endDate);
      if (propertyId) {
        params.append('property_id', propertyId.toString());
      }

      const response = await fetch(`/api/analytics/demand-heatmap?${params.toString()}`);

      if (!response.ok) {
        throw new Error('Erro ao carregar heatmap');
      }

      const result = await response.json();
      setData(result.data);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar heatmap');
    } finally {
      setLoading(false);
    }
  };

  const getIntensityColor = (intensity: string) => {
    switch (intensity) {
      case 'high':
        return 'bg-red-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'low':
        return 'bg-green-500';
      default:
        return 'bg-gray-300';
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  // Agrupar dados por mês para visualização
  const groupedByMonth = data ? data.heatmap.reduce((acc: any, point) => {
    const month = point.date.substring(0, 7); // YYYY-MM
    if (!acc[month]) {
      acc[month] = [];
    }
    acc[month].push(point);
    return acc;
  }, {}) : {};

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12 text-gray-500">
        Nenhum dado disponível
      </div>
    );
  }

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Heatmap de Demanda
            </CardTitle>
            <Button variant="outline" size="sm" onClick={fetchHeatmap}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Atualizar
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Filtros */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm text-gray-600 mb-1 block">Data Inicial</label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm text-gray-600 mb-1 block">Data Final</label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <Button onClick={fetchHeatmap} className="w-full">
                <Filter className="h-4 w-4 mr-2" />
                Filtrar
              </Button>
            </div>
          </div>

          {/* Legenda */}
          <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
            <span className="text-sm text-gray-600">Intensidade:</span>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span className="text-xs">Baixa</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-500 rounded"></div>
              <span className="text-xs">Média</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 rounded"></div>
              <span className="text-xs">Alta</span>
            </div>
          </div>

          {/* Heatmap Visual */}
          <div className="space-y-4">
            {Object.entries(groupedByMonth).map(([month, points]: [string, any]) => (
              <div key={month} className="space-y-2">
                <h3 className="font-semibold text-sm">
                  {new Date(month + '-01').toLocaleDateString('pt-BR', {
                    month: 'long',
                    year: 'numeric',
                  })}
                </h3>
                <div className="grid grid-cols-7 md:grid-cols-14 lg:grid-cols-31 gap-1">
                  {points.map((point: HeatmapDataPoint, idx: number) => {
                    const date = new Date(point.date);
                    const dayOfWeek = date.getDay();
                    const day = date.getDate();
                    const isSelected = selectedDate === point.date;

                    return (
                      <div
                        key={idx}
                        className={`
                          aspect-square rounded cursor-pointer transition-all
                          ${getIntensityColor(point.intensity)}
                          ${isSelected ? 'ring-2 ring-blue-500 ring-offset-2' : ''}
                          hover:opacity-80
                        `}
                        style={{
                          opacity: point.demand_level / 100,
                        }}
                        onClick={() => setSelectedDate(point.date)}
                        title={`${formatDate(point.date)}: ${point.bookings} reservas, ${formatCurrency(point.revenue)}`}
                      >
                        <div className="w-full h-full flex items-center justify-center text-white text-xs font-bold">
                          {day}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Detalhes da Data Selecionada */}
          {selectedDate && (
            <div className="p-4 bg-blue-50 rounded-lg">
              {(() => {
                const selectedPoint = data.heatmap.find(p => p.date === selectedDate);
                if (!selectedPoint) return null;

                return (
                  <div className="space-y-2">
                    <div className="font-semibold">
                      {formatDate(selectedPoint.date)}
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <div className="text-gray-600">Reservas</div>
                        <div className="font-bold">{selectedPoint.bookings}</div>
                      </div>
                      <div>
                        <div className="text-gray-600">Receita</div>
                        <div className="font-bold">{formatCurrency(selectedPoint.revenue)}</div>
                      </div>
                      <div>
                        <div className="text-gray-600">Ticket Médio</div>
                        <div className="font-bold">{formatCurrency(selectedPoint.avg_value)}</div>
                      </div>
                      <div>
                        <div className="text-gray-600">Nível de Demanda</div>
                        <div className="font-bold">{selectedPoint.demand_level}%</div>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* Estatísticas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-800">
                {data.heatmap.length}
              </div>
              <div className="text-xs text-gray-500">Dias Analisados</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-800">
                {data.max_demand}
              </div>
              <div className="text-xs text-gray-500">Pico de Demanda</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-800">
                {data.heatmap.filter(p => p.intensity === 'high').length}
              </div>
              <div className="text-xs text-gray-500">Dias de Alta Demanda</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

