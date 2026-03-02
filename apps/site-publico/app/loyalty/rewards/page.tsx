'use client';

/**
 * Página de Catálogo de Recompensas
 * Página dedicada para visualização e resgate de recompensas
 */

import { useState } from 'react';
import { RewardsCatalog } from '@/components/loyalty/RewardsCatalog';
import { RewardRedemption } from '@/components/loyalty/RewardRedemption';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function RewardsPage() {
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
        <h1 className="text-3xl font-bold">Catálogo de Recompensas</h1>
        <p className="text-gray-600 mt-2">
          Escolha sua recompensa favorita e resgate com seus pontos
        </p>
      </div>

      <RewardsCatalog onRedeem={handleRedeemReward} />

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

