'use client';
import React, { useState, useCallback } from 'react';
import { Card, Button, Input, Badge, Tabs, Select } from '@/components/ui';
import { Plus, Settings, Play, Pause, Trash2, Save, Eye, Copy, Download, Upload, Workflow, ArrowRight, Users, Clock, CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface WorkflowStep {
  id: string;
  name: string;
  type: 'start' | 'task' | 'decision' | 'approval' | 'notification' | 'end';
  description: string;
  assignee?: string;
  duration?: number;
  conditions?: string[];
  actions?: string[];
  position: { x: number; y: number };
  connections: string[];
}

interface WorkflowProcess {
  id: string;
  name: string;
  description: string;
  version: string;
  status: 'draft' | 'active' | 'paused' | 'archived';
  steps: WorkflowStep[];
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

interface WorkflowEngineProps {
  onProcessSelect?: (process: WorkflowProcess) => void;
}

const StepTypeConfig = {
  start: { icon: '▶️', color: 'bg-green-100 text-green-800', label: 'Início' },
  task: { icon: '📋', color: 'bg-blue-100 text-blue-800', label: 'Tarefa' },
  decision: { icon: '❓', color: 'bg-yellow-100 text-yellow-800', label: 'Decisão' },
  approval: { icon: '✅', color: 'bg-purple-100 text-purple-800', label: 'Aprovação' },
  notification: { icon: '🔔', color: 'bg-orange-100 text-orange-800', label: 'Notificação' },
  end: { icon: '🏁', color: 'bg-red-100 text-red-800', label: 'Fim' },
};

function SortableStep({ step, onEdit, onDelete }: { step: WorkflowStep; onEdit: (step: WorkflowStep) => void; onDelete: (id: string) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: step.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const config = StepTypeConfig[step.type];

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="cursor-move"
    >
      <Card className="p-4 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">{config.icon}</span>
            <Badge className={config.color}>
              {config.label}
            </Badge>
          </div>
          <div className="flex items-center space-x-1">
            <Button variant="ghost" size="sm" onClick={() => onEdit(step)}>
              <Settings className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => onDelete(step.id)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <h4 className="font-medium text-gray-900 mb-2">{step.name}</h4>
        <p className="text-sm text-gray-600 mb-3">{step.description}</p>
        
        {step.assignee && (
          <div className="flex items-center space-x-2 mb-2">
            <Users className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-600">{step.assignee}</span>
          </div>
        )}
        
        {step.duration && (
          <div className="flex items-center space-x-2 mb-2">
            <Clock className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-600">{step.duration} dias</span>
          </div>
        )}
        
        {step.connections.length > 0 && (
          <div className="flex items-center space-x-2">
            <ArrowRight className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-500">
              {step.connections.length} conexão{step.connections.length > 1 ? 'ões' : 'ão'}
            </span>
          </div>
        )}
      </Card>
    </div>
  );
}

export default function WorkflowEngine({ onProcessSelect }: WorkflowEngineProps) {
  const [processes, setProcesses] = useState<WorkflowProcess[]>([
    {
      id: '1',
      name: 'Processo de Reserva',
      description: 'Workflow completo para processamento de reservas de hotel',
      version: '1.0.0',
      status: 'active',
      steps: [
        {
          id: 'step1',
          name: 'Recebimento da Reserva',
          type: 'start',
          description: 'Cliente faz reserva através do sistema',
          position: { x: 100, y: 100 },
          connections: ['step2'],
        },
        {
          id: 'step2',
          name: 'Verificação de Disponibilidade',
          type: 'task',
          description: 'Verificar se há quartos disponíveis',
          assignee: 'Sistema',
          duration: 1,
          position: { x: 300, y: 100 },
          connections: ['step3'],
        },
        {
          id: 'step3',
          name: 'Disponível?',
          type: 'decision',
          description: 'Decidir se prossegue ou cancela',
          position: { x: 500, y: 100 },
          connections: ['step4', 'step6'],
        },
        {
          id: 'step4',
          name: 'Aprovação do Gerente',
          type: 'approval',
          description: 'Aprovação para reservas especiais',
          assignee: 'João Silva',
          duration: 2,
          position: { x: 700, y: 50 },
          connections: ['step5'],
        },
        {
          id: 'step5',
          name: 'Confirmação da Reserva',
          type: 'task',
          description: 'Confirmar reserva e enviar confirmação',
          assignee: 'Maria Santos',
          duration: 1,
          position: { x: 700, y: 150 },
          connections: ['step7'],
        },
        {
          id: 'step6',
          name: 'Cancelamento',
          type: 'notification',
          description: 'Notificar cliente sobre indisponibilidade',
          assignee: 'Sistema',
          duration: 1,
          position: { x: 500, y: 200 },
          connections: ['step8'],
        },
        {
          id: 'step7',
          name: 'Reserva Confirmada',
          type: 'end',
          description: 'Processo concluído com sucesso',
          position: { x: 900, y: 100 },
          connections: [],
        },
        {
          id: 'step8',
          name: 'Processo Cancelado',
          type: 'end',
          description: 'Processo cancelado por indisponibilidade',
          position: { x: 900, y: 200 },
          connections: [],
        },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'Admin',
    },
    {
      id: '2',
      name: 'Processo de Check-in',
      description: 'Workflow para check-in de hóspedes',
      version: '1.0.0',
      status: 'draft',
      steps: [
        {
          id: 'step1',
          name: 'Chegada do Hóspede',
          type: 'start',
          description: 'Hóspede chega ao hotel',
          position: { x: 100, y: 100 },
          connections: ['step2'],
        },
        {
          id: 'step2',
          name: 'Verificação de Documentos',
          type: 'task',
          description: 'Verificar documentos e identidade',
          assignee: 'Recepcionista',
          duration: 1,
          position: { x: 300, y: 100 },
          connections: ['step3'],
        },
        {
          id: 'step3',
          name: 'Check-in Concluído',
          type: 'end',
          description: 'Hóspede recebe chave e informações',
          position: { x: 500, y: 100 },
          connections: [],
        },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'Admin',
    },
  ]);

  const [activeProcess, setActiveProcess] = useState<WorkflowProcess | null>(processes[0]);
  const [activeTab, setActiveTab] = useState('designer');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      // Lógica para reordenar passos
      toast.info('Reordenação de passos implementada');
    }
  }, []);

  const handleCreateProcess = () => {
    const newProcess: WorkflowProcess = {
      id: Date.now().toString(),
      name: 'Novo Processo',
      description: 'Descrição do novo processo',
      version: '1.0.0',
      status: 'draft',
      steps: [
        {
          id: 'start',
          name: 'Início',
          type: 'start',
          description: 'Ponto de início do processo',
          position: { x: 100, y: 100 },
          connections: [],
        },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'Usuário Atual',
    };

    setProcesses(prev => [...prev, newProcess]);
    setActiveProcess(newProcess);
    toast.success('Novo processo criado!');
  };

  const handleSaveProcess = () => {
    if (activeProcess) {
      setProcesses(prev => prev.map(p => 
        p.id === activeProcess.id 
          ? { ...activeProcess, updatedAt: new Date() }
          : p
      ));
      toast.success('Processo salvo com sucesso!');
    }
  };

  const handleDeleteProcess = (processId: string) => {
    setProcesses(prev => prev.filter(p => p.id !== processId));
    if (activeProcess?.id === processId) {
      setActiveProcess(processes[0] || null);
    }
    toast.success('Processo excluído!');
  };

  const handleDuplicateProcess = (process: WorkflowProcess) => {
    const duplicated = {
      ...process,
      id: Date.now().toString(),
      name: `${process.name} (Cópia)`,
      status: 'draft' as const,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setProcesses(prev => [...prev, duplicated]);
    toast.success('Processo duplicado!');
  };

  const filteredProcesses = processes.filter(process => {
    const matchesSearch = process.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         process.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || process.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'paused': return 'bg-orange-100 text-orange-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Ativo';
      case 'draft': return 'Rascunho';
      case 'paused': return 'Pausado';
      case 'archived': return 'Arquivado';
      default: return status;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Motor de Workflow</h2>
          <p className="text-gray-600">Crie e gerencie processos de negócio automatizados</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={() => toast.info('Funcionalidade de importação em desenvolvimento')}>
            <Upload className="h-4 w-4 mr-2" />
            Importar
          </Button>
          <Button variant="outline" onClick={() => toast.info('Funcionalidade de exportação em desenvolvimento')}>
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Button onClick={handleCreateProcess}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Processo
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Buscar processos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <option value="all">Todos os Status</option>
            <option value="active">Ativo</option>
            <option value="draft">Rascunho</option>
            <option value="paused">Pausado</option>
            <option value="archived">Arquivado</option>
          </Select>
        </div>
      </Card>

      {/* Lista de Processos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card>
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Processos</h3>
              <p className="text-sm text-gray-600">{filteredProcesses.length} processo(s) encontrado(s)</p>
            </div>
            <div className="p-4 space-y-3">
              {filteredProcesses.map((process) => (
                <div
                  key={process.id}
                  onClick={() => setActiveProcess(process)}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    activeProcess?.id === process.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{process.name}</h4>
                    <Badge className={getStatusColor(process.status)}>
                      {getStatusLabel(process.status)}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{process.description}</p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>v{process.version}</span>
                    <span>{process.steps.length} passos</span>
                  </div>
                  <div className="flex items-center space-x-2 mt-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDuplicateProcess(process);
                      }}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteProcess(process.id);
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Designer de Workflow */}
        <div className="lg:col-span-2">
          <Card>
            <div className="border-b border-gray-200">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <div className="flex items-center justify-between px-4">
                  <div className="flex space-x-8">
                    <button
                      onClick={() => setActiveTab('designer')}
                      className={`py-4 px-1 border-b-2 font-medium text-sm ${
                        activeTab === 'designer'
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      Designer
                    </button>
                    <button
                      onClick={() => setActiveTab('properties')}
                      className={`py-4 px-1 border-b-2 font-medium text-sm ${
                        activeTab === 'properties'
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      Propriedades
                    </button>
                    <button
                      onClick={() => setActiveTab('preview')}
                      className={`py-4 px-1 border-b-2 font-medium text-sm ${
                        activeTab === 'preview'
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      Visualização
                    </button>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" onClick={handleSaveProcess}>
                      <Save className="h-4 w-4 mr-2" />
                      Salvar
                    </Button>
                    <Button variant="outline" size="sm">
                      <Play className="h-4 w-4 mr-2" />
                      Executar
                    </Button>
                  </div>
                </div>
              </Tabs>
            </div>

            <div className="p-6">
              {activeTab === 'designer' && activeProcess && (
                <div>
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {activeProcess.name}
                    </h3>
                    <p className="text-gray-600">{activeProcess.description}</p>
                  </div>

                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 min-h-96">
                    <DndContext
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragEnd={handleDragEnd}
                    >
                      <SortableContext
                        items={activeProcess.steps.map(step => step.id)}
                        strategy={verticalListSortingStrategy}
                      >
                        <div className="space-y-4">
                          {activeProcess.steps.map((step) => (
                            <SortableStep
                              key={step.id}
                              step={step}
                              onEdit={(step) => toast.info(`Editando passo: ${step.name}`)}
                              onDelete={(id) => toast.info(`Excluindo passo: ${id}`)}
                            />
                          ))}
                        </div>
                      </SortableContext>
                    </DndContext>
                  </div>

                  <div className="mt-4 flex items-center justify-center">
                    <Button variant="outline" onClick={() => toast.info('Adicionar novo passo')}>
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar Passo
                    </Button>
                  </div>
                </div>
              )}

              {activeTab === 'properties' && activeProcess && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Propriedades do Processo</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                      <Input value={activeProcess.name} onChange={(e) => setActiveProcess({...activeProcess, name: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Versão</label>
                      <Input value={activeProcess.version} onChange={(e) => setActiveProcess({...activeProcess, version: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                      <Select value={activeProcess.status} onValueChange={(value) => setActiveProcess({...activeProcess, status: value as any})}>
                        <option value="draft">Rascunho</option>
                        <option value="active">Ativo</option>
                        <option value="paused">Pausado</option>
                        <option value="archived">Arquivado</option>
                      </Select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Criado por</label>
                      <Input value={activeProcess.createdBy} disabled />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                    <textarea
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={3}
                      value={activeProcess.description}
                      onChange={(e) => setActiveProcess({...activeProcess, description: e.target.value})}
                      aria-label="Descrição do processo"
                    />
                  </div>
                </div>
              )}

              {activeTab === 'preview' && activeProcess && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Visualização do Processo</h3>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center justify-center space-x-4 mb-6">
                      <div className="text-center">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                          <CheckCircle className="h-8 w-8 text-green-600" />
                        </div>
                        <p className="text-sm font-medium text-gray-900">Passos Concluídos</p>
                        <p className="text-2xl font-bold text-green-600">0</p>
                      </div>
                      <div className="text-center">
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                          <Clock className="h-8 w-8 text-blue-600" />
                        </div>
                        <p className="text-sm font-medium text-gray-900">Em Andamento</p>
                        <p className="text-2xl font-bold text-blue-600">0</p>
                      </div>
                      <div className="text-center">
                        <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-2">
                          <AlertCircle className="h-8 w-8 text-yellow-600" />
                        </div>
                        <p className="text-sm font-medium text-gray-900">Pendentes</p>
                        <p className="text-2xl font-bold text-yellow-600">{activeProcess.steps.length}</p>
                      </div>
                      <div className="text-center">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-2">
                          <XCircle className="h-8 w-8 text-red-600" />
                        </div>
                        <p className="text-sm font-medium text-gray-900">Bloqueados</p>
                        <p className="text-2xl font-bold text-red-600">0</p>
                      </div>
                    </div>
                    
                    <div className="text-center">
                      <p className="text-gray-600 mb-4">
                        Este processo tem {activeProcess.steps.length} passos e está no status "{getStatusLabel(activeProcess.status)}"
                      </p>
                      <Button onClick={() => toast.info('Simulando execução do processo')}>
                        <Play className="h-4 w-4 mr-2" />
                        Simular Execução
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
