'use client';
import React, { useState } from 'react';
import { Card, Button, Input, Badge, Tabs, Select, Avatar, Progress, Textarea, Switch } from '@/components/ui';
import { Plus, Settings, Edit, Trash2, Users, Calendar, Target, Clock, CheckCircle, AlertCircle, XCircle, Eye, Copy, Filter, Search, Star, User, Tag, Mail, Phone, MapPin, Award, TrendingUp, CalendarDays, Milestone, ArrowRight, ArrowLeft, Play, Pause, Square } from 'lucide-react';
import { toast } from 'sonner';

interface Milestone {
  id: string;
  title: string;
  description: string;
  projectId: string;
  projectName: string;
  dueDate: string;
  status: 'pending' | 'in-progress' | 'completed' | 'delayed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  assignee: string;
  assigneeAvatar: string;
  progress: number;
  dependencies: string[];
  tags: string[];
  completedDate?: string;
  notes: string;
}

interface ProjectPhase {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  status: 'planning' | 'active' | 'completed' | 'on-hold';
  progress: number;
  milestones: Milestone[];
  team: string[];
  budget: number;
  actualCost: number;
}

interface ProjectTimelineProps {
  onMilestoneSelect?: (milestone: Milestone) => void;
  onPhaseSelect?: (phase: ProjectPhase) => void;
}

