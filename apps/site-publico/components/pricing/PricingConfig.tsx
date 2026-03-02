/**
 * ✅ FASE 2 - ETAPA 2.2: Componente PricingConfig
 * Formulário de configuração de Smart Pricing
 * 
 * @module components/pricing/PricingConfig
 */

'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Skeleton } from '@/components/ui/skeleton';
import { Save, RotateCcw, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface PricingConfigProps {
  propertyId: string;
  config: {
    minPrice: number;
    maxPrice: number;
    basePrice: number;
    aggressiveMode: boolean;
    autoAdjust: boolean;
    priceAdjustmentRate: number;
    eventMultiplier: number;
    weatherImpact: boolean;
    competitorTracking: boolean;
  } | null;
  isLoading?: boolean;
}

export default function PricingConfig({ propertyId, config, isLoading }: PricingConfigProps) {
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    minPrice: config?.minPrice || 0,
    maxPrice: config?.maxPrice || 0,
    basePrice: config?.basePrice || 0,
    aggressiveMode: config?.aggressiveMode || false,
    autoAdjust: config?.autoAdjust || true,
    priceAdjustmentRate: config?.priceAdjustmentRate || 10,
    eventMultiplier: config?.eventMultiplier || 1.5,
    weatherImpact: config?.weatherImpact || true,
    competitorTracking: config?.competitorTracking || true
  });

  // Mutation: Salvar configuração
  const saveConfig = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await fetch(`/api/pricing/config/${propertyId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erro ao salvar configuração');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pricing-config', propertyId] });
      toast.success('Configuração salva com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erro ao salvar configuração');
    }
  });

  // Handler: Salvar
  const handleSave = () => {
    // Validações
    if (formData.minPrice >= formData.maxPrice) {
      toast.error('Preço mínimo deve ser menor que preço máximo');
      return;
    }
    if (formData.basePrice < formData.minPrice || formData.basePrice > formData.maxPrice) {
      toast.error('Preço base deve estar entre mínimo e máximo');
      return;
    }
    
    saveConfig.mutate(formData);
  };

  // Handler: Reset
  const handleReset = () => {
    if (config) {
      setFormData({
        minPrice: config.minPrice,
        maxPrice: config.maxPrice,
        basePrice: config.basePrice,
        aggressiveMode: config.aggressiveMode,
        autoAdjust: config.autoAdjust,
        priceAdjustmentRate: config.priceAdjustmentRate,
        eventMultiplier: config.eventMultiplier,
        weatherImpact: config.weatherImpact,
        competitorTracking: config.competitorTracking
      });
      toast.info('Configuração resetada');
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Configuração de Precificação</CardTitle>
          <CardDescription>Configure os parâmetros da precificação inteligente</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configuração de Precificação Inteligente</CardTitle>
        <CardDescription>
          Ajuste os parâmetros para otimizar a precificação automática
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Preços */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Limites de Preço</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="minPrice">Preço Mínimo (R$)</Label>
              <Input
                id="minPrice"
                type="number"
                value={formData.minPrice}
                onChange={(e) => setFormData({ ...formData, minPrice: parseFloat(e.target.value) || 0 })}
                min="0"
                step="0.01"
              />
            </div>
            
            <div>
              <Label htmlFor="basePrice">Preço Base (R$)</Label>
              <Input
                id="basePrice"
                type="number"
                value={formData.basePrice}
                onChange={(e) => setFormData({ ...formData, basePrice: parseFloat(e.target.value) || 0 })}
                min="0"
                step="0.01"
              />
            </div>
            
            <div>
              <Label htmlFor="maxPrice">Preço Máximo (R$)</Label>
              <Input
                id="maxPrice"
                type="number"
                value={formData.maxPrice}
                onChange={(e) => setFormData({ ...formData, maxPrice: parseFloat(e.target.value) || 0 })}
                min="0"
                step="0.01"
              />
            </div>
          </div>
        </div>

        {/* Modo Agressivo */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="aggressiveMode">Modo Agressivo</Label>
            <p className="text-sm text-muted-foreground">
              Aumenta a velocidade de ajuste de preços para maximizar receita
            </p>
          </div>
          <Switch
            id="aggressiveMode"
            checked={formData.aggressiveMode}
            onCheckedChange={(checked) => setFormData({ ...formData, aggressiveMode: checked })}
          />
        </div>

        {/* Auto-ajuste */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="autoAdjust">Ajuste Automático</Label>
            <p className="text-sm text-muted-foreground">
              Permite que a IA ajuste preços automaticamente
            </p>
          </div>
          <Switch
            id="autoAdjust"
            checked={formData.autoAdjust}
            onCheckedChange={(checked) => setFormData({ ...formData, autoAdjust: checked })}
          />
        </div>

        {/* Taxa de Ajuste */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Taxa de Ajuste de Preço</Label>
            <span className="text-sm font-medium">{formData.priceAdjustmentRate}%</span>
          </div>
          <Slider
            value={[formData.priceAdjustmentRate]}
            onValueChange={([value]) => setFormData({ ...formData, priceAdjustmentRate: value })}
            min={1}
            max={20}
            step={1}
            className="w-full"
          />
          <p className="text-xs text-muted-foreground">
            Velocidade máxima de mudança de preço por atualização (1-20%)
          </p>
        </div>

        {/* Multiplicador de Eventos */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Multiplicador de Eventos</Label>
            <span className="text-sm font-medium">{formData.eventMultiplier.toFixed(1)}x</span>
          </div>
          <Slider
            value={[formData.eventMultiplier]}
            onValueChange={([value]) => setFormData({ ...formData, eventMultiplier: value })}
            min={1.0}
            max={3.0}
            step={0.1}
            className="w-full"
          />
          <p className="text-xs text-muted-foreground">
            Multiplicador aplicado quando há eventos locais (1.0x - 3.0x)
          </p>
        </div>

        {/* Impacto do Clima */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="weatherImpact">Impacto do Clima</Label>
            <p className="text-sm text-muted-foreground">
              Considera condições climáticas na precificação
            </p>
          </div>
          <Switch
            id="weatherImpact"
            checked={formData.weatherImpact}
            onCheckedChange={(checked) => setFormData({ ...formData, weatherImpact: checked })}
          />
        </div>

        {/* Tracking de Competidores */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="competitorTracking">Monitoramento de Competidores</Label>
            <p className="text-sm text-muted-foreground">
              Monitora e ajusta preços baseado em competidores
            </p>
          </div>
          <Switch
            id="competitorTracking"
            checked={formData.competitorTracking}
            onCheckedChange={(checked) => setFormData({ ...formData, competitorTracking: checked })}
          />
        </div>

        {/* Aviso de Validação */}
        {(formData.minPrice >= formData.maxPrice || 
          formData.basePrice < formData.minPrice || 
          formData.basePrice > formData.maxPrice) && (
          <div className="flex items-start gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
            <div className="text-sm text-yellow-800 dark:text-yellow-200">
              <p className="font-medium">Atenção: Valores inválidos</p>
              <p>Preço mínimo deve ser menor que máximo, e preço base deve estar entre eles.</p>
            </div>
          </div>
        )}

        {/* Botões de Ação */}
        <div className="flex items-center gap-2 pt-4 border-t">
          <Button 
            onClick={handleSave} 
            disabled={saveConfig.isPending}
            className="flex-1"
          >
            <Save className="h-4 w-4 mr-2" />
            {saveConfig.isPending ? 'Salvando...' : 'Salvar Configuração'}
          </Button>
          <Button 
            variant="outline" 
            onClick={handleReset}
            disabled={saveConfig.isPending}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Resetar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

