import React, { useState, useEffect, useMemo } from 'react';
import { Users, Target, Mail, Phone, Calendar, MapPin, Filter, Search, Plus, Edit, Trash2, Eye, Download, TrendingUp, UserPlus } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select, SelectOption } from '../components/ui/Select';
import { Modal } from '../components/ui/Modal';
import { Badge } from '../components/ui/Badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/Tabs';
import { cn } from '../../utils/cn';

export interface Lead {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  source: 'website' | 'social_media' | 'referral' | 'campaign' | 'event' | 'other';
  status: 'new' | 'contacted' | 'qualified' | 'converted' | 'lost';
  interests: string[];
  location: {
    city: string;
    state: string;
    country: string;
  };
  notes: string;
  assignedTo?: string;
  createdDate: Date;
  lastContactDate?: Date;
  score: number;
  tags: string[];
}

export interface LeadFilters {
  status: string[];
  source: string[];
  assignedTo: string[];
  dateRange: {
    start: Date | null;
    end: Date | null;
  };
  interests: string[];
}

export interface LeadCaptureProps {
  className?: string;
}

const sourceOptions: SelectOption[] = [
  { value: 'website', label: 'Website', icon: '🌐' },
  { value: 'social_media', label: 'Redes Sociais', icon: '📱' },
  { value: 'referral', label: 'Indicação', icon: '👥' },
  { value: 'campaign', label: 'Campanha', icon: '📢' },
  { value: 'event', label: 'Evento', icon: '🎉' },
  { value: 'other', label: 'Outro', icon: '📝' }
];

const statusOptions: SelectOption[] = [
  { value: 'new', label: 'Novo', icon: '🆕' },
  { value: 'contacted', label: 'Contactado', icon: '📞' },
  { value: 'qualified', label: 'Qualificado', icon: '✅' },
  { value: 'converted', label: 'Convertido', icon: '💰' },
  { value: 'lost', label: 'Perdido', icon: '❌' }
];

const mockLeads: Lead[] = [
  {
    id: 'lead_001',
    firstName: 'Ana',
    lastName: 'Silva',
    email: 'ana.silva@email.com',
    phone: '(11) 99999-9999',
    source: 'website',
    status: 'new',
    interests: ['caldas_novas', 'pacotes_familia'],
    location: { city: 'São Paulo', state: 'SP', country: 'Brasil' },
    notes: 'Interessada em pacotes para Caldas Novas',
    createdDate: new Date('2025-08-01T10:00:00'),
    score: 85,
    tags: ['alta_prioridade', 'caldas_novas']
  },
  {
    id: 'lead_002',
    firstName: 'Carlos',
    lastName: 'Mendes',
    email: 'carlos.mendes@email.com',
    phone: '(21) 88888-8888',
    source: 'social_media',
    status: 'contacted',
    interests: ['porto_seguro', 'viagens_romanticas'],
    location: { city: 'Rio de Janeiro', state: 'RJ', country: 'Brasil' },
    notes: 'Cliente interessado em viagem romântica',
    assignedTo: 'João Silva',
    createdDate: new Date('2025-07-28T14:30:00'),
    lastContactDate: new Date('2025-08-01T09:15:00'),
    score: 72,
    tags: ['porto_seguro', 'romantico']
  }
];

