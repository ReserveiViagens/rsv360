'use client';

import { MarketingCampaignsPanel } from '@/components/marketing/MarketingCampaignsPanel';

export default function MarketingBroadcastsPage() {
  return (
    <MarketingCampaignsPanel
      title="Broadcasts"
      description="Disparos em massa por e-mail, push ou WhatsApp. Filtre por canal na lista abaixo ou crie uma nova campanha."
      defaultCampaignType="email"
    />
  );
}
