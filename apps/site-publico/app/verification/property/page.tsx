/**
 * ✅ PÁGINA: PROPERTY VERIFICATION (Público)
 * Página pública para solicitar verificação de propriedade
 * 
 * @module app/verification/property/page
 */

'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { PhotoUploader } from '@/components/verification/PhotoUploader';
import { CheckCircle2, Clock, XCircle, Camera, MapPin, Building, AlertCircle, Info } from 'lucide-react';
import { getUser, getToken } from '@/lib/auth';
import { toast } from 'sonner';
import Link from 'next/link';

interface VerificationRequest {
  id?: number;
  property_id?: number;
  property_name?: string;
  verification_level: 'basic' | 'premium' | 'verified';
  status: 'pending' | 'in_review' | 'approved' | 'rejected';
  photos: Array<{ id: string; url: string }>;
  notes?: string;
}

function PropertyVerificationContent() {
  const searchParams = useSearchParams();
  const propertyId = searchParams?.get('property_id');
  const [verificationRequest, setVerificationRequest] = useState<VerificationRequest>({
    verification_level: 'basic',
    status: 'pending',
    photos: [],
  });
  const [submitting, setSubmitting] = useState(false);
  const [property, setProperty] = useState<any>(null);
  const user = getUser();
  const token = getToken();

  useEffect(() => {
    if (propertyId) {
      loadProperty();
      loadExistingRequest();
    }
  }, [propertyId]);

  const loadProperty = async () => {
    if (!propertyId) return;

    try {
      const response = await fetch(`/api/properties/${propertyId}`);
      const result = await response.json();

      if (result.success) {
        setProperty(result.data);
        setVerificationRequest(prev => ({
          ...prev,
          property_id: parseInt(propertyId),
          property_name: result.data.name,
        }));
      }
    } catch (error: any) {
      toast.error('Erro ao carregar propriedade');
    }
  };

  const loadExistingRequest = async () => {
    if (!propertyId || !token) return;

    try {
      const response = await fetch(`/api/verification/status?property_id=${propertyId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          setVerificationRequest(result.data);
        }
      }
    } catch (error) {
      // Ignorar erro - pode não ter solicitação ainda
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (verificationRequest.photos.length === 0) {
      toast.error('Adicione pelo menos uma foto');
      return;
    }

    try {
      setSubmitting(true);
      const response = await fetch('/api/verification/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({
          property_id: verificationRequest.property_id,
          verification_level: verificationRequest.verification_level,
          photos: verificationRequest.photos.map(p => p.url),
          notes: verificationRequest.notes,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao enviar solicitação');
      }

      toast.success('Solicitação de verificação enviada com sucesso!');
      setVerificationRequest(prev => ({ ...prev, status: 'pending' }));
    } catch (error: any) {
      toast.error(error.message || 'Erro ao enviar solicitação');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = () => {
    switch (verificationRequest.status) {
      case 'approved':
        return <Badge className="bg-green-500"><CheckCircle2 className="w-3 h-3 mr-1" /> Aprovado</Badge>;
      case 'in_review':
        return <Badge className="bg-blue-500"><Clock className="w-3 h-3 mr-1" /> Em Análise</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" /> Rejeitado</Badge>;
      default:
        return <Badge variant="outline"><Clock className="w-3 h-3 mr-1" /> Pendente</Badge>;
    }
  };

  const getVerificationLevelInfo = (level: string) => {
    switch (level) {
      case 'basic':
        return {
          name: 'Básica',
          description: 'Verificação básica com fotos da propriedade',
          requirements: ['Fotos externas', 'Fotos internas principais'],
        };
      case 'premium':
        return {
          name: 'Premium',
          description: 'Verificação completa com mais detalhes',
          requirements: ['Fotos externas', 'Fotos internas', 'Fotos de todas as áreas', 'Documentos'],
        };
      case 'verified':
        return {
          name: 'Verificado',
          description: 'Verificação completa com inspeção',
          requirements: ['Todas as fotos', 'Documentos completos', 'Inspeção presencial'],
        };
      default:
        return { name: '', description: '', requirements: [] };
    }
  };

  const levelInfo = getVerificationLevelInfo(verificationRequest.verification_level);

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Verificação de Propriedade</h1>
        <p className="text-muted-foreground">
          Solicite a verificação da sua propriedade para aumentar a confiança dos hóspedes
        </p>
      </div>

      {/* Status Existente */}
      {verificationRequest.id && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Status da Solicitação</p>
                <div className="flex items-center gap-2 mt-1">
                  {getStatusBadge()}
                  {verificationRequest.id && (
                    <span className="text-sm text-muted-foreground">
                      ID: #{verificationRequest.id}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Informações da Propriedade */}
      {property && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="w-5 h-5" />
              Propriedade
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="font-semibold">{property.name}</p>
              {property.address_city && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  {property.address_city}, {property.address_state}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Formulário de Verificação */}
      {verificationRequest.status !== 'approved' && (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Nível de Verificação */}
          <Card>
            <CardHeader>
              <CardTitle>Nível de Verificação</CardTitle>
              <CardDescription>
                Escolha o nível de verificação desejado
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select
                value={verificationRequest.verification_level}
                onValueChange={(value) => setVerificationRequest({
                  ...verificationRequest,
                  verification_level: value as any,
                })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="basic">
                    <div>
                      <div className="font-medium">Básica</div>
                      <div className="text-xs text-muted-foreground">
                        Verificação básica com fotos
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value="premium">
                    <div>
                      <div className="font-medium">Premium</div>
                      <div className="text-xs text-muted-foreground">
                        Verificação completa
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value="verified">
                    <div>
                      <div className="font-medium">Verificado</div>
                      <div className="text-xs text-muted-foreground">
                        Verificação completa + inspeção
                      </div>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>

              {/* Informações do Nível */}
              <Card className="bg-muted">
                <CardContent className="pt-6">
                  <div className="space-y-2">
                    <p className="font-medium">{levelInfo.name}</p>
                    <p className="text-sm text-muted-foreground">{levelInfo.description}</p>
                    <div className="pt-2">
                      <p className="text-sm font-medium mb-2">Requisitos:</p>
                      <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                        {levelInfo.requirements.map((req, idx) => (
                          <li key={idx}>{req}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>

          {/* Upload de Fotos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="w-5 h-5" />
                Fotos da Propriedade
              </CardTitle>
              <CardDescription>
                Adicione fotos de qualidade da sua propriedade
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PhotoUploader
                maxPhotos={20}
                maxSizeMB={10}
                verificationType="property"
                onUploadComplete={(photos) => {
                  setVerificationRequest(prev => ({
                    ...prev,
                    photos: photos.map(p => ({ id: p.id, url: p.url || p.preview })),
                  }));
                }}
              />
            </CardContent>
          </Card>

          {/* Observações */}
          <Card>
            <CardHeader>
              <CardTitle>Observações Adicionais</CardTitle>
              <CardDescription>
                Adicione informações relevantes sobre a propriedade
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Informações adicionais sobre a propriedade, características especiais, etc."
                value={verificationRequest.notes || ''}
                onChange={(e) => setVerificationRequest({
                  ...verificationRequest,
                  notes: e.target.value,
                })}
                rows={4}
              />
            </CardContent>
          </Card>

          {/* Informações */}
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-medium text-blue-900">Sobre a Verificação</p>
                  <p className="text-sm text-blue-800">
                    Nossa equipe revisará sua solicitação em até 48 horas. Propriedades verificadas recebem um badge especial
                    e aparecem com destaque nas buscas, aumentando a confiança dos hóspedes e as chances de reserva.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Botão de Envio */}
          <Button type="submit" className="w-full" size="lg" disabled={submitting}>
            {submitting ? 'Enviando...' : 'Enviar Solicitação de Verificação'}
          </Button>
        </form>
      )}

      {/* Propriedade Já Verificada */}
      {verificationRequest.status === 'approved' && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
              <div className="space-y-1">
                <p className="font-medium text-green-900">Propriedade Verificada</p>
                <p className="text-sm text-green-800">
                  Sua propriedade já está verificada! Ela aparece com destaque nas buscas e possui um badge de verificação.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function PropertyVerificationPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-64" />
          <div className="h-64 bg-gray-200 rounded" />
        </div>
      </div>
    }>
      <PropertyVerificationContent />
    </Suspense>
  );
}

