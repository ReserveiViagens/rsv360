import React, { useState, useEffect } from 'react';
import { GraduationCap, Play, Pause, CheckCircle, Clock, Users, BookOpen, Award, Target, BarChart3, Plus, Edit, Trash2, Eye, Download, Share } from 'lucide-react';
import { Card, Button, Badge, Tabs, TabsContent, TabsList, TabsTrigger, Input, Select, Modal, Textarea, Progress } from '../ui';
import { useUIStore } from '../../stores/useUIStore';

interface TrainingCourse {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: number; // em minutos
  modules: TrainingModule[];
  instructor: string;
  createdAt: string;
  updatedAt: string;
  status: 'draft' | 'published' | 'archived';
  enrolledUsers: number;
  completionRate: number;
  rating: number;
  tags: string[];
}

interface TrainingModule {
  id: string;
  title: string;
  description: string;
  duration: number;
  type: 'video' | 'text' | 'quiz' | 'interactive';
  content: string;
  order: number;
  isCompleted: boolean;
}

interface TrainingProgress {
  userId: string;
  courseId: string;
  completedModules: string[];
  currentModule: string;
  progress: number;
  startedAt: string;
  lastAccessed: string;
  completedAt?: string;
  score?: number;
}

interface TrainingSystemProps {
  onCourseCreated?: (course: TrainingCourse) => void;
  onCourseUpdated?: (course: TrainingCourse) => void;
  onCourseDeleted?: (id: string) => void;
  onUserEnrolled?: (userId: string, courseId: string) => void;
}

