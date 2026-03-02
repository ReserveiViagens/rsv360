'use client';

/**
 * Componente: Exibição de Pontos de Fidelidade
 * Mostra pontos atuais, progresso para próximo tier e histórico
 */

import { useState, useEffect } from 'react';
import { 
  Award, TrendingUp, Clock, Gift, 
  Loader2, RefreshCw, Star, Target
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface LoyaltyPoints {
  id: number;
  user_id: number;
  current_points: number;
  lifetime_points: number;
  points_redeemed: number;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
  tier_points_required: number;
  last_activity_at?: string;
}

interface LoyaltyTier {
  id: number;
  name: string;
  min_points: number;
  max_points: number | null;
  discount_percentage: number;
  benefits: any;
}

interface LoyaltyTransaction {
  id: number;
  transaction_type: string;
  points: number;
  description?: string;
  reference_type?: string;
  created_at: string;
}

interface LoyaltyPointsDisplayProps {
  userId?: number;
  className?: string;
}

export function LoyaltyPointsDisplay({ userId, className }: LoyaltyPointsDisplayProps) {
  const [points, setPoints] = useState<LoyaltyPoints | null>(null);
  const [currentTier, setCurrentTier] = useState<LoyaltyTier | null>(null);
  const [nextTier, setNextTier] = useState<LoyaltyTier | null>(null);
  const [transactions, setTransactions] = useState<LoyaltyTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [userId]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Buscar pontos do usuário
      const pointsParams = userId ? `?user_id=${userId}` : '';
      const pointsResponse = await fetch(`/api/loyalty/points${pointsParams}`);
      
      if (!pointsResponse.ok) {
        throw new Error('Erro ao carregar pontos');
      }

      const pointsResult = await pointsResponse.json();
      setPoints(pointsResult.data);

      // Buscar tiers
      const tiersResponse = await fetch('/api/loyalty/tiers');
      if (tiersResponse.ok) {
        const tiersResult = await tiersResponse.json();
        const tiers = tiersResult.data || [];
        
        // Encontrar tier atual e próximo
        const current = tiers.find((t: LoyaltyTier) => 
          t.name.toLowerCase() === pointsResult.data.tier
        );
        const currentIndex = tiers.findIndex((t: LoyaltyTier) => 
          t.name.toLowerCase() === pointsResult.data.tier
        );
        const next = currentIndex >= 0 && currentIndex < tiers.length - 1 
          ? tiers[currentIndex + 1] 
          : null;

        setCurrentTier(current || null);
        setNextTier(next || null);
      }

      // Buscar histórico de transações
      const historyResponse = await fetch(`/api/loyalty/history?type=transactions&limit=10`);
      if (historyResponse.ok) {
        const historyResult = await historyResponse.json();
        setTransactions(historyResult.data?.transactions || []);
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const getTierColor = (tier: string) => {
    const colors: Record<string, string> = {
      bronze: 'bg-amber-100 text-amber-800 border-amber-300',
      silver: 'bg-gray-100 text-gray-800 border-gray-300',
      gold: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      platinum: 'bg-blue-100 text-blue-800 border-blue-300',
      diamond: 'bg-purple-100 text-purple-800 border-purple-300',
    };
    return colors[tier] || 'bg-gray-100 text-gray-800';
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'earned':
      case 'bonus':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'redeemed':
        return <Gift className="h-4 w-4 text-blue-600" />;
      case 'expired':
        return <Clock className="h-4 w-4 text-red-600" />;
      default:
        return <Star className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'earned':
      case 'bonus':
        return 'text-green-600';
      case 'redeemed':
        return 'text-blue-600';
      case 'expired':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
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

  if (!points) {
    return (
      <div className="text-center py-12 text-gray-500">
        Nenhum dado de pontos disponível
      </div>
    );
  }

  // Calcular progresso para próximo tier
  const progressToNextTier = nextTier
    ? Math.min(
        ((points.current_points - currentTier?.min_points || 0) / 
         (nextTier.min_points - (currentTier?.min_points || 0))) * 100,
        100
      )
    : 100;

  const pointsNeeded = nextTier
    ? Math.max(0, nextTier.min_points - points.current_points)
    : 0;

  return (
    <div className={className}>
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="history">Histórico</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Card Principal de Pontos */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Award className="h-6 w-6" />
                  Meus Pontos
                </CardTitle>
                <Button variant="outline" size="sm" onClick={fetchData}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Atualizar
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Pontos Atuais */}
              <div className="text-center">
                <div className="text-5xl font-bold text-primary mb-2">
                  {points.current_points.toLocaleString('pt-BR')}
                </div>
                <div className="text-sm text-gray-500">
                  Pontos Disponíveis
                </div>
              </div>

              {/* Tier Atual */}
              <div className="flex items-center justify-center gap-4">
                <Badge className={`${getTierColor(points.tier)} text-lg px-4 py-2`}>
                  <Award className="h-5 w-5 mr-2" />
                  {points.tier.charAt(0).toUpperCase() + points.tier.slice(1)}
                </Badge>
                {currentTier && (
                  <div className="text-sm text-gray-600">
                    {currentTier.discount_percentage}% de desconto
                  </div>
                )}
              </div>

              {/* Progresso para Próximo Tier */}
              {nextTier && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">
                      Progresso para {nextTier.name}
                    </span>
                    <span className="font-medium">
                      {pointsNeeded > 0 ? `${pointsNeeded.toLocaleString('pt-BR')} pontos restantes` : 'Tier alcançado!'}
                    </span>
                  </div>
                  <Progress value={progressToNextTier} className="h-3" />
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{points.current_points.toLocaleString('pt-BR')} pontos</span>
                    <span>{nextTier.min_points.toLocaleString('pt-BR')} pontos</span>
                  </div>
                </div>
              )}

              {/* Estatísticas */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-800">
                    {points.lifetime_points.toLocaleString('pt-BR')}
                  </div>
                  <div className="text-xs text-gray-500">Total Acumulado</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-800">
                    {points.points_redeemed.toLocaleString('pt-BR')}
                  </div>
                  <div className="text-xs text-gray-500">Pontos Resgatados</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Benefícios do Tier Atual */}
          {currentTier && currentTier.benefits && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  Benefícios do Tier {currentTier.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {currentTier.discount_percentage > 0 && (
                    <div className="flex items-center gap-2 text-sm">
                      <Target className="h-4 w-4 text-green-600" />
                      <span>{currentTier.discount_percentage}% de desconto em reservas</span>
                    </div>
                  )}
                  {Object.entries(currentTier.benefits).map(([key, value]: [string, any]) => (
                    <div key={key} className="flex items-center gap-2 text-sm">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span className="capitalize">{key.replace(/_/g, ' ')}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Histórico de Transações</CardTitle>
            </CardHeader>
            <CardContent>
              {transactions.length > 0 ? (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Pontos</TableHead>
                        <TableHead>Descrição</TableHead>
                        <TableHead>Data</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transactions.map((transaction) => (
                        <TableRow key={transaction.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getTransactionIcon(transaction.transaction_type)}
                              <span className="capitalize">
                                {transaction.transaction_type}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className={`font-medium ${getTransactionColor(transaction.transaction_type)}`}>
                              {transaction.points > 0 ? '+' : ''}
                              {transaction.points.toLocaleString('pt-BR')}
                            </span>
                          </TableCell>
                          <TableCell className="text-sm text-gray-600">
                            {transaction.description || transaction.reference_type || '-'}
                          </TableCell>
                          <TableCell className="text-sm text-gray-500">
                            {formatDate(transaction.created_at)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Nenhuma transação encontrada
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
