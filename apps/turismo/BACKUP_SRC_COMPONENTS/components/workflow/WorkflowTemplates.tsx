'use client';
import React, { useState } from 'react';
import { Card, Button, Input, Badge, Tabs, Select, Textarea } from '@/components/ui';
import { Plus, Settings, Copy, Download, Upload, Eye, Edit, Trash2, Star, Bookmark, Search, Filter, Workflow, Users, Clock, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: 'reservation' | 'payment' | 'customer-service' | 'operations' | 'finance' | 'hr' | 'marketing' | 'custom';
  complexity: 'simple' | 'medium' | 'complex';
  estimatedTime: number; // em minutos
  steps: number;
  tags: string[];
  author: string;
  rating: number;
  downloads: number;
  isPublic: boolean;
  isFeatured: boolean;
  createdAt: Date;
  updatedAt: Date;
  preview: {
    steps: {
      id: string;
      name: string;
      type: string;
      description: string;
      estimatedDuration: number;
    }[];
    connections: {
      from: string;
      to: string;
      condition?: string;
    }[];
  };
}

interface WorkflowTemplatesProps {
  onTemplateSelect?: (template: WorkflowTemplate) => void;
}

export default function WorkflowTemplates({ onTemplateSelect }: WorkflowTemplatesProps) {
  const [templates, setTemplates] = useState<WorkflowTemplate[]>([
    {
      id: '1',
      name: 'Processo de Reserva Padrão',
      description: 'Workflow completo para processamento de reservas de hotel com verificação de disponibilidade e confirmação',
      category: 'reservation',
      complexity: 'medium',
      estimatedTime: 45,
      steps: 8,
      tags: ['Reserva', 'Hotel', 'Disponibilidade', 'Confirmação'],
      author: 'Equipe RSV',
      rating: 4.8,
      downloads: 156,
      isPublic: true,
      isFeatured: true,
      createdAt: new Date(Date.now() - 2592000000),
      updatedAt: new Date(Date.now() - 86400000),
      preview: {
        steps: [
          {
            id: 'step1',
            name: 'Recebimento da Reserva',
            type: 'start',
            description: 'Cliente faz reserva através do sistema',
            estimatedDuration: 5,
          },
          {
            id: 'step2',
            name: 'Verificação de Disponibilidade',
            type: 'task',
            description: 'Verificar se há quartos disponíveis',
            estimatedDuration: 10,
          },
          {
            id: 'step3',
            name: 'Validação de Dados',
            type: 'task',
            description: 'Validar informações do cliente e reserva',
            estimatedDuration: 15,
          },
          {
            id: 'step4',
            name: 'Processamento de Pagamento',
            type: 'task',
            description: 'Processar pagamento da reserva',
            estimatedDuration: 20,
          },
          {
            id: 'step5',
            name: 'Confirmação da Reserva',
            type: 'task',
            description: 'Confirmar reserva e enviar confirmação',
            estimatedDuration: 10,
          },
          {
            id: 'step6',
            name: 'Reserva Confirmada',
            type: 'end',
            description: 'Processo concluído com sucesso',
            estimatedDuration: 0,
          },
        ],
        connections: [
          { from: 'step1', to: 'step2' },
          { from: 'step2', to: 'step3' },
          { from: 'step3', to: 'step4' },
          { from: 'step4', to: 'step5' },
          { from: 'step5', to: 'step6' },
        ],
      },
    },
    {
      id: '2',
      name: 'Processo de Check-in',
      description: 'Workflow para check-in de hóspedes com verificação de documentos e atribuição de quartos',
      category: 'operations',
      complexity: 'simple',
      estimatedTime: 20,
      steps: 5,
      tags: ['Check-in', 'Hóspede', 'Documentos', 'Quarto'],
      author: 'Equipe RSV',
      rating: 4.6,
      downloads: 89,
      isPublic: true,
      isFeatured: false,
      createdAt: new Date(Date.now() - 5184000000),
      updatedAt: new Date(Date.now() - 172800000),
      preview: {
        steps: [
          {
            id: 'step1',
            name: 'Chegada do Hóspede',
            type: 'start',
            description: 'Hóspede chega ao hotel',
            estimatedDuration: 2,
          },
          {
            id: 'step2',
            name: 'Verificação de Documentos',
            type: 'task',
            description: 'Verificar documentos e identidade',
            estimatedDuration: 8,
          },
          {
            id: 'step3',
            name: 'Atribuição de Quarto',
            type: 'task',
            description: 'Atribuir quarto disponível',
            estimatedDuration: 5,
          },
          {
            id: 'step4',
            name: 'Entrega de Chave',
            type: 'task',
            description: 'Entregar chave e informações',
            estimatedDuration: 5,
          },
          {
            id: 'step5',
            name: 'Check-in Concluído',
            type: 'end',
            description: 'Hóspede recebe chave e informações',
            estimatedDuration: 0,
          },
        ],
        connections: [
          { from: 'step1', to: 'step2' },
          { from: 'step2', to: 'step3' },
          { from: 'step3', to: 'step4' },
          { from: 'step4', to: 'step5' },
        ],
      },
    },
    {
      id: '3',
      name: 'Processo de Reembolso',
      description: 'Workflow para processamento de reembolsos com aprovação e processamento financeiro',
      category: 'finance',
      complexity: 'complex',
      estimatedTime: 120,
      steps: 12,
      tags: ['Reembolso', 'Financeiro', 'Aprovação', 'Processamento'],
      author: 'Equipe Financeira',
      rating: 4.4,
      downloads: 67,
      isPublic: true,
      isFeatured: false,
      createdAt: new Date(Date.now() - 7776000000),
      updatedAt: new Date(Date.now() - 259200000),
      preview: {
        steps: [
          {
            id: 'step1',
            name: 'Solicitação de Reembolso',
            type: 'start',
            description: 'Cliente solicita reembolso',
            estimatedDuration: 10,
          },
          {
            id: 'step2',
            name: 'Validação da Solicitação',
            type: 'task',
            description: 'Validar motivo e documentação',
            estimatedDuration: 30,
          },
          {
            id: 'step3',
            name: 'Aprovação do Gerente',
            type: 'approval',
            description: 'Aprovação do gerente de departamento',
            estimatedDuration: 60,
          },
          {
            id: 'step4',
            name: 'Aprovação Financeira',
            type: 'approval',
            description: 'Aprovação da equipe financeira',
            estimatedDuration: 60,
          },
          {
            id: 'step5',
            name: 'Processamento do Reembolso',
            type: 'task',
            description: 'Processar reembolso financeiro',
            estimatedDuration: 45,
          },
          {
            id: 'step6',
            name: 'Reembolso Processado',
            type: 'end',
            description: 'Reembolso processado com sucesso',
            estimatedDuration: 0,
          },
        ],
        connections: [
          { from: 'step1', to: 'step2' },
          { from: 'step2', to: 'step3' },
          { from: 'step3', to: 'step4' },
          { from: 'step4', to: 'step5' },
          { from: 'step5', to: 'step6' },
        ],
      },
    },
    {
      id: '4',
      name: 'Processo de Atendimento ao Cliente',
      description: 'Workflow para atendimento de solicitações e reclamações de clientes',
      category: 'customer-service',
      complexity: 'medium',
      estimatedTime: 60,
      steps: 10,
      tags: ['Atendimento', 'Cliente', 'Reclamação', 'Solução'],
      author: 'Equipe de Atendimento',
      rating: 4.7,
      downloads: 134,
      isPublic: true,
      isFeatured: true,
      createdAt: new Date(Date.now() - 10368000000),
      updatedAt: new Date(Date.now() - 345600000),
      preview: {
        steps: [
          {
            id: 'step1',
            name: 'Recebimento da Solicitação',
            type: 'start',
            description: 'Receber solicitação do cliente',
            estimatedDuration: 5,
          },
          {
            id: 'step2',
            name: 'Classificação da Solicitação',
            type: 'task',
            description: 'Classificar tipo e prioridade',
            estimatedDuration: 10,
          },
          {
            id: 'step3',
            name: 'Atribuição ao Agente',
            type: 'task',
            description: 'Atribuir ao agente responsável',
            estimatedDuration: 5,
          },
          {
            id: 'step4',
            name: 'Análise da Situação',
            type: 'task',
            description: 'Analisar e investigar situação',
            estimatedDuration: 30,
          },
          {
            id: 'step5',
            name: 'Implementação da Solução',
            type: 'task',
            description: 'Implementar solução para o cliente',
            estimatedDuration: 20,
          },
          {
            id: 'step6',
            name: 'Follow-up com Cliente',
            type: 'task',
            description: 'Verificar satisfação do cliente',
            estimatedDuration: 15,
          },
          {
            id: 'step7',
            name: 'Solicitação Resolvida',
            type: 'end',
            description: 'Solicitação resolvida com sucesso',
            estimatedDuration: 0,
          },
        ],
        connections: [
          { from: 'step1', to: 'step2' },
          { from: 'step2', to: 'step3' },
          { from: 'step3', to: 'step4' },
          { from: 'step4', to: 'step5' },
          { from: 'step5', to: 'step6' },
          { from: 'step6', to: 'step7' },
        ],
      },
    },
    {
      id: '5',
      name: 'Processo de Aprovação de Descontos',
      description: 'Workflow para aprovação de descontos especiais com múltiplos níveis de aprovação',
      category: 'finance',
      complexity: 'complex',
      estimatedTime: 90,
      steps: 15,
      tags: ['Desconto', 'Aprovação', 'Financeiro', 'Múltiplos Níveis'],
      author: 'Equipe Financeira',
      rating: 4.3,
      downloads: 45,
      isPublic: true,
      isFeatured: false,
      createdAt: new Date(Date.now() - 12960000000),
      updatedAt: new Date(Date.now() - 518400000),
      preview: {
        steps: [
          {
            id: 'step1',
            name: 'Solicitação de Desconto',
            type: 'start',
            description: 'Solicitar desconto especial',
            estimatedDuration: 15,
          },
          {
            id: 'step2',
            name: 'Análise Inicial',
            type: 'task',
            description: 'Análise inicial da solicitação',
            estimatedDuration: 20,
          },
          {
            id: 'step3',
            name: 'Aprovação do Supervisor',
            type: 'approval',
            description: 'Aprovação do supervisor direto',
            estimatedDuration: 60,
          },
          {
            id: 'step4',
            name: 'Aprovação do Gerente',
            type: 'approval',
            description: 'Aprovação do gerente de departamento',
            estimatedDuration: 120,
          },
          {
            id: 'step5',
            name: 'Aprovação Financeira',
            type: 'approval',
            description: 'Aprovação da equipe financeira',
            estimatedDuration: 120,
          },
          {
            id: 'step6',
            name: 'Aprovação Final',
            type: 'approval',
            description: 'Aprovação final da diretoria',
            estimatedDuration: 180,
          },
          {
            id: 'step7',
            name: 'Implementação do Desconto',
            type: 'task',
            description: 'Implementar desconto aprovado',
            estimatedDuration: 30,
          },
          {
            id: 'step8',
            name: 'Desconto Aplicado',
            type: 'end',
            description: 'Desconto aplicado com sucesso',
            estimatedDuration: 0,
          },
        ],
        connections: [
          { from: 'step1', to: 'step2' },
          { from: 'step2', to: 'step3' },
          { from: 'step3', to: 'step4' },
          { from: 'step4', to: 'step5' },
          { from: 'step5', to: 'step6' },
          { from: 'step6', to: 'step7' },
          { from: 'step7', to: 'step8' },
        ],
      },
    },
  ]);

  const [activeTab, setActiveTab] = useState('browse');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [complexityFilter, setComplexityFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('popular');

  const handleCreateTemplate = () => {
    const newTemplate: WorkflowTemplate = {
      id: Date.now().toString(),
      name: 'Novo Template de Workflow',
      description: 'Descrição do novo template',
      category: 'custom',
      complexity: 'simple',
      estimatedTime: 30,
      steps: 5,
      tags: ['Novo', 'Customizado'],
      author: 'Usuário Atual',
      rating: 0,
      downloads: 0,
      isPublic: false,
      isFeatured: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      preview: {
        steps: [
          {
            id: 'step1',
            name: 'Início',
            type: 'start',
            description: 'Ponto de início do workflow',
            estimatedDuration: 5,
          },
          {
            id: 'step2',
            name: 'Fim',
            type: 'end',
            description: 'Ponto de fim do workflow',
            estimatedDuration: 0,
          },
        ],
        connections: [
          { from: 'step1', to: 'step2' },
        ],
      },
    };

    setTemplates(prev => [...prev, newTemplate]);
    toast.success('Novo template criado!');
  };

  const handleDuplicateTemplate = (template: WorkflowTemplate) => {
    const duplicated = {
      ...template,
      id: Date.now().toString(),
      name: `${template.name} (Cópia)`,
      author: 'Usuário Atual',
      downloads: 0,
      isPublic: false,
      isFeatured: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setTemplates(prev => [...prev, duplicated]);
    toast.success('Template duplicado!');
  };

  const handleDeleteTemplate = (templateId: string) => {
    setTemplates(prev => prev.filter(template => template.id !== templateId));
    toast.success('Template excluído!');
  };

  const handleDownloadTemplate = (template: WorkflowTemplate) => {
    setTemplates(prev => prev.map(t => 
      t.id === template.id 
        ? { ...t, downloads: t.downloads + 1 }
        : t
    ));
    toast.success('Template baixado!');
  };

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = categoryFilter === 'all' || template.category === categoryFilter;
    const matchesComplexity = complexityFilter === 'all' || template.complexity === complexityFilter;
    return matchesSearch && matchesCategory && matchesComplexity;
  });

  const sortedTemplates = [...filteredTemplates].sort((a, b) => {
    switch (sortBy) {
      case 'popular':
        return b.downloads - a.downloads;
      case 'rating':
        return b.rating - a.rating;
      case 'newest':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'oldest':
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case 'complexity':
        const complexityOrder = { simple: 1, medium: 2, complex: 3 };
        return complexityOrder[a.complexity] - complexityOrder[b.complexity];
      default:
        return 0;
    }
  });

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'reservation': return 'bg-blue-100 text-blue-800';
      case 'payment': return 'bg-green-100 text-green-800';
      case 'customer-service': return 'bg-purple-100 text-purple-800';
      case 'operations': return 'bg-orange-100 text-orange-800';
      case 'finance': return 'bg-indigo-100 text-indigo-800';
      case 'hr': return 'bg-pink-100 text-pink-800';
      case 'marketing': return 'bg-yellow-100 text-yellow-800';
      case 'custom': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'reservation': return 'Reserva';
      case 'payment': return 'Pagamento';
      case 'customer-service': return 'Atendimento';
      case 'operations': return 'Operações';
      case 'finance': return 'Financeiro';
      case 'hr': return 'RH';
      case 'marketing': return 'Marketing';
      case 'custom': return 'Customizado';
      default: return category;
    }
  };

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'simple': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'complex': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getComplexityLabel = (complexity: string) => {
    switch (complexity) {
      case 'simple': return 'Simples';
      case 'medium': return 'Médio';
      case 'complex': return 'Complexo';
      default: return complexity;
    }
  };

  const formatTime = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} min`;
    } else {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return `${hours}h ${mins > 0 ? `${mins}min` : ''}`.trim();
    }
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />);
    }

    if (hasHalfStar) {
      stars.push(<Star key="half" className="h-4 w-4 fill-yellow-400 text-yellow-400" />);
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="h-4 w-4 text-gray-300" />);
    }

    return stars;
  };

  const stats = {
    total: templates.length,
    public: templates.filter(t => t.isPublic).length,
    featured: templates.filter(t => t.isFeatured).length,
    categories: new Set(templates.map(t => t.category)).size,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Templates de Workflow</h2>
          <p className="text-gray-600">Explore e utilize templates pré-definidos para acelerar a criação de workflows</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={() => toast.info('Funcionalidade de importação em desenvolvimento')}>
            <Upload className="h-4 w-4 mr-2" />
            Importar
          </Button>
          <Button onClick={handleCreateTemplate}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Template
          </Button>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Workflow className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total de Templates</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Eye className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Públicos</p>
              <p className="text-2xl font-bold text-gray-900">{stats.public}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Star className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Destaque</p>
              <p className="text-2xl font-bold text-gray-900">{stats.featured}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Bookmark className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Categorias</p>
              <p className="text-2xl font-bold text-gray-900">{stats.categories}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filtros */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Buscar templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <option value="all">Todas as Categorias</option>
            <option value="reservation">Reserva</option>
            <option value="payment">Pagamento</option>
            <option value="customer-service">Atendimento</option>
            <option value="operations">Operações</option>
            <option value="finance">Financeiro</option>
            <option value="hr">RH</option>
            <option value="marketing">Marketing</option>
            <option value="custom">Customizado</option>
          </Select>
          <Select value={complexityFilter} onValueChange={setComplexityFilter}>
            <option value="all">Todas as Complexidades</option>
            <option value="simple">Simples</option>
            <option value="medium">Médio</option>
            <option value="complex">Complexo</option>
          </Select>
          <Select value={sortBy} onValueChange={setSortBy}>
            <option value="popular">Mais Populares</option>
            <option value="rating">Melhor Avaliados</option>
            <option value="newest">Mais Recentes</option>
            <option value="oldest">Mais Antigos</option>
            <option value="complexity">Por Complexidade</option>
          </Select>
        </div>
      </Card>

      {/* Conteúdo Principal */}
      <Card>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="border-b border-gray-200">
            <div className="flex space-x-8 px-4">
              <button
                onClick={() => setActiveTab('browse')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'browse'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Explorar ({stats.total})
              </button>
              <button
                onClick={() => setActiveTab('featured')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'featured'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Destaques ({stats.featured})
              </button>
              <button
                onClick={() => setActiveTab('my-templates')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'my-templates'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Meus Templates
              </button>
            </div>
          </div>

          <div className="p-4">
            {activeTab === 'browse' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedTemplates.map((template) => (
                  <Card key={template.id} className="p-4 hover:shadow-lg transition-shadow">
                    <div className="space-y-4">
                      {/* Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900 mb-1">{template.name}</h3>
                          <p className="text-sm text-gray-600 line-clamp-2">{template.description}</p>
                        </div>
                        {template.isFeatured && (
                          <Star className="h-5 w-5 text-yellow-500 fill-current" />
                        )}
                      </div>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-2">
                        <Badge className={getCategoryColor(template.category)}>
                          {getCategoryLabel(template.category)}
                        </Badge>
                        <Badge className={getComplexityColor(template.complexity)}>
                          {getComplexityLabel(template.complexity)}
                        </Badge>
                        {template.tags.slice(0, 2).map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>

                      {/* Estatísticas */}
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div className="text-center">
                          <p className="text-gray-600">Passos</p>
                          <p className="font-medium">{template.steps}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-gray-600">Tempo</p>
                          <p className="font-medium">{formatTime(template.estimatedTime)}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-gray-600">Downloads</p>
                          <p className="font-medium">{template.downloads}</p>
                        </div>
                      </div>

                      {/* Avaliação */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-1">
                          {renderStars(template.rating)}
                          <span className="text-sm text-gray-600 ml-1">({template.rating})</span>
                        </div>
                        <span className="text-xs text-gray-500">por {template.author}</span>
                      </div>

                      {/* Ações */}
                      <div className="flex items-center space-x-2 pt-2 border-t border-gray-200">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onTemplateSelect?.(template)}
                          className="flex-1"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Visualizar
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownloadTemplate(template)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDuplicateTemplate(template)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteTemplate(template.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {activeTab === 'featured' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Templates em Destaque</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {templates.filter(t => t.isFeatured).map((template) => (
                    <Card key={template.id} className="p-4 border-2 border-yellow-200 bg-yellow-50">
                      <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                          <Star className="h-5 w-5 text-yellow-500 fill-current" />
                          <span className="text-sm font-medium text-yellow-800">Destaque</span>
                        </div>
                        
                        <h3 className="font-medium text-gray-900">{template.name}</h3>
                        <p className="text-sm text-gray-600">{template.description}</p>
                        
                        <div className="flex items-center space-x-2">
                          <Badge className={getCategoryColor(template.category)}>
                            {getCategoryLabel(template.category)}
                          </Badge>
                          <Badge className={getComplexityColor(template.complexity)}>
                            {getComplexityLabel(template.complexity)}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center justify-between text-sm">
                          <span>{template.steps} passos • {formatTime(template.estimatedTime)}</span>
                          <span className="flex items-center space-x-1">
                            {renderStars(template.rating)}
                            <span>({template.rating})</span>
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onTemplateSelect?.(template)}
                            className="flex-1"
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Visualizar
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleDownloadTemplate(template)}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Usar
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'my-templates' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Meus Templates</h3>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 text-center">
                    Funcionalidade de templates pessoais em desenvolvimento. Em breve você poderá criar e gerenciar seus próprios templates.
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
