'use client';
import React, { useState } from 'react';
import { Card, Button, Input, Badge, Tabs, Select, Avatar, Switch } from '@/components/ui';
import { Plus, Settings, Check, X, Clock, AlertTriangle, CheckCircle, XCircle, Edit, Copy, Trash2, Users, FileText, Send, History } from 'lucide-react';
import { toast } from 'sonner';

interface ApprovalRequest {
  id: string;
  title: string;
  description: string;
  type: 'reservation' | 'payment' | 'refund' | 'discount' | 'upgrade' | 'cancellation';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  requester: {
    id: string;
    name: string;
    email: string;
    role: string;
    avatar?: string;
  };
  approvers: {
    id: string;
    name: string;
    email: string;
    role: string;
    avatar?: string;
    status: 'pending' | 'approved' | 'rejected';
    comment?: string;
    respondedAt?: Date;
  }[];
  amount?: number;
  currency?: string;
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
  workflow: {
    id: string;
    name: string;
    steps: number;
    currentStep: number;
  };
  attachments?: {
    name: string;
    type: string;
    size: number;
    url: string;
  }[];
  tags: string[];
}

interface ApprovalWorkflow {
  id: string;
  name: string;
  description: string;
  type: string;
  status: 'active' | 'draft' | 'archived';
  steps: {
    id: string;
    name: string;
    type: 'approval' | 'notification' | 'condition';
    approvers: string[];
    requiredApprovals: number;
    timeout?: number;
    order: number;
  }[];
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

interface ApprovalSystemProps {
  onRequestSelect?: (request: ApprovalRequest) => void;
}

export default function ApprovalSystem({ onRequestSelect }: ApprovalSystemProps) {
  const [requests, setRequests] = useState<ApprovalRequest[]>([
    {
      id: '1',
      title: 'Aprovação de Reserva VIP',
      description: 'Reserva especial para cliente VIP com desconto de 25% e upgrade de quarto',
      type: 'reservation',
      priority: 'high',
      status: 'pending',
      requester: {
        id: 'user1',
        name: 'Maria Santos',
        email: 'maria.santos@rsv.com',
        role: 'Gerente de Vendas',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
      },
      approvers: [
        {
          id: 'user2',
          name: 'João Silva',
          email: 'joao.silva@rsv.com',
          role: 'Diretor de Operações',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
          status: 'pending',
        },
        {
          id: 'user3',
          name: 'Ana Costa',
          email: 'ana.costa@rsv.com',
          role: 'Diretor Financeiro',
          avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
          status: 'pending',
        },
      ],
      amount: 2500,
      currency: 'BRL',
      dueDate: new Date(Date.now() + 86400000),
      createdAt: new Date(Date.now() - 3600000),
      updatedAt: new Date(Date.now() - 3600000),
      workflow: {
        id: 'workflow1',
        name: 'Aprovação de Reservas VIP',
        steps: 2,
        currentStep: 1,
      },
      attachments: [
        {
          name: 'reserva_vip.pdf',
          type: 'application/pdf',
          size: 245760,
          url: '#',
        },
        {
          name: 'perfil_cliente.pdf',
          type: 'application/pdf',
          size: 184320,
          url: '#',
        },
      ],
      tags: ['VIP', 'Desconto', 'Upgrade'],
    },
    {
      id: '2',
      title: 'Reembolso de Cancelamento',
      description: 'Solicitação de reembolso total para cancelamento de reserva com 48h de antecedência',
      type: 'refund',
      priority: 'medium',
      status: 'pending',
      requester: {
        id: 'user4',
        name: 'Carlos Lima',
        email: 'carlos.lima@rsv.com',
        role: 'Atendente',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      },
      approvers: [
        {
          id: 'user3',
          name: 'Ana Costa',
          email: 'ana.costa@rsv.com',
          role: 'Diretor Financeiro',
          avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
          status: 'pending',
        },
      ],
      amount: 1200,
      currency: 'BRL',
      dueDate: new Date(Date.now() + 172800000),
      createdAt: new Date(Date.now() - 7200000),
      updatedAt: new Date(Date.now() - 7200000),
      workflow: {
        id: 'workflow2',
        name: 'Aprovação de Reembolsos',
        steps: 1,
        currentStep: 1,
      },
      tags: ['Reembolso', 'Cancelamento'],
    },
    {
      id: '3',
      title: 'Desconto Corporativo',
      description: 'Aplicação de desconto de 15% para reserva corporativa de 50 quartos',
      type: 'discount',
      priority: 'high',
      status: 'approved',
      requester: {
        id: 'user5',
        name: 'Roberto Alves',
        email: 'roberto.alves@rsv.com',
        role: 'Gerente Comercial',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
      },
      approvers: [
        {
          id: 'user2',
          name: 'João Silva',
          email: 'joao.silva@rsv.com',
          role: 'Diretor de Operações',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
          status: 'approved',
          comment: 'Aprovado - Cliente estratégico com histórico positivo',
          respondedAt: new Date(Date.now() - 86400000),
        },
        {
          id: 'user3',
          name: 'Ana Costa',
          email: 'ana.costa@rsv.com',
          role: 'Diretor Financeiro',
          avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
          status: 'approved',
          comment: 'Aprovado - Margem ainda viável com volume',
          respondedAt: new Date(Date.now() - 86400000),
        },
      ],
      amount: 15000,
      currency: 'BRL',
      dueDate: new Date(Date.now() + 259200000),
      createdAt: new Date(Date.now() - 172800000),
      updatedAt: new Date(Date.now() - 86400000),
      workflow: {
        id: 'workflow3',
        name: 'Aprovação de Descontos',
        steps: 2,
        currentStep: 2,
      },
      tags: ['Corporativo', 'Volume', 'Desconto'],
    },
  ]);

  const [workflows, setWorkflows] = useState<ApprovalWorkflow[]>([
    {
      id: 'workflow1',
      name: 'Aprovação de Reservas VIP',
      description: 'Workflow para aprovação de reservas especiais com desconto e upgrades',
      type: 'reservation',
      status: 'active',
      steps: [
        {
          id: 'step1',
          name: 'Aprovação Operacional',
          type: 'approval',
          approvers: ['user2'],
          requiredApprovals: 1,
          timeout: 24,
          order: 1,
        },
        {
          id: 'step2',
          name: 'Aprovação Financeira',
          type: 'approval',
          approvers: ['user3'],
          requiredApprovals: 1,
          timeout: 24,
          order: 2,
        },
      ],
      createdAt: new Date(Date.now() - 2592000000),
      updatedAt: new Date(Date.now() - 86400000),
      createdBy: 'Admin',
    },
    {
      id: 'workflow2',
      name: 'Aprovação de Reembolsos',
      description: 'Workflow para aprovação de reembolsos e cancelamentos',
      type: 'refund',
      status: 'active',
      steps: [
        {
          id: 'step1',
          name: 'Aprovação Financeira',
          type: 'approval',
          approvers: ['user3'],
          requiredApprovals: 1,
          timeout: 48,
          order: 1,
        },
      ],
      createdAt: new Date(Date.now() - 5184000000),
      updatedAt: new Date(Date.now() - 172800000),
      createdBy: 'Admin',
    },
  ]);

  const [activeTab, setActiveTab] = useState('requests');
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');

  const handleApprove = (requestId: string, approverId: string) => {
    setRequests(prev => prev.map(request => 
      request.id === requestId 
        ? {
            ...request,
            approvers: request.approvers.map(approver => 
              approver.id === approverId 
                ? { ...approver, status: 'approved', respondedAt: new Date() }
                : approver
            ),
            status: request.approvers.every(a => a.id === approverId || a.status === 'approved') ? 'approved' : 'pending',
            updatedAt: new Date(),
          }
        : request
    ));
    toast.success('Solicitação aprovada!');
  };

  const handleReject = (requestId: string, approverId: string, comment: string) => {
    setRequests(prev => prev.map(request => 
      request.id === requestId 
        ? {
            ...request,
            approvers: request.approvers.map(approver => 
              approver.id === approverId 
                ? { ...approver, status: 'rejected', comment, respondedAt: new Date() }
                : approver
            ),
            status: 'rejected',
            updatedAt: new Date(),
          }
        : request
    ));
    toast.success('Solicitação rejeitada!');
  };

  const handleCreateRequest = () => {
    const newRequest: ApprovalRequest = {
      id: Date.now().toString(),
      title: 'Nova Solicitação de Aprovação',
      description: 'Descrição da nova solicitação',
      type: 'reservation',
      priority: 'medium',
      status: 'pending',
      requester: {
        id: 'current_user',
        name: 'Usuário Atual',
        email: 'usuario@rsv.com',
        role: 'Usuário',
      },
      approvers: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      workflow: {
        id: 'new_workflow',
        name: 'Novo Workflow',
        steps: 1,
        currentStep: 1,
      },
      tags: [],
    };

    setRequests(prev => [...prev, newRequest]);
    toast.success('Nova solicitação criada!');
  };

  const handleDeleteRequest = (requestId: string) => {
    setRequests(prev => prev.filter(request => request.id !== requestId));
    toast.success('Solicitação excluída!');
  };

  const filteredRequests = requests.filter(request => {
    const matchesSearch = request.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         request.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || request.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || request.priority === priorityFilter;
    return matchesSearch && matchesType && matchesStatus && matchesPriority;
  });

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'reservation': return 'bg-blue-100 text-blue-800';
      case 'payment': return 'bg-green-100 text-green-800';
      case 'refund': return 'bg-orange-100 text-orange-800';
      case 'discount': return 'bg-purple-100 text-purple-800';
      case 'upgrade': return 'bg-indigo-100 text-indigo-800';
      case 'cancellation': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'reservation': return 'Reserva';
      case 'payment': return 'Pagamento';
      case 'refund': return 'Reembolso';
      case 'discount': return 'Desconto';
      case 'upgrade': return 'Upgrade';
      case 'cancellation': return 'Cancelamento';
      default: return type;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-gray-100 text-gray-800';
      case 'medium': return 'bg-blue-100 text-blue-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'urgent': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'low': return 'Baixa';
      case 'medium': return 'Média';
      case 'high': return 'Alta';
      case 'urgent': return 'Urgente';
      default: return priority;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendente';
      case 'approved': return 'Aprovado';
      case 'rejected': return 'Rejeitado';
      case 'cancelled': return 'Cancelado';
      default: return status;
    }
  };

  const getApprovalStatus = (request: ApprovalRequest) => {
    const totalApprovers = request.approvers.length;
    const approvedCount = request.approvers.filter(a => a.status === 'approved').length;
    const rejectedCount = request.approvers.filter(a => a.status === 'rejected').length;
    
    if (rejectedCount > 0) return 'rejected';
    if (approvedCount === totalApprovers) return 'approved';
    return 'pending';
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const stats = {
    total: requests.length,
    pending: requests.filter(r => r.status === 'pending').length,
    approved: requests.filter(r => r.status === 'approved').length,
    rejected: requests.filter(r => r.status === 'rejected').length,
    urgent: requests.filter(r => r.priority === 'urgent').length,
    workflows: workflows.length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Sistema de Aprovações</h2>
          <p className="text-gray-600">Gerencie solicitações e fluxos de aprovação</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={() => toast.info('Funcionalidade de relatórios em desenvolvimento')}>
            <FileText className="h-4 w-4 mr-2" />
            Relatórios
          </Button>
          <Button onClick={handleCreateRequest}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Solicitação
          </Button>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total de Solicitações</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Pendentes</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Aprovadas</p>
              <p className="text-2xl font-bold text-gray-900">{stats.approved}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Urgentes</p>
              <p className="text-2xl font-bold text-gray-900">{stats.urgent}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filtros */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Buscar solicitações..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <option value="all">Todos os Tipos</option>
            <option value="reservation">Reserva</option>
            <option value="payment">Pagamento</option>
            <option value="refund">Reembolso</option>
            <option value="discount">Desconto</option>
            <option value="upgrade">Upgrade</option>
            <option value="cancellation">Cancelamento</option>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <option value="all">Todos os Status</option>
            <option value="pending">Pendente</option>
            <option value="approved">Aprovado</option>
            <option value="rejected">Rejeitado</option>
            <option value="cancelled">Cancelado</option>
          </Select>
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <option value="all">Todas as Prioridades</option>
            <option value="low">Baixa</option>
            <option value="medium">Média</option>
            <option value="high">Alta</option>
            <option value="urgent">Urgente</option>
          </Select>
        </div>
      </Card>

      {/* Conteúdo Principal */}
      <Card>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="border-b border-gray-200">
            <div className="flex space-x-8 px-4">
              <button
                onClick={() => setActiveTab('requests')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'requests'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Solicitações ({stats.total})
              </button>
              <button
                onClick={() => setActiveTab('workflows')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'workflows'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Workflows ({stats.workflows})
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'history'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Histórico
              </button>
            </div>
          </div>

          <div className="p-4">
            {activeTab === 'requests' && (
              <div className="space-y-4">
                {filteredRequests.map((request) => (
                  <div
                    key={request.id}
                    className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-medium text-gray-900">{request.title}</h3>
                          <Badge className={getTypeColor(request.type)}>
                            {getTypeLabel(request.type)}
                          </Badge>
                          <Badge className={getPriorityColor(request.priority)}>
                            {getPriorityLabel(request.priority)}
                          </Badge>
                          <Badge className={getStatusColor(request.status)}>
                            {getStatusLabel(request.status)}
                          </Badge>
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-3">{request.description}</p>
                        
                        <div className="flex items-center space-x-4 mb-3">
                          <div className="flex items-center space-x-2">
                            <Avatar className="h-6 w-6">
                              <img src={request.requester.avatar} alt={request.requester.name} />
                            </Avatar>
                            <span className="text-sm text-gray-600">
                              {request.requester.name} ({request.requester.role})
                            </span>
                          </div>
                          
                          {request.amount && (
                            <span className="text-sm font-medium text-gray-900">
                              {request.currency} {request.amount.toLocaleString()}
                            </span>
                          )}
                          
                          {request.dueDate && (
                            <div className="flex items-center space-x-1 text-sm text-gray-500">
                              <Clock className="h-4 w-4" />
                              <span>Vence: {request.dueDate.toLocaleDateString()}</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-2 mb-3">
                          <span className="text-xs text-gray-500">Workflow:</span>
                          <Badge variant="outline">{request.workflow.name}</Badge>
                          <span className="text-xs text-gray-500">
                            Passo {request.workflow.currentStep} de {request.workflow.steps}
                          </span>
                        </div>
                        
                        {request.tags.length > 0 && (
                          <div className="flex items-center space-x-2 mb-3">
                            {request.tags.map((tag) => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                        
                        {request.attachments && request.attachments.length > 0 && (
                          <div className="flex items-center space-x-2 mb-3">
                            <span className="text-xs text-gray-500">Anexos:</span>
                            {request.attachments.map((attachment) => (
                              <Badge key={attachment.name} variant="outline" className="text-xs">
                                {attachment.name} ({formatFileSize(attachment.size)})
                              </Badge>
                            ))}
                          </div>
                        )}
                        
                        <div className="space-y-2">
                          <h4 className="text-sm font-medium text-gray-900">Aprovadores:</h4>
                          <div className="space-y-2">
                            {request.approvers.map((approver) => (
                              <div key={approver.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                <div className="flex items-center space-x-2">
                                  <Avatar className="h-6 w-6">
                                    <img src={approver.avatar} alt={approver.name} />
                                  </Avatar>
                                  <div>
                                    <span className="text-sm font-medium text-gray-900">{approver.name}</span>
                                    <span className="text-xs text-gray-500 block">{approver.role}</span>
                                  </div>
                                </div>
                                
                                <div className="flex items-center space-x-2">
                                  {approver.status === 'pending' && (
                                    <>
                                      <Button
                                        size="sm"
                                        onClick={() => handleApprove(request.id, approver.id)}
                                        className="bg-green-600 hover:bg-green-700"
                                      >
                                        <Check className="h-4 w-4" />
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => {
                                          const comment = prompt('Comentário de rejeição:');
                                          if (comment) handleReject(request.id, approver.id, comment);
                                        }}
                                        className="border-red-300 text-red-700 hover:bg-red-50"
                                      >
                                        <X className="h-4 w-4" />
                                      </Button>
                                    </>
                                  )}
                                  
                                  {approver.status === 'approved' && (
                                    <Badge className="bg-green-100 text-green-800">
                                      <Check className="h-3 w-3 mr-1" />
                                      Aprovado
                                    </Badge>
                                  )}
                                  
                                  {approver.status === 'rejected' && (
                                    <Badge className="bg-red-100 text-red-800">
                                      <X className="h-3 w-3 mr-1" />
                                      Rejeitado
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 ml-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onRequestSelect?.(request)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteRequest(request.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'workflows' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Workflows de Aprovação</h3>
                  <Button onClick={() => toast.info('Criar novo workflow em desenvolvimento')}>
                    <Plus className="h-4 w-4 mr-2" />
                    Novo Workflow
                  </Button>
                </div>
                
                {workflows.map((workflow) => (
                  <div key={workflow.id} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-medium text-gray-900">{workflow.name}</h4>
                        <p className="text-sm text-gray-600">{workflow.description}</p>
                      </div>
                      <Badge className={workflow.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                        {workflow.status === 'active' ? 'Ativo' : 'Rascunho'}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2">
                      <h5 className="text-sm font-medium text-gray-900">Passos do Workflow:</h5>
                      {workflow.steps.map((step) => (
                        <div key={step.id} className="flex items-center space-x-3 p-2 bg-gray-50 rounded">
                          <span className="text-sm font-medium text-gray-900">{step.order}.</span>
                          <span className="text-sm text-gray-600">{step.name}</span>
                          <Badge variant="outline" className="text-xs">
                            {step.type === 'approval' ? 'Aprovação' : step.type}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {step.requiredApprovals} aprovação{step.requiredApprovals > 1 ? 'ões' : 'ão'} necessária{step.requiredApprovals > 1 ? 's' : ''}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'history' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Histórico de Aprovações</h3>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 text-center">
                    Sistema de histórico em desenvolvimento. Em breve você poderá visualizar o histórico completo de todas as aprovações.
                  </p>
                </div>
              </div>
            )}
          </div>
        </Tabs>
      </Card>
    </div>
  );
}
