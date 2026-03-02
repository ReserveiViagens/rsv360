import React, { useState, useEffect } from 'react';
import { Play, Pause, CheckCircle, AlertCircle, Clock, Globe, Users, BarChart3, Settings, Eye, Download, Share, Plus, Edit, Trash2, Zap, Shield, Database, Server } from 'lucide-react';
import { Card, Button, Badge, Tabs, TabsContent, TabsList, TabsTrigger, Input, Select, Modal, Textarea, Progress, Alert, AlertDescription } from '../ui';
import { useUIStore } from '../../stores/useUIStore';

// Interfaces
interface GoLiveChecklist {
  id: string;
  category: string;
  item: string;
  status: 'pending' | 'completed' | 'failed' | 'skipped';
  priority: 'low' | 'medium' | 'high' | 'critical';
  assignedTo: string;
  dueDate: string;
  completedAt?: string;
  notes?: string;
}

interface GoLivePhase {
  id: string;
  name: string;
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  startDate?: string;
  endDate?: string;
  checklist: GoLiveChecklist[];
  dependencies: string[];
  estimatedDuration: number; // em horas
}

interface GoLiveMetrics {
  totalChecklistItems: number;
  completedItems: number;
  failedItems: number;
  pendingItems: number;
  overallProgress: number;
  phasesCompleted: number;
  totalPhases: number;
  estimatedCompletion: string;
}

interface GoLiveSystemProps {
  onPhaseStarted?: (phase: GoLivePhase) => void;
  onPhaseCompleted?: (phase: GoLivePhase) => void;
  onGoLiveActivated?: () => void;
}

// Mock data
const mockGoLivePhases: GoLivePhase[] = [
  {
    id: '1',
    name: 'Preparação de Infraestrutura',
    status: 'completed',
    startDate: '2024-01-10T08:00:00Z',
    endDate: '2024-01-12T18:00:00Z',
    estimatedDuration: 24,
    dependencies: [],
    checklist: [
      {
        id: '1.1',
        category: 'Infraestrutura',
        item: 'Configurar servidor VPS ICP MAX',
        status: 'completed',
        priority: 'critical',
        assignedTo: 'DevOps Team',
        dueDate: '2024-01-11T18:00:00Z',
        completedAt: '2024-01-11T16:00:00Z',
        notes: 'Servidor configurado com Docker e PostgreSQL'
      },
      {
        id: '1.2',
        category: 'Infraestrutura',
        item: 'Configurar domínio e SSL',
        status: 'completed',
        priority: 'critical',
        assignedTo: 'DevOps Team',
        dueDate: '2024-01-11T18:00:00Z',
        completedAt: '2024-01-11T17:00:00Z',
        notes: 'SSL configurado com Let\'s Encrypt'
      },
      {
        id: '1.3',
        category: 'Infraestrutura',
        item: 'Configurar backup automático',
        status: 'completed',
        priority: 'high',
        assignedTo: 'DevOps Team',
        dueDate: '2024-01-12T18:00:00Z',
        completedAt: '2024-01-12T15:00:00Z',
        notes: 'Backup diário configurado'
      }
    ]
  },
  {
    id: '2',
    name: 'Deploy e Configuração',
    status: 'in-progress',
    startDate: '2024-01-13T08:00:00Z',
    estimatedDuration: 16,
    dependencies: ['1'],
    checklist: [
      {
        id: '2.1',
        category: 'Deploy',
        item: 'Deploy da aplicação frontend',
        status: 'completed',
        priority: 'critical',
        assignedTo: 'DevOps Team',
        dueDate: '2024-01-13T18:00:00Z',
        completedAt: '2024-01-13T16:00:00Z'
      },
      {
        id: '2.2',
        category: 'Deploy',
        item: 'Configurar banco de dados',
        status: 'completed',
        priority: 'critical',
        assignedTo: 'DevOps Team',
        dueDate: '2024-01-13T18:00:00Z',
        completedAt: '2024-01-13T17:00:00Z'
      },
      {
        id: '2.3',
        category: 'Deploy',
        item: 'Configurar variáveis de ambiente',
        status: 'in-progress',
        priority: 'high',
        assignedTo: 'DevOps Team',
        dueDate: '2024-01-14T12:00:00Z'
      }
    ]
  },
  {
    id: '3',
    name: 'Testes de Produção',
    status: 'pending',
    estimatedDuration: 8,
    dependencies: ['2'],
    checklist: [
      {
        id: '3.1',
        category: 'Testes',
        item: 'Testes de funcionalidade',
        status: 'pending',
        priority: 'high',
        assignedTo: 'QA Team',
        dueDate: '2024-01-15T18:00:00Z'
      },
      {
        id: '3.2',
        category: 'Testes',
        item: 'Testes de performance',
        status: 'pending',
        priority: 'medium',
        assignedTo: 'QA Team',
        dueDate: '2024-01-15T18:00:00Z'
      },
      {
        id: '3.3',
        category: 'Testes',
        item: 'Testes de segurança',
        status: 'pending',
        priority: 'high',
        assignedTo: 'Security Team',
        dueDate: '2024-01-15T18:00:00Z'
      }
    ]
  },
  {
    id: '4',
    name: 'Ativação Final',
    status: 'pending',
    estimatedDuration: 4,
    dependencies: ['3'],
    checklist: [
      {
        id: '4.1',
        category: 'Ativação',
        item: 'Ativar domínio principal',
        status: 'pending',
        priority: 'critical',
        assignedTo: 'DevOps Team',
        dueDate: '2024-01-16T10:00:00Z'
      },
      {
        id: '4.2',
        category: 'Ativação',
        item: 'Configurar monitoramento',
        status: 'pending',
        priority: 'high',
        assignedTo: 'DevOps Team',
        dueDate: '2024-01-16T10:00:00Z'
      },
      {
        id: '4.3',
        category: 'Ativação',
        item: 'Anunciar go-live',
        status: 'pending',
        priority: 'medium',
        assignedTo: 'Marketing Team',
        dueDate: '2024-01-16T12:00:00Z'
      }
    ]
  }
];

