import React, { useState, useEffect } from 'react';
import { Play, Pause, SkipForward, RotateCcw, CheckCircle, Clock, Users, BookOpen, Plus, Edit, Trash2, Eye, Star, Target, ArrowRight, ArrowLeft } from 'lucide-react';
import { Card, Button, Badge, Tabs, TabsContent, TabsList, TabsTrigger, Input, Select, Modal, Textarea, Progress } from '../ui';
import { useUIStore } from '../../stores/useUIStore';

interface Tutorial {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: number; // em minutos
  steps: TutorialStep[];
  author: string;
  createdAt: string;
  updatedAt: string;
  status: 'draft' | 'published' | 'archived';
  completedUsers: number;
  rating: number;
  tags: string[];
  thumbnail?: string;
}

interface TutorialStep {
  id: string;
  title: string;
  description: string;
  content: string;
  type: 'text' | 'image' | 'video' | 'interactive' | 'quiz';
  order: number;
  isCompleted: boolean;
  estimatedTime: number;
  hints: string[];
  requiredActions?: string[];
}

interface TutorialProgress {
  userId: string;
  tutorialId: string;
  currentStep: number;
  completedSteps: string[];
  startedAt: string;
  lastAccessed: string;
  completedAt?: string;
  totalTime: number;
  score?: number;
}

interface TutorialSystemProps {
  onTutorialCreated?: (tutorial: Tutorial) => void;
  onTutorialUpdated?: (tutorial: Tutorial) => void;
  onTutorialDeleted?: (id: string) => void;
  onUserStarted?: (userId: string, tutorialId: string) => void;
  onUserCompleted?: (userId: string, tutorialId: string) => void;
}

