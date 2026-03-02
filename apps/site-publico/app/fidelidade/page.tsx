/**
 * ✅ ITEM 74: FRONTEND DE FIDELIDADE
 * Interface de pontos, histórico e recompensas
 */

"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/components/providers/toast-wrapper';
import { 
  Star, Gift, TrendingUp, History, Award, Coins, 
  ArrowUp, ArrowDown, Clock, CheckCircle, XCircle 
} from '@/lib/lucide-icons';

interface LoyaltyPoints {
  user_id: number;
  current_points: number;
  lifetime_points: number;
  points_redeemed: number;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
  tier_points_required: number;
}

interface LoyaltyTransaction {
  id: number;
  transaction_type: 'earned' | 'redeemed' | 'expired' | 'adjusted' | 'bonus' | 'refund';
  points: number;
  points_before: number;
  points_after: number;
  description?: string;
  reference_type?: string;
  created_at: string;
}

interface LoyaltyReward {
  id: number;
  name: string;
  description?: string;
  points_required: number;
  reward_type: 'discount' | 'free_night' | 'upgrade' | 'cashback' | 'gift' | 'voucher';
  reward_value?: number;
  is_active: boolean;
}

interface LoyaltyRedemption {
  id: number;
  reward_id: number;
  points_used: number;
  reward_value?: number;
  status: 'pending' | 'approved' | 'rejected' | 'used' | 'expired';
  created_at: string;
  reward_name?: string;
  reward_type?: string;
}

const tierConfig = {
  bronze: { name: 'Bronze', color: 'bg-amber-600', min: 0, icon: '🥉' },
  silver: { name: 'Prata', color: 'bg-gray-400', min: 1000, icon: '🥈' },
  gold: { name: 'Ouro', color: 'bg-yellow-500', min: 5000, icon: '🥇' },
  platinum: { name: 'Platina', color: 'bg-blue-500', min: 10000, icon: '💎' },
  diamond: { name: 'Diamante', color: 'bg-purple-500', min: 25000, icon: '💠' },
};

