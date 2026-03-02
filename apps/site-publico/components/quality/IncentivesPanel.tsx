/**
 * ✅ FASE 3 - ETAPA 3.1: Componente IncentivesPanel
 * Painel de incentivos e recompensas para hosts
 * 
 * @module components/quality/IncentivesPanel
 */

'use client';

import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Gift, 
  Trophy, 
  Star, 
  Zap, 
  Crown, 
  Headphones, 
  TrendingUp,
  Award,
  Target,
  Clock,
  CheckCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Incentive {
  id: string;
  type: 'badge' | 'discount' | 'badge_highlight' | 'priority_support' | 'boost';
  title: string;
  description: string;
  icon: string;
  status: 'available' | 'earned' | 'expired';
  earnedAt?: string;
  expiresAt?: string;
  value?: number; // Para descontos (%)
}

interface Mission {
  id: string;
  title: string;
  description: string;
  progress: number; // 0-100
  target: number;
  current: number;
  reward: string;
  expiresAt?: string;
}

interface IncentivesData {
  points: number;
  level: 'regular' | 'top' | 'superhost';
  leaderboardPosition?: number;
  nextLevelPoints?: number;
  availableBadges: Array<{
    id: string;
    name: string;
    description: string;
    progress: number;
  }>;
  incentives: Incentive[];
  missions: Mission[];
  rewardHistory: Array<{
    id: string;
    type: string;
    title: string;
    earnedAt: string;
  }>;
}

interface IncentivesPanelProps {
  hostId: string;
  propertyId?: string;
}

export default function IncentivesPanel({ hostId, propertyId }: IncentivesPanelProps) {
  // Query: Buscar dados de incentivos
  const { data, isLoading, error } = useQuery<IncentivesData>({
    queryKey: ['host-incentives', hostId, propertyId],
    queryFn: async () => {
      const url = propertyId
        ? `/api/quality/incentives/${hostId}?property_id=${propertyId}`
        : `/api/quality/incentives/${hostId}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error('Erro ao buscar incentivos');
      const result = await response.json();
      return result.data || {
        points: 0,
        level: 'regular',
        availableBadges: [],
        incentives: [],
        missions: [],
        rewardHistory: []
      };
    },
    staleTime: 5 * 60 * 1000
  });

  const getLevelBadge = (level: string) => {
    switch (level) {
      case 'superhost':
        return <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">⭐ SuperHost</Badge>;
      case 'top':
        return <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white">🏆 Top Host</Badge>;
      default:
        return <Badge variant="outline">Host Regular</Badge>;
    }
  };

  const getIncentiveIcon = (type: string) => {
    switch (type) {
      case 'badge':
        return <Award className="h-5 w-5" />;
      case 'discount':
        return <Gift className="h-5 w-5" />;
      case 'badge_highlight':
        return <Star className="h-5 w-5" />;
      case 'priority_support':
        return <Headphones className="h-5 w-5" />;
      case 'boost':
        return <Zap className="h-5 w-5" />;
      default:
        return <Gift className="h-5 w-5" />;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Incentivos e Recompensas</CardTitle>
          <CardDescription>Carregando...</CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error || !data) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center p-12">
          <Gift className="w-12 h-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Erro ao carregar incentivos</h3>
          <p className="text-muted-foreground text-center">
            Não foi possível carregar os incentivos
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Status Geral */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-6 w-6" />
                Status do Host
              </CardTitle>
              <CardDescription>Seu nível e pontos acumulados</CardDescription>
            </div>
            {getLevelBadge(data.level)}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Pontos Acumulados</span>
                <span className="text-lg font-bold">{data.points.toLocaleString('pt-BR')}</span>
              </div>
              {data.nextLevelPoints && (
                <>
                  <Progress 
                    value={(data.points / data.nextLevelPoints) * 100} 
                    className="h-3"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {data.nextLevelPoints - data.points} pontos para o próximo nível
                  </p>
                </>
              )}
            </div>
            {data.leaderboardPosition && (
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Posição no Ranking</span>
                </div>
                <span className="text-lg font-bold">#{data.leaderboardPosition}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Próximos Badges */}
      {data.availableBadges.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Próximos Badges Disponíveis
            </CardTitle>
            <CardDescription>Continue melhorando para conquistar novos badges</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.availableBadges.map((badge) => (
                <div key={badge.id} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="font-semibold">{badge.name}</h4>
                      <p className="text-sm text-muted-foreground">{badge.description}</p>
                    </div>
                    <span className="text-sm font-medium">{Math.round(badge.progress)}%</span>
                  </div>
                  <Progress value={badge.progress} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Missões Temporárias */}
      {data.missions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Missões Temporárias
            </CardTitle>
            <CardDescription>Complete missões para ganhar recompensas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.missions.map((mission) => (
                <div key={mission.id} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="font-semibold">{mission.title}</h4>
                      <p className="text-sm text-muted-foreground mb-2">{mission.description}</p>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-muted-foreground">
                          Progresso: {mission.current} / {mission.target}
                        </span>
                      </div>
                    </div>
                    <Badge variant="outline" className="ml-2">
                      {mission.reward}
                    </Badge>
                  </div>
                  <Progress value={mission.progress} className="h-2 mb-2" />
                  {mission.expiresAt && (
                    <p className="text-xs text-muted-foreground">
                      Expira em {format(new Date(mission.expiresAt), "dd 'de' MMMM", { locale: ptBR })}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recompensas Disponíveis */}
      {data.incentives.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gift className="h-5 w-5" />
              Recompensas Disponíveis
            </CardTitle>
            <CardDescription>Benefícios que você pode aproveitar</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.incentives.map((incentive) => (
                <div
                  key={incentive.id}
                  className={`p-4 border rounded-lg ${
                    incentive.status === 'earned' ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${
                      incentive.status === 'earned' 
                        ? 'bg-green-100 dark:bg-green-900' 
                        : 'bg-muted'
                    }`}>
                      {getIncentiveIcon(incentive.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-semibold">{incentive.title}</h4>
                        {incentive.status === 'earned' && (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{incentive.description}</p>
                      {incentive.type === 'discount' && incentive.value && (
                        <Badge variant="outline" className="mb-2">
                          {incentive.value}% de desconto
                        </Badge>
                      )}
                      {incentive.status === 'earned' && incentive.earnedAt && (
                        <p className="text-xs text-muted-foreground">
                          Ganho em {format(new Date(incentive.earnedAt), "dd/MM/yyyy", { locale: ptBR })}
                        </p>
                      )}
                      {incentive.status === 'available' && (
                        <Button size="sm" variant="outline" className="mt-2">
                          Ativar
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Histórico de Recompensas */}
      {data.rewardHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Histórico de Recompensas
            </CardTitle>
            <CardDescription>Recompensas que você já ganhou</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.rewardHistory.slice(0, 10).map((reward) => (
                <div key={reward.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium">{reward.title}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(reward.earnedAt), "dd/MM/yyyy", { locale: ptBR })}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

