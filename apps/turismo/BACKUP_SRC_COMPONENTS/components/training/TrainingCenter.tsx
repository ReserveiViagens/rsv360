'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Badge } from '@/components/ui/Badge'
import { Textarea } from '@/components/ui/Textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { Progress } from '@/components/ui/Progress'
import { 
  GraduationCap,
  BookOpen,
  Users,
  Target,
  Trophy,
  Star,
  Clock,
  CheckCircle,
  XCircle,
  Play,
  Pause,
  RotateCcw,
  Settings,
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Copy,
  Share,
  Download,
  Upload,
  Eye,
  EyeOff,
  Calendar,
  Award,
  TrendingUp,
  Activity,
  Brain,
  Lightbulb,
  Zap,
  Rocket,
  Shield,
  Bookmark,
  Heart,
  ThumbsUp,
  MessageCircle,
  Video,
  FileText,
  Image,
  Headphones,
  Monitor,
  Smartphone,
  Tablet,
  Laptop,
  Globe,
  MapPin,
  Building,
  User,
  UserCheck,
  UserPlus,
  AlertTriangle,
  Info,
  Warning,
  Mail,
  Phone,
  Wifi,
  Database,
  Server,
  Cloud,
  Code,
  Layers
} from 'lucide-react'
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  PieChart, 
  Cell,
  Pie,
  RadialBarChart,
  RadialBar,
  ScatterChart,
  Scatter,
  ComposedChart,
  RechartsTooltip
} from 'recharts'

// Tipos para Training Center
interface TrainingCourse {
  id: string
  title: string
  description: string
  category: 'technical' | 'business' | 'soft_skills' | 'compliance' | 'product'
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  type: 'video' | 'interactive' | 'simulation' | 'quiz' | 'hands_on' | 'mixed'
  duration: number // minutes
  modules: TrainingModule[]
  instructor: {
    id: string
    name: string
    avatar: string
    bio: string
    expertise: string[]
    rating: number
  }
  prerequisites: string[]
  skills: string[]
  learningObjectives: string[]
  certification: {
    available: boolean
    name?: string
    validityPeriod?: number // months
    renewalRequired?: boolean
  }
  rating: {
    average: number
    count: number
    distribution: Record<number, number>
  }
  enrollment: {
    enrolled: number
    completed: number
    inProgress: number
    dropouts: number
  }
  content: {
    videos: number
    documents: number
    quizzes: number
    assignments: number
    simulations: number
  }
  pricing: {
    free: boolean
    price?: number
    currency?: string
    subscription?: boolean
  }
  status: 'draft' | 'published' | 'archived' | 'under_review'
  tags: string[]
  createdAt: string
  updatedAt: string
  publishedAt?: string
}

interface TrainingModule {
  id: string
  title: string
  description: string
  order: number
  type: 'video' | 'reading' | 'quiz' | 'assignment' | 'simulation' | 'discussion'
  duration: number // minutes
  content: {
    videoUrl?: string
    documentUrl?: string
    interactiveContent?: any
    quizQuestions?: QuizQuestion[]
  }
  prerequisites: string[]
  learningObjectives: string[]
  resources: {
    type: 'pdf' | 'video' | 'link' | 'image' | 'audio'
    title: string
    url: string
    size?: number
  }[]
  completion: {
    required: boolean
    passingScore?: number
    attempts?: number
  }
  status: 'locked' | 'available' | 'in_progress' | 'completed' | 'failed'
}

interface QuizQuestion {
  id: string
  type: 'multiple_choice' | 'true_false' | 'fill_blank' | 'essay' | 'matching'
  question: string
  options?: string[]
  correctAnswer: string | string[]
  explanation: string
  points: number
  difficulty: 'easy' | 'medium' | 'hard'
  tags: string[]
}

interface UserProgress {
  userId: string
  courseId: string
  enrolledAt: string
  startedAt?: string
  completedAt?: string
  lastAccessedAt: string
  progress: {
    overall: number // percentage
    modules: Record<string, {
      status: 'not_started' | 'in_progress' | 'completed' | 'failed'
      progress: number
      score?: number
      attempts: number
      timeSpent: number // minutes
      lastAccessed: string
    }>
  }
  performance: {
    totalTimeSpent: number // minutes
    averageScore: number
    quizzesPassed: number
    assignmentsSubmitted: number
    certificationsEarned: string[]
  }
  engagement: {
    loginFrequency: number
    sessionDuration: number
    forumPosts: number
    questionsAsked: number
    helpRequests: number
  }
  aiRecommendations: {
    nextCourses: string[]
    skillGaps: string[]
    studySchedule: {
      recommendedHours: number
      preferredTimes: string[]
      frequency: 'daily' | 'weekly' | 'bi_weekly'
    }
  }
}