const GoLiveSystem: React.FC<GoLiveSystemProps> = ({
  onPhaseStarted,
  onPhaseCompleted,
  onGoLiveActivated
}) => {
  const [phases, setPhases] = useState<GoLivePhase[]>(mockGoLivePhases);
  const [activeTab, setActiveTab] = useState('overview');
  const [showPhaseModal, setShowPhaseModal] = useState(false);
  const [showChecklistModal, setShowChecklistModal] = useState(false);
  const [selectedPhase, setSelectedPhase] = useState<GoLivePhase | null>(null);
  const [newPhase, setNewPhase] = useState<Partial<GoLivePhase>>({});
  const [newChecklistItem, setNewChecklistItem] = useState<Partial<GoLiveChecklist>>({});
  const { showNotification } = useUIStore();

  // Calcular métricas
  const metrics: GoLiveMetrics = {
    totalChecklistItems: phases.reduce((total, phase) => total + phase.checklist.length, 0),
    completedItems: phases.reduce((total, phase) => 
      total + phase.checklist.filter(item => item.status === 'completed').length, 0),
    failedItems: phases.reduce((total, phase) => 
      total + phase.checklist.filter(item => item.status === 'failed').length, 0),
    pendingItems: phases.reduce((total, phase) => 
      total + phase.checklist.filter(item => item.status === 'pending').length, 0),
    overallProgress: phases.reduce((total, phase) => {
      const phaseProgress = phase.checklist.length > 0 
        ? (phase.checklist.filter(item => item.status === 'completed').length / phase.checklist.length) * 100
        : 0;
      return total + phaseProgress;
    }, 0) / phases.length,
    phasesCompleted: phases.filter(phase => phase.status === 'completed').length,
    totalPhases: phases.length,
    estimatedCompletion: new Date(Date.now() + (phases.filter(p => p.status === 'pending').length * 8 * 60 * 60 * 1000)).toLocaleDateString()
  };

  const handlePhaseStart = (phase: GoLivePhase) => {
    const updatedPhase = {
      ...phase,
      status: 'in-progress' as const,
      startDate: new Date().toISOString()
    };

    setPhases(prev => prev.map(p => p.id === phase.id ? updatedPhase : p));
    onPhaseStarted?.(updatedPhase);
    showNotification(`Fase "${phase.name}" iniciada!`, 'info');
  };

  const handlePhaseComplete = (phase: GoLivePhase) => {
    const updatedPhase = {
      ...phase,
      status: 'completed' as const,
      endDate: new Date().toISOString()
    };

    setPhases(prev => prev.map(p => p.id === phase.id ? updatedPhase : p));
    onPhaseCompleted?.(updatedPhase);
    showNotification(`Fase "${phase.name}" concluída!`, 'success');

    // Verificar se todas as fases estão completas
    const allPhasesCompleted = phases.every(p => p.id === phase.id ? true : p.status === 'completed');
    if (allPhasesCompleted) {
      showNotification('Todas as fases foram concluídas! Sistema pronto para go-live!', 'success');
    }
  };

  const handleChecklistItemComplete = (phaseId: string, itemId: string) => {
    setPhases(prev => prev.map(phase => {
      if (phase.id === phaseId) {
        const updatedChecklist = phase.checklist.map(item => {
          if (item.id === itemId) {
            return {
              ...item,
              status: 'completed' as const,
              completedAt: new Date().toISOString()
            };
          }
          return item;
        });

        return {
          ...phase,
          checklist: updatedChecklist
        };
      }
      return phase;
    }));

    showNotification('Item do checklist marcado como concluído!', 'success');
  };

  const handleGoLiveActivation = () => {
    // Verificar se todas as fases críticas estão completas
    const criticalPhasesComplete = phases
      .filter(phase => ['1', '2', '3'].includes(phase.id))
      .every(phase => phase.status === 'completed');

    if (!criticalPhasesComplete) {
      showNotification('Não é possível ativar o go-live. Fases críticas ainda não foram concluídas.', 'error');
      return;
    }

    showNotification('🎉 GO-LIVE ATIVADO! Sistema RSV está oficialmente em produção!', 'success');
    onGoLiveActivated?.();
  };

  const handleCreatePhase = () => {
    if (newPhase.name && newPhase.estimatedDuration) {
      const phase: GoLivePhase = {
        id: Date.now().toString(),
        name: newPhase.name,
        status: 'pending',
        estimatedDuration: newPhase.estimatedDuration,
        dependencies: newPhase.dependencies || [],
        checklist: []
      };

      setPhases(prev => [...prev, phase]);
      setNewPhase({});
      setShowPhaseModal(false);
      showNotification('Nova fase criada!', 'success');
    }
  };

  const handleCreateChecklistItem = () => {
    if (selectedPhase && newChecklistItem.item && newChecklistItem.category) {
      const item: GoLiveChecklist = {
        id: `${selectedPhase.id}.${selectedPhase.checklist.length + 1}`,
        category: newChecklistItem.category,
        item: newChecklistItem.item,
        status: 'pending',
        priority: newChecklistItem.priority || 'medium',
        assignedTo: newChecklistItem.assignedTo || 'Team',
        dueDate: newChecklistItem.dueDate || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      };

      setPhases(prev => prev.map(phase => {
        if (phase.id === selectedPhase.id) {
          return {
            ...phase,
            checklist: [...phase.checklist, item]
          };
        }
        return phase;
      }));

      setNewChecklistItem({});
      setShowChecklistModal(false);
      showNotification('Item do checklist criado!', 'success');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const canStartPhase = (phase: GoLivePhase) => {
    if (phase.status !== 'pending') return false;
    return phase.dependencies.every(depId => 
      phases.find(p => p.id === depId)?.status === 'completed'
    );
  };

  const canCompletePhase = (phase: GoLivePhase) => {
    if (phase.status !== 'in-progress') return false;
    return phase.checklist.every(item => item.status === 'completed');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Sistema de Go-Live</h2>
          <p className="text-gray-600">Gerencie a ativação final do sistema RSV em produção</p>
        </div>
        <div className="flex space-x-3">
          <Button onClick={() => setShowPhaseModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Nova Fase
          </Button>
          <Button 
            onClick={handleGoLiveActivation}
            variant="default"
            className="bg-green-600 hover:bg-green-700"
          >
            <Play className="w-4 h-4 mr-2" />
            ATIVAR GO-LIVE
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Card>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="phases">Fases</TabsTrigger>
            <TabsTrigger value="checklist">Checklist</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
          </TabsList>

          {/* Visão Geral */}
          <TabsContent value="overview" className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <Card className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <BarChart3 className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Progresso Geral</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {Math.round(metrics.overallProgress)}%
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Fases Concluídas</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {metrics.phasesCompleted}/{metrics.totalPhases}
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <Clock className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Itens Pendentes</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {metrics.pendingItems}
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Globe className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Previsão</p>
                    <p className="text-sm font-medium text-gray-900">
                      {metrics.estimatedCompletion}
                    </p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Progresso das Fases */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Progresso das Fases</h3>
              <div className="space-y-4">
                {phases.map(phase => (
                  <Card key={phase.id} className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <Badge className={getStatusColor(phase.status)}>
                          {phase.status}
                        </Badge>
                        <span className="font-medium text-gray-900">{phase.name}</span>
                      </div>
                      <div className="text-sm text-gray-500">
                        {phase.estimatedDuration}h estimadas
                      </div>
                    </div>
                    
                    <div className="mb-3">
                      <Progress 
                        value={
                          phase.checklist.length > 0 
                            ? (phase.checklist.filter(item => item.status === 'completed').length / phase.checklist.length) * 100
                            : 0
                        } 
                        className="w-full" 
                      />
                      <p className="text-sm text-gray-600 mt-1">
                        {phase.checklist.filter(item => item.status === 'completed').length}/{phase.checklist.length} itens concluídos
                      </p>
                    </div>

                    <div className="flex space-x-2">
                      {canStartPhase(phase) && (
                        <Button 
                          size="sm" 
                          onClick={() => handlePhaseStart(phase)}
                        >
                          <Play className="w-4 h-4 mr-1" />
                          Iniciar
                        </Button>
                      )}
                      {canCompletePhase(phase) && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handlePhaseComplete(phase)}
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Concluir
                        </Button>
                      )}
                      <Button size="sm" variant="outline">
                        <Eye className="w-4 h-4 mr-1" />
                        Ver
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Fases */}
          <TabsContent value="phases" className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Fases do Go-Live</h3>
                <Button onClick={() => setShowPhaseModal(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Nova Fase
                </Button>
              </div>

              <div className="space-y-4">
                {phases.map(phase => (
                  <Card key={phase.id} className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <Badge className={getStatusColor(phase.status)}>
                          {phase.status}
                        </Badge>
                        <h4 className="text-lg font-medium text-gray-900">{phase.name}</h4>
                      </div>
                      <div className="text-sm text-gray-500">
                        {phase.estimatedDuration}h estimadas
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="text-sm text-gray-600">
                        <p><strong>Status:</strong> {phase.status}</p>
                        {phase.startDate && (
                          <p><strong>Início:</strong> {new Date(phase.startDate).toLocaleString()}</p>
                        )}
                        {phase.endDate && (
                          <p><strong>Fim:</strong> {new Date(phase.endDate).toLocaleString()}</p>
                        )}
                        <p><strong>Duração Estimada:</strong> {phase.estimatedDuration}h</p>
                      </div>
                      <div className="text-sm text-gray-600">
                        <p><strong>Dependências:</strong></p>
                        {phase.dependencies.length > 0 ? (
                          <ul className="list-disc list-inside">
                            {phase.dependencies.map(depId => {
                              const depPhase = phases.find(p => p.id === depId);
                              return (
                                <li key={depId}>
                                  {depPhase?.name} ({depPhase?.status})
                                </li>
                              );
                            })}
                          </ul>
                        ) : (
                          <p>Nenhuma dependência</p>
                        )}
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      {canStartPhase(phase) && (
                        <Button 
                          onClick={() => handlePhaseStart(phase)}
                        >
                          <Play className="w-4 h-4 mr-2" />
                          Iniciar Fase
                        </Button>
                      )}
                      {canCompletePhase(phase) && (
                        <Button 
                          variant="outline"
                          onClick={() => handlePhaseComplete(phase)}
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Concluir Fase
                        </Button>
                      )}
                      <Button 
                        variant="outline"
                        onClick={() => {
                          setSelectedPhase(phase);
                          setShowChecklistModal(true);
                        }}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Adicionar Item
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Checklist */}
          <TabsContent value="checklist" className="p-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Checklist de Go-Live</h3>
              
              <div className="space-y-4">
                {phases.map(phase => (
                  <div key={phase.id} className="space-y-3">
                    <h4 className="font-medium text-gray-900 flex items-center space-x-2">
                      <Badge className={getStatusColor(phase.status)}>
                        {phase.status}
                      </Badge>
                      <span>{phase.name}</span>
                    </h4>
                    
                    <div className="space-y-2">
                      {phase.checklist.map(item => (
                        <Card key={item.id} className="p-3">
                          <div className="flex items-center justify-between">
                                                         <div className="flex items-center space-x-3">
                               <label className="flex items-center space-x-2 cursor-pointer">
                                 <input
                                   type="checkbox"
                                   checked={item.status === 'completed'}
                                   onChange={() => handleChecklistItemComplete(phase.id, item.id)}
                                   className="rounded border-gray-300"
                                 />
                                 <span className="sr-only">Marcar como concluído</span>
                               </label>
                              <div>
                                <p className="font-medium text-gray-900">{item.item}</p>
                                <p className="text-sm text-gray-600">{item.category}</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Badge className={getPriorityColor(item.priority)}>
                                {item.priority}
                              </Badge>
                              <span className="text-sm text-gray-500">
                                {item.assignedTo}
                              </span>
                            </div>
                          </div>
                          
                          {item.notes && (
                            <p className="text-sm text-gray-600 mt-2">{item.notes}</p>
                          )}
                          
                          <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                            <span>Vencimento: {new Date(item.dueDate).toLocaleDateString()}</span>
                            {item.completedAt && (
                              <span>Concluído: {new Date(item.completedAt).toLocaleDateString()}</span>
                            )}
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Timeline */}
          <TabsContent value="timeline" className="p-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Timeline do Go-Live</h3>
              
              <div className="relative">
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                
                <div className="space-y-6">
                  {phases.map((phase, index) => (
                    <div key={phase.id} className="relative flex items-start space-x-4">
                      <div className="flex-shrink-0 w-8 h-8 bg-white border-2 border-gray-300 rounded-full flex items-center justify-center">
                        {phase.status === 'completed' ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : phase.status === 'in-progress' ? (
                          <Clock className="w-4 h-4 text-blue-600" />
                        ) : (
                          <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-2">
                          <h4 className="text-lg font-medium text-gray-900">{phase.name}</h4>
                          <Badge className={getStatusColor(phase.status)}>
                            {phase.status}
                          </Badge>
                        </div>
                        
                        <div className="text-sm text-gray-600 space-y-1">
                          <p><strong>Duração Estimada:</strong> {phase.estimatedDuration}h</p>
                          {phase.startDate && (
                            <p><strong>Início:</strong> {new Date(phase.startDate).toLocaleString()}</p>
                          )}
                          {phase.endDate && (
                            <p><strong>Fim:</strong> {new Date(phase.endDate).toLocaleString()}</p>
                          )}
                          <p><strong>Progresso:</strong> {phase.checklist.filter(item => item.status === 'completed').length}/{phase.checklist.length} itens</p>
                        </div>
                        
                        {phase.dependencies.length > 0 && (
                          <div className="mt-2">
                            <p className="text-xs text-gray-500">
                              <strong>Dependências:</strong> {phase.dependencies.map(depId => {
                                const depPhase = phases.find(p => p.id === depId);
                                return depPhase?.name;
                              }).join(', ')}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </Card>

      {/* Modal de Fase */}
      <Modal open={showPhaseModal} onOpenChange={setShowPhaseModal}>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Nova Fase de Go-Live
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome da Fase
              </label>
              <Input
                placeholder="Ex: Preparação de Infraestrutura"
                value={newPhase.name || ''}
                onChange={(e) => setNewPhase(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Duração Estimada (horas)
              </label>
              <Input
                type="number"
                placeholder="8"
                value={newPhase.estimatedDuration || ''}
                onChange={(e) => setNewPhase(prev => ({ ...prev, estimatedDuration: parseInt(e.target.value) }))}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dependências
              </label>
              <Select
                multiple
                value={newPhase.dependencies || []}
                onChange={(value) => setNewPhase(prev => ({ ...prev, dependencies: value }))}
              >
                {phases.map(phase => (
                  <option key={phase.id} value={phase.id}>
                    {phase.name}
                  </option>
                ))}
              </Select>
            </div>

            <div className="flex justify-end space-x-3">
              <Button variant="outline" onClick={() => setShowPhaseModal(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreatePhase}>
                <Plus className="w-4 h-4 mr-2" />
                Criar Fase
              </Button>
            </div>
          </div>
        </div>
      </Modal>

      {/* Modal de Checklist */}
      <Modal open={showChecklistModal} onOpenChange={setShowChecklistModal}>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Novo Item do Checklist
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categoria
              </label>
              <Input
                placeholder="Ex: Infraestrutura"
                value={newChecklistItem.category || ''}
                onChange={(e) => setNewChecklistItem(prev => ({ ...prev, category: e.target.value }))}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Item
              </label>
              <Textarea
                placeholder="Ex: Configurar servidor VPS ICP MAX"
                value={newChecklistItem.item || ''}
                onChange={(e) => setNewChecklistItem(prev => ({ ...prev, item: e.target.value }))}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prioridade
              </label>
              <Select
                value={newChecklistItem.priority || 'medium'}
                onValueChange={(value) => setNewChecklistItem(prev => ({ ...prev, priority: value as any }))}
              >
                <option value="low">Baixa</option>
                <option value="medium">Média</option>
                <option value="high">Alta</option>
                <option value="critical">Crítica</option>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Responsável
              </label>
              <Input
                placeholder="Ex: DevOps Team"
                value={newChecklistItem.assignedTo || ''}
                onChange={(e) => setNewChecklistItem(prev => ({ ...prev, assignedTo: e.target.value }))}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data de Vencimento
              </label>
              <Input
                type="datetime-local"
                value={newChecklistItem.dueDate || ''}
                onChange={(e) => setNewChecklistItem(prev => ({ ...prev, dueDate: e.target.value }))}
              />
            </div>

            <div className="flex justify-end space-x-3">
              <Button variant="outline" onClick={() => setShowChecklistModal(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreateChecklistItem}>
                <Plus className="w-4 h-4 mr-2" />
                Criar Item
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export { GoLiveSystem };
export type { GoLiveChecklist, GoLivePhase, GoLiveMetrics, GoLiveSystemProps };
