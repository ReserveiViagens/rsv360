/**
 * ✅ COMPONENTE: TOP HOST LEADERBOARD
 * Ranking público de hosts por qualidade
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trophy, Star, Award, Users, TrendingUp } from '@/lib/lucide-icons';
import { Button } from '@/components/ui/button';
import { getUser, getToken } from '@/lib/auth';
import { toast } from 'sonner';

interface LeaderboardEntry {
  position: number;
  host_id: number;
  host_name?: string;
  host_email?: string;
  overall_score: number;
  quality_score?: number;
  performance_score?: number;
  guest_satisfaction_score?: number;
  total_ratings: number;
  total_bookings: number;
  badge_count: number;
  tier: 'diamond' | 'platinum' | 'gold' | 'silver' | 'bronze';
}

interface LeaderboardData {
  entries: LeaderboardEntry[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export function TopHostLeaderboard() {
  const [loading, setLoading] = useState(false);
  const [leaderboard, setLeaderboard] = useState<LeaderboardData | null>(null);
  const [filters, setFilters] = useState({
    page: 1,
    page_size: '50',
    min_bookings: '5',
    min_score: '',
    tier: 'all',
  });

  const user = getUser();
  const token = getToken();

  useEffect(() => {
    loadLeaderboard();
  }, [filters]);

  const loadLeaderboard = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      queryParams.append('page', filters.page.toString());
      if (filters.page_size) queryParams.append('page_size', filters.page_size);
      if (filters.min_bookings) queryParams.append('min_bookings', filters.min_bookings);
      if (filters.min_score) queryParams.append('min_score', filters.min_score);
      if (filters.tier && filters.tier !== 'all') queryParams.append('tier', filters.tier);

      const response = await fetch(`/api/top-hosts/leaderboard?${queryParams.toString()}`, {
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao carregar ranking');
      }

      if (result.success) {
        setLeaderboard(result.data);
      }
    } catch (error: any) {
      toast.error(error.message || 'Erro ao carregar ranking');
    } finally {
      setLoading(false);
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'diamond':
        return 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white';
      case 'platinum':
        return 'bg-gradient-to-r from-gray-300 to-gray-400 text-white';
      case 'gold':
        return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white';
      case 'silver':
        return 'bg-gradient-to-r from-gray-400 to-gray-500 text-white';
      case 'bronze':
        return 'bg-gradient-to-r from-orange-600 to-orange-800 text-white';
      default:
        return 'bg-muted text-foreground';
    }
  };

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'diamond':
        return '💎';
      case 'platinum':
        return '⚪';
      case 'gold':
        return '🥇';
      case 'silver':
        return '🥈';
      case 'bronze':
        return '🥉';
      default:
        return '⭐';
    }
  };

  const getPositionIcon = (position: number) => {
    if (position === 1) return '🥇';
    if (position === 2) return '🥈';
    if (position === 3) return '🥉';
    return `#${position}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold flex items-center gap-2">
            <Trophy className="w-8 h-8 text-yellow-500" />
            Top Hosts Leaderboard
          </h2>
          <p className="text-muted-foreground">
            Ranking dos melhores hosts por qualidade e performance
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
          <CardDescription>Ajuste os critérios do ranking</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="page_size">Resultados por Página</Label>
              <Input
                id="page_size"
                type="number"
                value={filters.page_size}
                onChange={(e) => setFilters({ ...filters, page_size: e.target.value, page: 1 })}
                min="10"
                max="100"
              />
            </div>
            <div>
              <Label htmlFor="min_bookings">Mínimo de Reservas</Label>
              <Input
                id="min_bookings"
                type="number"
                value={filters.min_bookings}
                onChange={(e) => setFilters({ ...filters, min_bookings: e.target.value, page: 1 })}
                min="0"
              />
            </div>
            <div>
              <Label htmlFor="min_score">Score Mínimo</Label>
              <Input
                id="min_score"
                type="number"
                step="0.1"
                value={filters.min_score}
                onChange={(e) => setFilters({ ...filters, min_score: e.target.value, page: 1 })}
                min="0"
                max="5"
                placeholder="Ex: 4.0"
              />
            </div>
            <div>
              <Label htmlFor="tier">Tier</Label>
              <Select
                value={filters.tier || 'all'}
                onValueChange={(value) => setFilters({ ...filters, tier: value, page: 1 })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos os tiers" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os tiers</SelectItem>
                  <SelectItem value="diamond">Diamond</SelectItem>
                  <SelectItem value="platinum">Platinum</SelectItem>
                  <SelectItem value="gold">Gold</SelectItem>
                  <SelectItem value="silver">Silver</SelectItem>
                  <SelectItem value="bronze">Bronze</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <Card>
          <CardContent className="flex items-center justify-center p-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Carregando ranking...</p>
            </div>
          </CardContent>
        </Card>
      ) : leaderboard && leaderboard.entries.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total de Hosts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{leaderboard.total}</div>
                <p className="text-sm text-muted-foreground">
                  Página {leaderboard.page} de {leaderboard.totalPages}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Score Médio</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {(
                    leaderboard.entries.reduce((sum, h) => sum + h.overall_score, 0) /
                    leaderboard.entries.length
                  ).toFixed(1)}
                </div>
                <p className="text-sm text-muted-foreground">de 5.0</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total de Badges</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {leaderboard.entries.reduce((sum, h) => sum + h.badge_count, 0)}
                </div>
                <p className="text-sm text-muted-foreground">badges conquistados</p>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-3">
            {leaderboard.entries.map((host) => (
              <Card
                key={host.host_id}
                className={`transition-all hover:shadow-lg ${
                  host.position <= 3 ? 'border-2 border-yellow-400' : ''
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-muted font-bold text-lg">
                        {getPositionIcon(host.position)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-lg">
                            {host.host_name || `Host #${host.host_id}`}
                          </h3>
                          <Badge className={getTierColor(host.tier)}>
                            {getTierIcon(host.tier)} {host.tier}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                            {host.overall_score.toFixed(1)}/5.0
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {host.total_bookings} reservas
                          </span>
                          <span className="flex items-center gap-1">
                            <Award className="w-4 h-4" />
                            {host.badge_count} badges
                          </span>
                          <span className="flex items-center gap-1">
                            <TrendingUp className="w-4 h-4" />
                            {host.total_ratings} avaliações
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary">
                        {host.overall_score.toFixed(1)}
                      </div>
                      <div className="text-xs text-muted-foreground">Score</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Paginação */}
          {leaderboard.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <Button
                variant="outline"
                onClick={() => setFilters({ ...filters, page: Math.max(1, filters.page - 1) })}
                disabled={filters.page === 1}
              >
                Anterior
              </Button>
              <span className="text-sm text-muted-foreground">
                Página {leaderboard.page} de {leaderboard.totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => setFilters({ ...filters, page: Math.min(leaderboard.totalPages, filters.page + 1) })}
                disabled={filters.page >= leaderboard.totalPages}
              >
                Próxima
              </Button>
            </div>
          )}
        </>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-12">
            <Trophy className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum host encontrado</h3>
            <p className="text-muted-foreground text-center">
              Ajuste os filtros para ver mais resultados
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}


