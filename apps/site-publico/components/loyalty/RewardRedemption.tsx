'use client';

/**
 * Componente: Formulário de Resgate de Recompensa
 * Permite resgatar recompensas e exibe confirmação
 */

import { useState, useEffect } from 'react';
import { 
  Gift, CheckCircle, XCircle, Loader2,
  AlertTriangle, Calendar, Award
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface LoyaltyReward {
  id: number;
  name: string;
  description?: string;
  points_required: number;
  reward_type: string;
  reward_value?: number;
}

interface LoyaltyPoints {
  current_points: number;
}

interface RewardRedemptionProps {
  rewardId: number;
  userId?: number;
  onSuccess?: () => void;
  onCancel?: () => void;
  className?: string;
}

export function RewardRedemption({ 
  rewardId, 
  userId,
  onSuccess,
  onCancel,
  className 
}: RewardRedemptionProps) {
  const [reward, setReward] = useState<LoyaltyReward | null>(null);
  const [userPoints, setUserPoints] = useState<LoyaltyPoints | null>(null);
  const [loading, setLoading] = useState(true);
  const [redeeming, setRedeeming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    fetchData();
  }, [rewardId, userId]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Buscar recompensa
      const rewardResponse = await fetch(`/api/loyalty/rewards/${rewardId}`);
      if (!rewardResponse.ok) {
        throw new Error('Recompensa não encontrada');
      }

      const rewardResult = await rewardResponse.json();
      setReward(rewardResult.data);

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

  const handleRedeem = async () => {
    if (!reward || !userPoints) return;

    setRedeeming(true);
    setError(null);

    try {
      const response = await fetch('/api/loyalty/redemptions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reward_id: reward.id,
          user_id: userId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao resgatar recompensa');
      }

      setSuccess(true);
      setShowConfirm(false);
      
      if (onSuccess) {
        setTimeout(() => {
          onSuccess();
        }, 2000);
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao resgatar recompensa');
    } finally {
      setRedeeming(false);
    }
  };

  const canRedeem = () => {
    if (!reward || !userPoints) return false;
    return userPoints.current_points >= reward.points_required;
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

  if (error && !reward) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (success) {
    return (
      <Card className={className}>
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <CheckCircle className="h-16 w-16 text-green-600 mx-auto" />
            <div>
              <h3 className="text-2xl font-bold">Resgate Confirmado!</h3>
              <p className="text-gray-600 mt-2">
                Sua recompensa foi resgatada com sucesso
              </p>
            </div>
            {reward && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <div className="font-medium">{reward.name}</div>
                <div className="text-sm text-gray-600 mt-1">
                  {reward.description}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!reward) {
    return (
      <Alert>
        <AlertDescription>Recompensa não encontrada</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <Gift className="h-6 w-6" />
            Resgatar Recompensa
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Detalhes da Recompensa */}
          <div className="p-4 bg-gray-50 rounded-lg space-y-3">
            <div>
              <h3 className="font-bold text-lg">{reward.name}</h3>
              {reward.description && (
                <p className="text-sm text-gray-600 mt-1">{reward.description}</p>
              )}
            </div>
            
            {reward.reward_value && (
              <div className="text-2xl font-bold text-primary">
                {formatRewardValue(reward)}
              </div>
            )}

            <div className="flex items-center justify-between pt-2 border-t">
              <span className="text-sm text-gray-600">Pontos necessários:</span>
              <span className="font-bold text-lg">
                {reward.points_required.toLocaleString('pt-BR')}
              </span>
            </div>
          </div>

          {/* Pontos Disponíveis */}
          {userPoints && (
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-600">Seus pontos disponíveis</div>
                  <div className="text-2xl font-bold text-primary mt-1">
                    {userPoints.current_points.toLocaleString('pt-BR')}
                  </div>
                </div>
                <Award className="h-10 w-10 text-primary opacity-20" />
              </div>
            </div>
          )}

          {/* Pontos Restantes após Resgate */}
          {userPoints && canRedeem() && (
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Pontos após resgate:</span>
                <span className="font-bold text-lg text-green-600">
                  {(userPoints.current_points - reward.points_required).toLocaleString('pt-BR')}
                </span>
              </div>
            </div>
          )}

          {/* Erro */}
          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Aviso de Pontos Insuficientes */}
          {userPoints && !canRedeem() && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Você precisa de mais {(
                  reward.points_required - userPoints.current_points
                ).toLocaleString('pt-BR')} pontos para resgatar esta recompensa.
              </AlertDescription>
            </Alert>
          )}

          {/* Botões */}
          <div className="flex gap-3">
            {onCancel && (
              <Button variant="outline" onClick={onCancel} className="flex-1">
                Cancelar
              </Button>
            )}
            <Button
              onClick={() => setShowConfirm(true)}
              disabled={!canRedeem() || redeeming}
              className="flex-1"
            >
              {redeeming ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processando...
                </>
              ) : (
                <>
                  <Gift className="h-4 w-4 mr-2" />
                  Confirmar Resgate
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Dialog de Confirmação */}
      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Resgate</DialogTitle>
            <DialogDescription>
              Você tem certeza que deseja resgatar esta recompensa?
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-2">
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="font-medium">{reward.name}</div>
              <div className="text-sm text-gray-600">
                {reward.points_required.toLocaleString('pt-BR')} pontos serão descontados
              </div>
            </div>
            {userPoints && (
              <div className="text-sm text-gray-600">
                Pontos restantes: {(userPoints.current_points - reward.points_required).toLocaleString('pt-BR')}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirm(false)}>
              Cancelar
            </Button>
            <Button onClick={handleRedeem} disabled={redeeming}>
              {redeeming ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processando...
                </>
              ) : (
                'Confirmar'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

