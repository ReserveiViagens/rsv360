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
  MapPin,
  Route,
  Target,
  Brain,
  TrendingUp,
  Clock,
  Star,
  Award,
  Zap,
  Activity,
  BarChart3,
  PieChart,
  Eye,
  EyeOff,
  Play,
  Pause,
  RotateCcw,
  Settings,
  Download,
  Upload,
  Calendar,
  User,
  Users,
  Lightbulb,
  Rocket,
  Shield,
  BookOpen,
  GraduationCap,
  Briefcase,
  Code,
  Database,
  Globe,
  Smartphone,
  Monitor,
  Tablet,
  Laptop,
  Wifi,
  Mail,
  Phone,
  Building,
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Copy,
  Share,
  ExternalLink,
  Maximize,
  Minimize,
  Info,
  Warning,
  AlertTriangle,
  CheckCircle,
  CheckCircle2,
  XCircle,
  Square,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  ChevronLeft,
  ArrowRight,
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  RefreshCw,
  Timer,
  ThumbsUp,
  ThumbsDown,
  MessageCircle,
  HelpCircle,
  Bookmark,
  BookmarkCheck,
  FileText,
  Video,
  Headphones,
  Image,
  Link,
  Layers,
  Compass,
  Navigation,
  Flag,
  FlagTriangle,
  Trophy,
  Medal,
  Crown,
  Sparkles,
  TrendingDown,
  FlashIcon,
  Flame,
  Mountain,
  TreePine,
  Waves
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
  PieChart as RechartsPieChart, 
  Cell,
  Pie,
  RadialBarChart,
  RadialBar,
  ScatterChart,
  Scatter,
  ComposedChart,
  RechartsTooltip,
  Treemap
} from 'recharts'

// Tipos para Learning Paths
interface LearningPath {
  id: string
  title: string
  description: string
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  duration: number // in days
  category: string
  tags: string[]
  prerequisites: string[]
  learningObjectives: string[]
  skills: string[]
  modules: LearningModule[]
  assessments: PathAssessment[]
  certification?: PathCertification
  metadata: {
    difficulty: number // 1-10
    popularity: number // 1-100
    completionRate: number // 0-100
    averageRating: number // 1-5
    totalEnrollments: number
    createdBy: string
    createdAt: string
    updatedAt: string
    estimatedHours: number
    language: string
    industry: string[]
  }
  personalizedFor?: UserProfile
  adaptiveFeatures: {
    enabled: boolean
    adjustsToLearningSpeed: boolean
    personalizedContent: boolean
    smartRecommendations: boolean
    difficultyAdaptation: boolean
  }
}

interface LearningModule {
  id: string
  title: string
  description: string
  type: 'theory' | 'practical' | 'assessment' | 'project' | 'simulation' | 'workshop'
  order: number
  duration: number // in minutes
  isRequired: boolean
  content: LearningContent[]
  quizzes: Quiz[]
  assignments: Assignment[]
  prerequisites: string[]
  learningObjectives: string[]
  skills: string[]
  resources: LearningResource[]
  metadata: {
    difficulty: number
    estimatedTime: number
    completionCriteria: string[]
    successMetrics: string[]
  }
}

interface LearningContent {
  id: string
  title: string
  type: 'video' | 'text' | 'audio' | 'interactive' | 'simulation' | 'document' | 'link'
  url?: string
  content?: string
  duration: number // in minutes
  order: number
  isRequired: boolean
  metadata: {
    language: string
    subtitles: string[]
    downloadable: boolean
    mobileOptimized: boolean
    accessibility: string[]
  }
}

interface Quiz {
  id: string
  title: string
  questions: QuizQuestion[]
  passingScore: number
  maxAttempts: number
  timeLimit?: number // in minutes
  isRequired: boolean
  metadata: {
    difficulty: number
    estimatedTime: number
    questionTypes: string[]
  }
}

interface QuizQuestion {
  id: string
  type: 'multiple_choice' | 'true_false' | 'short_answer' | 'essay' | 'matching' | 'ordering'
  question: string
  options?: string[]
  correctAnswer: any
  explanation: string
  points: number
  difficulty: number
  tags: string[]
}

interface Assignment {
  id: string
  title: string
  description: string
  type: 'project' | 'report' | 'presentation' | 'practical' | 'portfolio' | 'peer_review'
  instructions: string
  deliverables: string[]
  rubric: AssignmentRubric
  dueDate?: string
  estimatedHours: number
  isRequired: boolean
  allowLateSubmission: boolean
  peerReviewRequired: boolean
}

interface AssignmentRubric {
  criteria: RubricCriterion[]
  totalPoints: number
  passingScore: number
}

interface RubricCriterion {
  id: string
  name: string
  description: string
  points: number
  levels: RubricLevel[]
}

interface RubricLevel {
  id: string
  name: string
  description: string
  points: number
}

