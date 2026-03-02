'use client';

/**
 * Página Principal de Analytics
 * Integração de todos os componentes de analytics
 */

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AnalyticsDashboard } from '@/components/analytics/AnalyticsDashboard';
import { RevenueForecast } from '@/components/analytics/RevenueForecast';
import { DemandHeatmap } from '@/components/analytics/DemandHeatmap';
import { CompetitorBenchmark } from '@/components/analytics/CompetitorBenchmark';
import { AnalyticsInsights } from '@/components/analytics/AnalyticsInsights';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function AnalyticsPage() {
  const [propertyId, setPropertyId] = useState<number | undefined>(undefined);
  const [selectedPropertyId, setSelectedPropertyId] = useState<number | undefined>(undefined);

  const handlePropertySelect = () => {
    setPropertyId(selectedPropertyId);
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Análises</h1>
          <p className="text-gray-600 mt-2">
            Análise completa de receita, demanda e performance
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            placeholder="ID da Propriedade (opcional)"
            value={selectedPropertyId || ''}
            onChange={(e) => setSelectedPropertyId(e.target.value ? parseInt(e.target.value) : undefined)}
            className="w-[200px]"
          />
          <Button onClick={handlePropertySelect} variant="outline">
            Filtrar
          </Button>
        </div>
      </div>

      <Tabs defaultValue="dashboard" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="forecast">Previsão</TabsTrigger>
          <TabsTrigger value="heatmap">Heatmap</TabsTrigger>
          <TabsTrigger value="benchmark">Benchmark</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          <AnalyticsDashboard propertyId={propertyId} />
        </TabsContent>

        <TabsContent value="forecast">
          <RevenueForecast propertyId={propertyId} />
        </TabsContent>

        <TabsContent value="heatmap">
          <DemandHeatmap propertyId={propertyId} />
        </TabsContent>

        <TabsContent value="benchmark">
          {propertyId ? (
            <CompetitorBenchmark propertyId={propertyId} />
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">
                Selecione uma propriedade para ver o benchmark de concorrentes
              </p>
              <Input
                type="number"
                placeholder="ID da Propriedade"
                value={selectedPropertyId || ''}
                onChange={(e) => setSelectedPropertyId(e.target.value ? parseInt(e.target.value) : undefined)}
                className="w-[200px] mx-auto"
              />
              <Button onClick={handlePropertySelect} className="mt-4">
                Carregar Benchmark
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="insights">
          <AnalyticsInsights propertyId={propertyId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