export default function FidelidadePage() {
  const { error: showError, success: showSuccess } = useToast();
  const [points, setPoints] = useState<LoyaltyPoints | null>(null);
  const [transactions, setTransactions] = useState<LoyaltyTransaction[]>([]);
  const [rewards, setRewards] = useState<LoyaltyReward[]>([]);
  const [redemptions, setRedemptions] = useState<LoyaltyRedemption[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRedeemDialog, setShowRedeemDialog] = useState(false);
  const [selectedReward, setSelectedReward] = useState<LoyaltyReward | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadPoints(),
        loadTransactions(),
        loadRewards(),
        loadRedemptions(),
      ]);
    } catch (error: any) {
      showError(error.message || 'Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const loadPoints = async () => {
    try {
      const response = await fetch('/api/loyalty/points');
      const result = await response.json();
      if (result.success) {
        setPoints(result.data);
      }
    } catch (error: any) {
      console.error('Erro ao carregar pontos:', error);
    }
  };

  const loadTransactions = async () => {
    try {
      const response = await fetch('/api/loyalty/history?type=transactions');
      const result = await response.json();
      if (result.success) {
        setTransactions(result.data.transactions || []);
      }
    } catch (error: any) {
      console.error('Erro ao carregar transações:', error);
    }
  };

  const loadRewards = async () => {
    try {
      const response = await fetch('/api/loyalty/rewards');
      const result = await response.json();
      if (result.success) {
        setRewards(result.data || []);
      }
    } catch (error: any) {
      console.error('Erro ao carregar recompensas:', error);
    }
  };

  const loadRedemptions = async () => {
    try {
      const response = await fetch('/api/loyalty/history?type=redemptions');
      const result = await response.json();
      if (result.success) {
        setRedemptions(result.data.redemptions || []);
      }
    } catch (error: any) {
      console.error('Erro ao carregar resgates:', error);
    }
  };

  const handleRedeemReward = async (rewardId: number) => {
    try {
      const response = await fetch(`/api/loyalty/rewards/${rewardId}/redeem`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      const result = await response.json();

      if (result.success) {
        showSuccess('Recompensa resgatada com sucesso!');
        setShowRedeemDialog(false);
        setSelectedReward(null);
        loadData();
      } else {
        showError(result.error || 'Erro ao resgatar recompensa');
      }
    } catch (error: any) {
      showError(error.message || 'Erro ao resgatar recompensa');
    }
  };

  const getTierProgress = () => {
    if (!points) return { current: 0, next: 0, percentage: 0, nextTier: null };

    const tiers = Object.entries(tierConfig).sort((a, b) => a[1].min - b[1].min);
    const currentTierIndex = tiers.findIndex(([key]) => key === points.tier);
    const nextTier = currentTierIndex < tiers.length - 1 ? tiers[currentTierIndex + 1] : null;

    if (!nextTier) {
      return { current: points.current_points, next: 0, percentage: 100, nextTier: null };
    }

    const current = points.current_points - tierConfig[points.tier as keyof typeof tierConfig].min;
    const next = nextTier[1].min - tierConfig[points.tier as keyof typeof tierConfig].min;
    const percentage = Math.min(100, (current / next) * 100);

    return { current, next, percentage, nextTier: nextTier[0] };
  };

  const progress = getTierProgress();
  const currentTier = points ? tierConfig[points.tier as keyof typeof tierConfig] : null;

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center py-12">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Programa de Fidelidade</h1>
        <p className="text-muted-foreground mt-1">Gerencie seus pontos e recompensas</p>
      </div>

      {points && (
        <div className="grid gap-6 md:grid-cols-3 mb-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pontos Atuais</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Coins className="h-8 w-8 text-yellow-500" />
                <div>
                  <div className="text-3xl font-bold">{points.current_points.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground">pontos</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Nível Atual</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Award className={`h-8 w-8 ${currentTier?.color.replace('bg-', 'text-')}`} />
                <div>
                  <div className="text-2xl font-bold">{currentTier?.icon} {currentTier?.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {progress.nextTier ? `Próximo: ${tierConfig[progress.nextTier as keyof typeof tierConfig].name}` : 'Nível máximo'}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Acumulado</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-8 w-8 text-green-500" />
                <div>
                  <div className="text-3xl font-bold">{points.lifetime_points.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground">pontos totais</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {points && progress.nextTier && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Progresso para o Próximo Nível</CardTitle>
            <CardDescription>
              {progress.current.toLocaleString()} / {progress.next.toLocaleString()} pontos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={progress.percentage} className="h-3" />
            <div className="mt-2 text-sm text-muted-foreground">
              Faltam {(progress.next - progress.current).toLocaleString()} pontos para {tierConfig[progress.nextTier as keyof typeof tierConfig].name}
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="rewards" className="space-y-4">
        <TabsList>
          <TabsTrigger value="rewards">Recompensas</TabsTrigger>
          <TabsTrigger value="history">Histórico</TabsTrigger>
          <TabsTrigger value="transactions">Transações</TabsTrigger>
        </TabsList>

        <TabsContent value="rewards" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recompensas Disponíveis</CardTitle>
              <CardDescription>Resgate seus pontos por recompensas incríveis</CardDescription>
            </CardHeader>
            <CardContent>
              {rewards.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhuma recompensa disponível no momento
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {rewards.map((reward) => {
                    const canRedeem = points && points.current_points >= reward.points_required;
                    return (
                      <Card key={reward.id} className={!canRedeem ? 'opacity-60' : ''}>
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <CardTitle className="text-lg">{reward.name}</CardTitle>
                            <Badge variant="outline">{reward.points_required} pts</Badge>
                          </div>
                          {reward.description && (
                            <CardDescription>{reward.description}</CardDescription>
                          )}
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">Tipo:</span>
                              <Badge variant="secondary">
                                {reward.reward_type === 'discount' && 'Desconto'}
                                {reward.reward_type === 'free_night' && 'Noite Grátis'}
                                {reward.reward_type === 'upgrade' && 'Upgrade'}
                                {reward.reward_type === 'cashback' && 'Cashback'}
                                {reward.reward_type === 'gift' && 'Presente'}
                                {reward.reward_type === 'voucher' && 'Voucher'}
                              </Badge>
                            </div>
                            {reward.reward_value && (
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Valor:</span>
                                <span className="font-semibold">R$ {reward.reward_value.toFixed(2)}</span>
                              </div>
                            )}
                            <Button
                              className="w-full"
                              disabled={!canRedeem}
                              onClick={() => {
                                setSelectedReward(reward);
                                setShowRedeemDialog(true);
                              }}
                            >
                              <Gift className="mr-2 h-4 w-4" />
                              {canRedeem ? 'Resgatar' : 'Pontos Insuficientes'}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Resgates</CardTitle>
              <CardDescription>Visualize seus resgates de recompensas</CardDescription>
            </CardHeader>
            <CardContent>
              {redemptions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhum resgate realizado ainda
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Recompensa</TableHead>
                      <TableHead>Pontos</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Data</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {redemptions.map((redemption) => (
                      <TableRow key={redemption.id}>
                        <TableCell>{redemption.reward_name || 'Recompensa'}</TableCell>
                        <TableCell>{redemption.points_used} pts</TableCell>
                        <TableCell>
                          {redemption.reward_value ? `R$ ${redemption.reward_value.toFixed(2)}` : '-'}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              redemption.status === 'approved' || redemption.status === 'used'
                                ? 'default'
                                : redemption.status === 'rejected' || redemption.status === 'expired'
                                ? 'destructive'
                                : 'secondary'
                            }
                          >
                            {redemption.status === 'pending' && 'Pendente'}
                            {redemption.status === 'approved' && 'Aprovado'}
                            {redemption.status === 'rejected' && 'Rejeitado'}
                            {redemption.status === 'used' && 'Usado'}
                            {redemption.status === 'expired' && 'Expirado'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(redemption.created_at).toLocaleDateString('pt-BR')}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Transações</CardTitle>
              <CardDescription>Visualize todas as suas transações de pontos</CardDescription>
            </CardHeader>
            <CardContent>
              {transactions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhuma transação registrada ainda
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Pontos</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Data</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((transaction) => {
                      const isPositive = transaction.points > 0;
                      return (
                        <TableRow key={transaction.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {isPositive ? (
                                <ArrowUp className="h-4 w-4 text-green-500" />
                              ) : (
                                <ArrowDown className="h-4 w-4 text-red-500" />
                              )}
                              <span className="capitalize">
                                {transaction.transaction_type === 'earned' && 'Ganho'}
                                {transaction.transaction_type === 'redeemed' && 'Resgate'}
                                {transaction.transaction_type === 'expired' && 'Expirado'}
                                {transaction.transaction_type === 'adjusted' && 'Ajuste'}
                                {transaction.transaction_type === 'bonus' && 'Bônus'}
                                {transaction.transaction_type === 'refund' && 'Reembolso'}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>{transaction.description || '-'}</TableCell>
                          <TableCell className={isPositive ? 'text-green-600' : 'text-red-600'}>
                            {isPositive ? '+' : ''}{transaction.points}
                          </TableCell>
                          <TableCell>{transaction.points_after.toLocaleString()}</TableCell>
                          <TableCell>
                            {new Date(transaction.created_at).toLocaleDateString('pt-BR')}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={showRedeemDialog} onOpenChange={setShowRedeemDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Resgate</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja resgatar esta recompensa?
            </DialogDescription>
          </DialogHeader>
          {selectedReward && (
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <div className="font-semibold mb-2">{selectedReward.name}</div>
                <div className="text-sm text-muted-foreground">
                  {selectedReward.description}
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-sm">Custo:</span>
                  <span className="font-semibold">{selectedReward.points_required} pontos</span>
                </div>
                {selectedReward.reward_value && (
                  <div className="mt-1 flex items-center justify-between">
                    <span className="text-sm">Valor:</span>
                    <span className="font-semibold">R$ {selectedReward.reward_value.toFixed(2)}</span>
                  </div>
                )}
              </div>
              {points && (
                <div className="text-sm text-muted-foreground">
                  Você terá {points.current_points - selectedReward.points_required} pontos restantes
                </div>
              )}
              <div className="flex gap-2">
                <Button
                  className="flex-1"
                  onClick={() => selectedReward && handleRedeemReward(selectedReward.id)}
                >
                  Confirmar Resgate
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowRedeemDialog(false)}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