interface PathAssessment {
  id: string
  title: string
  type: 'quiz' | 'practical' | 'project' | 'comprehensive' | 'certification'
  description: string
  passingScore: number
  weight: number // in path completion
  isRequired: boolean
  modules: string[] // modules it covers
  estimatedTime: number
}

interface PathCertification {
  id: string
  name: string
  description: string
  issuer: string
  validityPeriod: number // in months
  requirements: string[]
  badge: string
  digitalCredential: boolean
  industryRecognized: boolean
}

interface UserProfile {
  id: string
  name: string
  role: string
  department: string
  experience: string
  learningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'reading'
  preferredPace: 'slow' | 'normal' | 'fast'
  availableTimePerWeek: number // in hours
  goals: string[]
  interests: string[]
  strengths: string[]
  weaknesses: string[]
}

interface LearningProgress {
  userId: string
  pathId: string
  status: 'not_started' | 'in_progress' | 'completed' | 'paused' | 'abandoned'
  enrolledAt: string
  startedAt?: string
  completedAt?: string
  lastAccessedAt: string
  overallProgress: number // 0-100
  timeSpent: number // in minutes
  modulesCompleted: string[]
  modulesProgress: Record<string, {
    status: 'not_started' | 'in_progress' | 'completed'
    progress: number
    timeSpent: number
    lastAccessed: string
    attempts: number
    bestScore?: number
  }>
  assessmentResults: Record<string, {
    score: number
    attempts: number
    passed: boolean
    completedAt: string
  }>
  achievements: Achievement[]
  notes: string[]
  bookmarks: string[]
  personalizedAdaptations: {
    adjustedDifficulty: number
    recommendedPace: string
    suggestedContent: string[]
    skipRecommendations: string[]
  }
}

interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  color: string
  earnedAt: string
  type: 'completion' | 'performance' | 'engagement' | 'milestone' | 'special'
  points: number
}

interface LearningResource {
  id: string
  title: string
  type: 'book' | 'article' | 'video' | 'course' | 'tool' | 'website' | 'document'
  description: string
  url: string
  author?: string
  publisher?: string
  duration?: number
  rating: number
  isRequired: boolean
  isPremium: boolean
  tags: string[]
}

interface PathRecommendation {
  id: string
  pathId: string
  score: number // 0-100
  reasons: string[]
  benefits: string[]
  estimatedROI: string
  priority: 'high' | 'medium' | 'low'
  category: string
  confidence: number // 0-100
}