const TutorialSystem: React.FC<TutorialSystemProps> = ({
  onTutorialCreated,
  onTutorialUpdated,
  onTutorialDeleted,
  onUserStarted,
  onUserCompleted
}) => {
  const [tutorials, setTutorials] = useState<Tutorial[]>([]);
  const [userProgress, setUserProgress] = useState<TutorialProgress[]>([]);
  const [selectedTutorial, setSelectedTutorial] = useState<Tutorial | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showTutorialModal, setShowTutorialModal] = useState(false);
  const [activeTab, setActiveTab] = useState('tutorials');
  
  const { showNotification } = useUIStore();

  // Mock data
  useEffect(() => {
    const mockTutorials: Tutorial[] = [
      {
        id: '1',
        title: 'Tutorial Completo do Sistema RSV',
        description: 'Aprenda todas as funcionalidades principais do sistema passo a passo',
        category: 'onboarding',
        difficulty: 'beginner',
        duration: 45,
        steps: [
          {
            id: 's1',
            title: 'Bem-vindo ao Sistema RSV',
            description: 'Introdução ao sistema e suas principais funcionalidades',
            content: 'O Sistema RSV é uma plataforma completa para gestão de reservas de viagens...',
            type: 'text',
            order: 1,
            isCompleted: false,
            estimatedTime: 3,
            hints: ['Leia atentamente as informações', 'Anote suas dúvidas']
          },
          {
            id: 's2',
            title: 'Primeira Reserva',
            description: 'Criando sua primeira reserva no sistema',
            content: 'Vamos criar uma reserva passo a passo...',
            type: 'interactive',
            order: 2,
            isCompleted: false,
            estimatedTime: 8,
            hints: ['Siga as instruções na tela', 'Não tenha medo de errar'],
            requiredActions: ['Criar reserva', 'Preencher dados do cliente']
          },
          {
            id: 's3',
            title: 'Gestão de Clientes',
            description: 'Como gerenciar perfis de clientes',
            content: 'Aprenda a criar e editar perfis de clientes...',
            type: 'video',
            order: 3,
            isCompleted: false,
            estimatedTime: 5,
            hints: ['Assista o vídeo completo', 'Pause quando necessário']
          }
        ],
        author: 'Equipe RSV',
        createdAt: '2024-01-10',
        updatedAt: '2024-01-20',
        status: 'published',
        completedUsers: 67,
        rating: 4.9,
        tags: ['iniciante', 'onboarding', 'sistema', 'reservas']
      },
      {
        id: '2',
        title: 'Relatórios Avançados',
        description: 'Dominando os relatórios e analytics do sistema',
        category: 'advanced',
        difficulty: 'advanced',
        duration: 30,
        steps: [
          {
            id: 's4',
            title: 'Configuração de Relatórios',
            description: 'Configurando parâmetros para relatórios personalizados',
            content: 'Vamos configurar relatórios avançados...',
            type: 'interactive',
            order: 1,
            isCompleted: false,
            estimatedTime: 10,
            hints: ['Teste diferentes configurações', 'Salve suas preferências']
          }
        ],
        author: 'Especialista RSV',
        createdAt: '2024-01-05',
        updatedAt: '2024-01-15',
        status: 'published',
        completedUsers: 23,
        rating: 4.7,
        tags: ['avançado', 'relatórios', 'analytics']
      }
    ];

    const mockProgress: TutorialProgress[] = [
      {
        userId: 'user1',
        tutorialId: '1',
        currentStep: 1,
        completedSteps: ['s1'],
        startedAt: '2024-01-15T10:00:00Z',
        lastAccessed: '2024-01-20T14:30:00Z',
        totalTime: 15
      }
    ];

    setTutorials(mockTutorials);
    setUserProgress(mockProgress);
  }, []);

  const filteredTutorials = tutorials.filter(tutorial => {
    const matchesSearch = tutorial.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tutorial.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tutorial.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || tutorial.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === 'all' || tutorial.difficulty === selectedDifficulty;
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  const handleCreateTutorial = () => {
    setShowCreateModal(true);
  };

  const handleEditTutorial = (tutorial: Tutorial) => {
    setSelectedTutorial(tutorial);
    setShowEditModal(true);
  };

  const handleDeleteTutorial = (id: string) => {
    setTutorials(tutorials => tutorials.filter(tutorial => tutorial.id !== id));
    onTutorialDeleted?.(id);
    showNotification('Tutorial excluído com sucesso!', 'success');
  };

  const handleStartTutorial = (tutorialId: string) => {
    const existingProgress = userProgress.find(p => p.tutorialId === tutorialId);
    if (!existingProgress) {
      const newProgress: TutorialProgress = {
        userId: 'current-user',
        tutorialId,
        currentStep: 0,
        completedSteps: [],
        startedAt: new Date().toISOString(),
        lastAccessed: new Date().toISOString(),
        totalTime: 0
      };
      setUserProgress(prev => [...prev, newProgress]);
      onUserStarted?.('current-user', tutorialId);
    }
    
    const tutorial = tutorials.find(t => t.id === tutorialId);
    if (tutorial) {
      setSelectedTutorial(tutorial);
      setCurrentStep(0);
      setShowTutorialModal(true);
    }
  };

  const handleNextStep = () => {
    if (selectedTutorial && currentStep < selectedTutorial.steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleCompleteStep = (stepId: string) => {
    if (selectedTutorial) {
      setUserProgress(prev => prev.map(progress => {
        if (progress.tutorialId === selectedTutorial.id) {
          const newCompletedSteps = [...progress.completedSteps, stepId];
          const isCompleted = newCompletedSteps.length === selectedTutorial.steps.length;
          
          return {
            ...progress,
            completedSteps: newCompletedSteps,
            currentStep: currentStep + 1,
            lastAccessed: new Date().toISOString(),
            ...(isCompleted && { completedAt: new Date().toISOString() })
          };
        }
        return progress;
      }));

      if (currentStep === selectedTutorial.steps.length - 1) {
        onUserCompleted?.('current-user', selectedTutorial.id);
        showNotification('Parabéns! Tutorial concluído com sucesso!', 'success');
        setShowTutorialModal(false);
      } else {
        handleNextStep();
      }
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'Iniciante';
      case 'intermediate': return 'Intermediário';
      case 'advanced': return 'Avançado';
      default: return difficulty;
    }
  };

  const getStepTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return 'Play';
      case 'interactive': return 'Target';
      case 'quiz': return 'CheckCircle';
      case 'image': return 'Eye';
      default: return 'BookOpen';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Sistema de Tutoriais</h2>
          <p className="text-gray-600">Tutoriais interativos para capacitação dos usuários</p>
        </div>
        <Button onClick={handleCreateTutorial} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Novo Tutorial
        </Button>
      </div>

      {/* Filtros */}
      <div className="flex gap-4">
        <div className="flex-1">
          <Input
            placeholder="Buscar tutoriais..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <option value="all">Todas as Categorias</option>
          <option value="onboarding">Onboarding</option>
          <option value="advanced">Avançado</option>
          <option value="specialized">Especializado</option>
        </Select>
        <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
          <option value="all">Todas as Dificuldades</option>
          <option value="beginner">Iniciante</option>
          <option value="intermediate">Intermediário</option>
          <option value="advanced">Avançado</option>
        </Select>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <BookOpen className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total de Tutoriais</p>
              <p className="text-2xl font-bold text-gray-900">{tutorials.length}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Users className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Usuários Ativos</p>
              <p className="text-2xl font-bold text-gray-900">
                {userProgress.length}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Concluídos</p>
              <p className="text-2xl font-bold text-gray-900">
                {userProgress.filter(p => p.completedAt).length}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Star className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Avaliação Média</p>
              <p className="text-2xl font-bold text-gray-900">
                {(tutorials.reduce((sum, t) => sum + t.rating, 0) / tutorials.length).toFixed(1)}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Lista de Tutoriais */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Tutoriais Disponíveis</h3>
          
          {filteredTutorials.length === 0 ? (
            <div className="text-center py-8">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Nenhum tutorial encontrado</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTutorials.map(tutorial => {
                const userProgressData = userProgress.find(p => p.tutorialId === tutorial.id);
                const isStarted = !!userProgressData;
                const progress = userProgressData ? (userProgressData.completedSteps.length / tutorial.steps.length) * 100 : 0;
                
                return (
                  <div key={tutorial.id} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <h4 className="text-xl font-semibold text-gray-900">{tutorial.title}</h4>
                          <Badge variant={tutorial.status === 'published' ? 'default' : 'secondary'}>
                            {tutorial.status === 'published' ? 'Publicado' : 
                             tutorial.status === 'draft' ? 'Rascunho' : 'Arquivado'}
                          </Badge>
                          <Badge className={getDifficultyColor(tutorial.difficulty)}>
                            {getDifficultyLabel(tutorial.difficulty)}
                          </Badge>
                        </div>
                        
                        <p className="text-gray-600 mb-4">{tutorial.description}</p>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Clock className="h-4 w-4" />
                            {tutorial.duration} min
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Target className="h-4 w-4" />
                            {tutorial.steps.length} passos
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Users className="h-4 w-4" />
                            {tutorial.completedUsers} concluíram
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Star className="h-4 w-4" />
                            {tutorial.rating}/5.0
                          </div>
                        </div>

                        {/* Progresso do usuário */}
                        {isStarted && userProgressData && (
                          <div className="mb-4">
                            <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                              <span>Seu Progresso</span>
                              <span>{Math.round(progress)}%</span>
                            </div>
                            <Progress value={progress} className="h-2" />
                            <p className="text-xs text-gray-500 mt-1">
                              Passo atual: {tutorial.steps[userProgressData.currentStep]?.title}
                            </p>
                          </div>
                        )}
                        
                        <div className="flex items-center gap-2">
                          {tutorial.tags.map(tag => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-center gap-3 ml-6">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">{tutorial.completedUsers}</div>
                          <div className="text-xs text-gray-500">Usuários Concluíram</div>
                        </div>
                        
                        <div className="flex flex-col gap-2">
                          <Button
                            onClick={() => handleStartTutorial(tutorial.id)}
                            className="flex items-center gap-2"
                          >
                            <Play className="h-4 w-4" />
                            {isStarted ? 'Continuar' : 'Começar'}
                          </Button>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedTutorial(tutorial)}
                            title="Ver Detalhes"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditTutorial(tutorial)}
                            title="Editar"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteTutorial(tutorial.id)}
                            title="Excluir"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </Card>

      {/* Modal de Tutorial */}
      <Modal open={showTutorialModal} onOpenChange={setShowTutorialModal}>
        <div className="p-6 max-w-4xl mx-auto">
          {selectedTutorial && (
            <div className="space-y-6">
              {/* Header do Tutorial */}
              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{selectedTutorial.title}</h3>
                <p className="text-gray-600">{selectedTutorial.description}</p>
                <div className="flex items-center justify-center gap-4 mt-3">
                  <Badge className={getDifficultyColor(selectedTutorial.difficulty)}>
                    {getDifficultyLabel(selectedTutorial.difficulty)}
                  </Badge>
                  <span className="text-sm text-gray-500">
                    Passo {currentStep + 1} de {selectedTutorial.steps.length}
                  </span>
                </div>
              </div>

              {/* Progresso */}
              <div className="w-full">
                <Progress value={((currentStep + 1) / selectedTutorial.steps.length) * 100} className="h-3" />
              </div>

              {/* Conteúdo do Passo */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <BookOpen className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      {selectedTutorial.steps[currentStep].title}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {selectedTutorial.steps[currentStep].description}
                    </p>
                  </div>
                </div>
                
                <div className="prose max-w-none">
                  <p className="text-gray-700 mb-4">{selectedTutorial.steps[currentStep].content}</p>
                </div>

                {/* Dicas */}
                {selectedTutorial.steps[currentStep].hints.length > 0 && (
                  <div className="bg-yellow-50 p-4 rounded-lg mt-4">
                    <h5 className="font-semibold text-yellow-800 mb-2">💡 Dicas:</h5>
                    <ul className="text-sm text-yellow-700 space-y-1">
                      {selectedTutorial.steps[currentStep].hints.map((hint, index) => (
                        <li key={index}>• {hint}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Ações Requeridas */}
                {selectedTutorial.steps[currentStep].requiredActions && (
                  <div className="bg-green-50 p-4 rounded-lg mt-4">
                    <h5 className="font-semibold text-green-800 mb-2">✅ Ações Requeridas:</h5>
                    <ul className="text-sm text-green-700 space-y-1">
                      {selectedTutorial.steps[currentStep].requiredActions.map((action, index) => (
                        <li key={index}>• {action}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Navegação */}
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  onClick={handlePreviousStep}
                  disabled={currentStep === 0}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Anterior
                </Button>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowTutorialModal(false)}
                  >
                    Pausar
                  </Button>
                  
                  {currentStep === selectedTutorial.steps.length - 1 ? (
                    <Button
                      onClick={() => handleCompleteStep(selectedTutorial.steps[currentStep].id)}
                      className="flex items-center gap-2"
                    >
                      <CheckCircle className="h-4 w-4" />
                      Concluir Tutorial
                    </Button>
                  ) : (
                    <Button
                      onClick={() => handleCompleteStep(selectedTutorial.steps[currentStep].id)}
                      className="flex items-center gap-2"
                    >
                      Próximo
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* Modal de Criação */}
      <Modal open={showCreateModal} onOpenChange={setShowCreateModal}>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Novo Tutorial</h3>
          <div className="space-y-4">
            <Input placeholder="Título do tutorial" />
            <Textarea placeholder="Descrição do tutorial" rows={3} />
            <Select>
              <option value="">Selecionar categoria</option>
              <option value="onboarding">Onboarding</option>
              <option value="advanced">Avançado</option>
              <option value="specialized">Especializado</option>
            </Select>
            <Select>
              <option value="">Selecionar dificuldade</option>
              <option value="beginner">Iniciante</option>
              <option value="intermediate">Intermediário</option>
              <option value="advanced">Avançado</option>
            </Select>
            <Input placeholder="Duração estimada em minutos" type="number" />
            <Input placeholder="Tags (separadas por vírgula)" />
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowCreateModal(false)}>
                Cancelar
              </Button>
              <Button onClick={() => {
                setShowCreateModal(false);
                showNotification('Tutorial criado com sucesso!', 'success');
              }}>
                Criar Tutorial
              </Button>
            </div>
          </div>
        </div>
      </Modal>

      {/* Modal de Edição */}
      <Modal open={showEditModal} onOpenChange={setShowEditModal}>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Editar Tutorial</h3>
          {selectedTutorial && (
            <div className="space-y-4">
              <Input defaultValue={selectedTutorial.title} placeholder="Título do tutorial" />
              <Textarea defaultValue={selectedTutorial.description} placeholder="Descrição do tutorial" rows={3} />
              <Select defaultValue={selectedTutorial.category}>
                <option value="onboarding">Onboarding</option>
                <option value="advanced">Avançado</option>
                <option value="specialized">Especializado</option>
              </Select>
              <Select defaultValue={selectedTutorial.difficulty}>
                <option value="beginner">Iniciante</option>
                <option value="intermediate">Intermediário</option>
                <option value="advanced">Avançado</option>
              </Select>
              <Input defaultValue={selectedTutorial.duration.toString()} placeholder="Duração estimada em minutos" type="number" />
              <Input defaultValue={selectedTutorial.tags.join(', ')} placeholder="Tags (separadas por vírgula)" />
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setShowEditModal(false)}>
                  Cancelar
                </Button>
                <Button onClick={() => {
                  setShowEditModal(false);
                  showNotification('Tutorial atualizado com sucesso!', 'success');
                }}>
                  Salvar Alterações
                </Button>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export { TutorialSystem };
export type { Tutorial, TutorialStep, TutorialProgress, TutorialSystemProps };
