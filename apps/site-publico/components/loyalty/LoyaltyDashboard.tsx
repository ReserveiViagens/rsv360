'use client';

/**
 * Componente: Dashboard de Fidelidade
 * Exibe métricas, gráficos de tiers e top recompensas
 */

import { useState, useEffect } from 'react';
import { 
  Award, TrendingUp, Gift, Users,
  Loader2, RefreshCw, Star, Target
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface LoyaltyDashboardMetrics {
  total_points: number;
  total_users: number;
  total_rewards: number;
  total_redemptions: number;
  tier_distribution: Array<{ tier: string; count: number }>;
  top_rewards: Array<{ id: number; name: string; redemptions: number }>;
  points_earned_trend: Array<{ month: string; points: number }>;
  redemptions_trend: Array<{ month: string; count: number }>;
}

interface LoyaltyDashboardProps {
  userId?: number;
  className?: string;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export function LoyaltyDashboard({ userId, className }: LoyaltyDashboardProps) {
  const [metrics, setMetrics] = useState<LoyaltyDashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMetrics();
  }, [userId]);

  const fetchMetrics = async () => {
    setLoading(true);
    setError(null);

    try {
      // Por enquanto, vamos buscar dados individuais e agregar
      // TODO: Criar endpoint /api/loyalty/dashboard quando necessário
      
      const [pointsResponse, rewardsResponse, historyResponse] = await Promise.all([
        fetch('/api/loyalty/points'),
        fetch('/api/loyalty/rewards'),
        fetch('/api/loyalty/history?type=all&limit=100'),
      ]);

      if (!pointsResponse.ok || !rewardsResponse.ok) {
        throw new Error('Erro ao carregar métricas');
      }

      const pointsData = await pointsResponse.json();
      const rewardsData = await rewardsResponse.json();
      const historyData = await historyResponse.json();

      // Processar dados para métricas
      const transactions = historyData.data?.transactions || [];
      const redemptions = historyData.data?.redemptions || [];

      // Calcular métricas básicas
      const totalPoints = pointsData.data?.current_points || 0;
      const totalRewards = rewardsData.data?.length || 0;
      const totalRedemptions = redemptions.length;

      // Distribuição de tiers (simulado - precisa de endpoint real)
      const tierDistribution = [
        { tier: 'Bronze', count: 45 },
        { tier: 'Silver', count: 30 },
        { tier: 'Gold', count: 15 },
        { tier: 'Platinum', count: 8 },
        { tier: 'Diamond', count: 2 },
      ];

      // Top recompensas
      const rewardCounts: Record<number, number> = {};
      redemptions.forEach((r: any) => {
        rewardCounts[r.reward_id] = (rewardCounts[r.reward_id] || 0) + 1;
      });

      const topRewards = Object.entries(rewardCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([id, count]) => ({
          id: parseInt(id),
          name: `Recompensa #${id}`,
          redemptions: count as number,
        }));

      // Tendências (simulado - precisa de dados reais)
      const pointsEarnedTrend = [
        { month: 'Jan', points: 1200 },
        { month: 'Fev', points: 1500 },
        { month: 'Mar', points: 1800 },
        { month: 'Abr', points: 2000 },
        { month: 'Mai', points: 2200 },
        { month: 'Jun', points: 2500 },
      ];

      const redemptionsTrend = [
        { month: 'Jan', count: 15 },
        { month: 'Fev', count: 18 },
        { month: 'Mar', count: 22 },
        { month: 'Abr', count: 25 },
        { month: 'Mai', count: 28 },
        { month: 'Jun', count: 30 },
      ];

      setMetrics({
        total_points: totalPoints,
        total_users: 100, // Simulado
        total_rewards: totalRewards,
        total_redemptions: totalRedemptions,
        tier_distribution: tierDistribution,
        top_rewards: topRewards,
        points_earned_trend: pointsEarnedTrend,
        redemptions_trend: redemptionsTrend,
      });
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar métricas');
    } finally {
      setLoading(false);
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

  if (!metrics) {
    return (
      <div className="text-center py-12 text-gray-500">
        Nenhuma métrica disponível
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Dashboard de Fidelidade</h2>
          <p className="text-gray-500 mt-1">
            Visão geral do programa de fidelidade
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchMetrics}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Atualizar
        </Button>
      </div>

      {/* Cards de Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Pontos</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.total_points.toLocaleString('pt-BR')}
            </div>
            <p className="text-xs text-muted-foreground">
              Pontos acumulados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuários Ativos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.total_users.toLocaleString('pt-BR')}
            </div>
            <p className="text-xs text-muted-foreground">
              No programa
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recompensas</CardTitle>
            <Gift className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.total_rewards}
            </div>
            <p className="text-xs text-muted-foreground">
              Disponíveis
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resgates</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.total_redemptions}
            </div>
            <p className="text-xs text-muted-foreground">
              Total de resgates
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Distribuição de Tiers */}
        <Card>
          <CardHeader>
            <CardTitle>Distribuição de Tiers</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={metrics.tier_distribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ tier, percent }) => `${tier}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {metrics.tier_distribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Recompensas */}
        <Card>
          <CardHeader>
            <CardTitle>Top 5 Recompensas</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={metrics.top_rewards}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="redemptions" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Tendências */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tendência de Pontos Ganhos */}
        <Card>
          <CardHeader>
            <CardTitle>Pontos Ganhos (Últimos 6 Meses)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={metrics.points_earned_trend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="points" fill="#00C49F" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Tendência de Resgates */}
        <Card>
          <CardHeader>
            <CardTitle>Resgates (Últimos 6 Meses)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={metrics.redemptions_trend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#FF8042" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