export default function ProjectTimeline({ onMilestoneSelect, onPhaseSelect }: ProjectTimelineProps) {
  const [milestones, setMilestones] = useState<Milestone[]>([
    {
      id: '1',
      title: 'Definição de Requisitos',
      description: 'Documentar todos os requisitos funcionais e não funcionais do sistema',
      projectId: '1',
      projectName: 'Sistema de Onboarding RSV',
      dueDate: '2025-01-31',
      status: 'completed',
      priority: 'high',
      assignee: 'João Silva',
      assigneeAvatar: '/avatars/joao.jpg',
      progress: 100,
      dependencies: [],
      tags: ['requisitos', 'documentação', 'planejamento'],
      completedDate: '2025-01-28',
      notes: 'Requisitos aprovados pelo cliente e equipe técnica'
    },
    {
      id: '2',
      title: 'Arquitetura do Sistema',
      description: 'Definir arquitetura técnica e infraestrutura',
      projectId: '1',
      projectName: 'Sistema de Onboarding RSV',
      dueDate: '2025-02-15',
      status: 'in-progress',
      priority: 'high',
      assignee: 'Pedro Costa',
      assigneeAvatar: '/avatars/pedro.jpg',
      progress: 75,
      dependencies: ['1'],
      tags: ['arquitetura', 'tecnologia', 'infraestrutura'],
      notes: 'Arquitetura definida, implementação em andamento'
    },
    {
      id: '3',
      title: 'Prototipagem UI/UX',
      description: 'Criar protótipos e wireframes das interfaces',
      projectId: '1',
      projectName: 'Sistema de Onboarding RSV',
      dueDate: '2025-02-20',
      status: 'pending',
      priority: 'medium',
      assignee: 'Ana Lima',
      assigneeAvatar: '/avatars/ana.jpg',
      progress: 0,
      dependencies: ['1'],
      tags: ['design', 'ui/ux', 'prototipagem'],
      notes: 'Aguardando aprovação dos requisitos'
    }
  ]);

  const [phases, setPhases] = useState<ProjectPhase[]>([
    {
      id: '1',
      name: 'Fase de Planejamento',
      description: 'Definição de requisitos, arquitetura e planejamento detalhado',
      startDate: '2025-01-15',
      endDate: '2025-02-28',
      status: 'active',
      progress: 60,
      milestones: ['1', '2'],
      team: ['João Silva', 'Pedro Costa', 'Ana Lima'],
      budget: 50000,
      actualCost: 30000
    },
    {
      id: '2',
      name: 'Fase de Desenvolvimento',
      description: 'Implementação das funcionalidades principais do sistema',
      startDate: '2025-03-01',
      endDate: '2025-05-31',
      status: 'planning',
      progress: 0,
      milestones: ['3'],
      team: ['Maria Santos', 'Pedro Costa'],
      budget: 80000,
      actualCost: 0
    },
    {
      id: '3',
      name: 'Fase de Testes',
      description: 'Testes unitários, integração e aceitação do usuário',
      startDate: '2025-06-01',
      endDate: '2025-06-30',
      status: 'planning',
      progress: 0,
      milestones: [],
      team: ['Ana Lima', 'João Silva'],
      budget: 20000,
      actualCost: 0
    }
  ]);

  const [selectedProject, setSelectedProject] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showMilestoneForm, setShowMilestoneForm] = useState(false);
  const [showPhaseForm, setShowPhaseForm] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState<Milestone | null>(null);
  const [editingPhase, setEditingPhase] = useState<ProjectPhase | null>(null);
  const [viewMode, setViewMode] = useState<'timeline' | 'list' | 'gantt'>('timeline');

  const [newMilestone, setNewMilestone] = useState({
    title: '',
    description: '',
    projectId: '1',
    dueDate: '',
    status: 'pending' as const,
    priority: 'medium' as const,
    assignee: '',
    tags: '',
    notes: ''
  });

  const [newPhase, setNewPhase] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    status: 'planning' as const,
    budget: 0,
    team: ''
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-gray-100 text-gray-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'delayed': return 'bg-red-100 text-red-800';
      case 'planning': return 'bg-purple-100 text-purple-800';
      case 'active': return 'bg-green-100 text-green-800';
      case 'on-hold': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-gray-100 text-gray-800';
      case 'medium': return 'bg-blue-100 text-blue-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPhaseStatusColor = (status: string) => {
    switch (status) {
      case 'planning': return 'bg-purple-100 text-purple-800';
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'on-hold': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredMilestones = milestones.filter(milestone => {
    const matchesProject = selectedProject === 'all' || milestone.projectId === selectedProject;
    const matchesStatus = selectedStatus === 'all' || milestone.status === selectedStatus;
    const matchesPriority = selectedPriority === 'all' || milestone.priority === selectedPriority;
    const matchesSearch = milestone.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         milestone.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         milestone.projectName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesProject && matchesStatus && matchesPriority && matchesSearch;
  });

  const handleCreateMilestone = () => {
    if (!newMilestone.title || !newMilestone.description || !newMilestone.assignee) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    const milestone: Milestone = {
      id: Date.now().toString(),
      title: newMilestone.title,
      description: newMilestone.description,
      projectId: newMilestone.projectId,
      projectName: 'Sistema de Onboarding RSV',
      dueDate: newMilestone.dueDate,
      status: newMilestone.status,
      priority: newMilestone.priority,
      assignee: newMilestone.assignee,
      assigneeAvatar: `/avatars/${newMilestone.assignee.toLowerCase().split(' ')[0]}.jpg`,
      progress: 0,
      dependencies: [],
      tags: newMilestone.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
      notes: newMilestone.notes
    };

    setMilestones([...milestones, milestone]);
    setShowMilestoneForm(false);
    setNewMilestone({
      title: '', description: '', projectId: '1', dueDate: '', status: 'pending',
      priority: 'medium', assignee: '', tags: '', notes: ''
    });
    toast.success('Milestone criado com sucesso!');
  };

  const handleCreatePhase = () => {
    if (!newPhase.name || !newPhase.description || !newPhase.startDate || !newPhase.endDate) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    const phase: ProjectPhase = {
      id: Date.now().toString(),
      name: newPhase.name,
      description: newPhase.description,
      startDate: newPhase.startDate,
      endDate: newPhase.endDate,
      status: newPhase.status,
      progress: 0,
      milestones: [],
      team: newPhase.team.split(',').map(member => member.trim()).filter(member => member),
      budget: newPhase.budget,
      actualCost: 0
    };

    setPhases([...phases, phase]);
    setShowPhaseForm(false);
    setNewPhase({
      name: '', description: '', startDate: '', endDate: '', status: 'planning', budget: 0, team: ''
    });
    toast.success('Fase criada com sucesso!');
  };

  const handleEditMilestone = (milestone: Milestone) => {
    setEditingMilestone(milestone);
    setNewMilestone({
      title: milestone.title,
      description: milestone.description,
      projectId: milestone.projectId,
      dueDate: milestone.dueDate,
      status: milestone.status,
      priority: milestone.priority,
      assignee: milestone.assignee,
      tags: milestone.tags.join(', '),
      notes: milestone.notes
    });
    setShowMilestoneForm(true);
  };

  const handleUpdateMilestone = () => {
    if (!editingMilestone) return;

    const updatedMilestones = milestones.map(m => 
      m.id === editingMilestone.id ? {
        ...m,
        title: newMilestone.title,
        description: newMilestone.description,
        projectId: newMilestone.projectId,
        dueDate: newMilestone.dueDate,
        status: newMilestone.status,
        priority: newMilestone.priority,
        assignee: newMilestone.assignee,
        assigneeAvatar: `/avatars/${newMilestone.assignee.toLowerCase().split(' ')[0]}.jpg`,
        tags: newMilestone.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        notes: newMilestone.notes
      } : m
    );

    setMilestones(updatedMilestones);
    setEditingMilestone(null);
    setShowMilestoneForm(false);
    setNewMilestone({
      title: '', description: '', projectId: '1', dueDate: '', status: 'pending',
      priority: 'medium', assignee: '', tags: '', notes: ''
    });
    toast.success('Milestone atualizado com sucesso!');
  };

  const handleDeleteMilestone = (milestoneId: string) => {
    setMilestones(milestones.filter(m => m.id !== milestoneId));
    toast.success('Milestone removido com sucesso!');
  };

  const handleStatusChange = (milestoneId: string, newStatus: Milestone['status']) => {
    setMilestones(milestones.map(m => 
      m.id === milestoneId ? { 
        ...m, 
        status: newStatus, 
        completedDate: newStatus === 'completed' ? new Date().toISOString().split('T')[0] : undefined 
      } : m
    ));
    toast.success('Status do milestone atualizado!');
  };

  const renderTimelineView = () => (
    <div className="space-y-8">
      {phases.map((phase) => (
        <div key={phase.id} className="relative">
          <div className="flex items-center mb-4">
            <div className="flex items-center space-x-3">
              <div className={`w-4 h-4 rounded-full ${getPhaseStatusColor(phase.status)}`}></div>
              <h3 className="text-lg font-semibold text-gray-900">{phase.name}</h3>
              <Badge className={getPhaseStatusColor(phase.status)}>
                {phase.status === 'planning' && 'Planejamento'}
                {phase.status === 'active' && 'Ativa'}
                {phase.status === 'completed' && 'Concluída'}
                {phase.status === 'on-hold' && 'Em Pausa'}
              </Badge>
            </div>
            <div className="ml-auto flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {new Date(phase.startDate).toLocaleDateString('pt-BR')} - {new Date(phase.endDate).toLocaleDateString('pt-BR')}
              </span>
              <span className="text-sm font-medium">{phase.progress}%</span>
              <Progress value={phase.progress} className="w-24" />
            </div>
          </div>

          <div className="ml-6 border-l-2 border-gray-200 pl-6 space-y-4">
            {milestones
              .filter(milestone => phase.milestones.includes(milestone.id))
              .map((milestone, index) => (
                <div key={milestone.id} className="relative">
                  <div className="absolute -left-8 top-2 w-4 h-4 bg-white border-2 border-gray-300 rounded-full"></div>
                  <Card className="p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h4 className="font-medium text-gray-900">{milestone.title}</h4>
                          <Badge className={getStatusColor(milestone.status)}>
                            {milestone.status === 'pending' && 'Pendente'}
                            {milestone.status === 'in-progress' && 'Em Progresso'}
                            {milestone.status === 'completed' && 'Concluído'}
                            {milestone.status === 'delayed' && 'Atrasado'}
                          </Badge>
                          <Badge className={getPriorityColor(milestone.priority)}>
                            {milestone.priority === 'low' && 'Baixa'}
                            {milestone.priority === 'medium' && 'Média'}
                            {milestone.priority === 'high' && 'Alta'}
                            {milestone.priority === 'critical' && 'Crítica'}
                          </Badge>
                        </div>
                        <p className="text-gray-600 text-sm mb-3">{milestone.description}</p>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-3">
                          <div className="flex items-center">
                            <User className="w-4 h-4 mr-1" />
                            {milestone.assignee}
                          </div>
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            {new Date(milestone.dueDate).toLocaleDateString('pt-BR')}
                          </div>
                          <div className="flex items-center">
                            <Target className="w-4 h-4 mr-1" />
                            {milestone.projectName}
                          </div>
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            {milestone.progress}%
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <Progress value={milestone.progress} className="w-32" />
                          <div className="flex space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleStatusChange(milestone.id, 'pending')}
                              disabled={milestone.status === 'pending'}
                            >
                              <Square className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleStatusChange(milestone.id, 'in-progress')}
                              disabled={milestone.status === 'in-progress'}
                            >
                              <Play className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleStatusChange(milestone.id, 'completed')}
                              disabled={milestone.status === 'completed'}
                            >
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>

                        {milestone.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-3">
                            {milestone.tags.map((tag, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col space-y-2 ml-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditMilestone(milestone)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onMilestoneSelect?.(milestone)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                </div>
              ))}
          </div>
        </div>
      ))}
    </div>
  );

  const renderListView = () => (
    <div className="space-y-3">
      {filteredMilestones.map((milestone) => (
        <Card key={milestone.id} className="p-4 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <h3 className="font-semibold text-gray-900">{milestone.title}</h3>
                <Badge className={getStatusColor(milestone.status)}>
                  {milestone.status === 'pending' && 'Pendente'}
                  {milestone.status === 'in-progress' && 'Em Progresso'}
                  {milestone.status === 'completed' && 'Concluído'}
                  {milestone.status === 'delayed' && 'Atrasado'}
                </Badge>
                <Badge className={getPriorityColor(milestone.priority)}>
                  {milestone.priority === 'low' && 'Baixa'}
                  {milestone.priority === 'medium' && 'Média'}
                  {milestone.priority === 'high' && 'Alta'}
                  {milestone.priority === 'critical' && 'Crítica'}
                </Badge>
              </div>
              <p className="text-gray-600 text-sm mb-3">{milestone.description}</p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-3">
                <div className="flex items-center">
                  <User className="w-4 h-4 mr-1" />
                  {milestone.assignee}
                </div>
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  {new Date(milestone.dueDate).toLocaleDateString('pt-BR')}
                </div>
                <div className="flex items-center">
                  <Target className="w-4 h-4 mr-1" />
                  {milestone.projectName}
                </div>
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  {milestone.progress}%
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Progress value={milestone.progress} className="w-32" />
                <div className="flex space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleStatusChange(milestone.id, 'pending')}
                    disabled={milestone.status === 'pending'}
                  >
                    <Square className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleStatusChange(milestone.id, 'in-progress')}
                    disabled={milestone.status === 'in-progress'}
                  >
                    <Play className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleStatusChange(milestone.id, 'completed')}
                    disabled={milestone.status === 'completed'}
                  >
                    <CheckCircle className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex flex-col space-y-2 ml-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleEditMilestone(milestone)}
              >
                <Edit className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onMilestoneSelect?.(milestone)}
              >
                <Eye className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Cronogramas e Timeline</h2>
          <p className="text-gray-600">Gerencie cronogramas, fases e milestones dos projetos</p>
        </div>
        <div className="flex space-x-2">
          <Button
            variant={viewMode === 'timeline' ? 'default' : 'outline'}
            onClick={() => setViewMode('timeline')}
          >
            Timeline
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            onClick={() => setViewMode('list')}
          >
            Lista
          </Button>
          <Button onClick={() => setShowMilestoneForm(true)} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Novo Milestone
          </Button>
          <Button onClick={() => setShowPhaseForm(true)} className="bg-green-600 hover:bg-green-700">
            <Plus className="w-4 h-4 mr-2" />
            Nova Fase
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Projeto</label>
            <Select value={selectedProject} onValueChange={setSelectedProject}>
              <option value="all">Todos os Projetos</option>
              <option value="1">Sistema de Onboarding RSV</option>
              <option value="2">Migração de Dados</option>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <option value="all">Todos os Status</option>
              <option value="pending">Pendente</option>
              <option value="in-progress">Em Progresso</option>
              <option value="completed">Concluído</option>
              <option value="delayed">Atrasado</option>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Prioridade</label>
            <Select value={selectedPriority} onValueChange={setSelectedPriority}>
              <option value="all">Todas as Prioridades</option>
              <option value="low">Baixa</option>
              <option value="medium">Média</option>
              <option value="high">Alta</option>
              <option value="critical">Crítica</option>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Buscar</label>
            <Input
              placeholder="Título, descrição ou projeto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </Card>

      {/* Formulário de Milestone */}
      {showMilestoneForm && (
        <Card className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">
              {editingMilestone ? 'Editar Milestone' : 'Novo Milestone'}
            </h3>
            <Button variant="ghost" onClick={() => {
              setShowMilestoneForm(false);
              setEditingMilestone(null);
              setNewMilestone({
                title: '', description: '', projectId: '1', dueDate: '', status: 'pending',
                priority: 'medium', assignee: '', tags: '', notes: ''
              });
            }}>
              ✕
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Título *</label>
              <Input
                value={newMilestone.title}
                onChange={(e) => setNewMilestone({...newMilestone, title: e.target.value})}
                placeholder="Digite o título do milestone"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Responsável *</label>
              <Select value={newMilestone.assignee} onValueChange={(value: any) => setNewMilestone({...newMilestone, assignee: value})}>
                <option value="">Selecione um responsável</option>
                <option value="João Silva">João Silva</option>
                <option value="Maria Santos">Maria Santos</option>
                <option value="Pedro Costa">Pedro Costa</option>
                <option value="Ana Lima">Ana Lima</option>
              </Select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Descrição *</label>
              <Textarea
                value={newMilestone.description}
                onChange={(e) => setNewMilestone({...newMilestone, description: e.target.value})}
                placeholder="Descreva o milestone"
                rows={3}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data de Vencimento</label>
              <Input
                type="date"
                value={newMilestone.dueDate}
                onChange={(e) => setNewMilestone({...newMilestone, dueDate: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <Select value={newMilestone.status} onValueChange={(value: any) => setNewMilestone({...newMilestone, status: value})}>
                <option value="pending">Pendente</option>
                <option value="in-progress">Em Progresso</option>
                <option value="completed">Concluído</option>
                <option value="delayed">Atrasado</option>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prioridade</label>
              <Select value={newMilestone.priority} onValueChange={(value: any) => setNewMilestone({...newMilestone, priority: value})}>
                <option value="low">Baixa</option>
                <option value="medium">Média</option>
                <option value="high">Alta</option>
                <option value="critical">Crítica</option>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
              <Input
                value={newMilestone.tags}
                onChange={(e) => setNewMilestone({...newMilestone, tags: e.target.value})}
                placeholder="tag1, tag2, tag3"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Observações</label>
              <Textarea
                value={newMilestone.notes}
                onChange={(e) => setNewMilestone({...newMilestone, notes: e.target.value})}
                placeholder="Observações adicionais"
                rows={2}
              />
            </div>
          </div>
          
          <div className="flex justify-end space-x-2 mt-6">
            <Button variant="outline" onClick={() => {
              setShowMilestoneForm(false);
              setEditingMilestone(null);
            }}>
              Cancelar
            </Button>
            <Button onClick={editingMilestone ? handleUpdateMilestone : handleCreateMilestone}>
              {editingMilestone ? 'Atualizar' : 'Criar'} Milestone
            </Button>
          </div>
        </Card>
      )}

      {/* Formulário de Fase */}
      {showPhaseForm && (
        <Card className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">
              {editingPhase ? 'Editar Fase' : 'Nova Fase'}
            </h3>
            <Button variant="ghost" onClick={() => {
              setShowPhaseForm(false);
              setEditingPhase(null);
              setNewPhase({
                name: '', description: '', startDate: '', endDate: '', status: 'planning', budget: 0, team: ''
              });
            }}>
              ✕
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome da Fase *</label>
              <Input
                value={newPhase.name}
                onChange={(e) => setNewPhase({...newPhase, name: e.target.value})}
                placeholder="Digite o nome da fase"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <Select value={newPhase.status} onValueChange={(value: any) => setNewPhase({...newPhase, status: value})}>
                <option value="planning">Planejamento</option>
                <option value="active">Ativa</option>
                <option value="completed">Concluída</option>
                <option value="on-hold">Em Pausa</option>
              </Select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Descrição *</label>
              <Textarea
                value={newPhase.description}
                onChange={(e) => setNewPhase({...newPhase, description: e.target.value})}
                placeholder="Descreva a fase"
                rows={3}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data de Início *</label>
              <Input
                type="date"
                value={newPhase.startDate}
                onChange={(e) => setNewPhase({...newPhase, startDate: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data de Fim *</label>
              <Input
                type="date"
                value={newPhase.endDate}
                onChange={(e) => setNewPhase({...newPhase, endDate: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Orçamento (R$)</label>
              <Input
                type="number"
                value={newPhase.budget}
                onChange={(e) => setNewPhase({...newPhase, budget: Number(e.target.value)})}
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Equipe</label>
              <Input
                value={newPhase.team}
                onChange={(e) => setNewPhase({...newPhase, team: e.target.value})}
                placeholder="membro1, membro2, membro3"
              />
            </div>
          </div>
          
          <div className="flex justify-end space-x-2 mt-6">
            <Button variant="outline" onClick={() => {
              setShowPhaseForm(false);
              setEditingPhase(null);
            }}>
              Cancelar
            </Button>
            <Button onClick={editingPhase ? handleUpdateMilestone : handleCreatePhase}>
              {editingPhase ? 'Atualizar' : 'Criar'} Fase
            </Button>
          </div>
        </Card>
      )}

      {/* Visualização */}
      {viewMode === 'timeline' ? renderTimelineView() : renderListView()}

      {filteredMilestones.length === 0 && (
        <Card className="p-12 text-center">
          <div className="text-gray-500">
            <Milestone className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">Nenhum milestone encontrado</h3>
            <p className="text-gray-400">Crie seu primeiro milestone ou ajuste os filtros</p>
          </div>
        </Card>
      )}
    </div>
  );
}
