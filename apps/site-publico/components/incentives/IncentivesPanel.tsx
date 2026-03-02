/**
 * ✅ FASE 6.4: IncentivesPanel Component
 * 
 * Painel de incentivos e gamification para hosts
 */

'use client';

import React, { useEffect, useState } from 'react';
import { Trophy, Star, Gift, TrendingUp, Award, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';

interface Incentive {
  id: string;
  type: 'badge' | 'points' | 'bonus' | 'discount' | 'feature_unlock';
  title: string;
  description: string;
  value: number;
  earnedAt: Date;
  expiresAt: Date | null;
  status: 'active' | 'used' | 'expired';
}

interface IncentiveProgram {
  id: string;
  name: string;
  description: string;
  type: 'performance' | 'milestone' | 'seasonal' | 'promotional';
  criteria: Record<string, any>;
  reward: {
    type: 'badge' | 'points' | 'bonus' | 'discount';
    value: number;
  };
  active: boolean;
}

interface Props {
  hostId: number;
}

export function IncentivesPanel({ hostId }: Props) {
  const [incentives, setIncentives] = useState<Incentive[]>([]);
  const [totalPoints, setTotalPoints] = useState<number>(0);
  const [programs, setPrograms] = useState<IncentiveProgram[]>([]);
  const [loading, setLoading] = useState(true);
  const [leaderboardPosition, setLeaderboardPosition] = useState<number | null>(null);

  useEffect(() => {
    loadIncentivesData();
  }, [hostId]);

  const loadIncentivesData = async () => {
    try {
      setLoading(true);
      
      const response = await fetch(`/api/quality/incentives/${hostId}`);
      
      if (!response.ok) {
        throw new Error('Erro ao carregar incentivos');
      }
      
      const data = await response.json();
      
      if (data.success) {
        setIncentives(data.incentives || []);
        setTotalPoints(data.points || 0);
        // Programas podem vir de outra API ou ser estáticos
        setPrograms([]);
      }
    } catch (error: any) {
      toast.error(error.message || 'Erro ao carregar incentivos');
    } finally {
      setLoading(false);
    }
  };

  const redeemReward = async (incentiveId: string) => {
    try {
      const response = await fetch(`/api/quality/incentives/${hostId}/redeem`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ incentiveId }),
      });

      if (!response.ok) {
        throw new Error('Erro ao resgatar recompensa');
      }

      toast.success('Recompensa resgatada com sucesso!');
      loadIncentivesData();
    } catch (error: any) {
      toast.error(error.message || 'Erro ao resgatar recompensa');
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-32 bg-gray-200 animate-pulse rounded" />
        <div className="h-64 bg-gray-200 animate-pulse rounded" />
      </div>
    );
  }

  const activeIncentives = incentives.filter(i => i.status === 'active');
  const availableRewards = [
    { id: '1', name: 'Destaque Homepage', cost: 500, description: 'Sua propriedade em destaque na homepage' },
    { id: '2', name: 'Desconto 10% Taxas', cost: 1000, description: 'Desconto de 10% em todas as taxas' },
    { id: '3', name: 'Selo Top Host', cost: 1500, description: 'Badge exclusivo de Top Host' },
    { id: '4', name: 'Suporte Prioritário', cost: 2000, description: 'Suporte com prioridade máxima' },
  ];

  return (
    <div className="space-y-6">
      {/* Leaderboard Position */}
      <Card className="p-6 bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Trophy className="h-6 w-6 text-yellow-500" />
              <h3 className="text-lg font-semibold">Posição no Ranking</h3>
            </div>
            <p className="text-2xl font-bold text-purple-700">
              #{leaderboardPosition || '--'} de todos os hosts
            </p>
            {leaderboardPosition && leaderboardPosition > 1 && (
              <p className="text-sm text-gray-600 mt-1">
                Faltam {leaderboardPosition - 1} posições para o topo!
              </p>
            )}
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-purple-700">{totalPoints}</div>
            <div className="text-sm text-gray-600">Pontos Totais</div>
          </div>
        </div>
      </Card>

      {/* Pontos Acumulados */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Star className="h-5 w-5 text-yellow-500" />
          <h3 className="text-lg font-semibold">Pontos Acumulados</h3>
        </div>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Pontos Atuais</span>
              <span className="font-semibold">{totalPoints} pts</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-yellow-500 h-3 rounded-full transition-all"
                style={{ width: `${Math.min((totalPoints % 1000) / 10, 100)}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Próximo nível em {1000 - (totalPoints % 1000)} pontos
            </p>
          </div>
        </div>
      </Card>

      {/* Incentivos Ativos */}
      {activeIncentives.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Gift className="h-5 w-5 text-green-500" />
            <h3 className="text-lg font-semibold">Incentivos Ativos</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeIncentives.map((incentive) => (
              <div
                key={incentive.id}
                className="p-4 border rounded-lg bg-gradient-to-br from-green-50 to-emerald-50 border-green-200"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-green-900">{incentive.title}</h4>
                    <p className="text-sm text-green-700 mt-1">{incentive.description}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Award className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium text-green-800">
                        {incentive.value} {incentive.type === 'points' ? 'pontos' : 'R$'}
                      </span>
                    </div>
                  </div>
                </div>
                {incentive.expiresAt && (
                  <p className="text-xs text-gray-500 mt-2">
                    Expira em: {new Date(incentive.expiresAt).toLocaleDateString('pt-BR')}
                  </p>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Recompensas Disponíveis */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Target className="h-5 w-5 text-blue-500" />
          <h3 className="text-lg font-semibold">Recompensas Disponíveis</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {availableRewards.map((reward) => (
            <div
              key={reward.id}
              className="p-4 border rounded-lg bg-white hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h4 className="font-semibold">{reward.name}</h4>
                  <p className="text-sm text-gray-600 mt-1">{reward.description}</p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-blue-600">{reward.cost}</div>
                  <div className="text-xs text-gray-500">pontos</div>
                </div>
              </div>
              <Button
                size="sm"
                variant={totalPoints >= reward.cost ? 'default' : 'outline'}
                disabled={totalPoints < reward.cost}
                onClick={() => redeemReward(reward.id)}
                className="w-full mt-2"
              >
                {totalPoints >= reward.cost ? 'Resgatar' : 'Pontos Insuficientes'}
              </Button>
            </div>
          ))}
        </div>
      </Card>

      {/* Histórico de Recompensas */}
      {incentives.filter(i => i.status === 'used').length > 0 && (
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-5 w-5 text-purple-500" />
            <h3 className="text-lg font-semibold">Histórico de Recompensas</h3>
          </div>
          <div className="space-y-3">
            {incentives
              .filter(i => i.status === 'used')
              .map((incentive) => (
                <div
                  key={incentive.id}
                  className="flex items-center justify-between p-3 border rounded-lg bg-gray-50"
                >
                  <div>
                    <p className="font-medium">{incentive.title}</p>
                    <p className="text-sm text-gray-500">
                      Resgatado em {new Date(incentive.earnedAt).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-semibold text-gray-700">
                      {incentive.value} {incentive.type === 'points' ? 'pts' : 'R$'}
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </Card>
      )}
    </div>
  );
}