const LearningPaths: React.FC = () => {
  const [activeTab, setActiveTab] = useState('browse')
  const [selectedPath, setSelectedPath] = useState<LearningPath | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')
  const [filterLevel, setFilterLevel] = useState('all')
  const [sortBy, setSortBy] = useState('popularity')

  // Dados mock para demonstração
  const [learningPaths] = useState<LearningPath[]>([
    {
      id: 'path_001',
      title: 'Fundamentos do Sistema RSV',
      description: 'Curso completo para novos usuários aprenderem a navegar e utilizar todas as funcionalidades básicas do sistema RSV',
      level: 'beginner',
      duration: 14,
      category: 'technical',
      tags: ['sistema', 'navegação', 'básico', 'novos-usuários'],
      prerequisites: [],
      learningObjectives: [
        'Navegar eficientemente pelo sistema RSV',
        'Realizar operações básicas de cadastro',
        'Interpretar relatórios simples',
        'Utilizar funcionalidades de busca',
        'Configurar preferências pessoais'
      ],
      skills: ['system_navigation', 'data_entry', 'basic_reporting'],
      modules: [
        {
          id: 'mod_001',
          title: 'Introdução ao Sistema',
          description: 'Overview geral do sistema e sua interface',
          type: 'theory',
          order: 1,
          duration: 30,
          isRequired: true,
          content: [
            {
              id: 'content_001',
              title: 'Bem-vindo ao RSV',
              type: 'video',
              url: '/videos/welcome.mp4',
              duration: 15,
              order: 1,
              isRequired: true,
              metadata: {
                language: 'pt-BR',
                subtitles: ['pt-BR', 'en'],
                downloadable: true,
                mobileOptimized: true,
                accessibility: ['closed_captions', 'audio_description']
              }
            }
          ],
          quizzes: [],
          assignments: [],
          prerequisites: [],
          learningObjectives: ['Compreender a estrutura do sistema'],
          skills: ['system_navigation'],
          resources: [],
          metadata: {
            difficulty: 2,
            estimatedTime: 30,
            completionCriteria: ['Watch all videos', 'Complete introduction quiz'],
            successMetrics: ['Quiz score > 80%']
          }
        }
      ],
      assessments: [],
      metadata: {
        difficulty: 3,
        popularity: 95,
        completionRate: 87,
        averageRating: 4.6,
        totalEnrollments: 1250,
        createdBy: 'RSV Training Team',
        createdAt: '2024-01-15T00:00:00Z',
        updatedAt: '2025-01-10T00:00:00Z',
        estimatedHours: 12,
        language: 'pt-BR',
        industry: ['tourism', 'travel', 'hospitality']
      },
      adaptiveFeatures: {
        enabled: true,
        adjustsToLearningSpeed: true,
        personalizedContent: true,
        smartRecommendations: true,
        difficultyAdaptation: false
      }
    },
    {
      id: 'path_002',
      title: 'Análise de Dados e Relatórios',
      description: 'Aprenda a criar, interpretar e utilizar relatórios para tomada de decisões estratégicas',
      level: 'intermediate',
      duration: 21,
      category: 'analytics',
      tags: ['dados', 'relatórios', 'análise', 'métricas', 'kpis'],
      prerequisites: ['path_001'],
      learningObjectives: [
        'Criar relatórios personalizados',
        'Interpretar métricas de negócio',
        'Identificar tendências nos dados',
        'Apresentar insights para a equipe',
        'Automatizar relatórios recorrentes'
      ],
      skills: ['data_analysis', 'reporting', 'business_intelligence'],
      modules: [],
      assessments: [],
      metadata: {
        difficulty: 6,
        popularity: 78,
        completionRate: 72,
        averageRating: 4.4,
        totalEnrollments: 890,
        createdBy: 'Analytics Team',
        createdAt: '2024-02-20T00:00:00Z',
        updatedAt: '2025-01-05T00:00:00Z',
        estimatedHours: 18,
        language: 'pt-BR',
        industry: ['tourism', 'travel', 'hospitality']
      },
      adaptiveFeatures: {
        enabled: true,
        adjustsToLearningSpeed: true,
        personalizedContent: true,
        smartRecommendations: true,
        difficultyAdaptation: true
      }
    },
    {
      id: 'path_003',
      title: 'Liderança e Gestão de Equipes',
      description: 'Desenvolvimento de habilidades de liderança para supervisores e gestores',
      level: 'advanced',
      duration: 35,
      category: 'leadership',
      tags: ['liderança', 'gestão', 'equipes', 'comunicação', 'desenvolvimento'],
      prerequisites: ['path_001', 'communication_basics'],
      learningObjectives: [
        'Desenvolver estilo de liderança eficaz',
        'Gerenciar conflitos e desafios',
        'Motivar e engajar equipes',
        'Conduzir reuniões produtivas',
        'Dar feedback construtivo'
      ],
      skills: ['leadership', 'team_management', 'communication', 'conflict_resolution'],
      modules: [],
      assessments: [],
      metadata: {
        difficulty: 8,
        popularity: 65,
        completionRate: 68,
        averageRating: 4.7,
        totalEnrollments: 456,
        createdBy: 'Leadership Development',
        createdAt: '2024-03-10T00:00:00Z',
        updatedAt: '2024-12-20T00:00:00Z',
        estimatedHours: 25,
        language: 'pt-BR',
        industry: ['tourism', 'travel', 'hospitality', 'general']
      },
      adaptiveFeatures: {
        enabled: true,
        adjustsToLearningSpeed: true,
        personalizedContent: true,
        smartRecommendations: true,
        difficultyAdaptation: true
      }
    },
    {
      id: 'path_004',
      title: 'Excelência no Atendimento ao Cliente',
      description: 'Técnicas avançadas para proporcionar experiências excepcionais aos clientes',
      level: 'intermediate',
      duration: 18,
      category: 'customer_service',
      tags: ['atendimento', 'cliente', 'experiência', 'satisfação', 'vendas'],
      prerequisites: ['communication_basics'],
      learningObjectives: [
        'Dominar técnicas de atendimento',
        'Resolver problemas complexos',
        'Aumentar satisfação do cliente',
        'Identificar oportunidades de venda',
        'Lidar com situações difíceis'
      ],
      skills: ['customer_service', 'problem_solving', 'sales', 'empathy'],
      modules: [],
      assessments: [],
      metadata: {
        difficulty: 5,
        popularity: 88,
        completionRate: 79,
        averageRating: 4.5,
        totalEnrollments: 1100,
        createdBy: 'Customer Success Team',
        createdAt: '2024-01-25T00:00:00Z',
        updatedAt: '2025-01-08T00:00:00Z',
        estimatedHours: 15,
        language: 'pt-BR',
        industry: ['tourism', 'travel', 'hospitality', 'retail']
      },
      adaptiveFeatures: {
        enabled: true,
        adjustsToLearningSpeed: true,
        personalizedContent: true,
        smartRecommendations: true,
        difficultyAdaptation: false
      }
    },
    {
      id: 'path_005',
      title: 'Especialização em Destinos Turísticos',
      description: 'Conhecimento aprofundado sobre destinos, culturas e produtos turísticos',
      level: 'intermediate',
      duration: 28,
      category: 'product_knowledge',
      tags: ['destinos', 'turismo', 'produtos', 'culturas', 'vendas'],
      prerequisites: ['path_004'],
      learningObjectives: [
        'Conhecer destinos em profundidade',
        'Compreender culturas locais',
        'Recomendar produtos adequados',
        'Personalizar experiências',
        'Aumentar valor das vendas'
      ],
      skills: ['product_knowledge', 'cultural_awareness', 'sales', 'consultation'],
      modules: [],
      assessments: [],
      metadata: {
        difficulty: 6,
        popularity: 71,
        completionRate: 74,
        averageRating: 4.3,
        totalEnrollments: 680,
        createdBy: 'Product Team',
        createdAt: '2024-04-05T00:00:00Z',
        updatedAt: '2024-12-15T00:00:00Z',
        estimatedHours: 22,
        language: 'pt-BR',
        industry: ['tourism', 'travel']
      },
      adaptiveFeatures: {
        enabled: true,
        adjustsToLearningSpeed: true,
        personalizedContent: true,
        smartRecommendations: true,
        difficultyAdaptation: true
      }
    },
    {
      id: 'path_006',
      title: 'Administração Avançada do Sistema',
      description: 'Configurações avançadas, gestão de usuários e otimização do sistema',
      level: 'expert',
      duration: 42,
      category: 'technical',
      tags: ['administração', 'configuração', 'segurança', 'otimização', 'avançado'],
      prerequisites: ['path_001', 'path_002'],
      learningObjectives: [
        'Configurar sistema completo',
        'Gerenciar usuários e permissões',
        'Implementar políticas de segurança',
        'Otimizar performance',
        'Resolver problemas técnicos'
      ],
      skills: ['system_admin', 'security', 'troubleshooting', 'optimization'],
      modules: [],
      assessments: [],
      certification: {
        id: 'cert_admin',
        name: 'RSV Certified Administrator',
        description: 'Certificação oficial para administradores do sistema RSV',
        issuer: 'RSV Academy',
        validityPeriod: 24,
        requirements: ['Complete all modules', 'Pass final exam with 85%', 'Complete practical project'],
        badge: '/badges/admin-certified.png',
        digitalCredential: true,
        industryRecognized: true
      },
      metadata: {
        difficulty: 9,
        popularity: 42,
        completionRate: 58,
        averageRating: 4.8,
        totalEnrollments: 234,
        createdBy: 'Technical Team',
        createdAt: '2024-05-10T00:00:00Z',
        updatedAt: '2024-11-30T00:00:00Z',
        estimatedHours: 35,
        language: 'pt-BR',
        industry: ['tourism', 'travel', 'technology']
      },
      adaptiveFeatures: {
        enabled: false,
        adjustsToLearningSpeed: false,
        personalizedContent: false,
        smartRecommendations: true,
        difficultyAdaptation: false
      }
    }
  ])

  const [userProgress] = useState<Record<string, LearningProgress>>({
    'path_001': {
      userId: 'user_001',
      pathId: 'path_001',
      status: 'completed',
      enrolledAt: '2024-11-15T00:00:00Z',
      startedAt: '2024-11-16T00:00:00Z',
      completedAt: '2024-12-02T00:00:00Z',
      lastAccessedAt: '2024-12-02T16:30:00Z',
      overallProgress: 100,
      timeSpent: 720, // 12 hours
      modulesCompleted: ['mod_001', 'mod_002', 'mod_003'],
      modulesProgress: {},
      assessmentResults: {},
      achievements: [
        {
          id: 'ach_001',
          title: 'Primeiro Passo',
          description: 'Completou o primeiro módulo',
          icon: 'Flag',
          color: '#10b981',
          earnedAt: '2024-11-17T00:00:00Z',
          type: 'milestone',
          points: 10
        }
      ],
      notes: [],
      bookmarks: [],
      personalizedAdaptations: {
        adjustedDifficulty: 3,
        recommendedPace: 'normal',
        suggestedContent: [],
        skipRecommendations: []
      }
    },
    'path_002': {
      userId: 'user_001',
      pathId: 'path_002',
      status: 'in_progress',
      enrolledAt: '2024-12-05T00:00:00Z',
      startedAt: '2024-12-06T00:00:00Z',
      lastAccessedAt: '2025-01-15T14:20:00Z',
      overallProgress: 65,
      timeSpent: 540, // 9 hours
      modulesCompleted: ['mod_001', 'mod_002'],
      modulesProgress: {},
      assessmentResults: {},
      achievements: [],
      notes: ['Focar mais nas visualizações de dados'],
      bookmarks: ['module_003_charts'],
      personalizedAdaptations: {
        adjustedDifficulty: 5,
        recommendedPace: 'fast',
        suggestedContent: ['advanced_charts', 'excel_integration'],
        skipRecommendations: []
      }
    }
  })

  const [pathRecommendations] = useState<PathRecommendation[]>([
    {
      id: 'rec_001',
      pathId: 'path_003',
      score: 92,
      reasons: [
        'Baseado no seu perfil de liderança',
        'Próximo passo natural na carreira',
        'Alta demanda na sua área'
      ],
      benefits: [
        'Desenvolver habilidades de gestão',
        'Preparar para promoção',
        'Aumentar impacto na equipe'
      ],
      estimatedROI: 'Aumento salarial de 15-25% em 12 meses',
      priority: 'high',
      category: 'career_development',
      confidence: 87
    },
    {
      id: 'rec_002',
      pathId: 'path_004',
      score: 85,
      reasons: [
        'Complementa habilidades técnicas',
        'Melhora interação com clientes',
        'Área de oportunidade identificada'
      ],
      benefits: [
        'Maior satisfação do cliente',
        'Melhores avaliações',
        'Oportunidades de venda'
      ],
      estimatedROI: 'Melhoria de 20% nas métricas de atendimento',
      priority: 'medium',
      category: 'skill_enhancement',
      confidence: 82
    }
  ])

  // Dados para gráficos
  const progressOverTimeData = [
    { month: 'Nov', completed: 1, inProgress: 0, enrolled: 1 },
    { month: 'Dez', completed: 1, inProgress: 1, enrolled: 2 },
    { month: 'Jan', completed: 1, inProgress: 1, enrolled: 2 }
  ]

  const skillDevelopmentData = [
    { skill: 'Sistema', before: 2, after: 4.5 },
    { skill: 'Análise', before: 3, after: 4 },
    { skill: 'Comunicação', before: 4, after: 4.2 },
    { skill: 'Liderança', before: 2.5, after: 3.8 }
  ]

  const categoryDistributionData = [
    { name: 'Técnico', value: 35, color: '#3b82f6' },
    { name: 'Negócio', value: 25, color: '#10b981' },
    { name: 'Liderança', value: 20, color: '#8b5cf6' },
    { name: 'Atendimento', value: 20, color: '#f59e0b' }
  ]

  const timeSpentData = [
    { path: 'Fundamentos RSV', hours: 12, completed: true },
    { path: 'Análise de Dados', hours: 9, completed: false },
    { path: 'Atendimento', hours: 0, completed: false },
    { path: 'Liderança', hours: 0, completed: false }
  ]

  // Funções auxiliares
  const formatDuration = (days: number) => {
    if (days < 7) {
      return `${days} dias`
    } else if (days < 30) {
      const weeks = Math.floor(days / 7)
      return `${weeks} ${weeks === 1 ? 'semana' : 'semanas'}`
    } else {
      const months = Math.floor(days / 30)
      return `${months} ${months === 1 ? 'mês' : 'meses'}`
    }
  }

  const formatHours = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    
    if (hours > 0) {
      return `${hours}h ${remainingMinutes}m`
    } else {
      return `${remainingMinutes}m`
    }
  }

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'expert': return 'bg-purple-100 text-purple-800'
      case 'advanced': return 'bg-blue-100 text-blue-800'
      case 'intermediate': return 'bg-yellow-100 text-yellow-800'
      case 'beginner': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getDifficultyStars = (difficulty: number) => {
    const stars = []
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`w-3 h-3 ${i <= difficulty / 2 ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
        />
      )
    }
    return stars
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'technical': return Code
      case 'analytics': return BarChart3
      case 'leadership': return Users
      case 'customer_service': return Headphones
      case 'product_knowledge': return BookOpen
      default: return BookOpen
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800'
      case 'in_progress': return 'bg-blue-100 text-blue-800'
      case 'not_started': return 'bg-gray-100 text-gray-800'
      case 'paused': return 'bg-yellow-100 text-yellow-800'
      case 'abandoned': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredPaths = learningPaths.filter(path => {
    const matchesSearch = path.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         path.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         path.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    
    const matchesCategory = filterCategory === 'all' || path.category === filterCategory
    const matchesLevel = filterLevel === 'all' || path.level === filterLevel
    
    return matchesSearch && matchesCategory && matchesLevel
  })

  const sortedPaths = [...filteredPaths].sort((a, b) => {
    switch (sortBy) {
      case 'popularity':
        return b.metadata.popularity - a.metadata.popularity
      case 'rating':
        return b.metadata.averageRating - a.metadata.averageRating
      case 'duration':
        return a.duration - b.duration
      case 'difficulty':
        return a.metadata.difficulty - b.metadata.difficulty
      case 'newest':
        return new Date(b.metadata.createdAt).getTime() - new Date(a.metadata.createdAt).getTime()
      default:
        return b.metadata.popularity - a.metadata.popularity
    }
  })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Caminhos de Aprendizado</h1>
          <p className="text-gray-600">Trilhas personalizadas para desenvolvimento de habilidades</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="secondary">
            <Settings className="w-4 h-4 mr-2" />
            Preferências
          </Button>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Criar Trilha
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="browse">Explorar</TabsTrigger>
          <TabsTrigger value="my-paths">Minhas Trilhas</TabsTrigger>
          <TabsTrigger value="recommendations">Recomendações</TabsTrigger>
          <TabsTrigger value="progress">Progresso</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="browse" className="space-y-6">
          {/* Search and Filters */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-wrap gap-4">
                <div className="flex-1 min-w-64">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Buscar trilhas de aprendizado..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <option value="all">Todas as Categorias</option>
                  <option value="technical">Técnicas</option>
                  <option value="analytics">Análise de Dados</option>
                  <option value="leadership">Liderança</option>
                  <option value="customer_service">Atendimento</option>
                  <option value="product_knowledge">Produtos</option>
                </Select>
                
                <Select value={filterLevel} onValueChange={setFilterLevel}>
                  <option value="all">Todos os Níveis</option>
                  <option value="beginner">Iniciante</option>
                  <option value="intermediate">Intermediário</option>
                  <option value="advanced">Avançado</option>
                  <option value="expert">Especialista</option>
                </Select>
                
                <Select value={sortBy} onValueChange={setSortBy}>
                  <option value="popularity">Mais Populares</option>
                  <option value="rating">Melhor Avaliados</option>
                  <option value="duration">Menor Duração</option>
                  <option value="difficulty">Menor Dificuldade</option>
                  <option value="newest">Mais Recentes</option>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Learning Paths Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedPaths.map((path) => {
              const IconComponent = getCategoryIcon(path.category)
              const progress = userProgress[path.id]
              
              return (
                <Card key={path.id} className="border hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-3 rounded-lg bg-blue-50">
                        <IconComponent className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getLevelColor(path.level)} size="sm">
                          {path.level}
                        </Badge>
                        {path.certification && (
                          <Award className="w-4 h-4 text-yellow-600" title="Oferece Certificação" />
                        )}
                      </div>
                    </div>
                    
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{path.title}</h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{path.description}</p>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600">{formatDuration(path.duration)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                          <span className="text-gray-600">{path.metadata.averageRating}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-1">
                          <Users className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600">{path.metadata.totalEnrollments}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          {getDifficultyStars(path.metadata.difficulty)}
                        </div>
                      </div>

                      {progress && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Progresso</span>
                            <span className="font-medium">{progress.overallProgress}%</span>
                          </div>
                          <Progress value={progress.overallProgress} className="h-2" />
                          <Badge className={getStatusColor(progress.status)} size="sm">
                            {progress.status}
                          </Badge>
                        </div>
                      )}
                      
                      <div className="flex flex-wrap gap-1 mt-2">
                        {path.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {path.tags.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{path.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex space-x-2 mt-4">
                      {progress && progress.status === 'in_progress' ? (
                        <Button className="flex-1">
                          <Play className="w-4 h-4 mr-2" />
                          Continuar
                        </Button>
                      ) : progress && progress.status === 'completed' ? (
                        <Button variant="secondary" className="flex-1">
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Revisar
                        </Button>
                      ) : (
                        <Button className="flex-1">
                          <Play className="w-4 h-4 mr-2" />
                          Iniciar
                        </Button>
                      )}
                      <Button variant="secondary" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="secondary" size="sm">
                        <Bookmark className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {sortedPaths.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhuma trilha encontrada</h3>
                <p className="text-gray-600">Tente ajustar os filtros ou termo de busca</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="my-paths" className="space-y-6">
          {/* My Learning Paths */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">2</div>
                <div className="text-sm text-gray-600">Trilhas Ativas</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">1</div>
                <div className="text-sm text-gray-600">Concluídas</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-purple-600">540</div>
                <div className="text-sm text-gray-600">Minutos Estudados</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-orange-600">1</div>
                <div className="text-sm text-gray-600">Certificações</div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            {Object.entries(userProgress).map(([pathId, progress]) => {
              const path = learningPaths.find(p => p.id === pathId)
              if (!path) return null
              
              const IconComponent = getCategoryIcon(path.category)
              
              return (
                <Card key={pathId} className="border">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start space-x-4">
                        <div className="p-3 rounded-lg bg-blue-50">
                          <IconComponent className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{path.title}</h3>
                          <p className="text-gray-600 text-sm mb-2">{path.description}</p>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span>Iniciado em {new Date(progress.enrolledAt).toLocaleDateString('pt-BR')}</span>
                            <span>•</span>
                            <span>{formatHours(progress.timeSpent)} estudados</span>
                            {progress.completedAt && (
                              <>
                                <span>•</span>
                                <span>Concluído em {new Date(progress.completedAt).toLocaleDateString('pt-BR')}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <Badge className={getStatusColor(progress.status)}>
                        {progress.status}
                      </Badge>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">Progresso Geral</span>
                        <span className="text-sm font-bold">{progress.overallProgress}%</span>
                      </div>
                      <Progress value={progress.overallProgress} className="h-3" />
                      
                      {progress.achievements.length > 0 && (
                        <div>
                          <span className="text-sm font-medium text-gray-700">Conquistas Recentes:</span>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {progress.achievements.map((achievement) => (
                              <div key={achievement.id} className="flex items-center space-x-2 p-2 bg-yellow-50 rounded-lg">
                                <Trophy className="w-4 h-4 text-yellow-600" />
                                <span className="text-sm font-medium">{achievement.title}</span>
                                <Badge variant="secondary" size="sm">{achievement.points}pts</Badge>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex space-x-2 mt-4">
                      {progress.status === 'completed' ? (
                        <>
                          <Button variant="secondary">
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Revisar Conteúdo
                          </Button>
                          <Button variant="secondary">
                            <Download className="w-4 h-4 mr-2" />
                            Certificado
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button>
                            <Play className="w-4 h-4 mr-2" />
                            Continuar
                          </Button>
                          <Button variant="secondary">
                            <Eye className="w-4 h-4 mr-2" />
                            Ver Detalhes
                          </Button>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-6">
          {/* AI Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Brain className="w-5 h-5 text-purple-600" />
                <span>Recomendações Personalizadas</span>
              </CardTitle>
              <CardDescription>
                Trilhas sugeridas pela IA baseadas no seu perfil e objetivos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pathRecommendations.map((recommendation) => {
                  const path = learningPaths.find(p => p.id === recommendation.pathId)
                  if (!path) return null
                  
                  const IconComponent = getCategoryIcon(path.category)
                  
                  return (
                    <Card key={recommendation.id} className="border">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-start space-x-4">
                            <div className="p-3 rounded-lg bg-purple-50">
                              <IconComponent className="h-6 w-6 text-purple-600" />
                            </div>
                            <div>
                              <h4 className="text-lg font-semibold text-gray-900">{path.title}</h4>
                              <p className="text-gray-600 text-sm mb-2">{path.description}</p>
                              <div className="flex items-center space-x-4 text-sm text-gray-500">
                                <span>{formatDuration(path.duration)}</span>
                                <span>•</span>
                                <span>{path.metadata.estimatedHours}h estimadas</span>
                                <span>•</span>
                                <span>⭐ {path.metadata.averageRating}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge className={getPriorityColor(recommendation.priority)}>
                              {recommendation.priority}
                            </Badge>
                            <Badge variant="secondary">
                              {recommendation.score}% match
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          <div>
                            <h5 className="font-medium text-gray-900 mb-2">Por que recomendamos:</h5>
                            <ul className="space-y-1">
                              {recommendation.reasons.map((reason, index) => (
                                <li key={index} className="flex items-start space-x-2 text-sm text-gray-600">
                                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                                  <span>{reason}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          
                          <div>
                            <h5 className="font-medium text-gray-900 mb-2">Benefícios esperados:</h5>
                            <ul className="space-y-1">
                              {recommendation.benefits.map((benefit, index) => (
                                <li key={index} className="flex items-start space-x-2 text-sm text-gray-600">
                                  <TrendingUp className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                                  <span>{benefit}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                        
                        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                          <div className="flex items-center space-x-2 mb-1">
                            <TrendingUp className="w-4 h-4 text-blue-600" />
                            <span className="font-medium text-blue-900">ROI Estimado:</span>
                          </div>
                          <p className="text-blue-800 text-sm">{recommendation.estimatedROI}</p>
                        </div>
                        
                        <div className="flex space-x-2 mt-4">
                          <Button>
                            <Play className="w-4 h-4 mr-2" />
                            Iniciar Trilha
                          </Button>
                          <Button variant="secondary">
                            <Eye className="w-4 h-4 mr-2" />
                            Ver Detalhes
                          </Button>
                          <Button variant="secondary">
                            <Bookmark className="w-4 h-4 mr-2" />
                            Salvar
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Smart Suggestions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Lightbulb className="w-5 h-5 text-yellow-600" />
                <span>Sugestões Inteligentes</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <span className="font-medium">Baseado no seu tempo disponível</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    Você tem aproximadamente 5h/semana. Recomendamos trilhas de até 3 semanas.
                  </p>
                  <Button size="sm" variant="secondary">Ver Trilhas Rápidas</Button>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Target className="w-4 h-4 text-green-600" />
                    <span className="font-medium">Próximo na sua carreira</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    Para sua posição atual, sugerimos focar em habilidades de liderança.
                  </p>
                  <Button size="sm" variant="secondary">Ver Trilhas de Liderança</Button>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-purple-600" />
                    <span className="font-medium">Lacunas identificadas</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    Sua última avaliação mostrou oportunidades em análise de dados.
                  </p>
                  <Button size="sm" variant="secondary">Ver Trilhas de Analytics</Button>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Users className="w-4 h-4 text-orange-600" />
                    <span className="font-medium">Popular na sua equipe</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    Seus colegas estão fazendo trilhas de atendimento ao cliente.
                  </p>
                  <Button size="sm" variant="secondary">Ver Trilhas Populares</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="progress" className="space-y-6">
          {/* Progress Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Progresso ao Longo do Tempo</CardTitle>
                <CardDescription>Evolução das suas trilhas de aprendizado</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={progressOverTimeData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="completed" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.6} name="Concluídas" />
                    <Area type="monotone" dataKey="inProgress" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} name="Em Progresso" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tempo Dedicado por Trilha</CardTitle>
                <CardDescription>Horas investidas em cada área</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={timeSpentData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="path" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="hours" fill="#3b82f6" name="Horas" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Desenvolvimento de Habilidades</CardTitle>
                <CardDescription>Comparação antes/depois das trilhas</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={skillDevelopmentData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="skill" />
                    <YAxis domain={[0, 5]} />
                    <Tooltip />
                    <Bar dataKey="before" fill="#f59e0b" name="Antes" />
                    <Bar dataKey="after" fill="#10b981" name="Depois" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Distribuição por Categoria</CardTitle>
                <CardDescription>Foco das suas trilhas de aprendizado</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <RechartsPieChart>
                    <Pie
                      data={categoryDistributionData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}%`}
                    >
                      {categoryDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Achievements */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Trophy className="w-5 h-5 text-yellow-600" />
                <span>Conquistas Recentes</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  {
                    title: 'Primeiro Passo',
                    description: 'Completou sua primeira trilha',
                    icon: Flag,
                    color: 'bg-green-500',
                    date: '2024-12-02'
                  },
                  {
                    title: 'Estudioso',
                    description: '10 horas de estudo concluídas',
                    icon: BookOpen,
                    color: 'bg-blue-500',
                    date: '2024-12-15'
                  },
                  {
                    title: 'Consistente',
                    description: '7 dias consecutivos estudando',
                    icon: Calendar,
                    color: 'bg-purple-500',
                    date: '2025-01-10'
                  }
                ].map((achievement, index) => (
                  <div key={index} className="p-4 border rounded-lg flex items-center space-x-3">
                    <div className={`p-2 rounded-full ${achievement.color}`}>
                      <achievement.icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{achievement.title}</h4>
                      <p className="text-sm text-gray-600">{achievement.description}</p>
                      <p className="text-xs text-gray-500">{new Date(achievement.date).toLocaleDateString('pt-BR')}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          {/* Learning Analytics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <BookOpen className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-blue-600">3</div>
                <div className="text-sm text-gray-600">Trilhas Concluídas</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Clock className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-green-600">21h</div>
                <div className="text-sm text-gray-600">Tempo Total</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Target className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-purple-600">85%</div>
                <div className="text-sm text-gray-600">Taxa de Conclusão</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Trophy className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-yellow-600">12</div>
                <div className="text-sm text-gray-600">Conquistas</div>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Analytics */}
          <Card>
            <CardHeader>
              <CardTitle>Relatório Detalhado de Aprendizado</CardTitle>
              <CardDescription>Análise completa do seu progresso</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="overview" className="space-y-4">
                <TabsList>
                  <TabsTrigger value="overview">Visão Geral</TabsTrigger>
                  <TabsTrigger value="time">Tempo</TabsTrigger>
                  <TabsTrigger value="performance">Performance</TabsTrigger>
                  <TabsTrigger value="engagement">Engajamento</TabsTrigger>
                </TabsList>
                
                <TabsContent value="overview" className="space-y-4">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="font-semibold">Resumo de Atividades</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Trilhas iniciadas:</span>
                          <span className="font-medium">3</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Módulos completados:</span>
                          <span className="font-medium">12</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Quizzes realizados:</span>
                          <span className="font-medium">8</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Projetos entregues:</span>
                          <span className="font-medium">2</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <h4 className="font-semibold">Métricas de Qualidade</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Pontuação média:</span>
                          <span className="font-medium">87%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Taxa de primeira tentativa:</span>
                          <span className="font-medium">92%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Tempo médio por módulo:</span>
                          <span className="font-medium">45min</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Consistência semanal:</span>
                          <span className="font-medium">78%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="time" className="space-y-4">
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={progressOverTimeData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="completed" stroke="#10b981" strokeWidth={2} name="Horas por Semana" />
                    </LineChart>
                  </ResponsiveContainer>
                </TabsContent>
                
                <TabsContent value="performance" className="space-y-4">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={skillDevelopmentData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="skill" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="before" fill="#f59e0b" name="Pontuação Inicial" />
                      <Bar dataKey="after" fill="#10b981" name="Pontuação Atual" />
                    </BarChart>
                  </ResponsiveContainer>
                </TabsContent>
                
                <TabsContent value="engagement" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-3">Padrões de Estudo</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Horário preferido:</span>
                          <span className="font-medium">14:00 - 16:00</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Dia da semana ativo:</span>
                          <span className="font-medium">Terça-feira</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Sessão média:</span>
                          <span className="font-medium">35 minutos</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Tipo de conteúdo preferido:</span>
                          <span className="font-medium">Vídeos</span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-3">Interações</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Perguntas feitas:</span>
                          <span className="font-medium">3</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Discussões participadas:</span>
                          <span className="font-medium">5</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Recursos salvos:</span>
                          <span className="font-medium">12</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Feedback dado:</span>
                          <span className="font-medium">8</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default LearningPaths
