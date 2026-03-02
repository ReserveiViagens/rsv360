/**
 * ✅ COMPONENTE: VERIFICATION DASHBOARD (Admin)
 * Dashboard para moderação de verificações de propriedades
 */

'use client';

import { VerificationStatusCard, VerificationLevelBadge, VerificationBadgesList } from './VerificationLevelBadge';
import type { PropertyVerificationStatus } from '@/lib/verification-levels-service';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Shield, Check, X, Eye, Image, Video } from '@/lib/lucide-icons';
import { toast } from 'sonner';

interface VerificationRequest {
  id: number;
  property_id: number;
  property_name: string;
  host_name: string;
  status: string;
  photos: string[];
  video_url?: string;
  created_at: string;
  reviewed_at?: string;
  reviewed_by_name?: string;
  rejection_reason?: string;
  review_notes?: string;
}

export function VerificationDashboard() {
  const [loading, setLoading] = useState(false);
  const [verifications, setVerifications] = useState<VerificationRequest[]>([]);
  const [selectedVerification, setSelectedVerification] = useState<VerificationRequest | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [activeTab, setActiveTab] = useState('pending');

  useEffect(() => {
    loadVerifications();
  }, [activeTab]);

  const loadVerifications = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const status = activeTab === 'all' ? undefined : activeTab;

      const response = await fetch(
        `/api/verification/list?status=${status || ''}`,
        {
          headers: {
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao carregar verificações');
      }

      if (result.success) {
        setVerifications(result.data || []);
      }
    } catch (error: any) {
      toast.error(error.message || 'Erro ao carregar verificações');
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (approved: boolean) => {
    if (!selectedVerification) return;

    if (!approved && !rejectionReason.trim()) {
      toast.error('Motivo da rejeição é obrigatório');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      const response = await fetch('/api/verification/review', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({
          verification_id: selectedVerification.id,
          approved,
          notes: reviewNotes || undefined,
          rejection_reason: rejectionReason || undefined,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao revisar verificação');
      }

      toast.success(approved ? 'Verificação aprovada!' : 'Verificação rejeitada');
      setSelectedVerification(null);
      setReviewNotes('');
      setRejectionReason('');
      loadVerifications();
    } catch (error: any) {
      toast.error(error.message || 'Erro ao revisar verificação');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-600">Pendente</Badge>;
      case 'under_review':
        return <Badge className="bg-blue-600">Em Revisão</Badge>;
      case 'approved':
        return <Badge className="bg-green-600">Aprovado</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejeitado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const filteredVerifications = activeTab === 'all'
    ? verifications
    : verifications.filter((v) => v.status === activeTab);

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Shield className="w-8 h-8" />
          Dashboard de Verificação
        </h1>
        <p className="text-muted-foreground mt-2">
          Revise e modere solicitações de verificação de propriedades
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lista de Verificações */}
        <div className="lg:col-span-2">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="pending">Pendentes</TabsTrigger>
              <TabsTrigger value="under_review">Em Revisão</TabsTrigger>
              <TabsTrigger value="approved">Aprovadas</TabsTrigger>
              <TabsTrigger value="rejected">Rejeitadas</TabsTrigger>
              <TabsTrigger value="all">Todas</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="space-y-4 mt-4">
              {loading ? (
                <Card>
                  <CardContent className="flex items-center justify-center p-12">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                      <p className="text-muted-foreground">Carregando...</p>
                    </div>
                  </CardContent>
                </Card>
              ) : filteredVerifications.length > 0 ? (
                filteredVerifications.map((verification) => (
                  <Card
                    key={verification.id}
                    className={`cursor-pointer hover:shadow-lg transition-shadow ${
                      selectedVerification?.id === verification.id ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => setSelectedVerification(verification)}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle>{verification.property_name}</CardTitle>
                          <CardDescription>
                            Host: {verification.host_name}
                          </CardDescription>
                        </div>
                        {getStatusBadge(verification.status)}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Image className="w-4 h-4" />
                          {verification.photos?.length || 0} fotos
                        </span>
                        {verification.video_url && (
                          <span className="flex items-center gap-1">
                            <Video className="w-4 h-4" />
                            Vídeo
                          </span>
                        )}
                        <span>
                          {new Date(verification.created_at).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center p-12">
                    <Shield className="w-12 h-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">
                      Nenhuma verificação encontrada
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Painel de Revisão */}
        <div className="lg:col-span-1">
          {selectedVerification ? (
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Revisar Verificação</CardTitle>
                <CardDescription>
                  {selectedVerification.property_name}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Fotos */}
                {selectedVerification.photos && selectedVerification.photos.length > 0 && (
                  <div>
                    <Label>Fotos</Label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {selectedVerification.photos.map((photo, index) => (
                        <img
                          key={index}
                          src={photo}
                          alt={`Foto ${index + 1}`}
                          className="w-full h-24 object-cover rounded"
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Vídeo */}
                {selectedVerification.video_url && (
                  <div>
                    <Label>Vídeo</Label>
                    <video
                      src={selectedVerification.video_url}
                      controls
                      className="w-full rounded mt-2"
                    />
                  </div>
                )}

                {/* Notas de Revisão */}
                {selectedVerification.status === 'pending' || selectedVerification.status === 'under_review' ? (
                  <>
                    <div>
                      <Label>Notas de Revisão (Opcional)</Label>
                      <Textarea
                        value={reviewNotes}
                        onChange={(e) => setReviewNotes(e.target.value)}
                        placeholder="Adicione notas sobre a verificação..."
                        rows={3}
                      />
                    </div>

                    <div>
                      <Label>Motivo da Rejeição (se rejeitar)</Label>
                      <Textarea
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        placeholder="Explique o motivo da rejeição..."
                        rows={3}
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleReview(true)}
                        disabled={loading}
                        className="flex-1 bg-green-600 hover:bg-green-700"
                      >
                        <Check className="w-4 h-4 mr-2" />
                        Aprovar
                      </Button>
                      <Button
                        onClick={() => handleReview(false)}
                        disabled={loading || !rejectionReason.trim()}
                        variant="destructive"
                        className="flex-1"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Rejeitar
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="space-y-2">
                    {selectedVerification.reviewed_by_name && (
                      <p className="text-sm">
                        <strong>Revisado por:</strong> {selectedVerification.reviewed_by_name}
                      </p>
                    )}
                    {selectedVerification.review_notes && (
                      <p className="text-sm">
                        <strong>Notas:</strong> {selectedVerification.review_notes}
                      </p>
                    )}
                    {selectedVerification.rejection_reason && (
                      <p className="text-sm text-red-600">
                        <strong>Motivo:</strong> {selectedVerification.rejection_reason}
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-12">
                <Eye className="w-12 h-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground text-center">
                  Selecione uma verificação para revisar
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

