'use client';

/**
 * Componente: Formulário de Campanha (CRM)
 * Formulário de criação/edição de campanha com seleção de segmento e canal
 */

import { useState, useEffect } from 'react';
import { 
  Save, X, Loader2, Mail, Calendar, DollarSign
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Segment {
  id: number;
  name: string;
  customer_count: number;
}

interface CampaignFormProps {
  campaignId?: number;
  onSuccess?: () => void;
  onCancel?: () => void;
  className?: string;
}

export function CampaignForm({ 
  campaignId, 
  onSuccess, 
  onCancel,
  className 
}: CampaignFormProps) {
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(!!campaignId);
  const [error, setError] = useState<string | null>(null);
  const [segments, setSegments] = useState<Segment[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    campaign_type: 'email',
    channel: 'email',
    target_segment_id: undefined as number | undefined,
    target_criteria: {} as any,
    subject: '',
    message: '',
    template_id: '',
    status: 'draft',
    scheduled_at: '',
    budget: undefined as number | undefined,
  });

  useEffect(() => {
    fetchSegments();
    if (campaignId) {
      fetchCampaign();
    }
  }, [campaignId]);

  const fetchSegments = async () => {
    try {
      const response = await fetch('/api/crm/segments?is_active=true');
      if (response.ok) {
        const result = await response.json();
        setSegments(result.data || []);
      }
    } catch (err) {
      console.error('Erro ao carregar segmentos:', err);
    }
  };

  const fetchCampaign = async () => {
    setLoadingData(true);
    try {
      const response = await fetch(`/api/crm/campaigns/${campaignId}`);
      if (!response.ok) {
        throw new Error('Erro ao carregar campanha');
      }
      const result = await response.json();
      const campaign = result.data;
      
      setFormData({
        name: campaign.name || '',
        description: campaign.description || '',
        campaign_type: campaign.campaign_type || 'email',
        channel: campaign.channel || 'email',
        target_segment_id: campaign.target_segment_id || undefined,
        target_criteria: typeof campaign.target_criteria === 'string'
          ? JSON.parse(campaign.target_criteria || '{}')
          : campaign.target_criteria || {},
        subject: campaign.subject || '',
        message: campaign.message || '',
        template_id: campaign.template_id || '',
        status: campaign.status || 'draft',
        scheduled_at: campaign.scheduled_at
          ? new Date(campaign.scheduled_at).toISOString().slice(0, 16)
          : '',
        budget: campaign.budget || undefined,
      });
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar campanha');
    } finally {
      setLoadingData(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const url = campaignId
        ? `/api/crm/campaigns/${campaignId}`
        : '/api/crm/campaigns';

      const method = campaignId ? 'PUT' : 'POST';

      const payload = {
        ...formData,
        target_segment_id: formData.target_segment_id || null,
        scheduled_at: formData.scheduled_at || null,
        budget: formData.budget || null,
      };

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao salvar campanha');
      }

      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar campanha');
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">
            {campaignId ? 'Editar Campanha' : 'Nova Campanha'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Informações Básicas */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Informações Básicas</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nome da Campanha *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                    placeholder="ex.: Promoção de Verão 2025"
                  />
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) =>
                      setFormData({ ...formData, status: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Rascunho</SelectItem>
                      <SelectItem value="scheduled">Agendada</SelectItem>
                      <SelectItem value="running">Em Execução</SelectItem>
                      <SelectItem value="paused">Pausada</SelectItem>
                      <SelectItem value="completed">Concluída</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Descrição da campanha"
                  rows={3}
                />
              </div>
            </div>

            {/* Tipo e Canal */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Tipo e Canal</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="campaign_type">Tipo de Campanha *</Label>
                  <Select
                    value={formData.campaign_type}
                    onValueChange={(value) =>
                      setFormData({ ...formData, campaign_type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="sms">SMS</SelectItem>
                      <SelectItem value="push">Push Notification</SelectItem>
                      <SelectItem value="whatsapp">WhatsApp</SelectItem>
                      <SelectItem value="social">Social Media</SelectItem>
                      <SelectItem value="display">Display</SelectItem>
                      <SelectItem value="retargeting">Retargeting</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="channel">Canal *</Label>
                  <Select
                    value={formData.channel}
                    onValueChange={(value) =>
                      setFormData({ ...formData, channel: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="sms">SMS</SelectItem>
                      <SelectItem value="whatsapp">WhatsApp</SelectItem>
                      <SelectItem value="web">Web</SelectItem>
                      <SelectItem value="app">App</SelectItem>
                      <SelectItem value="social_media">Social Media</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Segmentação */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Segmentação</h3>
              
              <div>
                <Label htmlFor="target_segment_id">Segmento Alvo</Label>
                <Select
                  value={formData.target_segment_id?.toString() || 'none'}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      target_segment_id: value === 'none' ? undefined : parseInt(value),
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um segmento (opcional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Nenhum segmento específico</SelectItem>
                    {segments.map((segment) => (
                      <SelectItem key={segment.id} value={segment.id.toString()}>
                        {segment.name} ({segment.customer_count} clientes)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Conteúdo */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Conteúdo</h3>
              
              <div>
                <Label htmlFor="subject">Assunto</Label>
                <Input
                  id="subject"
                  value={formData.subject}
                  onChange={(e) =>
                    setFormData({ ...formData, subject: e.target.value })
                  }
                  placeholder="Assunto da mensagem"
                />
              </div>

              <div>
                <Label htmlFor="message">Mensagem *</Label>
                <Textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) =>
                    setFormData({ ...formData, message: e.target.value })
                  }
                  required
                  placeholder="Conteúdo da campanha"
                  rows={6}
                />
              </div>
            </div>

            {/* Agendamento e Orçamento */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Agendamento e Orçamento</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="scheduled_at">Data/Hora de Envio</Label>
                  <Input
                    id="scheduled_at"
                    type="datetime-local"
                    value={formData.scheduled_at}
                    onChange={(e) =>
                      setFormData({ ...formData, scheduled_at: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="budget">Orçamento (R$)</Label>
                  <Input
                    id="budget"
                    type="number"
                    step="0.01"
                    value={formData.budget || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        budget: e.target.value ? parseFloat(e.target.value) : undefined,
                      })
                    }
                    placeholder="0.00"
                    min="0"
                  />
                </div>
              </div>
            </div>

            {/* Botões */}
            <div className="flex items-center justify-end gap-2 pt-4 border-t">
              {onCancel && (
                <Button type="button" variant="outline" onClick={onCancel}>
                  <X className="h-4 w-4 mr-2" />
                  Cancelar
                </Button>
              )}
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Salvar Campanha
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

