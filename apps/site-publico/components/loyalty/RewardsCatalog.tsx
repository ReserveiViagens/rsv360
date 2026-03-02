'use client';

/**
 * Componente: Catálogo de Recompensas
 * Exibe recompensas disponíveis com filtros e visualização
 */

import { useState, useEffect } from 'react';
import { 
  Gift, Star, Filter, Search, 
  Loader2, RefreshCw, Award, ShoppingBag
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface LoyaltyReward {
  id: number;
  name: string;
  description?: string;
  points_required: number;
  reward_type: 'discount' | 'free_night' | 'upgrade' | 'cashback' | 'gift' | 'voucher';
  reward_value?: number;
  is_active: boolean;
  stock_quantity?: number;
  valid_from?: string;
  valid_until?: string;
}

interface LoyaltyPoints {
  current_points: number;
}

interface RewardsCatalogProps {
  userId?: number;
  onRedeem?: (rewardId: number) => void;
  className?: string;
}

export function RewardsCatalog({ userId, onRedeem, className }: RewardsCatalogProps) {
  const [rewards, setRewards] = useState<LoyaltyReward[]>([]);
  const [userPoints, setUserPoints] = useState<LoyaltyPoints | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    reward_type: '',
    min_points: '',
    max_points: '',
    search: '',
  });

  useEffect(() => {
    fetchData();
  }, [userId, filters]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Buscar recompensas
      const params = new URLSearchParams();
      if (filters.reward_type) params.append('reward_type', filters.reward_type);
      if (filters.min_points) params.append('min_points', filters.min_points);
      if (filters.max_points) params.append('max_points', filters.max_points);

      const rewardsResponse = await fetch(`/api/loyalty/rewards?${params.toString()}`);
      if (!rewardsResponse.ok) {
        throw new Error('Erro ao carregar recompensas');
      }

      const rewardsResult = await rewardsResponse.json();
      let rewardsData = rewardsResult.data || [];

      // Aplicar busca
      if (filters.search) {
        rewardsData = rewardsData.filter((r: LoyaltyReward) =>
          r.name.toLowerCase().includes(filters.search.toLowerCase()) ||
          r.description?.toLowerCase().includes(filters.search.toLowerCase())
        );
      }

      setRewards(rewardsData);

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

  const getRewardIcon = (type: string) => {
    switch (type) {
      case 'discount':
        return <Star className="h-5 w-5 text-green-600" />;
      case 'free_night':
        return <Award className="h-5 w-5 text-blue-600" />;
      case 'upgrade':
        return <ShoppingBag className="h-5 w-5 text-purple-600" />;
      case 'cashback':
        return <Gift className="h-5 w-5 text-yellow-600" />;
      default:
        return <Gift className="h-5 w-5 text-gray-600" />;
    }
  };

  const getRewardBadge = (type: string) => {
    const badges: Record<string, string> = {
      discount: 'Desconto',
      free_night: 'Noite Grátis',
      upgrade: 'Upgrade',
      cashback: 'Cashback',
      gift: 'Presente',
      voucher: 'Vale',
    };
    return badges[type] || type;
  };

  const canRedeem = (reward: LoyaltyReward) => {
    if (!userPoints) return false;
    if (!reward.is_active) return false;
    if (reward.points_required > userPoints.current_points) return false;
    if (reward.stock_quantity !== null && reward.stock_quantity <= 0) return false;
    
    // Verificar validade
    const now = new Date();
    if (reward.valid_from && new Date(reward.valid_from) > now) return false;
    if (reward.valid_until && new Date(reward.valid_until) < now) return false;
    
    return true;
  };

  const formatRewardValue = (reward: LoyaltyReward) => {
    if (!reward.reward_value) return '';
    
    switch (reward.reward_type) {
      case 'discount':
        return `${reward.reward_value}% OFF`;
      case 'cashback':
        return `R$ ${reward.reward_value.toFixed(2)}`;
      case 'free_night':
        return `${reward.reward_value} noite(s)`;
      default:
        return `R$ ${reward.reward_value.toFixed(2)}`;
    }
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
          <h2 className="text-2xl font-bold">Catálogo de Recompensas</h2>
          <p className="text-gray-500 mt-1">
            Resgate seus pontos por recompensas incríveis
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchData}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Atualizar
        </Button>
      </div>

      {/* Filtros */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar recompensas..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="pl-10"
                />
              </div>
            </div>
            <Select
              value={filters.reward_type || 'all'}
              onValueChange={(value) => setFilters({ ...filters, reward_type: value === 'all' ? undefined : value })}
            >
              <SelectTrigger>
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Tipo de recompensa" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                <SelectItem value="discount">Desconto</SelectItem>
                <SelectItem value="free_night">Noite Grátis</SelectItem>
                <SelectItem value="upgrade">Upgrade</SelectItem>
                <SelectItem value="cashback">Cashback</SelectItem>
                <SelectItem value="gift">Presente</SelectItem>
                <SelectItem value="voucher">Vale</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="Min pontos"
                value={filters.min_points}
                onChange={(e) => setFilters({ ...filters, min_points: e.target.value })}
                className="w-1/2"
              />
              <Input
                type="number"
                placeholder="Max pontos"
                value={filters.max_points}
                onChange={(e) => setFilters({ ...filters, max_points: e.target.value })}
                className="w-1/2"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Grid de Recompensas */}
      {rewards.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rewards.map((reward) => {
            const canRedeemReward = canRedeem(reward);
            const hasEnoughPoints = userPoints && userPoints.current_points >= reward.points_required;

            return (
              <Card key={reward.id} className={`relative ${
                !reward.is_active ? 'opacity-60' : ''
              }`}>
                {!reward.is_active && (
                  <div className="absolute top-2 right-2">
                    <Badge variant="secondary">Indisponível</Badge>
                  </div>
                )}

                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {getRewardIcon(reward.reward_type)}
                      <CardTitle className="text-lg">{reward.name}</CardTitle>
                    </div>
                    <Badge variant="outline">
                      {getRewardBadge(reward.reward_type)}
                    </Badge>
                  </div>
                  {reward.description && (
                    <p className="text-sm text-gray-600 mt-2">
                      {reward.description}
                    </p>
                  )}
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Valor da Recompensa */}
                  {reward.reward_value && (
                    <div className="text-2xl font-bold text-primary">
                      {formatRewardValue(reward)}
                    </div>
                  )}

                  {/* Pontos Necessários */}
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600">Pontos necessários:</span>
                    <span className="font-bold text-lg">
                      {reward.points_required.toLocaleString('pt-BR')}
                    </span>
                  </div>

                  {/* Estoque */}
                  {reward.stock_quantity !== null && (
                    <div className="text-sm text-gray-500">
                      {reward.stock_quantity > 0 
                        ? `${reward.stock_quantity} disponíveis`
                        : 'Esgotado'
                      }
                    </div>
                  )}

                  {/* Validade */}
                  {reward.valid_until && (
                    <div className="text-xs text-gray-500">
                      Válido até: {new Date(reward.valid_until).toLocaleDateString('pt-BR')}
                    </div>
                  )}

                  {/* Botão de Resgate */}
                  <Button
                    className="w-full"
                    disabled={!canRedeemReward}
                    onClick={() => onRedeem && onRedeem(reward.id)}
                  >
                    {!hasEnoughPoints ? (
                      <>
                        <Gift className="h-4 w-4 mr-2" />
                        Pontos insuficientes
                      </>
                    ) : !reward.is_active ? (
                      'Indisponível'
                    ) : (
                      <>
                        <Gift className="h-4 w-4 mr-2" />
                        Resgatar
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center text-gray-500">
            Nenhuma recompensa encontrada
          </CardContent>
        </Card>
      )}

      {/* Pontos Disponíveis */}
      {userPoints && (
        <Card className="mt-6">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600">Seus pontos disponíveis</div>
                <div className="text-3xl font-bold text-primary mt-1">
                  {userPoints.current_points.toLocaleString('pt-BR')}
                </div>
              </div>
              <Award className="h-12 w-12 text-primary opacity-20" />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

