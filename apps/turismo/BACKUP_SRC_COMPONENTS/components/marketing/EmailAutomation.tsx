import React, { useState, useEffect, useMemo } from 'react';
import { Mail, Plus, Edit, Trash2, Play, Pause, Eye, Download, Filter, Search, Calendar, Users, Target, BarChart3, Clock, CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select, SelectOption } from '../components/ui/Select';
import { Modal } from '../components/ui/Modal';
import { Badge } from '../components/ui/Badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/Tabs';
import { cn } from '../../utils/cn';

export interface EmailAutomation {
  id: string;
  name: string;
  type: 'welcome' | 'abandoned_cart' | 'follow_up' | 'newsletter' | 'promotional' | 'custom';
  status: 'active' | 'paused' | 'draft' | 'completed';
  trigger: 'immediate' | 'scheduled' | 'event_based' | 'sequence';
  audience: string;
  subject: string;
  sentCount: number;
  openRate: number;
  clickRate: number;
  conversionRate: number;
  createdAt: string;
  lastSent: string;
  nextScheduled: string;
  createdBy: string;
}

export interface EmailAutomationFilters {
  type: string;
  status: string;
  trigger: string;
  dateRange: string;
  search: string;
}

export interface EmailAutomationProps {
  className?: string;
}

const automationTypeOptions: SelectOption[] = [
  { value: 'welcome', label: 'E-mail de Boas-vindas' },
  { value: 'abandoned_cart', label: 'Carrinho Abandonado' },
  { value: 'follow_up', label: 'Follow-up' },
  { value: 'newsletter', label: 'Newsletter' },
  { value: 'promotional', label: 'Promocional' },
  { value: 'custom', label: 'Personalizado' }
];

const statusOptions: SelectOption[] = [
  { value: 'active', label: 'Ativa' },
  { value: 'paused', label: 'Pausada' },
  { value: 'draft', label: 'Rascunho' },
  { value: 'completed', label: 'Concluída' }
];

const triggerOptions: SelectOption[] = [
  { value: 'immediate', label: 'Imediato' },
  { value: 'scheduled', label: 'Agendado' },
  { value: 'event_based', label: 'Baseado em Evento' },
  { value: 'sequence', label: 'Sequência' }
];

const mockAutomations: EmailAutomation[] = [
  {
    id: '1',
    name: 'Boas-vindas para Novos Clientes',
    type: 'welcome',
    status: 'active',
    trigger: 'event_based',
    audience: 'Novos clientes',
    subject: 'Bem-vindo à RSV! 🎉',
    sentCount: 1247,
    openRate: 68.5,
    clickRate: 23.1,
    conversionRate: 8.7,
    createdAt: '2024-01-15',
    lastSent: '2024-08-04',
    nextScheduled: '2024-08-05',
    createdBy: 'João Silva'
  },
  {
    id: '2',
    name: 'Carrinho Abandonado',
    type: 'abandoned_cart',
    status: 'active',
    trigger: 'event_based',
    audience: 'Clientes com carrinho abandonado',
    subject: 'Complete sua compra! 🛒',
    sentCount: 892,
    openRate: 45.2,
    clickRate: 18.9,
    conversionRate: 12.3,
    createdAt: '2024-02-20',
    lastSent: '2024-08-04',
    nextScheduled: '2024-08-06',
    createdBy: 'Maria Santos'
  },
  {
    id: '3',
    name: 'Newsletter Semanal',
    type: 'newsletter',
    status: 'active',
    trigger: 'scheduled',
    audience: 'Todos os inscritos',
    subject: 'Novidades da semana! 📰',
    sentCount: 2156,
    openRate: 52.8,
    clickRate: 15.4,
    conversionRate: 4.2,
    createdAt: '2024-01-10',
    lastSent: '2024-08-01',
    nextScheduled: '2024-08-08',
    createdBy: 'João Silva'
  },
  {
    id: '4',
    name: 'Follow-up Pós-Compra',
    type: 'follow_up',
    status: 'paused',
    trigger: 'sequence',
    audience: 'Clientes que compraram',
    subject: 'Como está sua experiência? ⭐',
    sentCount: 567,
    openRate: 71.3,
    clickRate: 28.7,
    conversionRate: 6.8,
    createdAt: '2024-03-05',
    lastSent: '2024-07-28',
    nextScheduled: '2024-08-10',
    createdBy: 'Pedro Costa'
  },
  {
    id: '5',
    name: 'Promoção Black Friday',
    type: 'promotional',
    status: 'draft',
    trigger: 'scheduled',
    audience: 'Clientes VIP',
    subject: 'Black Friday: Ofertas Exclusivas! 🔥',
    sentCount: 0,
    openRate: 0,
    clickRate: 0,
    conversionRate: 0,
    createdAt: '2024-08-01',
    lastSent: '-',
    nextScheduled: '2024-11-29',
    createdBy: 'Maria Santos'
  }
];

