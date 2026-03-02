'use client';

/**
 * Página Principal do CRM
 * Integra componentes principais do CRM com layout responsivo
 */

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CRMDashboard } from '@/components/crm/CRMDashboard';
import { CustomerList } from '@/components/crm/CustomerList';
import { CustomerSearch } from '@/components/crm/CustomerSearch';
import { CustomerSegments } from '@/components/crm/CustomerSegments';
import { CampaignList } from '@/components/crm/CampaignList';
import { CampaignForm } from '@/components/crm/CampaignForm';
import { Button } from '@/components/ui/button';
import { Plus, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function CRMPage() {
  const router = useRouter();
  const [showCampaignForm, setShowCampaignForm] = useState(false);
  const [editingCampaignId, setEditingCampaignId] = useState<number | null>(null);

  const handleViewCustomer = (customerId: number) => {
    router.push(`/crm/${customerId}`);
  };

  const handleCreateCampaign = () => {
    setEditingCampaignId(null);
    setShowCampaignForm(true);
  };

  const handleEditCampaign = (campaignId: number) => {
    setEditingCampaignId(campaignId);
    setShowCampaignForm(true);
  };

  const handleCampaignSuccess = () => {
    setShowCampaignForm(false);
    setEditingCampaignId(null);
  };

  const handleCampaignCancel = () => {
    setShowCampaignForm(false);
    setEditingCampaignId(null);
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">CRM</h1>
          <p className="text-gray-500 mt-1">
            Gerenciamento de relacionamento com clientes
          </p>
        </div>
        <div className="flex items-center gap-2">
          <CustomerSearch
            onSelect={(customer) => handleViewCustomer(customer.id)}
            className="w-[300px]"
          />
        </div>
      </div>

      {showCampaignForm ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">
              {editingCampaignId ? 'Editar Campanha' : 'Nova Campanha'}
            </h2>
            <Button variant="ghost" size="sm" onClick={handleCampaignCancel}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <CampaignForm
            campaignId={editingCampaignId || undefined}
            onSuccess={handleCampaignSuccess}
            onCancel={handleCampaignCancel}
          />
        </div>
      ) : (
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList>
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="customers">Clientes</TabsTrigger>
            <TabsTrigger value="segments">Segmentos</TabsTrigger>
            <TabsTrigger value="campaigns">Campanhas</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <CRMDashboard onViewCustomer={handleViewCustomer} />
          </TabsContent>

          <TabsContent value="customers" className="space-y-6">
            <CustomerList
              onViewCustomer={handleViewCustomer}
              onEditCustomer={handleViewCustomer}
            />
          </TabsContent>

          <TabsContent value="segments" className="space-y-6">
            <CustomerSegments />
          </TabsContent>

          <TabsContent value="campaigns" className="space-y-6">
            <div className="flex items-center justify-end mb-4">
              <Button onClick={handleCreateCampaign}>
                <Plus className="h-4 w-4 mr-2" />
                Nova Campanha
              </Button>
            </div>
            <CampaignList
              onView={(id) => {
                // Implementar visualização de campanha
                console.log('View campaign:', id);
              }}
              onEdit={handleEditCampaign}
              onCreate={handleCreateCampaign}
            />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}

