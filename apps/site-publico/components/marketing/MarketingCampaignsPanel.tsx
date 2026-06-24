'use client';

import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { CampaignList } from '@/components/crm/CampaignList';
import { CampaignForm } from '@/components/crm/CampaignForm';
import { Button } from '@/components/ui/button';
import { MarketingPageHeader } from './MarketingPageHeader';

type MarketingCampaignsPanelProps = {
  title?: string;
  description?: string;
  defaultCampaignType?: string;
};

export function MarketingCampaignsPanel({
  title = 'Campanhas',
  description = 'Gerencie campanhas de e-mail, push, SMS e WhatsApp via API CRM.',
  defaultCampaignType,
}: MarketingCampaignsPanelProps) {
  const [showCampaignForm, setShowCampaignForm] = useState(false);
  const [editingCampaignId, setEditingCampaignId] = useState<number | null>(null);

  const handleCreateCampaign = () => {
    setEditingCampaignId(null);
    setShowCampaignForm(true);
  };

  const handleEditCampaign = (campaignId: number) => {
    setEditingCampaignId(campaignId);
    setShowCampaignForm(true);
  };

  const handleCloseForm = () => {
    setShowCampaignForm(false);
    setEditingCampaignId(null);
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <MarketingPageHeader
        title={title}
        description={description}
        action={
          !showCampaignForm ? (
            <Button onClick={handleCreateCampaign}>
              <Plus className="mr-2 h-4 w-4" />
              Nova campanha
            </Button>
          ) : null
        }
      />

      {showCampaignForm ? (
        <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              {editingCampaignId ? 'Editar campanha' : 'Nova campanha'}
            </h2>
            <Button variant="ghost" size="sm" onClick={handleCloseForm}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <CampaignForm
            campaignId={editingCampaignId ?? undefined}
            onSuccess={handleCloseForm}
            onCancel={handleCloseForm}
          />
        </div>
      ) : (
        <CampaignList
          onEdit={handleEditCampaign}
          onCreate={handleCreateCampaign}
          defaultCampaignType={defaultCampaignType}
        />
      )}
    </div>
  );
}
