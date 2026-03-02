'use client';
import React, { useState } from 'react';
import { Card, Button, Input, Badge, Tabs, Select, Avatar, Progress, Textarea, Switch } from '@/components/ui';
import { Plus, Settings, Edit, Trash2, Users, Calendar, Target, Clock, CheckCircle, AlertCircle, XCircle, Eye, Copy, Filter, Search, Star, User, Tag, Flag } from 'lucide-react';
import { toast } from 'sonner';

interface Task {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'review' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'critical';
  assignee: string;
  assigneeAvatar: string;
  project: string;
  projectId: string;
  dueDate: string;
  estimatedHours: number;
  actualHours: number;
  progress: number;
  tags: string[];
  dependencies: string[];
  attachments: number;
  comments: number;
  createdAt: string;
  updatedAt: string;
}

interface TaskManagerProps {
  onTaskSelect?: (task: Task) => void;
}

export default function TaskManager({ onTaskSelect }: TaskManagerProps) {
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: '1',
      title: 'Implementar Sistema de Autenticação',
      description: 'Desenvolver sistema completo de login, registro e controle de acesso',
      status: 'in-progress',
      priority: 'high',
      assignee: 'Maria Santos',
      assigneeAvatar: '/avatars/maria.jpg',
      project: 'Sistema de Onboarding RSV',
      projectId: '1',
      dueDate: '2025-02-15',
      estimatedHours: 40,
      actualHours: 25,
      progress: 62,
      tags: ['frontend', 'autenticação', 'segurança'],
      dependencies: [],
      attachments: 3,
      comments: 8,
      createdAt: '2025-01-15',
      updatedAt: '2025-01-20'
    },
    {
      id: '2',
      title: 'Criar API de Usuários',
      description: 'Desenvolver endpoints para CRUD de usuários com validações',
      status: 'todo',
      priority: 'medium',
      assignee: 'Pedro Costa',
      assigneeAvatar: '/avatars/pedro.jpg',
      project: 'Sistema de Onboarding RSV',
      projectId: '1',
      dueDate: '2025-02-20',
      estimatedHours: 24,
      actualHours: 0,
      progress: 0,
      tags: ['backend', 'api', 'usuários'],
      dependencies: ['1'],
      attachments: 1,
      comments: 2,
      createdAt: '2025-01-18',
      updatedAt: '2025-01-18'
    },
    {
      id: '3',
      title: 'Design do Dashboard Principal',
      description: 'Criar interface visual para o dashboard principal do sistema',
      status: 'review',
      priority: 'medium',
      assignee: 'Ana Lima',
      assigneeAvatar: '/avatars/ana.jpg',
      project: 'Sistema de Onboarding RSV',
      projectId: '1',
      dueDate: '2025-02-10',
      estimatedHours: 16,
      actualHours: 18,
      progress: 100,
      tags: ['design', 'ui/ux', 'dashboard'],
      dependencies: [],
      attachments: 5,
      comments: 12,
      createdAt: '2025-01-10',
      updatedAt: '2025-01-19'
    }
  ]);

  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [selectedAssignee, setSelectedAssignee] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');

  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    status: 'todo' as const,
    priority: 'medium' as const,
    assignee: '',
    project: '',
    dueDate: '',
    estimatedHours: 0,
    tags: ''
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'todo': return 'bg-gray-100 text-gray-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'review': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
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

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'low': return <Flag className="w-3 h-3 text-gray-500" />;
      case 'medium': return <Flag className="w-3 h-3 text-blue-500" />;
      case 'high': return <Flag className="w-3 h-3 text-orange-500" />;
      case 'critical': return <Flag className="w-3 h-3 text-red-500" />;
      default: return <Flag className="w-3 h-3 text-gray-500" />;
    }
  };

  const filteredTasks = tasks.filter(task => {
    const matchesStatus = selectedStatus === 'all' || task.status === selectedStatus;
    const matchesPriority = selectedPriority === 'all' || task.priority === selectedPriority;
    const matchesAssignee = selectedAssignee === 'all' || task.assignee === selectedAssignee;
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.project.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesPriority && matchesAssignee && matchesSearch;
  });

  const handleCreateTask = () => {
    if (!newTask.title || !newTask.description || !newTask.assignee) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    const task: Task = {
      id: Date.now().toString(),
      title: newTask.title,
      description: newTask.description,
      status: newTask.status,
      priority: newTask.priority,
      assignee: newTask.assignee,
      assigneeAvatar: `/avatars/${newTask.assignee.toLowerCase().split(' ')[0]}.jpg`,
      project: newTask.project,
      projectId: '1',
      dueDate: newTask.dueDate,
      estimatedHours: newTask.estimatedHours,
      actualHours: 0,
      progress: 0,
      tags: newTask.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
      dependencies: [],
      attachments: 0,
      comments: 0,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0]
    };

    setTasks([...tasks, task]);
    setShowCreateForm(false);
    setNewTask({
      title: '', description: '', status: 'todo', priority: 'medium',
      assignee: '', project: '', dueDate: '', estimatedHours: 0, tags: ''
    });
    toast.success('Tarefa criada com sucesso!');
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setNewTask({
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      assignee: task.assignee,
      project: task.project,
      dueDate: task.dueDate,
      estimatedHours: task.estimatedHours,
      tags: task.tags.join(', ')
    });
    setShowCreateForm(true);
  };

  const handleUpdateTask = () => {
    if (!editingTask) return;

    const updatedTasks = tasks.map(t => 
      t.id === editingTask.id ? {
        ...t,
        title: newTask.title,
        description: newTask.description,
        status: newTask.status,
        priority: newTask.priority,
        assignee: newTask.assignee,
        assigneeAvatar: `/avatars/${newTask.assignee.toLowerCase().split(' ')[0]}.jpg`,
        project: newTask.project,
        dueDate: newTask.dueDate,
        estimatedHours: newTask.estimatedHours,
        tags: newTask.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        updatedAt: new Date().toISOString().split('T')[0]
      } : t
    );

    setTasks(updatedTasks);
    setEditingTask(null);
    setShowCreateForm(false);
    setNewTask({
      title: '', description: '', status: 'todo', priority: 'medium',
      assignee: '', project: '', dueDate: '', estimatedHours: 0, tags: ''
    });
    toast.success('Tarefa atualizada com sucesso!');
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks(tasks.filter(t => t.id !== taskId));
    toast.success('Tarefa removida com sucesso!');
  };

  const handleDuplicateTask = (task: Task) => {
    const duplicatedTask = {
      ...task,
      id: Date.now().toString(),
      title: `${task.title} (Cópia)`,
      status: 'todo' as const,
      progress: 0,
      actualHours: 0,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0]
    };
    setTasks([...tasks, duplicatedTask]);
    toast.success('Tarefa duplicada com sucesso!');
  };

  const handleStatusChange = (taskId: string, newStatus: Task['status']) => {
    setTasks(tasks.map(t => 
      t.id === taskId ? { ...t, status: newStatus, updatedAt: new Date().toISOString().split('T')[0] } : t
    ));
    toast.success('Status da tarefa atualizado!');
  };

  const renderKanbanView = () => {
    const columns = [
      { key: 'todo', label: 'A Fazer', color: 'bg-gray-100' },
      { key: 'in-progress', label: 'Em Progresso', color: 'bg-blue-100' },
      { key: 'review', label: 'Em Revisão', color: 'bg-yellow-100' },
      { key: 'completed', label: 'Concluído', color: 'bg-green-100' }
    ];

    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {columns.map(column => (
          <div key={column.key} className={`${column.color} rounded-lg p-4`}>
            <h3 className="font-semibold text-gray-800 mb-4">{column.label}</h3>
            <div className="space-y-3">
              {filteredTasks
                .filter(task => task.status === column.key)
                .map(task => (
                  <Card key={task.id} className="p-3 cursor-pointer hover:shadow-md transition-shadow">
                    <div className="space-y-2">
                      <div className="flex items-start justify-between">
                        <h4 className="font-medium text-sm text-gray-900 line-clamp-2">{task.title}</h4>
                        {getPriorityIcon(task.priority)}
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-600">
                        <span>{task.assignee}</span>
                        <span>{task.dueDate}</span>
                      </div>
                      <Progress value={task.progress} className="w-full h-1" />
                    </div>
                  </Card>
                ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderListView = () => (
    <div className="space-y-3">
      {filteredTasks.map((task) => (
        <Card key={task.id} className="p-4 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div className="flex-1 space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">{task.title}</h3>
                  <p className="text-gray-600 text-sm mb-2 line-clamp-2">{task.description}</p>
                </div>
                <div className="flex items-center space-x-2 ml-4">
                  {getPriorityIcon(task.priority)}
                  <Badge className={getStatusColor(task.status)}>
                    {task.status === 'todo' && 'A Fazer'}
                    {task.status === 'in-progress' && 'Em Progresso'}
                    {task.status === 'review' && 'Em Revisão'}
                    {task.status === 'completed' && 'Concluído'}
                    {task.status === 'cancelled' && 'Cancelado'}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                <div className="flex items-center">
                  <User className="w-4 h-4 mr-1" />
                  {task.assignee}
                </div>
                <div className="flex items-center">
                  <Target className="w-4 h-4 mr-1" />
                  {task.project}
                </div>
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  {new Date(task.dueDate).toLocaleDateString('pt-BR')}
                </div>
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  {task.estimatedHours}h
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">Progresso:</span>
                    <span className="text-sm font-medium">{task.progress}%</span>
                  </div>
                  <Progress value={task.progress} className="w-24" />
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <span>{task.attachments} anexos</span>
                  <span>•</span>
                  <span>{task.comments} comentários</span>
                </div>
              </div>

              {task.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {task.tags.map((tag, index) => (
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
                onClick={() => handleEditTask(task)}
              >
                <Edit className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDuplicateTask(task)}
              >
                <Copy className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDeleteTask(task.id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onTaskSelect?.(task)}
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
          <h2 className="text-2xl font-bold text-gray-900">Gestão de Tarefas</h2>
          <p className="text-gray-600">Gerencie todas as tarefas dos projetos</p>
        </div>
        <div className="flex space-x-2">
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            onClick={() => setViewMode('list')}
          >
            Lista
          </Button>
          <Button
            variant={viewMode === 'kanban' ? 'default' : 'outline'}
            onClick={() => setViewMode('kanban')}
          >
            Kanban
          </Button>
          <Button onClick={() => setShowCreateForm(true)} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Nova Tarefa
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <option value="all">Todos os Status</option>
              <option value="todo">A Fazer</option>
              <option value="in-progress">Em Progresso</option>
              <option value="review">Em Revisão</option>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Responsável</label>
            <Select value={selectedAssignee} onValueChange={setSelectedAssignee}>
              <option value="all">Todos os Responsáveis</option>
              <option value="Maria Santos">Maria Santos</option>
              <option value="Pedro Costa">Pedro Costa</option>
              <option value="Ana Lima">Ana Lima</option>
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
              {editingTask ? 'Editar Tarefa' : 'Nova Tarefa'}
            </h3>
            <Button variant="ghost" onClick={() => {
              setShowCreateForm(false);
              setEditingTask(null);
              setNewTask({
                title: '', description: '', status: 'todo', priority: 'medium',
                assignee: '', project: '', dueDate: '', estimatedHours: 0, tags: ''
              });
            }}>
              ✕
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Título da Tarefa *</label>
              <Input
                value={newTask.title}
                onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                placeholder="Digite o título da tarefa"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Responsável *</label>
              <Select value={newTask.assignee} onValueChange={(value: any) => setNewTask({...newTask, assignee: value})}>
                <option value="">Selecione um responsável</option>
                <option value="Maria Santos">Maria Santos</option>
                <option value="Pedro Costa">Pedro Costa</option>
                <option value="Ana Lima">Ana Lima</option>
              </Select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Descrição *</label>
              <Textarea
                value={newTask.description}
                onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                placeholder="Descreva a tarefa"
                rows={3}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Projeto</label>
              <Input
                value={newTask.project}
                onChange={(e) => setNewTask({...newTask, project: e.target.value})}
                placeholder="Nome do projeto"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data de Vencimento</label>
              <Input
                type="date"
                value={newTask.dueDate}
                onChange={(e) => setNewTask({...newTask, dueDate: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <Select value={newTask.status} onValueChange={(value: any) => setNewTask({...newTask, status: value})}>
                <option value="todo">A Fazer</option>
                <option value="in-progress">Em Progresso</option>
                <option value="review">Em Revisão</option>
                <option value="completed">Concluído</option>
                <option value="cancelled">Cancelado</option>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prioridade</label>
              <Select value={newTask.priority} onValueChange={(value: any) => setNewTask({...newTask, priority: value})}>
                <option value="low">Baixa</option>
                <option value="medium">Média</option>
                <option value="high">Alta</option>
                <option value="critical">Crítica</option>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Horas Estimadas</label>
              <Input
                type="number"
                value={newTask.estimatedHours}
                onChange={(e) => setNewTask({...newTask, estimatedHours: Number(e.target.value)})}
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
              <Input
                value={newTask.tags}
                onChange={(e) => setNewTask({...newTask, tags: e.target.value})}
                placeholder="tag1, tag2, tag3"
              />
            </div>
          </div>
          
          <div className="flex justify-end space-x-2 mt-6">
            <Button variant="outline" onClick={() => {
              setShowCreateForm(false);
              setEditingTask(null);
            }}>
              Cancelar
            </Button>
            <Button onClick={editingTask ? handleUpdateTask : handleCreateTask}>
              {editingTask ? 'Atualizar' : 'Criar'} Tarefa
            </Button>
          </div>
        </Card>
      )}

      {/* Visualização de Tarefas */}
      {viewMode === 'kanban' ? renderKanbanView() : renderListView()}

      {filteredTasks.length === 0 && (
        <Card className="p-12 text-center">
          <div className="text-gray-500">
            <Target className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">Nenhuma tarefa encontrada</h3>
            <p className="text-gray-400">Crie sua primeira tarefa ou ajuste os filtros</p>
          </div>
        </Card>
      )}
    </div>
  );
}
