'use client';

/**
 * Componente: Lista de Campanhas (CRM)
 * Lista campanhas com status e métricas básicas
 */

import { useState, useEffect } from 'react';
import { 
  Mail, Plus, Eye, Edit, Trash2, 
  Loader2, TrendingUp, Users, MousePointerClick
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface Campaign {
  id: number;
  name: string;
  description?: string;
  campaign_type: string;
  channel: string;
  status: string;
  total_recipients: number;
  sent_count: number;
  delivered_count: number;
  opened_count: number;
  clicked_count: number;
  converted_count: number;
  scheduled_at?: string;
  started_at?: string;
  completed_at?: string;
  created_at: string;
}

interface CampaignListProps {
  onView?: (campaignId: number) => void;
  onEdit?: (campaignId: number) => void;
  onCreate?: () => void;
  className?: string;
}

export function CampaignList({ 
  onView, 
  onEdit, 
  onCreate,
  className 
}: CampaignListProps) {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    status: '',
    campaign_type: '',
  });

  useEffect(() => {
    fetchCampaigns();
  }, [filters]);

  const fetchCampaigns = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.campaign_type) params.append('campaign_type', filters.campaign_type);

      const response = await fetch(`/api/crm/campaigns?${params.toString()}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao carregar campanhas');
      }

      const result = await response.json();
      setCampaigns(result.data || []);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar campanhas');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      draft: 'bg-gray-100 text-gray-800',
      scheduled: 'bg-blue-100 text-blue-800',
      running: 'bg-green-100 text-green-800',
      paused: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-purple-100 text-purple-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getCampaignTypeIcon = (type: string) => {
    return <Mail className="h-4 w-4" />;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const calculateOpenRate = (campaign: Campaign) => {
    if (campaign.delivered_count === 0) return 0;
    return (campaign.opened_count / campaign.delivered_count) * 100;
  };

  const calculateClickRate = (campaign: Campaign) => {
    if (campaign.delivered_count === 0) return 0;
    return (campaign.clicked_count / campaign.delivered_count) * 100;
  };

  const calculateConversionRate = (campaign: Campaign) => {
    if (campaign.delivered_count === 0) return 0;
    return (campaign.converted_count / campaign.delivered_count) * 100;
  };

  const filteredCampaigns = campaigns;

  if (loading) {
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
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Campanhas de Marketing
            </CardTitle>
            {onCreate && (
              <Button size="sm" onClick={onCreate}>
                <Plus className="h-4 w-4 mr-2" />
                Nova Campanha
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Filtros */}
          <div className="flex items-center gap-2 mb-4">
            <Select
              value={filters.status || 'all'}
              onValueChange={(value) => setFilters({ ...filters, status: value === 'all' ? undefined : value })}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                <SelectItem value="draft">Rascunho</SelectItem>
                <SelectItem value="scheduled">Agendada</SelectItem>
                <SelectItem value="running">Em Execução</SelectItem>
                <SelectItem value="paused">Pausada</SelectItem>
                <SelectItem value="completed">Concluída</SelectItem>
                <SelectItem value="cancelled">Cancelada</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={filters.campaign_type || 'all'}
              onValueChange={(value) => setFilters({ ...filters, campaign_type: value === 'all' ? undefined : value })}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="sms">SMS</SelectItem>
                <SelectItem value="push">Push</SelectItem>
                <SelectItem value="whatsapp">WhatsApp</SelectItem>
                <SelectItem value="social">Social Media</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tabela de Campanhas */}
          {filteredCampaigns.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              Nenhuma campanha encontrada
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Tipo/Canal</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Destinatários</TableHead>
                    <TableHead>Métricas</TableHead>
                    <TableHead>Agendamento</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCampaigns.map((campaign) => (
                    <TableRow key={campaign.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{campaign.name}</div>
                          {campaign.description && (
                            <div className="text-sm text-gray-500 truncate max-w-xs">
                              {campaign.description}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getCampaignTypeIcon(campaign.campaign_type)}
                          <div>
                            <div className="text-sm capitalize">{campaign.campaign_type}</div>
                            <div className="text-xs text-gray-500 capitalize">
                              {campaign.channel}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(campaign.status)}>
                          {campaign.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-sm">
                            <Users className="h-3 w-3" />
                            <span>{campaign.total_recipients}</span>
                          </div>
                          <div className="text-xs text-gray-500">
                            Enviados: {campaign.sent_count}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1 text-sm">
                          <div className="flex items-center gap-1">
                            <TrendingUp className="h-3 w-3 text-green-600" />
                            <span>Abertura: {calculateOpenRate(campaign).toFixed(1)}%</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MousePointerClick className="h-3 w-3 text-blue-600" />
                            <span>Cliques: {calculateClickRate(campaign).toFixed(1)}%</span>
                          </div>
                          <div className="text-xs text-gray-600">
                            Conversão: {calculateConversionRate(campaign).toFixed(1)}%
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {campaign.scheduled_at ? (
                            formatDate(campaign.scheduled_at)
                          ) : (
                            <span className="text-gray-400">Não agendada</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          {onView && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onView(campaign.id)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          )}
                          {onEdit && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onEdit(campaign.id)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

