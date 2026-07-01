'use client';

/**
 * Página de detalhe do cliente CRM
 */

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CustomerProfile } from '@/components/crm/CustomerProfile';
import { CustomerHistory } from '@/components/crm/CustomerHistory';
import { CustomerInteractions } from '@/components/crm/CustomerInteractions';

interface CustomerDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function CustomerDetailPage({ params }: CustomerDetailPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const customerId = parseInt(id, 10);

  if (Number.isNaN(customerId) || customerId <= 0) {
    return (
      <div className="container mx-auto py-6">
        <p className="text-red-600">ID de cliente inválido.</p>
        <Button variant="outline" className="mt-4" onClick={() => router.push('/crm')}>
          Voltar ao CRM
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.push('/crm')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Perfil do Cliente</h1>
          <p className="text-gray-500 text-sm">ID #{customerId}</p>
        </div>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile">Perfil</TabsTrigger>
          <TabsTrigger value="history">Histórico</TabsTrigger>
          <TabsTrigger value="interactions">Interações</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <CustomerProfile customerId={customerId} />
        </TabsContent>

        <TabsContent value="history">
          <CustomerHistory customerId={customerId} />
        </TabsContent>

        <TabsContent value="interactions">
          <CustomerInteractions customerId={customerId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
