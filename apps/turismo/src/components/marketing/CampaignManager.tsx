import React, { useState, useEffect, useMemo } from 'react';
import { Megaphone, Target, Users, TrendingUp, Calendar, Mail, Share2, BarChart3, Plus, Edit, Trash2, Play, Pause, Eye, Download, Filter, Search, DollarSign, MessageSquare, Bell, Image } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select, SelectOption } from '../components/ui/Select';
import { Modal } from '../components/ui/Modal';
import { Badge } from '../components/ui/Badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/Tabs';
import { cn } from '../../utils/cn';

export interface Campaign {
  id: string;
  name: string;
  description: string;
  type: 'email' | 'social' | 'sms' | 'push' | 'banner';
  status: 'draft' | 'scheduled' | 'active' | 'paused' | 'completed' | 'cancelled';
  targetAudience: string[];
  channels: string[];
  budget: number;
  startDate: Date;
  endDate?: Date;
  createdDate: Date;
  createdBy: string;
  metrics: {
    impressions: number;
    clicks: number;
    conversions: number;
    spend: number;
    roi: number;
    openRate?: number;
    clickRate?: number;
    conversionRate: number;
  };
  content: {
    subject?: string;
    body?: string;
    images?: string[];
    ctaText?: string;
    ctaUrl?: string;
  };
  schedule: {
    frequency: 'once' | 'daily' | 'weekly' | 'monthly';
    time: string;
    timezone: string;
  };
}

export interface CampaignFilters {
  status: string[];
  type: string[];
  dateRange: {
    start: Date | null;
    end: Date | null;
  };
  budgetRange: {
    min: number | null;
    max: number | null;
  };
  createdBy: string;
}

export interface CampaignManagerProps {
  className?: string;
}

const campaignTypeOptions: SelectOption[] = [
  { value: 'email', label: 'Email Marketing', icon: '📧' },
  { value: 'social', label: 'Redes Sociais', icon: '📱' },
  { value: 'sms', label: 'SMS', icon: '💬' },
  { value: 'push', label: 'Push Notification', icon: '🔔' },
  { value: 'banner', label: 'Banner Ads', icon: '🖼️' }
];

const statusOptions: SelectOption[] = [
  { value: 'draft', label: 'Rascunho', icon: '📝' },
  { value: 'scheduled', label: 'Agendada', icon: '⏰' },
  { value: 'active', label: 'Ativa', icon: '▶️' },
  { value: 'paused', label: 'Pausada', icon: '⏸️' },
  { value: 'completed', label: 'Concluída', icon: '✅' },
  { value: 'cancelled', label: 'Cancelada', icon: '❌' }
];

const frequencyOptions: SelectOption[] = [
  { value: 'once', label: 'Uma vez' },
  { value: 'daily', label: 'Diário' },
  { value: 'weekly', label: 'Semanal' },
  { value: 'monthly', label: 'Mensal' }
];

const mockCampaigns: Campaign[] = [
  {
    id: 'camp_001',
    name: 'Pacotes Caldas Novas - Verão 2025',
    description: 'Campanha de verão para pacotes de Caldas Novas com desconto especial',
    type: 'email',
    status: 'active',
    targetAudience: ['clientes_existentes', 'interessados_caldas_novas'],
    channels: ['email', 'whatsapp'],
    budget: 5000,
    startDate: new Date('2025-08-01'),
    endDate: new Date('2025-09-30'),
    createdDate: new Date('2025-07-25'),
    createdBy: 'João Silva',
    metrics: {
      impressions: 15000,
      clicks: 1200,
      conversions: 85,
      spend: 3200,
      roi: 2.8,
      openRate: 24.5,
      clickRate: 8.0,
      conversionRate: 7.1
    },
    content: {
      subject: '🌞 Verão em Caldas Novas - Descontos Imperdíveis!',
      body: 'Aproveite o verão com nossos pacotes especiais...',
      ctaText: 'Reservar Agora',
      ctaUrl: '/pacotes/caldas-novas-verao'
    },
    schedule: {
      frequency: 'weekly',
      time: '10:00',
      timezone: 'America/Sao_Paulo'
    }
  },
  {
    id: 'camp_002',
    name: 'Black Friday Viagens',
    description: 'Campanha de Black Friday com descontos de até 50%',
    type: 'social',
    status: 'scheduled',
    targetAudience: ['todos_usuarios', 'seguidores_redes_sociais'],
    channels: ['facebook', 'instagram', 'google_ads'],
    budget: 15000,
    startDate: new Date('2025-11-20'),
    endDate: new Date('2025-11-30'),
    createdDate: new Date('2025-08-01'),
    createdBy: 'Maria Santos',
    metrics: {
      impressions: 0,
      clicks: 0,
      conversions: 0,
      spend: 0,
      roi: 0,
      conversionRate: 0
    },
    content: {
      subject: 'Black Friday - Até 50% OFF em Viagens!',
      body: 'Prepare-se para as melhores ofertas do ano...',
      ctaText: 'Ver Ofertas',
      ctaUrl: '/black-friday'
    },
    schedule: {
      frequency: 'daily',
      time: '09:00',
      timezone: 'America/Sao_Paulo'
    }
  },
  {
    id: 'camp_003',
    name: 'Lembretes de Viagem',
    description: 'Campanha de lembretes para clientes com viagens próximas',
    type: 'push',
    status: 'active',
    targetAudience: ['clientes_com_viagens_proximas'],
    channels: ['push_notification', 'email'],
    budget: 2000,
    startDate: new Date('2025-07-01'),
    createdDate: new Date('2025-06-15'),
    createdBy: 'Pedro Costa',
    metrics: {
      impressions: 8500,
      clicks: 680,
      conversions: 45,
      spend: 1200,
      roi: 3.2,
      conversionRate: 6.6
    },
    content: {
      subject: 'Sua viagem está chegando! 🧳',
      body: 'Confira os detalhes finais da sua viagem...',
      ctaText: 'Ver Detalhes',
      ctaUrl: '/minhas-viagens'
    },
    schedule: {
      frequency: 'weekly',
      time: '14:00',
      timezone: 'America/Sao_Paulo'
    }
  }
];