const LeadCapture: React.FC<LeadCaptureProps> = ({ className }) => {
  const [leads, setLeads] = useState<Lead[]>(mockLeads);
  const [filters, setFilters] = useState<LeadFilters>({
    status: [],
    source: [],
    assignedTo: [],
    dateRange: { start: null, end: null },
    interests: []
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const filteredLeads = useMemo(() => {
    return leads.filter(lead => {
      if (filters.status.length > 0 && !filters.status.includes(lead.status)) return false;
      if (filters.source.length > 0 && !filters.source.includes(lead.source)) return false;
      if (filters.assignedTo.length > 0 && !filters.assignedTo.includes(lead.assignedTo || '')) return false;
      if (searchTerm && !(
        lead.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.email.toLowerCase().includes(searchTerm.toLowerCase())
      )) return false;
      return true;
    });
  }, [leads, filters, searchTerm]);

  const paginatedLeads = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredLeads.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredLeads, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredLeads.length / itemsPerPage);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800';
      case 'contacted': return 'bg-yellow-100 text-yellow-800';
      case 'qualified': return 'bg-green-100 text-green-800';
      case 'converted': return 'bg-purple-100 text-purple-800';
      case 'lost': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'website': return <Mail className="w-4 h-4" />;
      case 'social_media': return <Users className="w-4 h-4" />;
      case 'referral': return <UserPlus className="w-4 h-4" />;
      case 'campaign': return <Target className="w-4 h-4" />;
      case 'event': return <Calendar className="w-4 h-4" />;
      default: return <Mail className="w-4 h-4" />;
    }
  };

  const handleFilterChange = (field: keyof LeadFilters, value: any) => {
    setFilters(prev => ({ ...prev, [field]: value }));
    setCurrentPage(1);
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleCreateLead = () => {
    setSelectedLead(null);
    setShowCreateModal(true);
  };

  const handleEditLead = (lead: Lead) => {
    setSelectedLead(lead);
    setShowEditModal(true);
  };

  const handleStatusChange = (leadId: string, newStatus: string) => {
    setLeads(prev => prev.map(l => 
      l.id === leadId ? { ...l, status: newStatus as any } : l
    ));
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Captura de Leads</h2>
          <p className="text-gray-600">Gerencie e acompanhe seus leads</p>
        </div>
        <Button onClick={handleCreateLead} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Novo Lead
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Buscar</label>
            <Input
              placeholder="Nome, email..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <Select
              value={filters.status.length > 0 ? { value: filters.status.join(','), label: `${filters.status.length} selecionados` } : null}
              options={statusOptions}
              onChange={(option) => handleFilterChange('status', [option.value])}
              placeholder="Todos os status"
              isMulti
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Fonte</label>
            <Select
              value={filters.source.length > 0 ? { value: filters.source.join(','), label: `${filters.source.length} selecionados` } : null}
              options={sourceOptions}
              onChange={(option) => handleFilterChange('source', [option.value])}
              placeholder="Todas as fontes"
              isMulti
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Responsável</label>
            <Input
              placeholder="Nome do responsável"
              value={filters.assignedTo.join(', ')}
              onChange={(e) => handleFilterChange('assignedTo', e.target.value ? [e.target.value] : [])}
            />
          </div>
        </div>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total de Leads</p>
              <p className="text-xl font-bold text-gray-900">{filteredLeads.length}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Convertidos</p>
              <p className="text-xl font-bold text-gray-900">
                {filteredLeads.filter(l => l.status === 'converted').length}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Target className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Qualificados</p>
              <p className="text-xl font-bold text-gray-900">
                {filteredLeads.filter(l => l.status === 'qualified').length}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <UserPlus className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Novos Hoje</p>
              <p className="text-xl font-bold text-gray-900">
                {filteredLeads.filter(l => 
                  l.status === 'new' && 
                  l.createdDate.toDateString() === new Date().toDateString()
                ).length}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Leads Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lead</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fonte</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Localização</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedLeads.map((lead) => (
                <tr key={lead.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {lead.firstName} {lead.lastName}
                      </div>
                      <div className="text-sm text-gray-500">{lead.email}</div>
                      <div className="text-xs text-gray-400">{lead.phone}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {getSourceIcon(lead.source)}
                      <span className="text-sm text-gray-900 capitalize">
                        {lead.source.replace(/_/g, ' ')}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge className={cn('flex items-center gap-1', getStatusColor(lead.status))}>
                      {lead.status === 'new' ? 'Novo' :
                       lead.status === 'contacted' ? 'Contactado' :
                       lead.status === 'qualified' ? 'Qualificado' :
                       lead.status === 'converted' ? 'Convertido' : 'Perdido'}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div 
                          className={cn(
                            'h-2 rounded-full',
                            lead.score >= 80 ? 'bg-green-500' :
                            lead.score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                          )}
                          style={{ width: `${lead.score}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-900">{lead.score}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>
                      <div>{lead.location.city}</div>
                      <div className="text-gray-500">{lead.location.state}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>
                      <div>Criado: {formatDate(lead.createdDate)}</div>
                      {lead.lastContactDate && (
                        <div className="text-gray-500">Contato: {formatDate(lead.lastContactDate)}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditLead(lead)}
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Editar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {/* View details */}}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Ver
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
                    {Math.min(currentPage * itemsPerPage, filteredLeads.length)}
                  </span>{' '}
                  de <span className="font-medium">{filteredLeads.length}</span> resultados
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

      {/* Create/Edit Lead Modal */}
      <Modal
        isOpen={showCreateModal || showEditModal}
        onClose={() => {
          setShowCreateModal(false);
          setShowEditModal(false);
        }}
        title={selectedLead ? 'Editar Lead' : 'Novo Lead'}
        size="lg"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nome</label>
              <Input
                placeholder="Nome"
                defaultValue={selectedLead?.firstName || ''}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sobrenome</label>
              <Input
                placeholder="Sobrenome"
                defaultValue={selectedLead?.lastName || ''}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <Input
                type="email"
                placeholder="email@exemplo.com"
                defaultValue={selectedLead?.email || ''}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Telefone</label>
              <Input
                placeholder="(11) 99999-9999"
                defaultValue={selectedLead?.phone || ''}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Fonte</label>
              <Select
                value={sourceOptions.find(opt => opt.value === selectedLead?.source)}
                options={sourceOptions}
                onChange={(option) => console.log('Selected:', option)}
                placeholder="Selecione a fonte"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <Select
                value={statusOptions.find(opt => opt.value === selectedLead?.status)}
                options={statusOptions}
                onChange={(option) => console.log('Selected:', option)}
                placeholder="Selecione o status"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Observações</label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Observações sobre o lead..."
              defaultValue={selectedLead?.notes || ''}
            />
          </div>

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
              {selectedLead ? 'Atualizar' : 'Criar'} Lead
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export { LeadCapture };
export type { Lead, LeadFilters, LeadCaptureProps };
