/**
 * ✅ PÁGINA: QUALITY DASHBOARD
 * Dashboard de qualidade do host
 */

'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { QualityDashboard } from '@/components/top-host/QualityDashboard';

export default function QualityDashboardPage() {
  const searchParams = useSearchParams();
  const [hostId, setHostId] = useState<string>(searchParams?.get('host_id') || '');
  const [itemId, setItemId] = useState<string>(searchParams?.get('item_id') || '');
  const [viewingHostId, setViewingHostId] = useState<number | null>(
    hostId ? parseInt(hostId) : null
  );
  const [viewingItemId, setViewingItemId] = useState<number | undefined>(
    itemId ? parseInt(itemId) : undefined
  );

  const handleLoadDashboard = () => {
    if (!hostId) {
      return;
    }
    setViewingHostId(parseInt(hostId));
    setViewingItemId(itemId ? parseInt(itemId) : undefined);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Dashboard de Qualidade</h1>
        <p className="text-muted-foreground">
          Visualize métricas de qualidade e performance dos hosts
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Configuração</CardTitle>
          <CardDescription>Selecione o host para visualizar</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="host_id">ID do Host *</Label>
              <Input
                id="host_id"
                type="number"
                value={hostId}
                onChange={(e) => setHostId(e.target.value)}
                placeholder="Ex: 1"
              />
            </div>
            <div>
              <Label htmlFor="item_id">ID do Item (opcional)</Label>
              <Input
                id="item_id"
                type="number"
                value={itemId}
                onChange={(e) => setItemId(e.target.value)}
                placeholder="Ex: 1"
              />
            </div>
            <div className="flex items-end">
              <Button onClick={handleLoadDashboard} disabled={!hostId} className="w-full">
                Carregar Dashboard
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {viewingHostId && (
        <QualityDashboard hostId={viewingHostId} itemId={viewingItemId} />
      )}
    </div>
  );
}