const CampaignManager: React.FC<CampaignManagerProps> = ({ className }) => {
  const [campaigns, setCampaigns] = useState<Campaign[]>(mockCampaigns);
  const [filters, setFilters] = useState<CampaignFilters>({
    status: [],
    type: [],
    dateRange: { start: null, end: null },
    budgetRange: { min: null, max: null },
    createdBy: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const filteredCampaigns = useMemo(() => {
    return campaigns.filter(campaign => {
      // Status filter
      if (filters.status.length > 0 && !filters.status.includes(campaign.status)) {
        return false;
      }

      // Type filter
      if (filters.type.length > 0 && !filters.type.includes(campaign.type)) {
        return false;
      }

      // Date range filter
      if (filters.dateRange.start && campaign.startDate < filters.dateRange.start) {
        return false;
      }
      if (filters.dateRange.end && campaign.startDate > filters.dateRange.end) {
        return false;
      }

      // Budget range filter
      if (filters.budgetRange.min && campaign.budget < filters.budgetRange.min) {
        return false;
      }
      if (filters.budgetRange.max && campaign.budget > filters.budgetRange.max) {
        return false;
      }

      // Created by filter
      if (filters.createdBy && !campaign.createdBy.toLowerCase().includes(filters.createdBy.toLowerCase())) {
        return false;
      }

      // Search term
      if (searchTerm && !(
        campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        campaign.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        campaign.id.toLowerCase().includes(searchTerm.toLowerCase())
      )) {
        return false;
      }

      return true;
    });
  }, [campaigns, filters, searchTerm]);

  const paginatedCampaigns = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredCampaigns.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredCampaigns, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredCampaigns.length / itemsPerPage);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-purple-100 text-purple-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <Play className="w-4 h-4" />;
      case 'scheduled': return <Calendar className="w-4 h-4" />;
      case 'draft': return <Edit className="w-4 h-4" />;
      case 'paused': return <Pause className="w-4 h-4" />;
      case 'completed': return <TrendingUp className="w-4 h-4" />;
      case 'cancelled': return <Trash2 className="w-4 h-4" />;
      default: return <Edit className="w-4 h-4" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'email': return <Mail className="w-4 h-4" />;
      case 'social': return <Share2 className="w-4 h-4" />;
      case 'sms': return <MessageSquare className="w-4 h-4" />;
      case 'push': return <Bell className="w-4 h-4" />;
      case 'banner': return <Image className="w-4 h-4" />;
      default: return <Megaphone className="w-4 h-4" />;
    }
  };

  const handleFilterChange = (field: keyof CampaignFilters, value: any) => {
    setFilters(prev => ({ ...prev, [field]: value }));
    setCurrentPage(1);
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleCreateCampaign = () => {
    setSelectedCampaign(null);
    setShowCreateModal(true);
  };

  const handleEditCampaign = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setShowEditModal(true);
  };

  const handleToggleStatus = (campaignId: string, newStatus: string) => {
    setCampaigns(prev => prev.map(c => 
      c.id === campaignId ? { ...c, status: newStatus as any } : c
    ));
  };

  const handleDeleteCampaign = (campaignId: string) => {
    setCampaigns(prev => prev.filter(c => c.id !== campaignId));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestão de Campanhas</h2>
          <p className="text-gray-600">Crie e gerencie suas campanhas de marketing</p>
        </div>
        <Button onClick={handleCreateCampaign} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Nova Campanha
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Buscar
            </label>
            <Input
              placeholder="Nome, descrição..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <Select
              value={filters.status.length > 0 ? { value: filters.status.join(','), label: `${filters.status.length} selecionados` } : null}
              options={statusOptions}
              onChange={(option) => handleFilterChange('status', [option.value])}
              placeholder="Todos os status"
              isMulti
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo
            </label>
            <Select
              value={filters.type.length > 0 ? { value: filters.type.join(','), label: `${filters.type.length} selecionados` } : null}
              options={campaignTypeOptions}
              onChange={(option) => handleFilterChange('type', [option.value])}
              placeholder="Todos os tipos"
              isMulti
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Orçamento Mín
            </label>
            <Input
              type="number"
              placeholder="R$ 0"
              value={filters.budgetRange.min || ''}
              onChange={(e) => handleFilterChange('budgetRange', { ...filters.budgetRange, min: e.target.value ? Number(e.target.value) : null })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Orçamento Máx
            </label>
            <Input
              type="number"
              placeholder="R$ 10000"
              value={filters.budgetRange.max || ''}
              onChange={(e) => handleFilterChange('budgetRange', { ...filters.budgetRange, max: e.target.value ? Number(e.target.value) : null })}
            />
          </div>
        </div>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Megaphone className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total de Campanhas</p>
              <p className="text-xl font-bold text-gray-900">{filteredCampaigns.length}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Play className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Campanhas Ativas</p>
              <p className="text-xl font-bold text-gray-900">
                {filteredCampaigns.filter(c => c.status === 'active').length}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">ROI Médio</p>
              <p className="text-xl font-bold text-gray-900">
                {filteredCampaigns.length > 0 
                  ? `${(filteredCampaigns.reduce((sum, c) => sum + c.metrics.roi, 0) / filteredCampaigns.length).toFixed(1)}x`
                  : '0x'
                }
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Orçamento Total</p>
              <p className="text-xl font-bold text-gray-900">
                {formatCurrency(filteredCampaigns.reduce((sum, c) => sum + c.budget, 0))}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Campaigns Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Campanha
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Orçamento
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Performance
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Período
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedCampaigns.map((campaign) => (
                <tr key={campaign.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{campaign.name}</div>
                      <div className="text-sm text-gray-500">{campaign.description}</div>
                      <div className="text-xs text-gray-400">Criada por {campaign.createdBy}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {getTypeIcon(campaign.type)}
                      <span className="text-sm text-gray-900 capitalize">{campaign.type}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge className={cn('flex items-center gap-1', getStatusColor(campaign.status))}>
                      {getStatusIcon(campaign.status)}
                      {campaign.status === 'active' ? 'Ativa' :
                       campaign.status === 'scheduled' ? 'Agendada' :
                       campaign.status === 'draft' ? 'Rascunho' :
                       campaign.status === 'paused' ? 'Pausada' :
                       campaign.status === 'completed' ? 'Concluída' : 'Cancelada'}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{formatCurrency(campaign.budget)}</div>
                      <div className="text-xs text-gray-500">Gasto: {formatCurrency(campaign.metrics.spend)}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">ROI:</span>
                        <span className={cn('text-xs font-medium', campaign.metrics.roi > 2 ? 'text-green-600' : 'text-red-600')}>
                          {campaign.metrics.roi.toFixed(1)}x
                        </span>
                      </div>
                      {campaign.metrics.openRate && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500">Abertura:</span>
                          <span className="text-xs font-medium text-gray-900">{formatPercentage(campaign.metrics.openRate)}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">Conversão:</span>
                        <span className="text-xs font-medium text-gray-900">{formatPercentage(campaign.metrics.conversionRate)}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>
                      <div>Início: {formatDate(campaign.startDate)}</div>
                      {campaign.endDate && <div>Fim: {formatDate(campaign.endDate)}</div>}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditCampaign(campaign)}
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Editar
                      </Button>
                      {campaign.status === 'active' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleStatus(campaign.id, 'paused')}
                        >
                          <Pause className="w-4 h-4 mr-2" />
                          Pausar
                        </Button>
                      )}
                      {campaign.status === 'paused' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleStatus(campaign.id, 'active')}
                        >
                          <Play className="w-4 h-4 mr-2" />
                          Ativar
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {/* View metrics */}}
                      >
                        <BarChart3 className="w-4 h-4 mr-2" />
                        Métricas
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Próxima
              </Button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Mostrando <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> a{' '}
                  <span className="font-medium">
                    {Math.min(currentPage * itemsPerPage, filteredCampaigns.length)}
                  </span>{' '}
                  de <span className="font-medium">{filteredCampaigns.length}</span> resultados
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={cn(
                        'relative inline-flex items-center px-4 py-2 border text-sm font-medium',
                        page === currentPage
                          ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      )}
                    >
                      {page}
                    </button>
                  ))}
                </nav>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Create/Edit Campaign Modal */}
      <Modal
        isOpen={showCreateModal || showEditModal}
        onClose={() => {
          setShowCreateModal(false);
          setShowEditModal(false);
        }}
        title={selectedCampaign ? 'Editar Campanha' : 'Nova Campanha'}
        size="2xl"
      >
        <div className="space-y-6">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">Básico</TabsTrigger>
              <TabsTrigger value="content">Conteúdo</TabsTrigger>
              <TabsTrigger value="audience">Audiência</TabsTrigger>
              <TabsTrigger value="schedule">Agendamento</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome da Campanha
                  </label>
                  <Input
                    placeholder="Ex: Black Friday 2025"
                    defaultValue={selectedCampaign?.name || ''}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo
                  </label>
                  <Select
                    value={campaignTypeOptions.find(opt => opt.value === selectedCampaign?.type)}
                    options={campaignTypeOptions}
                    onChange={(option) => console.log('Selected:', option)}
                    placeholder="Selecione o tipo"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descrição
                  </label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="Descreva o objetivo e detalhes da campanha..."
                    defaultValue={selectedCampaign?.description || ''}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Orçamento
                  </label>
                  <Input
                    type="number"
                    placeholder="R$ 0,00"
                    defaultValue={selectedCampaign?.budget || ''}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <Select
                    value={statusOptions.find(opt => opt.value === selectedCampaign?.status)}
                    options={statusOptions}
                    onChange={(option) => console.log('Selected:', option)}
                    placeholder="Selecione o status"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="content" className="space-y-4">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Assunto (Email)
                  </label>
                  <Input
                    placeholder="Assunto do email..."
                    defaultValue={selectedCampaign?.content.subject || ''}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Corpo da Mensagem
                  </label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={6}
                    placeholder="Conteúdo da mensagem..."
                    defaultValue={selectedCampaign?.content.body || ''}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Texto do CTA
                    </label>
                    <Input
                      placeholder="Ex: Reservar Agora"
                      defaultValue={selectedCampaign?.content.ctaText || ''}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      URL do CTA
                    </label>
                    <Input
                      placeholder="https://..."
                      defaultValue={selectedCampaign?.content.ctaUrl || ''}
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="audience" className="space-y-4">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Segmentos de Audiência
                  </label>
                  <div className="space-y-2">
                    {['clientes_existentes', 'interessados_caldas_novas', 'novos_usuarios', 'seguidores_redes_sociais'].map((segment) => (
                      <label key={segment} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          className="w-4 h-4 text-blue-600 rounded"
                          defaultChecked={selectedCampaign?.targetAudience.includes(segment)}
                        />
                        <span className="text-sm text-gray-700 capitalize">
                          {segment.replace(/_/g, ' ')}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Canais de Distribuição
                  </label>
                  <div className="space-y-2">
                    {['email', 'whatsapp', 'facebook', 'instagram', 'google_ads', 'push_notification'].map((channel) => (
                      <label key={channel} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          className="w-4 h-4 text-blue-600 rounded"
                          defaultChecked={selectedCampaign?.channels.includes(channel)}
                        />
                        <span className="text-sm text-gray-700 capitalize">
                          {channel.replace(/_/g, ' ')}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="schedule" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Data de Início
                  </label>
                  <Input
                    type="date"
                    defaultValue={selectedCampaign?.startDate.toISOString().split('T')[0] || ''}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Data de Fim (Opcional)
                  </label>
                  <Input
                    type="date"
                    defaultValue={selectedCampaign?.endDate?.toISOString().split('T')[0] || ''}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Frequência
                  </label>
                  <Select
                    value={frequencyOptions.find(opt => opt.value === selectedCampaign?.schedule.frequency)}
                    options={frequencyOptions}
                    onChange={(option) => console.log('Selected:', option)}
                    placeholder="Selecione a frequência"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Horário
                  </label>
                  <Input
                    type="time"
                    defaultValue={selectedCampaign?.schedule.time || '10:00'}
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => {
                setShowCreateModal(false);
                setShowEditModal(false);
              }}
            >
              Cancelar
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700">
              {selectedCampaign ? 'Atualizar' : 'Criar'} Campanha
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export { CampaignManager };
export type { Campaign, CampaignFilters, CampaignManagerProps };
