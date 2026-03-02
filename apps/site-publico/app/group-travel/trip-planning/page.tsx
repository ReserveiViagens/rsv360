/**
 * ✅ PÁGINA: TRIP PLANNING
 * Página de planejamento de viagem em grupo
 * 
 * @module app/group-travel/trip-planning/page
 */

'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Users, DollarSign, CheckCircle2, Clock, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { SplitCalculator } from '@/components/group-travel/SplitCalculator';
import { TripInviteModal } from '@/components/group-travel/TripInviteModal';
import { getUser, getToken } from '@/lib/auth';
import { toast } from 'sonner';

interface TripPlan {
  id?: number;
  name: string;
  destination: string;
  start_date: string;
  end_date: string;
  budget?: number;
  participants: Array<{
    id: string;
    name: string;
    email?: string;
  }>;
  status: 'planning' | 'confirmed' | 'completed' | 'cancelled';
}

function TripPlanningContent() {
  const searchParams = useSearchParams();
  const tripId = searchParams?.get('id');
  const [tripPlan, setTripPlan] = useState<TripPlan>({
    name: '',
    destination: '',
    start_date: '',
    end_date: '',
    budget: 0,
    participants: [],
    status: 'planning',
  });
  const [saving, setSaving] = useState(false);
  const user = getUser();
  const token = getToken();

  useEffect(() => {
    if (tripId) {
      loadTripPlan();
    }
  }, [tripId]);

  const loadTripPlan = async () => {
    // Implementar carregamento do plano de viagem
  };

  const handleSave = async () => {
    if (!tripPlan.name.trim() || !tripPlan.destination.trim()) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    try {
      setSaving(true);
      const response = await fetch('/api/trips', {
        method: tripId ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify(tripPlan),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao salvar plano');
      }

      toast.success('Plano de viagem salvo com sucesso!');
    } catch (error: any) {
      toast.error(error.message || 'Erro ao salvar plano');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link href="/group-travel" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-2">
            <ArrowLeft className="w-4 h-4" />
            Voltar para Viagens em Grupo
          </Link>
          <h1 className="text-3xl font-bold">Planejamento de Viagem</h1>
          <p className="text-muted-foreground mt-1">
            Organize sua viagem em grupo com facilidade
          </p>
        </div>
        <div className="flex gap-2">
          <TripInviteModal
            tripName={tripPlan.name}
            trigger={
              <Button variant="outline">
                <Users className="w-4 h-4 mr-2" />
                Convidar Participantes
              </Button>
            }
          />
          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'Salvando...' : 'Salvar Plano'}
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="details" className="space-y-4">
        <TabsList>
          <TabsTrigger value="details">Detalhes</TabsTrigger>
          <TabsTrigger value="participants">Participantes</TabsTrigger>
          <TabsTrigger value="budget">Orçamento</TabsTrigger>
          <TabsTrigger value="timeline">Cronograma</TabsTrigger>
        </TabsList>

        {/* Detalhes */}
        <TabsContent value="details" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Informações da Viagem</CardTitle>
              <CardDescription>
                Preencha os detalhes básicos da sua viagem
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Nome da Viagem *</Label>
                <Input
                  placeholder="Ex: Viagem para Caldas Novas"
                  value={tripPlan.name}
                  onChange={(e) => setTripPlan({ ...tripPlan, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Destino *
                </Label>
                <Input
                  placeholder="Ex: Caldas Novas, GO"
                  value={tripPlan.destination}
                  onChange={(e) => setTripPlan({ ...tripPlan, destination: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Data de Início *
                  </Label>
                  <Input
                    type="date"
                    value={tripPlan.start_date}
                    onChange={(e) => setTripPlan({ ...tripPlan, start_date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Data de Término *
                  </Label>
                  <Input
                    type="date"
                    value={tripPlan.end_date}
                    onChange={(e) => setTripPlan({ ...tripPlan, end_date: e.target.value })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Participantes */}
        <TabsContent value="participants" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Participantes
              </CardTitle>
              <CardDescription>
                Gerencie os participantes da viagem
              </CardDescription>
            </CardHeader>
            <CardContent>
              {tripPlan.participants.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhum participante adicionado ainda</p>
                  <p className="text-sm">Use o botão "Convidar Participantes" para adicionar</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {tripPlan.participants.map((participant) => (
                    <div
                      key={participant.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{participant.name}</p>
                        {participant.email && (
                          <p className="text-sm text-muted-foreground">{participant.email}</p>
                        )}
                      </div>
                      <Badge variant="outline">Participante</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Orçamento */}
        <TabsContent value="budget" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Orçamento
              </CardTitle>
              <CardDescription>
                Defina e divida o orçamento da viagem
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Orçamento Total</Label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={tripPlan.budget || ''}
                  onChange={(e) => setTripPlan({ ...tripPlan, budget: parseFloat(e.target.value) || 0 })}
                />
              </div>
              {tripPlan.budget && tripPlan.budget > 0 && (
                <SplitCalculator
                  totalAmount={tripPlan.budget}
                  participants={tripPlan.participants.map(p => ({
                    id: p.id,
                    name: p.name,
                    email: p.email,
                  }))}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Cronograma */}
        <TabsContent value="timeline" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Cronograma
              </CardTitle>
              <CardDescription>
                Visualize o cronograma da viagem
              </CardDescription>
            </CardHeader>
            <CardContent>
              {tripPlan.start_date && tripPlan.end_date ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                      <div>
                        <p className="font-medium">Check-in</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(tripPlan.start_date).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-blue-500" />
                      <div>
                        <p className="font-medium">Check-out</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(tripPlan.end_date).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Defina as datas de início e término para ver o cronograma</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function TripPlanningPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-64" />
          <div className="h-64 bg-gray-200 rounded" />
        </div>
      </div>
    }>
      <TripPlanningContent />
    </Suspense>
  );
}

