'use client';
import React, { useState } from 'react';
import { Card, Button, Input, Badge, Tabs, Select, Avatar, Progress, Textarea } from '@/components/ui';
import { Plus, Settings, Edit, Trash2, Users, Calendar, Target, TrendingUp, Eye, Copy, Download, Filter, Search, Star, Clock, CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';

interface Project {
  id: string;
  name: string;
  description: string;
  status: 'planning' | 'active' | 'on-hold' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'critical';
  startDate: string;
  endDate: string;
  progress: number;
  budget: number;
  team: TeamMember[];
  tasks: number;
  completedTasks: number;
  tags: string[];
  manager: string;
  client: string;
  category: string;
}

interface TeamMember {
  id: string;
  name: string;
  role: string;
  avatar: string;
  status: 'active' | 'inactive';
}

interface ProjectManagerProps {
  onProjectSelect?: (project: Project) => void;
}

export default function ProjectManager({ onProjectSelect }: ProjectManagerProps) {
  const [projects, setProjects] = useState<Project[]>([
    {
      id: '1',
      name: 'Sistema de Onboarding RSV',
      description: 'Desenvolvimento completo do sistema de onboarding para clientes RSV',
      status: 'active',
      priority: 'high',
      startDate: '2025-01-15',
      endDate: '2025-06-30',
      progress: 75,
      budget: 150000,
      team: [
        { id: '1', name: 'João Silva', role: 'Project Manager', avatar: '/avatars/joao.jpg', status: 'active' },
        { id: '2', name: 'Maria Santos', role: 'Frontend Dev', avatar: '/avatars/maria.jpg', status: 'active' },
        { id: '3', name: 'Pedro Costa', role: 'Backend Dev', avatar: '/avatars/pedro.jpg', status: 'active' }
      ],
      tasks: 45,
      completedTasks: 34,
      tags: ['desenvolvimento', 'onboarding', 'sistema'],
      manager: 'João Silva',
      client: 'RSV Corp',
      category: 'Desenvolvimento'
    },
    {
      id: '2',
      name: 'Migração de Dados',
      description: 'Migração completa dos dados legados para o novo sistema',
      status: 'planning',
      priority: 'medium',
      startDate: '2025-03-01',
      endDate: '2025-04-30',
      progress: 15,
      budget: 50000,
      team: [
        { id: '4', name: 'Ana Lima', role: 'Data Engineer', avatar: '/avatars/ana.jpg', status: 'active' }
      ],
      tasks: 20,
      completedTasks: 3,
      tags: ['migração', 'dados', 'legado'],
      manager: 'Ana Lima',
      client: 'RSV Corp',
      category: 'Infraestrutura'
    }
  ]);

  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    status: 'planning' as const,
    priority: 'medium' as const,
    startDate: '',
    endDate: '',
    budget: 0,
    manager: '',
    client: '',
    category: '',
    tags: ''
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planning': return 'bg-blue-100 text-blue-800';
      case 'active': return 'bg-green-100 text-green-800';
      case 'on-hold': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
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

  const filteredProjects = projects.filter(project => {
    const matchesStatus = selectedStatus === 'all' || project.status === selectedStatus;
    const matchesPriority = selectedPriority === 'all' || project.priority === selectedPriority;
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.client.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesPriority && matchesSearch;
  });

  const handleCreateProject = () => {
    if (!newProject.name || !newProject.description) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    const project: Project = {
      id: Date.now().toString(),
      name: newProject.name,
      description: newProject.description,
      status: newProject.status,
      priority: newProject.priority,
      startDate: newProject.startDate,
      endDate: newProject.endDate,
      progress: 0,
      budget: newProject.budget,
      team: [],
      tasks: 0,
      completedTasks: 0,
      tags: newProject.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
      manager: newProject.manager,
      client: newProject.client,
      category: newProject.category
    };

    setProjects([...projects, project]);
    setShowCreateForm(false);
    setNewProject({
      name: '', description: '', status: 'planning', priority: 'medium',
      startDate: '', endDate: '', budget: 0, manager: '', client: '', category: '', tags: ''
    });
    toast.success('Projeto criado com sucesso!');
  };

  const handleEditProject = (project: Project) => {
    setEditingProject(project);
    setNewProject({
      name: project.name,
      description: project.description,
      status: project.status,
      priority: project.priority,
      startDate: project.startDate,
      endDate: project.endDate,
      budget: project.budget,
      manager: project.manager,
      client: project.client,
      category: project.category,
      tags: project.tags.join(', ')
    });
    setShowCreateForm(true);
  };

  const handleUpdateProject = () => {
    if (!editingProject) return;

    const updatedProjects = projects.map(p => 
      p.id === editingProject.id ? {
        ...p,
        name: newProject.name,
        description: newProject.description,
        status: newProject.status,
        priority: newProject.priority,
        startDate: newProject.startDate,
        endDate: newProject.endDate,
        budget: newProject.budget,
        manager: newProject.manager,
        client: newProject.client,
        category: newProject.category,
        tags: newProject.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
      } : p
    );

    setProjects(updatedProjects);
    setEditingProject(null);
    setShowCreateForm(false);
    setNewProject({
      name: '', description: '', status: 'planning', priority: 'medium',
      startDate: '', endDate: '', budget: 0, manager: '', client: '', category: '', tags: ''
    });
    toast.success('Projeto atualizado com sucesso!');
  };

  const handleDeleteProject = (projectId: string) => {
    setProjects(projects.filter(p => p.id !== projectId));
    toast.success('Projeto removido com sucesso!');
  };

  const handleDuplicateProject = (project: Project) => {
    const duplicatedProject = {
      ...project,
      id: Date.now().toString(),
      name: `${project.name} (Cópia)`,
      status: 'planning' as const,
      progress: 0,
      completedTasks: 0
    };
    setProjects([...projects, duplicatedProject]);
    toast.success('Projeto duplicado com sucesso!');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestão de Projetos</h2>
          <p className="text-gray-600">Gerencie todos os projetos da empresa</p>
        </div>
        <Button onClick={() => setShowCreateForm(true)} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Novo Projeto
        </Button>
      </div>

      {/* Filtros */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <option value="all">Todos os Status</option>
              <option value="planning">Planejamento</option>
              <option value="active">Ativo</option>
              <option value="on-hold">Em Pausa</option>
              <option value="completed">Concluído</option>
              <option value="cancelled">Cancelado</option>
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
              placeholder="Nome, descrição ou cliente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-end">
            <Button variant="outline" className="w-full">
              <Filter className="w-4 h-4 mr-2" />
              Filtros
            </Button>
          </div>
        </div>
      </Card>

      {/* Formulário de Criação/Edição */}
      {showCreateForm && (
        <Card className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">
              {editingProject ? 'Editar Projeto' : 'Novo Projeto'}
            </h3>
            <Button variant="ghost" onClick={() => {
              setShowCreateForm(false);
              setEditingProject(null);
              setNewProject({
                name: '', description: '', status: 'planning', priority: 'medium',
                startDate: '', endDate: '', budget: 0, manager: '', client: '', category: '', tags: ''
              });
            }}>
              ✕
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Projeto *</label>
              <Input
                value={newProject.name}
                onChange={(e) => setNewProject({...newProject, name: e.target.value})}
                placeholder="Digite o nome do projeto"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
              <Input
                value={newProject.category}
                onChange={(e) => setNewProject({...newProject, category: e.target.value})}
                placeholder="Ex: Desenvolvimento, Marketing"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Descrição *</label>
              <Textarea
                value={newProject.description}
                onChange={(e) => setNewProject({...newProject, description: e.target.value})}
                placeholder="Descreva o projeto"
                rows={3}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <Select value={newProject.status} onValueChange={(value: any) => setNewProject({...newProject, status: value})}>
                <option value="planning">Planejamento</option>
                <option value="active">Ativo</option>
                <option value="on-hold">Em Pausa</option>
                <option value="completed">Concluído</option>
                <option value="cancelled">Cancelado</option>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prioridade</label>
              <Select value={newProject.priority} onValueChange={(value: any) => setNewProject({...newProject, priority: value})}>
                <option value="low">Baixa</option>
                <option value="medium">Média</option>
                <option value="high">Alta</option>
                <option value="critical">Crítica</option>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data de Início</label>
              <Input
                type="date"
                value={newProject.startDate}
                onChange={(e) => setNewProject({...newProject, startDate: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data de Fim</label>
              <Input
                type="date"
                value={newProject.endDate}
                onChange={(e) => setNewProject({...newProject, endDate: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Orçamento (R$)</label>
              <Input
                type="number"
                value={newProject.budget}
                onChange={(e) => setNewProject({...newProject, budget: Number(e.target.value)})}
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gerente</label>
              <Input
                value={newProject.manager}
                onChange={(e) => setNewProject({...newProject, manager: e.target.value})}
                placeholder="Nome do gerente"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cliente</label>
              <Input
                value={newProject.client}
                onChange={(e) => setNewProject({...newProject, client: e.target.value})}
                placeholder="Nome do cliente"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
              <Input
                value={newProject.tags}
                onChange={(e) => setNewProject({...newProject, tags: e.target.value})}
                placeholder="tag1, tag2, tag3"
              />
            </div>
          </div>
          
          <div className="flex justify-end space-x-2 mt-6">
            <Button variant="outline" onClick={() => {
              setShowCreateForm(false);
              setEditingProject(null);
            }}>
              Cancelar
            </Button>
            <Button onClick={editingProject ? handleUpdateProject : handleCreateProject}>
              {editingProject ? 'Atualizar' : 'Criar'} Projeto
            </Button>
          </div>
        </Card>
      )}

      {/* Lista de Projetos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredProjects.map((project) => (
          <Card key={project.id} className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{project.name}</h3>
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">{project.description}</p>
              </div>
              <div className="flex space-x-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEditProject(project)}
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDuplicateProject(project)}
                >
                  <Copy className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteProject(project.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex items-center justify-between">
                <Badge className={getStatusColor(project.status)}>
                  {project.status === 'planning' && 'Planejamento'}
                  {project.status === 'active' && 'Ativo'}
                  {project.status === 'on-hold' && 'Em Pausa'}
                  {project.status === 'completed' && 'Concluído'}
                  {project.status === 'cancelled' && 'Cancelado'}
                </Badge>
                <Badge className={getPriorityColor(project.priority)}>
                  {project.priority === 'low' && 'Baixa'}
                  {project.priority === 'medium' && 'Média'}
                  {project.priority === 'high' && 'Alta'}
                  {project.priority === 'critical' && 'Crítica'}
                </Badge>
              </div>

              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  {new Date(project.startDate).toLocaleDateString('pt-BR')}
                </div>
                <div className="flex items-center">
                  <Target className="w-4 h-4 mr-1" />
                  {new Date(project.endDate).toLocaleDateString('pt-BR')}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Progresso</span>
                <span className="text-sm font-medium">{project.progress}%</span>
              </div>
              <Progress value={project.progress} className="w-full" />

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center">
                  <Users className="w-4 h-4 mr-1" />
                  {project.team.length} membros
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  {project.completedTasks}/{project.tasks} tarefas
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Orçamento:</span>
                <span className="font-medium">R$ {project.budget.toLocaleString('pt-BR')}</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Avatar className="w-6 h-6">
                  <span className="text-xs">{project.manager.split(' ')[0][0]}</span>
                </Avatar>
                <span className="text-sm text-gray-600">{project.manager}</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onProjectSelect?.(project)}
              >
                <Eye className="w-4 h-4 mr-1" />
                Ver Detalhes
              </Button>
            </div>

            {project.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-3">
                {project.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </Card>
        ))}
      </div>

      {filteredProjects.length === 0 && (
        <Card className="p-12 text-center">
          <div className="text-gray-500">
            <Target className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">Nenhum projeto encontrado</h3>
            <p className="text-gray-400">Crie seu primeiro projeto ou ajuste os filtros</p>
          </div>
        </Card>
      )}
    </div>
  );
}
