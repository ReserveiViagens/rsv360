import { Badge } from '@/components/ui/badge';
import type { LoyaltyTier } from '../types';

const tone: Record<LoyaltyTier, 'secondary' | 'success' | 'warning' | 'default'> = {
  Bronze: 'secondary',
  Prata: 'default',
  Ouro: 'warning',
  Diamante: 'success',
};

export function LoyaltyTierBadge({ tier }: { tier: LoyaltyTier }) {
  return <Badge variant={tone[tier]}>{tier}</Badge>;
}
