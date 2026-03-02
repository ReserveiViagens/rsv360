'use client';

/**
 * Página Principal do Programa de Fidelidade
 * Integra componentes de pontos, tiers, transações e recompensas
 */

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LoyaltyPointsDisplay } from '@/components/loyalty/LoyaltyPointsDisplay';
import { LoyaltyTiers } from '@/components/loyalty/LoyaltyTiers';
import { LoyaltyTransactions } from '@/components/loyalty/LoyaltyTransactions';
import { RewardsCatalog } from '@/components/loyalty/RewardsCatalog';
import { MyRewards } from '@/components/loyalty/MyRewards';
import { LoyaltyDashboard } from '@/components/loyalty/LoyaltyDashboard';
import { RewardRedemption } from '@/components/loyalty/RewardRedemption';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function LoyaltyPage() {
  const [selectedRewardId, setSelectedRewardId] = useState<number | null>(null);
  const [showRedemptionDialog, setShowRedemptionDialog] = useState(false);

  const handleRedeemReward = (rewardId: number) => {
    setSelectedRewardId(rewardId);
    setShowRedemptionDialog(true);
  };

  const handleRedemptionSuccess = () => {
    setShowRedemptionDialog(false);
    setSelectedRewardId(null);
    // Recarregar dados se necessário
    window.location.reload();
  };

  const handleRedemptionCancel = () => {
    setShowRedemptionDialog(false);
    setSelectedRewardId(null);
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Programa de Fidelidade</h1>
        <p className="text-gray-600 mt-2">
          Acumule pontos e resgate recompensas incríveis
        </p>
      </div>

      <Tabs defaultValue="dashboard" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="points">Meus Pontos</TabsTrigger>
          <TabsTrigger value="tiers">Níveis</TabsTrigger>
          <TabsTrigger value="rewards">Recompensas</TabsTrigger>
          <TabsTrigger value="my-rewards">Meus Resgates</TabsTrigger>
          <TabsTrigger value="history">Histórico</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          <LoyaltyDashboard />
        </TabsContent>

        <TabsContent value="points">
          <LoyaltyPointsDisplay />
        </TabsContent>

        <TabsContent value="tiers">
          <LoyaltyTiers />
        </TabsContent>

        <TabsContent value="rewards">
          <RewardsCatalog onRedeem={handleRedeemReward} />
        </TabsContent>

        <TabsContent value="my-rewards">
          <MyRewards />
        </TabsContent>

        <TabsContent value="history">
          <LoyaltyTransactions />
        </TabsContent>
      </Tabs>

      {/* Dialog de Resgate */}
      <Dialog open={showRedemptionDialog} onOpenChange={setShowRedemptionDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Resgatar Recompensa</DialogTitle>
          </DialogHeader>
          {selectedRewardId && (
            <RewardRedemption
              rewardId={selectedRewardId}
              onSuccess={handleRedemptionSuccess}
              onCancel={handleRedemptionCancel}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