const EmailAutomation: React.FC<EmailAutomationProps> = ({ className }) => {
  const [automations, setAutomations] = useState<EmailAutomation[]>(mockAutomations);
  const [filters, setFilters] = useState<EmailAutomationFilters>({
    type: '',
    status: '',
    trigger: '',
    dateRange: '',
    search: ''
  });
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedAutomation, setSelectedAutomation] = useState<EmailAutomation | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const filteredAutomations = useMemo(() => {
    return automations.filter(automation => {
      const matchesType = !filters.type || automation.type === filters.type;
      const matchesStatus = !filters.status || automation.status === filters.status;
      const matchesTrigger = !filters.trigger || automation.trigger === filters.trigger;
      const matchesSearch = !filters.search || 
        automation.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        automation.subject.toLowerCase().includes(filters.search.toLowerCase()) ||
        automation.audience.toLowerCase().includes(filters.search.toLowerCase());

      return matchesType && matchesStatus && matchesTrigger && matchesSearch;
    });
  }, [automations, filters]);

  const paginatedAutomations = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAutomations.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAutomations, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredAutomations.length / itemsPerPage);

  const handleCreateAutomation = () => {
    setSelectedAutomation(null);
    setIsCreateModalOpen(true);
  };

  const handleEditAutomation = (automation: EmailAutomation) => {
    setSelectedAutomation(automation);
    setIsEditModalOpen(true);
  };

  const handleViewAutomation = (automation: EmailAutomation) => {
    setSelectedAutomation(automation);
    setIsViewModalOpen(true);
  };

  const handleToggleStatus = (automation: EmailAutomation) => {
    setAutomations(prev => prev.map(a => 
      a.id === automation.id 
        ? { ...a, status: a.status === 'active' ? 'paused' : 'active' }
        : a
    ));
  };

  const handleDeleteAutomation = (automation: EmailAutomation) => {
    setAutomations(prev => prev.filter(a => a.id !== automation.id));
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      active: 'success',
      paused: 'warning',
      draft: 'info',
      completed: 'secondary'
    } as const;
    return <Badge variant={variants[status as keyof typeof variants]}>{statusOptions.find(s => s.value === status)?.label}</Badge>;
  };

  const getTypeIcon = (type: string) => {
    const icons = {
      welcome: '👋',
      abandoned_cart: '🛒',
      follow_up: '📧',
      newsletter: '📰',
      promotional: '🔥',
      custom: '⚙️'
    };
    return icons[type as keyof typeof icons] || '📧';
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Automação de E-mails</h2>
          <p className="text-gray-600">Gerencie campanhas automatizadas de e-mail</p>
        </div>
        <Button onClick={handleCreateAutomation} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Nova Automação
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total de Automações</p>
              <p className="text-2xl font-bold text-gray-900">{automations.length}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <Mail className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Ativas</p>
              <p className="text-2xl font-bold text-gray-900">
                {automations.filter(a => a.status === 'active').length}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Taxa Média de Abertura</p>
              <p className="text-2xl font-bold text-gray-900">
                {Math.round(automations.reduce((acc, a) => acc + a.openRate, 0) / automations.length)}%
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <BarChart3 className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Enviados</p>
              <p className="text-2xl font-bold text-gray-900">
                {automations.reduce((acc, a) => acc + a.sentCount, 0).toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-orange-100 rounded-full">
              <Users className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tipo</label>
            <Select
              value={filters.type}
              onValueChange={(value) => setFilters(prev => ({ ...prev, type: value }))}
              placeholder="Todos os tipos"
            >
              {automationTypeOptions.map(option => (
                <SelectOption key={option.value} value={option.value}>
                  {option.label}
                </SelectOption>
              ))}
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <Select
              value={filters.status}
              onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
              placeholder="Todos os status"
            >
              {statusOptions.map(option => (
                <SelectOption key={option.value} value={option.value}>
                  {option.label}
                </SelectOption>
              ))}
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Gatilho</label>
            <Select
              value={filters.trigger}
              onValueChange={(value) => setFilters(prev => ({ ...prev, trigger: value }))}
              placeholder="Todos os gatilhos"
            >
              {triggerOptions.map(option => (
                <SelectOption key={option.value} value={option.value}>
                  {option.label}
                </SelectOption>
              ))}
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Período</label>
            <Select
              value={filters.dateRange}
              onValueChange={(value) => setFilters(prev => ({ ...prev, dateRange: value }))}
              placeholder="Todos os períodos"
            >
              <SelectOption value="today">Hoje</SelectOption>
              <SelectOption value="week">Esta semana</SelectOption>
              <SelectOption value="month">Este mês</SelectOption>
              <SelectOption value="quarter">Este trimestre</SelectOption>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Buscar</label>
            <Input
              placeholder="Nome, assunto..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className="w-full"
            />
          </div>
        </div>
      </Card>

      {/* Automations Table */}
      <Card className="p-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-900">Automação</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Tipo</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Gatilho</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Performance</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Próximo Envio</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Ações</th>
              </tr>
            </thead>
            <tbody>
              {paginatedAutomations.map((automation) => (
                <tr key={automation.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-4">
                    <div>
                      <p className="font-medium text-gray-900">{automation.name}</p>
                      <p className="text-sm text-gray-600">{automation.subject}</p>
                      <p className="text-xs text-gray-500">Audience: {automation.audience}</p>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{getTypeIcon(automation.type)}</span>
                      <span className="text-sm text-gray-700">
                        {automationTypeOptions.find(t => t.value === automation.type)?.label}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    {getStatusBadge(automation.status)}
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-sm text-gray-700">
                      {triggerOptions.find(t => t.value === automation.trigger)?.label}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span>Enviados:</span>
                        <span className="font-medium">{automation.sentCount.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span>Abertura:</span>
                        <span className="font-medium">{automation.openRate}%</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span>Cliques:</span>
                        <span className="font-medium">{automation.clickRate}%</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="text-sm text-gray-700">
                      {automation.nextScheduled === '-' ? (
                        <span className="text-gray-500">Não agendado</span>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span>{automation.nextScheduled}</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewAutomation(automation)}
                        title="Visualizar"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditAutomation(automation)}
                        title="Editar"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleToggleStatus(automation)}
                        title={automation.status === 'active' ? 'Pausar' : 'Ativar'}
                      >
                        {automation.status === 'active' ? (
                          <Pause className="w-4 h-4" />
                        ) : (
                          <Play className="w-4 h-4" />
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteAutomation(automation)}
                        title="Excluir"
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
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
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-gray-700">
              Mostrando {((currentPage - 1) * itemsPerPage) + 1} a {Math.min(currentPage * itemsPerPage, filteredAutomations.length)} de {filteredAutomations.length} resultados
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                Anterior
              </Button>
              <span className="text-sm text-gray-700">
                Página {currentPage} de {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Próxima
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isCreateModalOpen || isEditModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setIsEditModalOpen(false);
          setSelectedAutomation(null);
        }}
        title={isCreateModalOpen ? 'Nova Automação' : 'Editar Automação'}
        size="lg"
      >
        <div className="space-y-6">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">Básico</TabsTrigger>
              <TabsTrigger value="content">Conteúdo</TabsTrigger>
              <TabsTrigger value="audience">Audience</TabsTrigger>
              <TabsTrigger value="schedule">Agendamento</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nome da Automação</label>
                <Input placeholder="Ex: Boas-vindas para novos clientes" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tipo</label>
                <Select placeholder="Selecione o tipo">
                  {automationTypeOptions.map(option => (
                    <SelectOption key={option.value} value={option.value}>
                      {option.label}
                    </SelectOption>
                  ))}
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Gatilho</label>
                <Select placeholder="Selecione o gatilho">
                  {triggerOptions.map(option => (
                    <SelectOption key={option.value} value={option.value}>
                      {option.label}
                    </SelectOption>
                  ))}
                </Select>
              </div>
            </TabsContent>

            <TabsContent value="content" className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Assunto do E-mail</label>
                <Input placeholder="Ex: Bem-vindo à RSV! 🎉" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Conteúdo</label>
                <textarea
                  className="w-full h-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Digite o conteúdo do e-mail..."
                />
              </div>
            </TabsContent>

            <TabsContent value="audience" className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Segmento de Audience</label>
                <Select placeholder="Selecione o segmento">
                  <SelectOption value="new_customers">Novos Clientes</SelectOption>
                  <SelectOption value="vip_customers">Clientes VIP</SelectOption>
                  <SelectOption value="inactive_customers">Clientes Inativos</SelectOption>
                  <SelectOption value="all_subscribers">Todos os Inscritos</SelectOption>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Filtros Adicionais</label>
                <Input placeholder="Ex: Clientes que compraram nos últimos 30 dias" />
              </div>
            </TabsContent>

            <TabsContent value="schedule" className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Data de Início</label>
                <Input type="date" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Frequência</label>
                <Select placeholder="Selecione a frequência">
                  <SelectOption value="once">Uma vez</SelectOption>
                  <SelectOption value="daily">Diário</SelectOption>
                  <SelectOption value="weekly">Semanal</SelectOption>
                  <SelectOption value="monthly">Mensal</SelectOption>
                </Select>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => {
                setIsCreateModalOpen(false);
                setIsEditModalOpen(false);
                setSelectedAutomation(null);
              }}
            >
              Cancelar
            </Button>
            <Button>
              {isCreateModalOpen ? 'Criar Automação' : 'Salvar Alterações'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* View Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedAutomation(null);
        }}
        title="Detalhes da Automação"
        size="lg"
      >
        {selectedAutomation && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                <p className="text-gray-900">{selectedAutomation.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                <p className="text-gray-900">
                  {automationTypeOptions.find(t => t.value === selectedAutomation.type)?.label}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <div className="mt-1">{getStatusBadge(selectedAutomation.status)}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gatilho</label>
                <p className="text-gray-900">
                  {triggerOptions.find(t => t.value === selectedAutomation.trigger)?.label}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Assunto</label>
                <p className="text-gray-900">{selectedAutomation.subject}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Audience</label>
                <p className="text-gray-900">{selectedAutomation.audience}</p>
              </div>
            </div>

            <div className="border-t pt-4">
              <h4 className="font-medium text-gray-900 mb-3">Métricas de Performance</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-gray-900">{selectedAutomation.sentCount.toLocaleString()}</p>
                  <p className="text-sm text-gray-600">E-mails Enviados</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-gray-900">{selectedAutomation.openRate}%</p>
                  <p className="text-sm text-gray-600">Taxa de Abertura</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-gray-900">{selectedAutomation.clickRate}%</p>
                  <p className="text-sm text-gray-600">Taxa de Clique</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-gray-900">{selectedAutomation.conversionRate}%</p>
                  <p className="text-sm text-gray-600">Taxa de Conversão</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <Button onClick={() => {
                setIsViewModalOpen(false);
                setSelectedAutomation(null);
              }}>
                Fechar
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export { EmailAutomation };
export type { EmailAutomation as EmailAutomationType, EmailAutomationFilters, EmailAutomationProps };