interface LearningAnalytics {
  period: {
    start: string
    end: string
  }
  overview: {
    totalLearners: number
    activeLearners: number
    coursesCompleted: number
    certificationsIssued: number
    averageEngagement: number
    completionRate: number
  }
  courses: {
    mostPopular: string[]
    highestRated: string[]
    mostCompleted: string[]
    needingImprovement: string[]
  }
  learners: {
    topPerformers: string[]
    atRisk: string[]
    newJoiners: number
    returning: number
  }
  engagement: {
    averageSessionTime: number
    peakLearningHours: string[]
    deviceUsage: Record<string, number>
    contentPreferences: Record<string, number>
  }
  skills: {
    mostDeveloped: string[]
    inDemand: string[]
    gaps: string[]
    trending: string[]
  }
}

const TrainingCenter: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedCourse, setSelectedCourse] = useState<TrainingCourse | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')

  // Dados mock para demonstração
  const [courses] = useState<TrainingCourse[]>([
    {
      id: '1',
      title: 'Fundamentos do Sistema RSV',
      description: 'Curso completo sobre os fundamentos e funcionalidades básicas do sistema Onboarding RSV',
      category: 'product',
      level: 'beginner',
      type: 'mixed',
      duration: 180, // 3 horas
      modules: [
        {
          id: 'm1',
          title: 'Introdução ao Sistema',
          description: 'Visão geral e primeiros passos',
          order: 1,
          type: 'video',
          duration: 30,
          content: {
            videoUrl: '/videos/intro-rsv.mp4'
          },
          prerequisites: [],
          learningObjectives: ['Entender a proposta do sistema', 'Conhecer a interface principal'],
          resources: [
            {
              type: 'pdf',
              title: 'Guia de Introdução',
              url: '/docs/intro-guide.pdf',
              size: 2048000
            }
          ],
          completion: {
            required: true
          },
          status: 'available'
        },
        {
          id: 'm2',
          title: 'Navegação e Interface',
          description: 'Como navegar pelo sistema e usar a interface',
          order: 2,
          type: 'interactive',
          duration: 45,
          content: {
            interactiveContent: {
              type: 'guided_tour',
              steps: 15
            }
          },
          prerequisites: ['m1'],
          learningObjectives: ['Navegar com confiança', 'Usar atalhos de teclado'],
          resources: [],
          completion: {
            required: true
          },
          status: 'locked'
        }
      ],
      instructor: {
        id: 'inst1',
        name: 'Ana Silva',
        avatar: '/avatars/ana-silva.jpg',
        bio: 'Especialista em sistemas de gestão com 10 anos de experiência',
        expertise: ['Gestão de Sistemas', 'Treinamento Corporativo', 'UX/UI'],
        rating: 4.8
      },
      prerequisites: [],
      skills: ['Navegação do Sistema', 'Interface de Usuário', 'Funcionalidades Básicas'],
      learningObjectives: [
        'Compreender os conceitos fundamentais do sistema RSV',
        'Navegar eficientemente pela interface',
        'Executar tarefas básicas do dia a dia',
        'Identificar recursos e funcionalidades principais'
      ],
      certification: {
        available: true,
        name: 'Certificação RSV Básico',
        validityPeriod: 12,
        renewalRequired: true
      },
      rating: {
        average: 4.6,
        count: 247,
        distribution: {
          5: 156,
          4: 67,
          3: 18,
          2: 4,
          1: 2
        }
      },
      enrollment: {
        enrolled: 247,
        completed: 198,
        inProgress: 35,
        dropouts: 14
      },
      content: {
        videos: 12,
        documents: 8,
        quizzes: 5,
        assignments: 3,
        simulations: 2
      },
      pricing: {
        free: true
      },
      status: 'published',
      tags: ['Básico', 'Obrigatório', 'Introdução', 'Sistema RSV'],
      createdAt: '2024-01-15T00:00:00Z',
      updatedAt: '2025-01-10T00:00:00Z',
      publishedAt: '2024-02-01T00:00:00Z'
    },
    {
      id: '2',
      title: 'Gestão Avançada de Reservas',
      description: 'Técnicas avançadas para gestão eficiente de reservas e otimização de operações',
      category: 'business',
      level: 'intermediate',
      type: 'mixed',
      duration: 240, // 4 horas
      modules: [],
      instructor: {
        id: 'inst2',
        name: 'Carlos Oliveira',
        avatar: '/avatars/carlos-oliveira.jpg',
        bio: 'Gerente de operações com especialização em turismo',
        expertise: ['Gestão de Reservas', 'Operações Turísticas', 'Customer Service'],
        rating: 4.9
      },
      prerequisites: ['1'],
      skills: ['Gestão de Reservas', 'Otimização de Operações', 'Atendimento ao Cliente'],
      learningObjectives: [
        'Dominar técnicas avançadas de gestão de reservas',
        'Otimizar processos operacionais',
        'Melhorar a experiência do cliente',
        'Implementar estratégias de upselling'
      ],
      certification: {
        available: true,
        name: 'Certificação RSV Avançado',
        validityPeriod: 12,
        renewalRequired: true
      },
      rating: {
        average: 4.8,
        count: 156,
        distribution: {
          5: 112,
          4: 32,
          3: 8,
          2: 3,
          1: 1
        }
      },
      enrollment: {
        enrolled: 156,
        completed: 134,
        inProgress: 18,
        dropouts: 4
      },
      content: {
        videos: 18,
        documents: 12,
        quizzes: 8,
        assignments: 5,
        simulations: 4
      },
      pricing: {
        free: false,
        price: 199.90,
        currency: 'BRL'
      },
      status: 'published',
      tags: ['Avançado', 'Gestão', 'Reservas', 'Operações'],
      createdAt: '2024-03-01T00:00:00Z',
      updatedAt: '2025-01-08T00:00:00Z',
      publishedAt: '2024-03-15T00:00:00Z'
    },
    {
      id: '3',
      title: 'Liderança e Soft Skills',
      description: 'Desenvolvimento de habilidades de liderança e competências interpessoais',
      category: 'soft_skills',
      level: 'intermediate',
      type: 'interactive',
      duration: 300, // 5 horas
      modules: [],
      instructor: {
        id: 'inst3',
        name: 'Maria Santos',
        avatar: '/avatars/maria-santos.jpg',
        bio: 'Coach executiva e especialista em desenvolvimento humano',
        expertise: ['Liderança', 'Coaching', 'Desenvolvimento Pessoal'],
        rating: 4.9
      },
      prerequisites: [],
      skills: ['Liderança', 'Comunicação', 'Gestão de Equipes', 'Inteligência Emocional'],
      learningObjectives: [
        'Desenvolver habilidades de liderança eficaz',
        'Melhorar a comunicação interpessoal',
        'Aprender técnicas de gestão de equipes',
        'Desenvolver inteligência emocional'
      ],
      certification: {
        available: true,
        name: 'Certificação em Liderança',
        validityPeriod: 24,
        renewalRequired: false
      },
      rating: {
        average: 4.9,
        count: 89,
        distribution: {
          5: 76,
          4: 11,
          3: 2,
          2: 0,
          1: 0
        }
      },
      enrollment: {
        enrolled: 89,
        completed: 67,
        inProgress: 19,
        dropouts: 3
      },
      content: {
        videos: 15,
        documents: 20,
        quizzes: 6,
        assignments: 8,
        simulations: 6
      },
      pricing: {
        free: false,
        price: 299.90,
        currency: 'BRL'
      },
      status: 'published',
      tags: ['Liderança', 'Soft Skills', 'Comunicação', 'Gestão'],
      createdAt: '2024-05-01T00:00:00Z',
      updatedAt: '2025-01-05T00:00:00Z',
      publishedAt: '2024-05-15T00:00:00Z'
    },
    {
      id: '4',
      title: 'Segurança da Informação e LGPD',
      description: 'Curso abrangente sobre segurança de dados e conformidade com a LGPD',
      category: 'compliance',
      level: 'intermediate',
      type: 'mixed',
      duration: 120, // 2 horas
      modules: [],
      instructor: {
        id: 'inst4',
        name: 'Roberto Fernandes',
        avatar: '/avatars/roberto-fernandes.jpg',
        bio: 'Especialista em segurança da informação e compliance',
        expertise: ['Segurança da Informação', 'LGPD', 'Compliance', 'Auditoria'],
        rating: 4.7
      },
      prerequisites: [],
      skills: ['Segurança da Informação', 'LGPD', 'Proteção de Dados', 'Compliance'],
      learningObjectives: [
        'Compreender os fundamentos da segurança da informação',
        'Conhecer as exigências da LGPD',
        'Implementar práticas de proteção de dados',
        'Desenvolver cultura de segurança'
      ],
      certification: {
        available: true,
        name: 'Certificação LGPD e Segurança',
        validityPeriod: 12,
        renewalRequired: true
      },
      rating: {
        average: 4.7,
        count: 203,
        distribution: {
          5: 134,
          4: 52,
          3: 14,
          2: 2,
          1: 1
        }
      },
      enrollment: {
        enrolled: 203,
        completed: 187,
        inProgress: 12,
        dropouts: 4
      },
      content: {
        videos: 10,
        documents: 15,
        quizzes: 7,
        assignments: 4,
        simulations: 3
      },
      pricing: {
        free: true
      },
      status: 'published',
      tags: ['Obrigatório', 'Segurança', 'LGPD', 'Compliance'],
      createdAt: '2024-06-01T00:00:00Z',
      updatedAt: '2025-01-12T00:00:00Z',
      publishedAt: '2024-06-15T00:00:00Z'
    }
  ])

  const [userProgress] = useState<UserProgress[]>([
    {
      userId: 'user1',
      courseId: '1',
      enrolledAt: '2025-01-10T00:00:00Z',
      startedAt: '2025-01-10T09:00:00Z',
      lastAccessedAt: '2025-01-15T14:30:00Z',
      progress: {
        overall: 75,
        modules: {
          'm1': {
            status: 'completed',
            progress: 100,
            score: 95,
            attempts: 1,
            timeSpent: 35,
            lastAccessed: '2025-01-10T10:30:00Z'
          },
          'm2': {
            status: 'in_progress',
            progress: 60,
            attempts: 1,
            timeSpent: 25,
            lastAccessed: '2025-01-15T14:30:00Z'
          }
        }
      },
      performance: {
        totalTimeSpent: 60,
        averageScore: 95,
        quizzesPassed: 2,
        assignmentsSubmitted: 1,
        certificationsEarned: []
      },
      engagement: {
        loginFrequency: 5,
        sessionDuration: 45,
        forumPosts: 3,
        questionsAsked: 2,
        helpRequests: 0
      },
      aiRecommendations: {
        nextCourses: ['2', '4'],
        skillGaps: ['Gestão Avançada', 'Relatórios'],
        studySchedule: {
          recommendedHours: 2,
          preferredTimes: ['09:00', '14:00'],
          frequency: 'daily'
        }
      }
    }
  ])

  const [analytics] = useState<LearningAnalytics>({
    period: {
      start: '2025-01-01T00:00:00Z',
      end: '2025-01-31T23:59:59Z'
    },
    overview: {
      totalLearners: 492,
      activeLearners: 387,
      coursesCompleted: 586,
      certificationsIssued: 234,
      averageEngagement: 78.5,
      completionRate: 85.2
    },
    courses: {
      mostPopular: ['1', '4', '2'],
      highestRated: ['3', '2', '1'],
      mostCompleted: ['1', '4', '3'],
      needingImprovement: []
    },
    learners: {
      topPerformers: ['user1', 'user2', 'user3'],
      atRisk: ['user15', 'user23'],
      newJoiners: 47,
      returning: 340
    },
    engagement: {
      averageSessionTime: 42,
      peakLearningHours: ['09:00', '14:00', '20:00'],
      deviceUsage: {
        desktop: 65,
        mobile: 25,
        tablet: 10
      },
      contentPreferences: {
        video: 45,
        interactive: 30,
        reading: 15,
        quiz: 10
      }
    },
    skills: {
      mostDeveloped: ['Navegação do Sistema', 'Atendimento ao Cliente', 'Segurança'],
      inDemand: ['Gestão Avançada', 'Liderança', 'Analytics'],
      gaps: ['Relatórios Avançados', 'Automação', 'Integração'],
      trending: ['IA e Automação', 'Customer Experience', 'Data Analytics']
    }
  })

  // Dados para gráficos
  const learningProgressData = [
    { week: 'Sem 1', enrolled: 67, completed: 42, inProgress: 18, dropouts: 7 },
    { week: 'Sem 2', enrolled: 73, completed: 51, inProgress: 15, dropouts: 7 },
    { week: 'Sem 3', enrolled: 85, completed: 64, inProgress: 16, dropouts: 5 },
    { week: 'Sem 4', enrolled: 92, completed: 73, inProgress: 14, dropouts: 5 }
  ]

  const skillDevelopmentData = [
    { skill: 'Sistema RSV', before: 35, after: 85, improvement: 50 },
    { skill: 'Gestão', before: 45, after: 78, improvement: 33 },
    { skill: 'Liderança', before: 40, after: 82, improvement: 42 },
    { skill: 'Segurança', before: 30, after: 88, improvement: 58 }
  ]

  const engagementData = [
    { day: 'Seg', sessions: 87, duration: 45 },
    { day: 'Ter', sessions: 92, duration: 48 },
    { day: 'Qua', sessions: 78, duration: 42 },
    { day: 'Qui', sessions: 95, duration: 52 },
    { day: 'Sex', sessions: 102, duration: 47 },
    { day: 'Sáb', sessions: 34, duration: 38 },
    { day: 'Dom', sessions: 28, duration: 35 }
  ]

  const certificationData = [
    { month: 'Nov', issued: 18, renewed: 5, expired: 2 },
    { month: 'Dez', issued: 34, renewed: 8, expired: 3 },
    { month: 'Jan', issued: 47, renewed: 12, expired: 1 }
  ]

  // Funções auxiliares
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    
    if (hours > 0) {
      return `${hours}h ${remainingMinutes}m`
    } else {
      return `${remainingMinutes}m`
    }
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR')
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('pt-BR').format(num)
  }

  const formatCurrency = (value: number, currency: string = 'BRL') => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: currency
    }).format(value)
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'technical': return 'bg-blue-100 text-blue-800'
      case 'business': return 'bg-green-100 text-green-800'
      case 'soft_skills': return 'bg-purple-100 text-purple-800'
      case 'compliance': return 'bg-red-100 text-red-800'
      case 'product': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-green-100 text-green-800'
      case 'intermediate': return 'bg-yellow-100 text-yellow-800'
      case 'advanced': return 'bg-orange-100 text-orange-800'
      case 'expert': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': case 'completed': return 'bg-green-100 text-green-800'
      case 'in_progress': case 'under_review': return 'bg-blue-100 text-blue-800'
      case 'draft': return 'bg-yellow-100 text-yellow-800'
      case 'archived': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="h-4 w-4" />
      case 'interactive': return <Monitor className="h-4 w-4" />
      case 'simulation': return <Zap className="h-4 w-4" />
      case 'quiz': return <Target className="h-4 w-4" />
      case 'hands_on': return <Code className="h-4 w-4" />
      case 'mixed': return <Layers className="h-4 w-4" />
      default: return <BookOpen className="h-4 w-4" />
    }
  }

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         course.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    
    const matchesCategory = filterCategory === 'all' || course.category === filterCategory
    
    return matchesSearch && matchesCategory
  })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Central de Treinamento</h1>
          <p className="text-gray-600">Sistema inteligente de aprendizado e desenvolvimento</p>
        </div>
        <div className="flex space-x-2">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Novo Curso
          </Button>
          <Button variant="secondary">
            <Settings className="w-4 h-4 mr-2" />
            Configurações
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="courses">Cursos</TabsTrigger>
          <TabsTrigger value="progress">Progresso</TabsTrigger>
          <TabsTrigger value="certifications">Certificações</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="library">Biblioteca</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* KPIs Principais */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Alunos</CardTitle>
                <Users className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {formatNumber(analytics.overview.totalLearners)}
                </div>
                <p className="text-xs text-gray-600">
                  {formatNumber(analytics.overview.activeLearners)} ativos
                </p>
                <Progress 
                  value={(analytics.overview.activeLearners / analytics.overview.totalLearners) * 100} 
                  className="mt-2 h-2" 
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Taxa de Conclusão</CardTitle>
                <Trophy className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {analytics.overview.completionRate}%
                </div>
                <p className="text-xs text-gray-600">
                  {formatNumber(analytics.overview.coursesCompleted)} cursos concluídos
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Certificações</CardTitle>
                <Award className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">
                  {formatNumber(analytics.overview.certificationsIssued)}
                </div>
                <p className="text-xs text-gray-600">
                  Emitidas este mês
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Engajamento</CardTitle>
                <TrendingUp className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {analytics.overview.averageEngagement}%
                </div>
                <p className="text-xs text-gray-600">
                  Engajamento médio
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Gráfico de Progresso de Aprendizado */}
          <Card>
            <CardHeader>
              <CardTitle>Progresso de Aprendizado</CardTitle>
              <CardDescription>Evolução dos alunos ao longo do tempo</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <ComposedChart data={learningProgressData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="enrolled" fill="#3b82f6" name="Inscritos" />
                  <Bar dataKey="completed" fill="#10b981" name="Concluídos" />
                  <Bar dataKey="inProgress" fill="#f59e0b" name="Em Progresso" />
                  <Line type="monotone" dataKey="dropouts" stroke="#ef4444" strokeWidth={2} name="Desistências" />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Desenvolvimento de Habilidades */}
            <Card>
              <CardHeader>
                <CardTitle>Desenvolvimento de Habilidades</CardTitle>
                <CardDescription>Evolução das competências dos alunos</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={skillDevelopmentData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="skill" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="before" fill="#e5e7eb" name="Antes" />
                    <Bar dataKey="after" fill="#10b981" name="Depois" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Engajamento Semanal */}
            <Card>
              <CardHeader>
                <CardTitle>Engajamento Semanal</CardTitle>
                <CardDescription>Sessões e duração por dia da semana</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <ComposedChart data={engagementData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Bar yAxisId="left" dataKey="sessions" fill="#3b82f6" name="Sessões" />
                    <Line yAxisId="right" type="monotone" dataKey="duration" stroke="#10b981" strokeWidth={2} name="Duração (min)" />
                  </ComposedChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Cursos em Destaque */}
          <Card>
            <CardHeader>
              <CardTitle>Cursos em Destaque</CardTitle>
              <CardDescription>Cursos mais populares e bem avaliados</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {courses.slice(0, 4).map((course) => (
                  <Card key={course.id} className="border hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          {getTypeIcon(course.type)}
                        </div>
                        <div className="flex items-center space-x-1">
                          <Star className="h-3 w-3 text-yellow-500 fill-current" />
                          <span className="text-xs text-gray-600">{course.rating.average}</span>
                        </div>
                      </div>
                      
                      <h4 className="font-semibold text-sm mb-2">{course.title}</h4>
                      <p className="text-xs text-gray-600 mb-3 line-clamp-2">{course.description}</p>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <Badge className={getCategoryColor(course.category)} size="sm">
                            {course.category}
                          </Badge>
                          <Badge className={getLevelColor(course.level)} size="sm">
                            {course.level}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center justify-between text-xs text-gray-600">
                          <span>{formatDuration(course.duration)}</span>
                          <span>{formatNumber(course.enrollment.enrolled)} alunos</span>
                        </div>
                        
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-600">Conclusão:</span>
                          <span className="font-medium">
                            {Math.round((course.enrollment.completed / course.enrollment.enrolled) * 100)}%
                          </span>
                        </div>
                        
                        <Progress 
                          value={(course.enrollment.completed / course.enrollment.enrolled) * 100} 
                          className="h-1" 
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Skills em Demanda */}
          <Card>
            <CardHeader>
              <CardTitle>Skills em Demanda</CardTitle>
              <CardDescription>Habilidades mais procuradas e desenvolvidas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <TrendingUp className="w-4 h-4 mr-2 text-green-600" />
                    Mais Desenvolvidas
                  </h4>
                  <div className="space-y-2">
                    {analytics.skills.mostDeveloped.map((skill, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-green-50 rounded">
                        <span className="text-sm">{skill}</span>
                        <Badge className="bg-green-100 text-green-800" size="sm">
                          #{index + 1}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <Target className="w-4 h-4 mr-2 text-blue-600" />
                    Em Demanda
                  </h4>
                  <div className="space-y-2">
                    {analytics.skills.inDemand.map((skill, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-blue-50 rounded">
                        <span className="text-sm">{skill}</span>
                        <Badge className="bg-blue-100 text-blue-800" size="sm">
                          #{index + 1}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <Brain className="w-4 h-4 mr-2 text-purple-600" />
                    Tendências
                  </h4>
                  <div className="space-y-2">
                    {analytics.skills.trending.map((skill, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-purple-50 rounded">
                        <span className="text-sm">{skill}</span>
                        <Badge className="bg-purple-100 text-purple-800" size="sm">
                          #{index + 1}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="courses" className="space-y-6">
          {/* Filtros e Busca */}
          <Card>
            <CardHeader>
              <CardTitle>Catálogo de Cursos</CardTitle>
              <CardDescription>Explore nossa biblioteca completa de treinamentos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex space-x-4 mb-6">
                <div className="flex-1">
                  <Input
                    placeholder="Buscar cursos, instrutores ou habilidades..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full"
                  />
                </div>
                <Select
                  title="Categoria"
                  options={[
                    { value: 'all', label: 'Todas as Categorias' },
                    { value: 'technical', label: 'Técnico' },
                    { value: 'business', label: 'Negócios' },
                    { value: 'soft_skills', label: 'Soft Skills' },
                    { value: 'compliance', label: 'Compliance' },
                    { value: 'product', label: 'Produto' }
                  ]}
                  value={filterCategory}
                  onChange={setFilterCategory}
                />
                <Button variant="secondary">
                  <Filter className="w-4 h-4 mr-2" />
                  Filtros
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCourses.map((course) => (
                  <Card key={course.id} className="border hover:shadow-lg transition-shadow cursor-pointer">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="p-3 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg">
                          {getTypeIcon(course.type)}
                        </div>
                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4 text-yellow-500 fill-current" />
                          <span className="text-sm font-medium">{course.rating.average}</span>
                          <span className="text-xs text-gray-500">({course.rating.count})</span>
                        </div>
                      </div>
                      
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{course.title}</h3>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-3">{course.description}</p>
                      
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Badge className={getCategoryColor(course.category)}>
                            {course.category}
                          </Badge>
                          <Badge className={getLevelColor(course.level)}>
                            {course.level}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            {formatDuration(course.duration)}
                          </div>
                          <div className="flex items-center">
                            <Users className="w-4 h-4 mr-1" />
                            {formatNumber(course.enrollment.enrolled)}
                          </div>
                          <div className="flex items-center">
                            <User className="w-4 h-4 mr-1" />
                            {course.instructor.name}
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Progresso da Turma:</span>
                            <span className="font-medium">
                              {Math.round((course.enrollment.completed / course.enrollment.enrolled) * 100)}%
                            </span>
                          </div>
                          <Progress 
                            value={(course.enrollment.completed / course.enrollment.enrolled) * 100} 
                            className="h-2" 
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="text-sm">
                            {course.pricing.free ? (
                              <Badge className="bg-green-100 text-green-800">Gratuito</Badge>
                            ) : (
                              <span className="font-semibold text-lg">
                                {formatCurrency(course.pricing.price!, course.pricing.currency)}
                              </span>
                            )}
                          </div>
                          <div className="flex space-x-2">
                            <Button size="sm" variant="secondary">
                              <Eye className="h-3 w-3 mr-1" />
                              Visualizar
                            </Button>
                            <Button size="sm">
                              <Play className="h-3 w-3 mr-1" />
                              Iniciar
                            </Button>
                          </div>
                        </div>
                        
                        {course.certification.available && (
                          <div className="pt-2 border-t">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-gray-600">Certificação disponível</span>
                              <Badge className="bg-yellow-100 text-yellow-800" size="sm">
                                <Award className="w-3 h-3 mr-1" />
                                Certificado
                              </Badge>
                            </div>
                          </div>
                        )}
                        
                        <div className="pt-2">
                          <div className="flex flex-wrap gap-1">
                            {course.tags.slice(0, 3).map((tag, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                            {course.tags.length > 3 && (
                              <Badge variant="secondary" className="text-xs">
                                +{course.tags.length - 3}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="progress" className="space-y-6">
          {/* Progresso Individual */}
          <Card>
            <CardHeader>
              <CardTitle>Meu Progresso</CardTitle>
              <CardDescription>Acompanhe seu desenvolvimento e conquistas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {userProgress.map((progress) => {
                  const course = courses.find(c => c.id === progress.courseId)
                  if (!course) return null
                  
                  return (
                    <Card key={progress.courseId} className="border">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-start space-x-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                              {getTypeIcon(course.type)}
                            </div>
                            <div>
                              <h4 className="font-semibold">{course.title}</h4>
                              <p className="text-sm text-gray-600">{course.description}</p>
                              <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                                <span>Iniciado: {formatDateTime(progress.startedAt!)}</span>
                                <span>•</span>
                                <span>Último acesso: {formatDateTime(progress.lastAccessedAt)}</span>
                              </div>
                            </div>
                          </div>
                          <Badge className={progress.progress.overall === 100 ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}>
                            {progress.progress.overall}% concluído
                          </Badge>
                        </div>
                        
                        <div className="space-y-4">
                          <div>
                            <div className="flex items-center justify-between text-sm mb-2">
                              <span>Progresso Geral</span>
                              <span>{progress.progress.overall}%</span>
                            </div>
                            <Progress value={progress.progress.overall} className="h-3" />
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="text-gray-600">Tempo Gasto:</span>
                              <div className="font-medium">{formatDuration(progress.performance.totalTimeSpent)}</div>
                            </div>
                            <div>
                              <span className="text-gray-600">Nota Média:</span>
                              <div className="font-medium">{progress.performance.averageScore}%</div>
                            </div>
                            <div>
                              <span className="text-gray-600">Quizzes Passados:</span>
                              <div className="font-medium">{progress.performance.quizzesPassed}</div>
                            </div>
                            <div>
                              <span className="text-gray-600">Engajamento:</span>
                              <div className="font-medium">{progress.engagement.loginFrequency} sessões</div>
                            </div>
                          </div>
                          
                          <div>
                            <h5 className="font-medium text-sm mb-2">Módulos:</h5>
                            <div className="space-y-2">
                              {Object.entries(progress.progress.modules).map(([moduleId, moduleProgress]) => {
                                const module = course.modules.find(m => m.id === moduleId)
                                if (!module) return null
                                
                                return (
                                  <div key={moduleId} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                    <div className="flex items-center space-x-2">
                                      <div className={`w-3 h-3 rounded-full ${
                                        moduleProgress.status === 'completed' ? 'bg-green-500' :
                                        moduleProgress.status === 'in_progress' ? 'bg-blue-500' :
                                        moduleProgress.status === 'failed' ? 'bg-red-500' : 'bg-gray-300'
                                      }`}></div>
                                      <span className="text-sm font-medium">{module.title}</span>
                                    </div>
                                    <div className="flex items-center space-x-2 text-sm">
                                      <span>{moduleProgress.progress}%</span>
                                      {moduleProgress.score && (
                                        <Badge variant="secondary" size="sm">
                                          {moduleProgress.score}pts
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                          
                          <div>
                            <h5 className="font-medium text-sm mb-2">Recomendações da IA:</h5>
                            <div className="space-y-2 text-sm">
                              <div>
                                <span className="text-gray-600">Próximos cursos:</span>
                                <div className="flex gap-1 mt-1">
                                  {progress.aiRecommendations.nextCourses.map((courseId, index) => {
                                    const recommendedCourse = courses.find(c => c.id === courseId)
                                    return recommendedCourse ? (
                                      <Badge key={index} variant="secondary" className="text-xs">
                                        {recommendedCourse.title}
                                      </Badge>
                                    ) : null
                                  })}
                                </div>
                              </div>
                              <div>
                                <span className="text-gray-600">Lacunas de habilidades:</span>
                                <div className="flex gap-1 mt-1">
                                  {progress.aiRecommendations.skillGaps.map((skill, index) => (
                                    <Badge key={index} className="bg-orange-100 text-orange-800 text-xs">
                                      {skill}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                              <div>
                                <span className="text-gray-600">Cronograma sugerido:</span>
                                <span className="ml-2 font-medium">
                                  {progress.aiRecommendations.studySchedule.recommendedHours}h/{progress.aiRecommendations.studySchedule.frequency}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="certifications" className="space-y-6">
          {/* Certificações */}
          <Card>
            <CardHeader>
              <CardTitle>Certificações</CardTitle>
              <CardDescription>Gerencie certificações emitidas e renovações</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={certificationData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="issued" fill="#10b981" name="Emitidas" />
                  <Bar dataKey="renewed" fill="#3b82f6" name="Renovadas" />
                  <Bar dataKey="expired" fill="#ef4444" name="Expiradas" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Lista de Certificações Disponíveis */}
          <Card>
            <CardHeader>
              <CardTitle>Certificações Disponíveis</CardTitle>
              <CardDescription>Cursos que oferecem certificação</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {courses.filter(course => course.certification.available).map((course) => (
                  <div key={course.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-yellow-100 rounded-lg">
                        <Award className="h-5 w-5 text-yellow-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold">{course.certification.name}</h4>
                        <p className="text-sm text-gray-600">Curso: {course.title}</p>
                        <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                          <span>Validade: {course.certification.validityPeriod} meses</span>
                          <span>•</span>
                          <span>Renovação: {course.certification.renewalRequired ? 'Obrigatória' : 'Opcional'}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right text-sm">
                        <div className="font-medium">
                          {Math.round((course.enrollment.completed / course.enrollment.enrolled) * 100)}%
                        </div>
                        <div className="text-gray-500">Taxa de conclusão</div>
                      </div>
                      <Button size="sm">
                        <Eye className="h-3 w-3 mr-1" />
                        Ver Detalhes
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          {/* Analytics Detalhados */}
          <Card>
            <CardHeader>
              <CardTitle>Analytics de Aprendizado</CardTitle>
              <CardDescription>Insights detalhados sobre performance e engajamento</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Analytics Avançados de Aprendizado
                </h3>
                <p className="text-gray-600 mb-6">
                  Análise detalhada de performance, engajamento e ROI de treinamentos.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">Performance Analytics</h4>
                    <p className="text-gray-600">Análise de performance individual e por equipe</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">Learning Paths</h4>
                    <p className="text-gray-600">Otimização de caminhos de aprendizado</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">ROI Training</h4>
                    <p className="text-gray-600">Retorno sobre investimento em treinamentos</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="library" className="space-y-6">
          {/* Biblioteca de Recursos */}
          <Card>
            <CardHeader>
              <CardTitle>Biblioteca de Recursos</CardTitle>
              <CardDescription>Materiais de apoio e recursos adicionais</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Biblioteca Digital
                </h3>
                <p className="text-gray-600 mb-6">
                  Acesso a documentos, vídeos, simulações e outros recursos de aprendizado.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                  <div className="p-4 border rounded-lg">
                    <FileText className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                    <h4 className="font-semibold mb-1">Documentos</h4>
                    <p className="text-gray-600">PDFs, manuais e guias</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <Video className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <h4 className="font-semibold mb-1">Vídeos</h4>
                    <p className="text-gray-600">Aulas e demonstrações</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <Headphones className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                    <h4 className="font-semibold mb-1">Áudios</h4>
                    <p className="text-gray-600">Podcasts e palestras</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <Monitor className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                    <h4 className="font-semibold mb-1">Simulações</h4>
                    <p className="text-gray-600">Prática interativa</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default TrainingCenter