const TrainingSystem: React.FC<TrainingSystemProps> = ({
  onCourseCreated,
  onCourseUpdated,
  onCourseDeleted,
  onUserEnrolled
}) => {
  const [courses, setCourses] = useState<TrainingCourse[]>([]);
  const [userProgress, setUserProgress] = useState<TrainingProgress[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<TrainingCourse | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [activeTab, setActiveTab] = useState('courses');
  
  const { showNotification } = useUIStore();

  // Mock data
  useEffect(() => {
    const mockCourses: TrainingCourse[] = [
      {
        id: '1',
        title: 'Introdução ao Sistema RSV',
        description: 'Curso completo para novos usuários aprenderem o básico do sistema',
        category: 'onboarding',
        difficulty: 'beginner',
        duration: 120,
        modules: [
          {
            id: 'm1',
            title: 'Visão Geral do Sistema',
            description: 'Conheça as principais funcionalidades',
            duration: 15,
            type: 'video',
            content: 'video_url_here',
            order: 1,
            isCompleted: false
          },
          {
            id: 'm2',
            title: 'Primeira Reserva',
            description: 'Aprenda a criar sua primeira reserva',
            duration: 25,
            type: 'interactive',
            content: 'interactive_content_here',
            order: 2,
            isCompleted: false
          },
          {
            id: 'm3',
            title: 'Gestão de Clientes',
            description: 'Como gerenciar clientes no sistema',
            duration: 30,
            type: 'text',
            content: 'text_content_here',
            order: 3,
            isCompleted: false
          }
        ],
        instructor: 'Equipe RSV',
        createdAt: '2024-01-10',
        updatedAt: '2024-01-20',
        status: 'published',
        enrolledUsers: 45,
        completionRate: 78,
        rating: 4.8,
        tags: ['iniciante', 'onboarding', 'sistema']
      },
      {
        id: '2',
        title: 'Gestão Avançada de Reservas',
        description: 'Técnicas avançadas para gestão eficiente de reservas',
        category: 'advanced',
        difficulty: 'advanced',
        duration: 180,
        modules: [
          {
            id: 'm4',
            title: 'Otimização de Preços',
            description: 'Estratégias para maximizar receita',
            duration: 40,
            type: 'video',
            content: 'video_url_here',
            order: 1,
            isCompleted: false
          },
          {
            id: 'm5',
            title: 'Análise de Mercado',
            description: 'Como analisar tendências do mercado',
            duration: 35,
            type: 'interactive',
            content: 'interactive_content_here',
            order: 2,
            isCompleted: false
          }
        ],
        instructor: 'Especialista RSV',
        createdAt: '2024-01-05',
        updatedAt: '2024-01-15',
        status: 'published',
        enrolledUsers: 23,
        completionRate: 65,
        rating: 4.6,
        tags: ['avançado', 'reservas', 'otimização']
      }
    ];

    const mockProgress: TrainingProgress[] = [
      {
        userId: 'user1',
        courseId: '1',
        completedModules: ['m1'],
        currentModule: 'm2',
        progress: 33,
        startedAt: '2024-01-15',
        lastAccessed: '2024-01-20'
      }
    ];

    setCourses(mockCourses);
    setUserProgress(mockProgress);
  }, []);

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || course.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === 'all' || course.difficulty === selectedDifficulty;
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  const handleCreateCourse = () => {
    setShowCreateModal(true);
  };

  const handleEditCourse = (course: TrainingCourse) => {
    setSelectedCourse(course);
    setShowEditModal(true);
  };

  const handleDeleteCourse = (id: string) => {
    setCourses(courses => courses.filter(course => course.id !== id));
    onCourseDeleted?.(id);
    showNotification('Curso excluído com sucesso!', 'success');
  };

  const handleEnrollCourse = (courseId: string) => {
    const existingProgress = userProgress.find(p => p.courseId === courseId);
    if (!existingProgress) {
      const newProgress: TrainingProgress = {
        userId: 'current-user',
        courseId,
        completedModules: [],
        currentModule: courses.find(c => c.id === courseId)?.modules[0]?.id || '',
        progress: 0,
        startedAt: new Date().toISOString(),
        lastAccessed: new Date().toISOString()
      };
      setUserProgress(prev => [...prev, newProgress]);
      onUserEnrolled?.('current-user', courseId);
      showNotification('Inscrição realizada com sucesso!', 'success');
    } else {
      showNotification('Você já está inscrito neste curso!', 'info');
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Sistema de Treinamento</h2>
          <p className="text-gray-600">Cursos e capacitação para usuários do sistema RSV</p>
        </div>
        <Button onClick={handleCreateCourse} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Novo Curso
        </Button>
      </div>

      {/* Filtros */}
      <div className="flex gap-4">
        <div className="flex-1">
          <Input
            placeholder="Buscar cursos..."
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
              <GraduationCap className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total de Cursos</p>
              <p className="text-2xl font-bold text-gray-900">{courses.length}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Users className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Usuários Inscritos</p>
              <p className="text-2xl font-bold text-gray-900">
                {courses.reduce((sum, course) => sum + course.enrolledUsers, 0)}
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
              <p className="text-sm text-gray-600">Taxa de Conclusão</p>
              <p className="text-2xl font-bold text-gray-900">
                {Math.round(courses.reduce((sum, course) => sum + course.completionRate, 0) / courses.length)}%
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Award className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Avaliação Média</p>
              <p className="text-2xl font-bold text-gray-900">
                {(courses.reduce((sum, course) => sum + course.rating, 0) / courses.length).toFixed(1)}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Lista de Cursos */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Cursos Disponíveis</h3>
          
          {filteredCourses.length === 0 ? (
            <div className="text-center py-8">
              <GraduationCap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Nenhum curso encontrado</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredCourses.map(course => {
                const userProgressData = userProgress.find(p => p.courseId === course.id);
                const isEnrolled = !!userProgressData;
                
                return (
                  <div key={course.id} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <h4 className="text-xl font-semibold text-gray-900">{course.title}</h4>
                          <Badge variant={course.status === 'published' ? 'default' : 'secondary'}>
                            {course.status === 'published' ? 'Publicado' : 
                             course.status === 'draft' ? 'Rascunho' : 'Arquivado'}
                          </Badge>
                          <Badge className={getDifficultyColor(course.difficulty)}>
                            {getDifficultyLabel(course.difficulty)}
                          </Badge>
                        </div>
                        
                        <p className="text-gray-600 mb-4">{course.description}</p>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Clock className="h-4 w-4" />
                            {course.duration} min
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <BookOpen className="h-4 w-4" />
                            {course.modules.length} módulos
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Users className="h-4 w-4" />
                            {course.enrolledUsers} inscritos
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Award className="h-4 w-4" />
                            {course.rating}/5.0
                          </div>
                        </div>

                        {/* Progresso do usuário */}
                        {isEnrolled && userProgressData && (
                          <div className="mb-4">
                            <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                              <span>Seu Progresso</span>
                              <span>{userProgressData.progress}%</span>
                            </div>
                            <Progress value={userProgressData.progress} className="h-2" />
                            <p className="text-xs text-gray-500 mt-1">
                              Módulo atual: {course.modules.find(m => m.id === userProgressData.currentModule)?.title}
                            </p>
                          </div>
                        )}
                        
                        <div className="flex items-center gap-2">
                          {course.tags.map(tag => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-center gap-3 ml-6">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">{course.completionRate}%</div>
                          <div className="text-xs text-gray-500">Taxa de Conclusão</div>
                        </div>
                        
                        <div className="flex flex-col gap-2">
                          {!isEnrolled ? (
                            <Button
                              onClick={() => handleEnrollCourse(course.id)}
                              className="flex items-center gap-2"
                            >
                              <Play className="h-4 w-4" />
                              Inscrever-se
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
                              className="flex items-center gap-2"
                            >
                              <Play className="h-4 w-4" />
                              Continuar
                            </Button>
                          )}
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedCourse(course)}
                            title="Ver Detalhes"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditCourse(course)}
                            title="Editar"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteCourse(course.id)}
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

      {/* Modal de Criação */}
      <Modal open={showCreateModal} onOpenChange={setShowCreateModal}>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Novo Curso</h3>
          <div className="space-y-4">
            <Input placeholder="Título do curso" />
            <Textarea placeholder="Descrição do curso" rows={3} />
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
            <Input placeholder="Duração em minutos" type="number" />
            <Input placeholder="Tags (separadas por vírgula)" />
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowCreateModal(false)}>
                Cancelar
              </Button>
              <Button onClick={() => {
                setShowCreateModal(false);
                showNotification('Curso criado com sucesso!', 'success');
              }}>
                Criar Curso
              </Button>
            </div>
          </div>
        </div>
      </Modal>

      {/* Modal de Edição */}
      <Modal open={showEditModal} onOpenChange={setShowEditModal}>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Editar Curso</h3>
          {selectedCourse && (
            <div className="space-y-4">
              <Input defaultValue={selectedCourse.title} placeholder="Título do curso" />
              <Textarea defaultValue={selectedCourse.description} placeholder="Descrição do curso" rows={3} />
              <Select defaultValue={selectedCourse.category}>
                <option value="onboarding">Onboarding</option>
                <option value="advanced">Avançado</option>
                <option value="specialized">Especializado</option>
              </Select>
              <Select defaultValue={selectedCourse.difficulty}>
                <option value="beginner">Iniciante</option>
                <option value="intermediate">Intermediário</option>
                <option value="advanced">Avançado</option>
              </Select>
              <Input defaultValue={selectedCourse.duration.toString()} placeholder="Duração em minutos" type="number" />
              <Input defaultValue={selectedCourse.tags.join(', ')} placeholder="Tags (separadas por vírgula)" />
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setShowEditModal(false)}>
                  Cancelar
                </Button>
                <Button onClick={() => {
                  setShowEditModal(false);
                  showNotification('Curso atualizado com sucesso!', 'success');
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

export { TrainingSystem };
export type { TrainingCourse, TrainingModule, TrainingProgress, TrainingSystemProps };
