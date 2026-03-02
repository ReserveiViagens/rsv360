'use client';

/**
 * Componente: Visualização de Tiers de Fidelidade
 * Mostra todos os tiers disponíveis, benefícios e progresso visual
 */

import { useState, useEffect } from 'react';
import { 
  Award, Star, TrendingUp, Gift, 
  Loader2, RefreshCw, Check, Lock
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface LoyaltyTier {
  id: number;
  name: string;
  description?: string;
  min_points: number;
  max_points: number | null;
  discount_percentage: number;
  free_shipping: boolean;
  priority_support: boolean;
  exclusive_offers: boolean;
  bonus_points_multiplier: number;
  tier_order: number;
  is_active: boolean;
  icon?: string;
  color?: string;
  benefits: any;
}

interface LoyaltyPoints {
  current_points: number;
  tier: string;
}

interface LoyaltyTiersProps {
  userId?: number;
  className?: string;
}

export function LoyaltyTiers({ userId, className }: LoyaltyTiersProps) {
  const [tiers, setTiers] = useState<LoyaltyTier[]>([]);
  const [userPoints, setUserPoints] = useState<LoyaltyPoints | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [userId]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Buscar tiers
      const tiersResponse = await fetch('/api/loyalty/tiers');
      if (!tiersResponse.ok) {
        throw new Error('Erro ao carregar tiers');
      }

      const tiersResult = await tiersResponse.json();
      const sortedTiers = (tiersResult.data || []).sort(
        (a: LoyaltyTier, b: LoyaltyTier) => a.tier_order - b.tier_order
      );
      setTiers(sortedTiers);

      // Buscar pontos do usuário
      const pointsParams = userId ? `?user_id=${userId}` : '';
      const pointsResponse = await fetch(`/api/loyalty/points${pointsParams}`);
      if (pointsResponse.ok) {
        const pointsResult = await pointsResponse.json();
        setUserPoints(pointsResult.data);
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const getTierColor = (tierName: string) => {
    const name = tierName.toLowerCase();
    const colors: Record<string, string> = {
      bronze: 'bg-amber-100 text-amber-800 border-amber-300',
      silver: 'bg-gray-100 text-gray-800 border-gray-300',
      gold: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      platinum: 'bg-blue-100 text-blue-800 border-blue-300',
      diamond: 'bg-purple-100 text-purple-800 border-purple-300',
    };
    return colors[name] || 'bg-gray-100 text-gray-800';
  };

  const isTierUnlocked = (tier: LoyaltyTier) => {
    if (!userPoints) return false;
    return userPoints.current_points >= tier.min_points;
  };

  const isCurrentTier = (tier: LoyaltyTier) => {
    if (!userPoints) return false;
    return tier.name.toLowerCase() === userPoints.tier.toLowerCase();
  };

  const getTierProgress = (tier: LoyaltyTier) => {
    if (!userPoints) return 0;
    if (userPoints.current_points >= tier.min_points) return 100;
    
    // Encontrar tier anterior
    const currentIndex = tiers.findIndex(t => t.name.toLowerCase() === userPoints.tier.toLowerCase());
    const previousTier = currentIndex > 0 ? tiers[currentIndex - 1] : null;
    const previousMin = previousTier?.min_points || 0;
    
    const range = tier.min_points - previousMin;
    const progress = ((userPoints.current_points - previousMin) / range) * 100;
    return Math.max(0, Math.min(100, progress));
  };

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

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Níveis de Fidelidade</h2>
          <p className="text-gray-500 mt-1">
            Conquiste benefícios exclusivos conforme você acumula pontos
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchData}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Atualizar
        </Button>
      </div>

      <div className="space-y-4">
        {tiers.map((tier, index) => {
          const unlocked = isTierUnlocked(tier);
          const current = isCurrentTier(tier);
          const progress = getTierProgress(tier);

          return (
            <Card 
              key={tier.id} 
              className={`relative overflow-hidden ${
                current ? 'ring-2 ring-primary' : ''
              } ${!unlocked ? 'opacity-75' : ''}`}
            >
              {current && (
                <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-3 py-1 text-xs font-medium rounded-bl-lg">
                  Seu Tier Atual
                </div>
              )}

              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                      unlocked ? getTierColor(tier.name) : 'bg-gray-200 text-gray-400'
                    }`}>
                      {unlocked ? (
                        <Award className="h-8 w-8" />
                      ) : (
                        <Lock className="h-8 w-8" />
                      )}
                    </div>
                    <div>
                      <CardTitle className="text-xl flex items-center gap-2">
                        {tier.name}
                        {unlocked && (
                          <Check className="h-5 w-5 text-green-600" />
                        )}
                      </CardTitle>
                      {tier.description && (
                        <p className="text-sm text-gray-600 mt-1">
                          {tier.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <Badge className={getTierColor(tier.name)}>
                    {tier.min_points.toLocaleString('pt-BR')} pontos
                    {tier.max_points && ` - ${tier.max_points.toLocaleString('pt-BR')}`}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Progresso */}
                {!unlocked && userPoints && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Progresso para desbloquear</span>
                      <span className="font-medium">
                        {Math.max(0, tier.min_points - userPoints.current_points).toLocaleString('pt-BR')} pontos restantes
                      </span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>
                )}

                {/* Benefícios */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {tier.discount_percentage > 0 && (
                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                      <TrendingUp className="h-5 w-5 text-green-600" />
                      <div>
                        <div className="font-medium">{tier.discount_percentage}% de desconto</div>
                        <div className="text-xs text-gray-500">Em todas as reservas</div>
                      </div>
                    </div>
                  )}

                  {tier.free_shipping && (
                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                      <Gift className="h-5 w-5 text-blue-600" />
                      <div>
                        <div className="font-medium">Frete Grátis</div>
                        <div className="text-xs text-gray-500">Em todos os pedidos</div>
                      </div>
                    </div>
                  )}

                  {tier.priority_support && (
                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                      <Star className="h-5 w-5 text-yellow-600" />
                      <div>
                        <div className="font-medium">Suporte Prioritário</div>
                        <div className="text-xs text-gray-500">Atendimento VIP</div>
                      </div>
                    </div>
                  )}

                  {tier.exclusive_offers && (
                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                      <Award className="h-5 w-5 text-purple-600" />
                      <div>
                        <div className="font-medium">Ofertas Exclusivas</div>
                        <div className="text-xs text-gray-500">Acesso antecipado</div>
                      </div>
                    </div>
                  )}

                  {tier.bonus_points_multiplier > 1 && (
                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                      <Star className="h-5 w-5 text-orange-600" />
                      <div>
                        <div className="font-medium">
                          {tier.bonus_points_multiplier}x Pontos Bônus
                        </div>
                        <div className="text-xs text-gray-500">Multiplicador de pontos</div>
                      </div>
                    </div>
                  )}

                  {tier.benefits && typeof tier.benefits === 'object' && (
                    Object.entries(tier.benefits).map(([key, value]: [string, any]) => (
                      <div key={key} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                        <Star className="h-5 w-5 text-yellow-500" />
                        <div>
                          <div className="font-medium capitalize">
                            {key.replace(/_/g, ' ')}
                          </div>
                          {typeof value === 'boolean' && value && (
                            <div className="text-xs text-gray-500">Ativo</div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
