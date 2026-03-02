/**
 * ✅ FASE 2 - ETAPA 2.2: Componente CompetitorComparison
 * Comparação com competidores
 * 
 * @module components/pricing/CompetitorComparison
 */

'use client';

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { RefreshCw, MapPin, Star, DollarSign, Users, Filter } from 'lucide-react';
import { toast } from 'sonner';

interface Competitor {
  id: string;
  name: string;
  distance: number; // em km
  rating: number;
  averagePrice: number;
  occupancy: number;
}

interface CompetitorComparisonProps {
  propertyId: string;
  competitors: Competitor[];
  isLoading?: boolean;
}

export default function CompetitorComparison({ 
  propertyId, 
  competitors: initialCompetitors, 
  isLoading 
}: CompetitorComparisonProps) {
  const [maxDistance, setMaxDistance] = useState<number>(10);
  const [minRating, setMinRating] = useState<number>(0);

  // Query: Buscar competidores (com refetch)
  const { data: competitors = initialCompetitors, refetch, isFetching } = useQuery<Competitor[]>({
    queryKey: ['competitor-prices', propertyId],
    queryFn: async () => {
      const response = await fetch(`/api/pricing/competitors/${propertyId}`);
      if (!response.ok) throw new Error('Erro ao buscar competidores');
      const data = await response.json();
      return data.data || [];
    },
    initialData: initialCompetitors,
    staleTime: 5 * 60 * 1000
  });

  // Filtrar competidores
  const filteredCompetitors = useMemo(() => {
    return competitors.filter(c => 
      c.distance <= maxDistance && c.rating >= minRating
    );
  }, [competitors, maxDistance, minRating]);

  // Preparar dados para gráfico
  const chartData = useMemo(() => {
    return filteredCompetitors.map(c => ({
      name: c.name.length > 15 ? c.name.substring(0, 15) + '...' : c.name,
      preco: c.averagePrice,
      ocupacao: c.occupancy
    }));
  }, [filteredCompetitors]);

  // Calcular estatísticas
  const stats = useMemo(() => {
    if (filteredCompetitors.length === 0) return null;
    
    const avgPrice = filteredCompetitors.reduce((sum, c) => sum + c.averagePrice, 0) / filteredCompetitors.length;
    const avgRating = filteredCompetitors.reduce((sum, c) => sum + c.rating, 0) / filteredCompetitors.length;
    const avgOccupancy = filteredCompetitors.reduce((sum, c) => sum + c.occupancy, 0) / filteredCompetitors.length;
    
    return { avgPrice, avgRating, avgOccupancy };
  }, [filteredCompetitors]);

  const handleRefresh = async () => {
    try {
      await refetch();
      toast.success('Dados atualizados');
    } catch (error: any) {
      toast.error(error.message || 'Erro ao atualizar');
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Comparação com Competidores</CardTitle>
          <CardDescription>Carregando dados...</CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[400px] w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!competitors || competitors.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Comparação com Competidores</CardTitle>
          <CardDescription>Nenhum competidor encontrado</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filtros
              </CardTitle>
              <CardDescription>Filtrar competidores por distância e rating</CardDescription>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRefresh}
              disabled={isFetching}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isFetching ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="maxDistance">Distância Máxima (km)</Label>
              <Input
                id="maxDistance"
                type="number"
                value={maxDistance}
                onChange={(e) => setMaxDistance(parseFloat(e.target.value) || 0)}
                min="0"
                max="50"
                step="1"
              />
            </div>
            <div>
              <Label htmlFor="minRating">Rating Mínimo</Label>
              <Input
                id="minRating"
                type="number"
                value={minRating}
                onChange={(e) => setMinRating(parseFloat(e.target.value) || 0)}
                min="0"
                max="5"
                step="0.1"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Estatísticas */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Preço Médio
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                R$ {stats.avgPrice.toFixed(2)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {filteredCompetitors.length} competidor{filteredCompetitors.length !== 1 ? 'es' : ''}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Star className="h-4 w-4" />
                Rating Médio
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {stats.avgRating.toFixed(1)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Média dos competidores
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Users className="h-4 w-4" />
                Ocupação Média
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {stats.avgOccupancy.toFixed(1)}%
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Taxa de ocupação média
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Gráfico Comparativo */}
      <Card>
        <CardHeader>
          <CardTitle>Comparação de Preços</CardTitle>
          <CardDescription>Preço médio vs ocupação dos competidores</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="name" 
                angle={-45}
                textAnchor="end"
                height={80}
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                yAxisId="left"
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => `R$ ${value.toFixed(0)}`}
              />
              <YAxis 
                yAxisId="right" 
                orientation="right"
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip
                formatter={(value: number, name: string) => {
                  if (name === 'preco') return [`R$ ${value.toFixed(2)}`, 'Preço Médio'];
                  if (name === 'ocupacao') return [`${value.toFixed(1)}%`, 'Ocupação'];
                  return [value, name];
                }}
              />
              <Legend />
              <Bar 
                yAxisId="left"
                dataKey="preco" 
                fill="#3b82f6" 
                name="preco"
                radius={[4, 4, 0, 0]}
              />
              <Bar 
                yAxisId="right"
                dataKey="ocupacao" 
                fill="#10b981" 
                name="ocupacao"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Tabela de Competidores */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Competidores</CardTitle>
          <CardDescription>
            {filteredCompetitors.length} de {competitors.length} competidores
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Distância</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Preço Médio</TableHead>
                  <TableHead>Ocupação</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCompetitors.map((competitor) => (
                  <TableRow key={competitor.id}>
                    <TableCell className="font-medium">{competitor.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-muted-foreground" />
                        {competitor.distance.toFixed(1)} km
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                        {competitor.rating.toFixed(1)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3 text-muted-foreground" />
                        R$ {competitor.averagePrice.toFixed(2)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={competitor.occupancy >= 70 ? 'default' : 'secondary'}>
                        {competitor.occupancy.toFixed(1)}%
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

