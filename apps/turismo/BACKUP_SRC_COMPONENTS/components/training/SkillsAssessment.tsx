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
  Target,
  Brain,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  XCircle,
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
  MapPin,
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
  AlertTriangle as Warning,
  AlertTriangle,
  CheckSquare,
  Square,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  Timer,
  ThumbsUp,
  ThumbsDown,
  MessageCircle,
  HelpCircle
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
  ComposedChart
} from 'recharts'

// Tipos para Skills Assessment
interface SkillCategory {
  id: string
  name: string
  description: string
  icon: string
  color: string
  skills: Skill[]
  weight: number // importance weight in overall assessment
}

interface Skill {
  id: string
  name: string
  description: string
  category: string
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  importance: 'critical' | 'high' | 'medium' | 'low'
  assessmentMethods: AssessmentMethod[]
  prerequisites: string[]
  relatedSkills: string[]
  learningResources: string[]
  certificationPath?: string
}

interface AssessmentMethod {
  id: string
  type: 'self_evaluation' | 'quiz' | 'practical' | 'simulation' | 'peer_review' | 'manager_review' | 'portfolio'
  name: string
  description: string
  duration: number // minutes
  questions: Question[]
  passingScore: number
  maxAttempts: number
  weight: number // weight in skill assessment
}

interface Question {
  id: string
  type: 'multiple_choice' | 'true_false' | 'rating' | 'practical' | 'essay' | 'code' | 'scenario'
  question: string
  description?: string
  options?: string[]
  correctAnswer?: any
  explanation?: string
  points: number
  difficulty: 'easy' | 'medium' | 'hard'
  skillTags: string[]
  timeLimit?: number // seconds
  resources?: string[]
  scenario?: string
}

interface AssessmentResult {
  id: string
  userId: string
  assessmentId: string
  startedAt: string
  completedAt?: string
  duration: number // minutes
  status: 'in_progress' | 'completed' | 'abandoned' | 'failed'
  overall: {
    score: number
    percentage: number
    level: 'beginner' | 'intermediate' | 'advanced' | 'expert'
    strengths: string[]
    weaknesses: string[]
    recommendations: string[]
  }
  categories: Record<string, {
    score: number
    percentage: number
    level: string
    skills: Record<string, {
      score: number
      level: string
      confidence: number
      needsImprovement: boolean
      nextSteps: string[]
    }>
  }>
  aiInsights: AIInsight[]
  improvementPlan: ImprovementPlan
  nextAssessment?: string
}

interface AIInsight {
  id: string
  type: 'strength' | 'weakness' | 'opportunity' | 'recommendation' | 'pattern'
  title: string
  description: string
  confidence: number // percentage
  evidence: string[]
  actionable: boolean
  priority: 'high' | 'medium' | 'low'
  category: string
  estimatedImpact: string
}

interface ImprovementPlan {
  id: string
  generatedAt: string
  duration: number // days
  focus: string[]
  phases: ImprovementPhase[]
  resources: LearningResource[]
  milestones: SkillMilestone[]
  tracking: {
    frequency: 'weekly' | 'bi_weekly' | 'monthly'
    methods: string[]
    kpis: string[]
  }
}

interface ImprovementPhase {
  id: string
  name: string
  description: string
  duration: number // days
  order: number
  objectives: string[]
  activities: string[]
  skills: string[]
  resources: string[]
  assessments: string[]
  success_criteria: string[]
}

interface LearningResource {
  id: string
  type: 'course' | 'book' | 'video' | 'article' | 'practice' | 'mentor' | 'workshop'
  title: string
  description: string
  provider: string
  duration: number // minutes
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  rating: number
  cost: number
  currency: string
  url: string
  skills: string[]
  prerequisites: string[]
}

interface SkillMilestone {
  id: string
  title: string
  description: string
  targetDate: string
  skills: string[]
  criteria: string[]
  reward: string
  status: 'pending' | 'in_progress' | 'completed' | 'overdue'
}

interface SkillGap {
  skill: string
  current: number
  required: number
  gap: number
  priority: 'critical' | 'high' | 'medium' | 'low'
  timeToClose: number // days
  effort: 'low' | 'medium' | 'high'
  impact: 'low' | 'medium' | 'high'
}

const SkillsAssessment: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [currentAssessment, setCurrentAssessment] = useState<AssessmentMethod | null>(null)
  const [assessmentProgress, setAssessmentProgress] = useState(0)
  const [selectedResult, setSelectedResult] = useState<AssessmentResult | null>(null)

  // Dados mock para demonstração
  const [skillCategories] = useState<SkillCategory[]>([
    {
      id: 'technical',
      name: 'Habilidades Técnicas',
      description: 'Competências relacionadas ao uso de sistemas e tecnologias',
      icon: 'Code',
      color: '#3b82f6',
      weight: 0.4,
      skills: [
        {
          id: 'system_navigation',
          name: 'Navegação do Sistema',
          description: 'Capacidade de navegar eficientemente pelo sistema RSV',
          category: 'technical',
          level: 'beginner',
          importance: 'critical',
          assessmentMethods: [],
          prerequisites: [],
          relatedSkills: ['system_features', 'data_entry'],
          learningResources: ['intro_course', 'navigation_guide'],
          certificationPath: 'rsv_basic'
        },
        {
          id: 'data_analysis',
          name: 'Análise de Dados',
          description: 'Interpretar relatórios e métricas do sistema',
          category: 'technical',
          level: 'intermediate',
          importance: 'high',
          assessmentMethods: [],
          prerequisites: ['system_navigation'],
          relatedSkills: ['reporting', 'excel'],
          learningResources: ['analytics_course', 'reporting_workshop']
        },
        {
          id: 'system_admin',
          name: 'Administração do Sistema',
          description: 'Configurações avançadas e gestão de usuários',
          category: 'technical',
          level: 'advanced',
          importance: 'medium',
          assessmentMethods: [],
          prerequisites: ['system_navigation', 'data_analysis'],
          relatedSkills: ['user_management', 'security'],
          learningResources: ['admin_course', 'security_training']
        }
      ]
    },
    {
      id: 'business',
      name: 'Conhecimento de Negócio',
      description: 'Entendimento dos processos e objetivos da empresa',
      icon: 'Briefcase',
      color: '#10b981',
      weight: 0.3,
      skills: [
        {
          id: 'industry_knowledge',
          name: 'Conhecimento do Setor',
          description: 'Entendimento do mercado de turismo e viagens',
          category: 'business',
          level: 'intermediate',
          importance: 'high',
          assessmentMethods: [],
          prerequisites: [],
          relatedSkills: ['customer_service', 'sales'],
          learningResources: ['industry_overview', 'market_trends']
        },
        {
          id: 'process_knowledge',
          name: 'Processos da Empresa',
          description: 'Conhecimento dos fluxos de trabalho internos',
          category: 'business',
          level: 'intermediate',
          importance: 'critical',
          assessmentMethods: [],
          prerequisites: [],
          relatedSkills: ['quality_control', 'compliance'],
          learningResources: ['process_guide', 'workflow_training']
        },
        {
          id: 'product_knowledge',
          name: 'Conhecimento de Produtos',
          description: 'Detalhes sobre destinos e pacotes oferecidos',
          category: 'business',
          level: 'advanced',
          importance: 'high',
          assessmentMethods: [],
          prerequisites: ['industry_knowledge'],
          relatedSkills: ['sales', 'customer_service'],
          learningResources: ['product_catalog', 'destination_guides']
        }
      ]
    },
    {
      id: 'soft_skills',
      name: 'Habilidades Interpessoais',
      description: 'Competências de comunicação e relacionamento',
      icon: 'Users',
      color: '#8b5cf6',
      weight: 0.3,
      skills: [
        {
          id: 'communication',
          name: 'Comunicação',
          description: 'Habilidade de comunicar-se clara e efetivamente',
          category: 'soft_skills',
          level: 'intermediate',
          importance: 'critical',
          assessmentMethods: [],
          prerequisites: [],
          relatedSkills: ['customer_service', 'teamwork'],
          learningResources: ['communication_course', 'presentation_skills']
        },
        {
          id: 'customer_service',
          name: 'Atendimento ao Cliente',
          description: 'Excelência no atendimento e resolução de problemas',
          category: 'soft_skills',
          level: 'advanced',
          importance: 'critical',
          assessmentMethods: [],
          prerequisites: ['communication'],
          relatedSkills: ['problem_solving', 'empathy'],
          learningResources: ['service_excellence', 'customer_psychology']
        },
        {
          id: 'leadership',
          name: 'Liderança',
          description: 'Capacidade de liderar equipes e projetos',
          category: 'soft_skills',
          level: 'advanced',
          importance: 'medium',
          assessmentMethods: [],
          prerequisites: ['communication', 'teamwork'],
          relatedSkills: ['delegation', 'motivation'],
          learningResources: ['leadership_fundamentals', 'team_management']
        }
      ]
    }
  ])

  const [assessmentResults] = useState<AssessmentResult[]>([
    {
      id: 'result_001',
      userId: 'user_001',
      assessmentId: 'assessment_001',
      startedAt: '2025-01-15T09:00:00Z',
      completedAt: '2025-01-15T10:30:00Z',
      duration: 90,
      status: 'completed',
      overall: {
        score: 78,
        percentage: 78,
        level: 'intermediate',
        strengths: [
          'Comunicação excelente',
          'Boa adaptação a tecnologia',
          'Conhecimento sólido do setor'
        ],
        weaknesses: [
          'Análise de dados precisa melhorar',
          'Liderança ainda em desenvolvimento',
          'Conhecimento limitado de processos avançados'
        ],
        recommendations: [
          'Focar em treinamento de análise de dados',
          'Participar de workshop de liderança',
          'Estudar casos de uso avançados do sistema'
        ]
      },
      categories: {
        technical: {
          score: 72,
          percentage: 72,
          level: 'intermediate',
          skills: {
            system_navigation: {
              score: 85,
              level: 'advanced',
              confidence: 90,
              needsImprovement: false,
              nextSteps: ['Explorar funcionalidades avançadas']
            },
            data_analysis: {
              score: 65,
              level: 'intermediate',
              confidence: 70,
              needsImprovement: true,
              nextSteps: ['Curso de análise de dados', 'Prática com relatórios']
            },
            system_admin: {
              score: 45,
              level: 'beginner',
              confidence: 50,
              needsImprovement: true,
              nextSteps: ['Treinamento de administração', 'Certificação avançada']
            }
          }
        },
        business: {
          score: 82,
          percentage: 82,
          level: 'advanced',
          skills: {
            industry_knowledge: {
              score: 88,
              level: 'advanced',
              confidence: 95,
              needsImprovement: false,
              nextSteps: ['Manter-se atualizado com tendências']
            },
            process_knowledge: {
              score: 78,
              level: 'intermediate',
              confidence: 80,
              needsImprovement: false,
              nextSteps: ['Estudar processos avançados']
            },
            product_knowledge: {
              score: 80,
              level: 'advanced',
              confidence: 85,
              needsImprovement: false,
              nextSteps: ['Explorar novos destinos']
            }
          }
        },
        soft_skills: {
          score: 80,
          percentage: 80,
          level: 'advanced',
          skills: {
            communication: {
              score: 92,
              level: 'expert',
              confidence: 95,
              needsImprovement: false,
              nextSteps: ['Mentorar outros colaboradores']
            },
            customer_service: {
              score: 85,
              level: 'advanced',
              confidence: 90,
              needsImprovement: false,
              nextSteps: ['Técnicas avançadas de relacionamento']
            },
            leadership: {
              score: 63,
              level: 'intermediate',
              confidence: 65,
              needsImprovement: true,
              nextSteps: ['Workshop de liderança', 'Projeto de liderança']
            }
          }
        }
      },
      aiInsights: [
        {
          id: 'insight_001',
          type: 'strength',
          title: 'Forte Orientação ao Cliente',
          description: 'Demonstra excelente capacidade de comunicação e foco no atendimento',
          confidence: 92,
          evidence: ['Alta pontuação em comunicação', 'Experiência prévia em atendimento'],
          actionable: true,
          priority: 'medium',
          category: 'soft_skills',
          estimatedImpact: 'Pode se tornar mentor em atendimento ao cliente'
        },
        {
          id: 'insight_002',
          type: 'weakness',
          title: 'Oportunidade em Análise de Dados',
          description: 'Habilidades analíticas podem ser desenvolvidas para maior eficiência',
          confidence: 85,
          evidence: ['Pontuação abaixo da média em análise', 'Feedback de supervisores'],
          actionable: true,
          priority: 'high',
          category: 'technical',
          estimatedImpact: 'Melhoria de 30% na eficiência de relatórios'
        },
        {
          id: 'insight_003',
          type: 'recommendation',
          title: 'Caminho para Liderança',
          description: 'Perfil adequado para desenvolvimento de liderança',
          confidence: 78,
          evidence: ['Boa comunicação', 'Experiência no setor', 'Interesse demonstrado'],
          actionable: true,
          priority: 'medium',
          category: 'career',
          estimatedImpact: 'Potencial para posição de liderança em 12 meses'
        }
      ],
      improvementPlan: {
        id: 'plan_001',
        generatedAt: '2025-01-15T10:30:00Z',
        duration: 90,
        focus: ['data_analysis', 'leadership', 'advanced_systems'],
        phases: [
          {
            id: 'phase_1',
            name: 'Fundamentos Analíticos',
            description: 'Desenvolvimento de habilidades básicas de análise',
            duration: 30,
            order: 1,
            objectives: [
              'Dominar ferramentas de relatório',
              'Interpretar métricas chave',
              'Criar análises básicas'
            ],
            activities: [
              'Curso: Análise de Dados para Turismo',
              'Prática: Relatórios semanais',
              'Workshop: Excel Avançado'
            ],
            skills: ['data_analysis', 'reporting', 'excel'],
            resources: ['analytics_course', 'excel_training', 'reporting_templates'],
            assessments: ['analytics_quiz', 'practical_report'],
            success_criteria: [
              'Pontuação > 80% em quiz',
              'Criar relatório independente',
              'Feedback positivo do supervisor'
            ]
          },
          {
            id: 'phase_2',
            name: 'Liderança Inicial',
            description: 'Desenvolvimento de habilidades básicas de liderança',
            duration: 45,
            order: 2,
            objectives: [
              'Compreender estilos de liderança',
              'Praticar comunicação de liderança',
              'Liderar pequenos projetos'
            ],
            activities: [
              'Workshop: Fundamentos da Liderança',
              'Mentoring: Sessões quinzenais',
              'Projeto: Liderar iniciativa de melhoria'
            ],
            skills: ['leadership', 'delegation', 'motivation'],
            resources: ['leadership_course', 'mentoring_program', 'project_toolkit'],
            assessments: ['leadership_360', 'project_review'],
            success_criteria: [
              'Completar projeto com sucesso',
              'Feedback 360° positivo',
              'Demonstrar competências de liderança'
            ]
          },
          {
            id: 'phase_3',
            name: 'Especialização Avançada',
            description: 'Aprofundamento em áreas específicas',
            duration: 15,
            order: 3,
            objectives: [
              'Dominar funcionalidades avançadas',
              'Otimizar processos pessoais',
              'Compartilhar conhecimento'
            ],
            activities: [
              'Certificação avançada',
              'Apresentação para equipe',
              'Documentação de melhores práticas'
            ],
            skills: ['system_admin', 'process_optimization', 'knowledge_sharing'],
            resources: ['advanced_certification', 'presentation_toolkit'],
            assessments: ['certification_exam', 'peer_evaluation'],
            success_criteria: [
              'Obter certificação avançada',
              'Apresentação bem avaliada',
              'Implementar melhoria de processo'
            ]
          }
        ],
        resources: [],
        milestones: [
          {
            id: 'milestone_1',
            title: 'Analista de Dados Competente',
            description: 'Capacidade de criar e interpretar relatórios complexos',
            targetDate: '2025-02-15T00:00:00Z',
            skills: ['data_analysis', 'reporting'],
            criteria: [
              'Pontuação > 80% em avaliação',
              'Criar relatório mensal independente',
              'Apresentar insights para equipe'
            ],
            reward: 'Certificação em Análise de Dados',
            status: 'pending'
          },
          {
            id: 'milestone_2',
            title: 'Líder Emergente',
            description: 'Demonstrar competências básicas de liderança',
            targetDate: '2025-03-15T00:00:00Z',
            skills: ['leadership', 'communication'],
            criteria: [
              'Liderar projeto com sucesso',
              'Feedback 360° positivo',
              'Mentorar novo colaborador'
            ],
            reward: 'Participação em programa de liderança',
            status: 'pending'
          }
        ],
        tracking: {
          frequency: 'bi_weekly',
          methods: ['self_assessment', 'manager_review', 'peer_feedback'],
          kpis: ['skill_progress', 'project_completion', 'feedback_scores']
        }
      }
    }
  ])

  const [skillGaps] = useState<SkillGap[]>([
    {
      skill: 'Análise de Dados',
      current: 65,
      required: 85,
      gap: 20,
      priority: 'high',
      timeToClose: 45,
      effort: 'medium',
      impact: 'high'
    },
    {
      skill: 'Liderança',
      current: 63,
      required: 80,
      gap: 17,
      priority: 'medium',
      timeToClose: 60,
      effort: 'high',
      impact: 'medium'
    },
    {
      skill: 'Administração do Sistema',
      current: 45,
      required: 70,
      gap: 25,
      priority: 'low',
      timeToClose: 90,
      effort: 'high',
      impact: 'low'
    }
  ])

  // Dados para gráficos
  const skillRadarData = [
    { skill: 'Navegação Sistema', current: 85, required: 80 },
    { skill: 'Análise Dados', current: 65, required: 85 },
    { skill: 'Conhecimento Setor', current: 88, required: 80 },
    { skill: 'Comunicação', current: 92, required: 85 },
    { skill: 'Atend. Cliente', current: 85, required: 90 },
    { skill: 'Liderança', current: 63, required: 80 }
  ]

  const skillProgressData = [
    { month: 'Nov', technical: 65, business: 78, softSkills: 75 },
    { month: 'Dez', technical: 70, business: 80, softSkills: 78 },
    { month: 'Jan', technical: 72, business: 82, softSkills: 80 }
  ]

  const assessmentHistoryData = [
    { date: '2024-11-15', overall: 68, categories: 3 },
    { date: '2024-12-15', overall: 74, categories: 3 },
    { date: '2025-01-15', overall: 78, categories: 3 }
  ]

  const skillDistributionData = [
    { name: 'Proficiente', value: 45, color: '#10b981' },
    { name: 'Em Desenvolvimento', value: 35, color: '#f59e0b' },
    { name: 'Iniciante', value: 20, color: '#ef4444' }
  ]

  // Funções auxiliares
  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    
    if (hours > 0) {
      return `${hours}h ${remainingMinutes}m`
    } else {
      return `${remainingMinutes}m`
    }
  }

  const getSkillLevelColor = (level: string) => {
    switch (level) {
      case 'expert': return 'bg-purple-100 text-purple-800'
      case 'advanced': return 'bg-blue-100 text-blue-800'
      case 'intermediate': return 'bg-yellow-100 text-yellow-800'
      case 'beginner': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getImportanceColor = (importance: string) => {
    switch (importance) {
      case 'critical': return 'bg-red-100 text-red-800'
      case 'high': return 'bg-orange-100 text-orange-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': case 'high': return 'bg-red-100 text-red-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800'
      case 'in_progress': return 'bg-blue-100 text-blue-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'overdue': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getInsightTypeIcon = (type: string) => {
    switch (type) {
      case 'strength': return <TrendingUp className="h-4 w-4 text-green-600" />
      case 'weakness': return <TrendingDown className="h-4 w-4 text-red-600" />
      case 'opportunity': return <Lightbulb className="h-4 w-4 text-yellow-600" />
      case 'recommendation': return <Target className="h-4 w-4 text-blue-600" />
      case 'pattern': return <Activity className="h-4 w-4 text-purple-600" />
      default: return <Info className="h-4 w-4 text-gray-600" />
    }
  }

  const getCurrentAssessmentResult = () => {
    return assessmentResults[0] // For demo, return the first result
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Avaliação de Habilidades</h1>
          <p className="text-gray-600">Sistema inteligente de avaliação e desenvolvimento de competências</p>
        </div>
        <div className="flex space-x-2">
          <Button>
            <Play className="w-4 h-4 mr-2" />
            Nova Avaliação
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
          <TabsTrigger value="assessment">Avaliação</TabsTrigger>
          <TabsTrigger value="results">Resultados</TabsTrigger>
          <TabsTrigger value="gaps">Lacunas</TabsTrigger>
          <TabsTrigger value="improvement">Melhoria</TabsTrigger>
          <TabsTrigger value="progress">Progresso</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Skills Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {skillCategories.map((category) => (
              <Card key={category.id} className="border hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-lg bg-blue-50">
                      <Code className="h-6 w-6 text-blue-600" />
                    </div>
                    <Badge variant="secondary">
                      {category.skills.length} skills
                    </Badge>
                  </div>
                  
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{category.name}</h3>
                  <p className="text-gray-600 text-sm mb-4">{category.description}</p>
                  
                  <div className="space-y-2">
                    {category.skills.slice(0, 3).map((skill) => (
                      <div key={skill.id} className="flex items-center justify-between text-sm">
                        <span className="text-gray-700">{skill.name}</span>
                        <Badge className={getSkillLevelColor(skill.level)} size="sm">
                          {skill.level}
                        </Badge>
                      </div>
                    ))}
                    {category.skills.length > 3 && (
                      <div className="text-xs text-blue-600 font-medium">
                        +{category.skills.length - 3} mais skills
                      </div>
                    )}
                  </div>
                  
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    className="w-full mt-4"
                    onClick={() => setSelectedCategory(category.id)}
                  >
                    Avaliar Categoria
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Latest Assessment Result */}
          {assessmentResults.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="w-5 h-5" />
                  <span>Última Avaliação</span>
                </CardTitle>
                <CardDescription>
                  Resultados da sua avaliação mais recente
                </CardDescription>
              </CardHeader>
              <CardContent>
                {(() => {
                  const result = getCurrentAssessmentResult()
                  return (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-3xl font-bold text-blue-600">{result.overall.score}%</div>
                          <div className="text-sm text-gray-600">Pontuação Geral</div>
                        </div>
                        <div className="text-right">
                          <Badge className={getSkillLevelColor(result.overall.level)}>
                            {result.overall.level}
                          </Badge>
                          <div className="text-sm text-gray-600 mt-1">
                            {formatDateTime(result.completedAt!)}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {Object.entries(result.categories).map(([categoryId, categoryResult]) => {
                          const category = skillCategories.find(c => c.id === categoryId)
                          return (
                            <div key={categoryId} className="p-4 border rounded-lg">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="font-semibold">{category?.name}</h4>
                                <span className="text-lg font-bold">{categoryResult.score}%</span>
                              </div>
                              <Progress value={categoryResult.score} className="h-2 mb-2" />
                              <Badge className={getSkillLevelColor(categoryResult.level)} size="sm">
                                {categoryResult.level}
                              </Badge>
                            </div>
                          )
                        })}
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-semibold text-green-900 mb-3 flex items-center">
                            <TrendingUp className="w-4 h-4 mr-2" />
                            Pontos Fortes
                          </h4>
                          <ul className="space-y-2">
                            {result.overall.strengths.map((strength, index) => (
                              <li key={index} className="flex items-start space-x-2">
                                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                                <span className="text-sm text-gray-700">{strength}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        <div>
                          <h4 className="font-semibold text-orange-900 mb-3 flex items-center">
                            <Target className="w-4 h-4 mr-2" />
                            Áreas de Melhoria
                          </h4>
                          <ul className="space-y-2">
                            {result.overall.weaknesses.map((weakness, index) => (
                              <li key={index} className="flex items-start space-x-2">
                                <AlertTriangle className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                                <span className="text-sm text-gray-700">{weakness}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      <div className="flex justify-center space-x-4">
                        <Button variant="secondary">
                          <Eye className="w-4 h-4 mr-2" />
                          Ver Detalhes
                        </Button>
                        <Button>
                          <RotateCcw className="w-4 h-4 mr-2" />
                          Reavaliar
                        </Button>
                      </div>
                    </div>
                  )
                })()}
              </CardContent>
            </Card>
          )}

          {/* Skill Radar Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Radar de Habilidades</CardTitle>
              <CardDescription>Comparação entre seu nível atual e o nível requerido</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={skillRadarData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="skill" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Bar dataKey="current" fill="#3b82f6" name="Nível Atual" />
                  <Bar dataKey="required" fill="#10b981" name="Nível Requerido" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assessment" className="space-y-6">
          {/* Assessment Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Iniciar Nova Avaliação</CardTitle>
              <CardDescription>Escolha o tipo de avaliação que deseja realizar</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card className="border-2 border-dashed border-gray-300 hover:border-blue-400 cursor-pointer transition-colors">
                  <CardContent className="p-6 text-center">
                    <Target className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                    <h3 className="font-semibold mb-2">Avaliação Completa</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Avaliação abrangente de todas as habilidades
                    </p>
                    <div className="text-xs text-gray-500 space-y-1">
                      <div>⏱️ 45-60 minutos</div>
                      <div>📊 Todas as categorias</div>
                      <div>🎯 Plano de melhoria incluído</div>
                    </div>
                    <Button className="w-full mt-4">
                      <Play className="w-4 h-4 mr-2" />
                      Iniciar
                    </Button>
                  </CardContent>
                </Card>

                <Card className="border-2 border-dashed border-gray-300 hover:border-green-400 cursor-pointer transition-colors">
                  <CardContent className="p-6 text-center">
                    <Code className="w-12 h-12 text-green-600 mx-auto mb-4" />
                    <h3 className="font-semibold mb-2">Habilidades Técnicas</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Foco em competências técnicas do sistema
                    </p>
                    <div className="text-xs text-gray-500 space-y-1">
                      <div>⏱️ 20-30 minutos</div>
                      <div>💻 Testes práticos</div>
                      <div>🔧 Simulações incluídas</div>
                    </div>
                    <Button className="w-full mt-4" variant="secondary">
                      <Play className="w-4 h-4 mr-2" />
                      Iniciar
                    </Button>
                  </CardContent>
                </Card>

                <Card className="border-2 border-dashed border-gray-300 hover:border-purple-400 cursor-pointer transition-colors">
                  <CardContent className="p-6 text-center">
                    <Users className="w-12 h-12 text-purple-600 mx-auto mb-4" />
                    <h3 className="font-semibold mb-2">Soft Skills</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Avaliação de habilidades interpessoais
                    </p>
                    <div className="text-xs text-gray-500 space-y-1">
                      <div>⏱️ 15-25 minutos</div>
                      <div>🗣️ Cenários práticos</div>
                      <div>👥 Autoavaliação + 360°</div>
                    </div>
                    <Button className="w-full mt-4" variant="secondary">
                      <Play className="w-4 h-4 mr-2" />
                      Iniciar
                    </Button>
                  </CardContent>
                </Card>

                <Card className="border-2 border-dashed border-gray-300 hover:border-orange-400 cursor-pointer transition-colors">
                  <CardContent className="p-6 text-center">
                    <Briefcase className="w-12 h-12 text-orange-600 mx-auto mb-4" />
                    <h3 className="font-semibold mb-2">Conhecimento de Negócio</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Processos e conhecimento do setor
                    </p>
                    <div className="text-xs text-gray-500 space-y-1">
                      <div>⏱️ 25-35 minutos</div>
                      <div>🏢 Cenários reais</div>
                      <div>📈 Casos de estudo</div>
                    </div>
                    <Button className="w-full mt-4" variant="secondary">
                      <Play className="w-4 h-4 mr-2" />
                      Iniciar
                    </Button>
                  </CardContent>
                </Card>

                <Card className="border-2 border-dashed border-gray-300 hover:border-yellow-400 cursor-pointer transition-colors">
                  <CardContent className="p-6 text-center">
                    <Zap className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
                    <h3 className="font-semibold mb-2">Avaliação Rápida</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Check-up rápido das principais skills
                    </p>
                    <div className="text-xs text-gray-500 space-y-1">
                      <div>⏱️ 10-15 minutos</div>
                      <div>⚡ Perguntas essenciais</div>
                      <div>📊 Resultado imediato</div>
                    </div>
                    <Button className="w-full mt-4" variant="secondary">
                      <Play className="w-4 h-4 mr-2" />
                      Iniciar
                    </Button>
                  </CardContent>
                </Card>

                <Card className="border-2 border-dashed border-gray-300 hover:border-indigo-400 cursor-pointer transition-colors">
                  <CardContent className="p-6 text-center">
                    <Brain className="w-12 h-12 text-indigo-600 mx-auto mb-4" />
                    <h3 className="font-semibold mb-2">Avaliação Personalizada</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Baseada no seu perfil e objetivos
                    </p>
                    <div className="text-xs text-gray-500 space-y-1">
                      <div>⏱️ Tempo variável</div>
                      <div>🤖 Adaptativa com IA</div>
                      <div>🎯 Focada em suas metas</div>
                    </div>
                    <Button className="w-full mt-4" variant="secondary">
                      <Brain className="w-4 h-4 mr-2" />
                      Configurar
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>

          {/* Assessment Tips */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Lightbulb className="w-5 h-5 text-yellow-600" />
                <span>Dicas para uma Boa Avaliação</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900">Antes de Começar:</h4>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Reserve tempo suficiente sem interrupções</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Use um ambiente silencioso e confortável</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Tenha acesso ao sistema para testes práticos</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Leia todas as instruções com atenção</span>
                    </li>
                  </ul>
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900">Durante a Avaliação:</h4>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-start space-x-2">
                      <Target className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span>Seja honesto em suas autoavaliações</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <Target className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span>Use exemplos reais quando solicitado</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <Target className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span>Não se preocupe com respostas "certas"</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <Target className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span>Faça pausas se necessário</span>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="results" className="space-y-6">
          {/* Detailed Results */}
          <Card>
            <CardHeader>
              <CardTitle>Resultados Detalhados</CardTitle>
              <CardDescription>Análise completa da sua última avaliação</CardDescription>
            </CardHeader>
            <CardContent>
              {(() => {
                const result = getCurrentAssessmentResult()
                return (
                  <div className="space-y-8">
                    {/* AI Insights */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4 flex items-center">
                        <Brain className="w-5 h-5 mr-2 text-purple-600" />
                        Insights da IA
                      </h3>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {result.aiInsights.map((insight) => (
                          <Card key={insight.id} className="border">
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center space-x-2">
                                  {getInsightTypeIcon(insight.type)}
                                  <h4 className="font-semibold">{insight.title}</h4>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Badge className={getPriorityColor(insight.priority)} size="sm">
                                    {insight.priority}
                                  </Badge>
                                  <Badge variant="secondary" size="sm">
                                    {insight.confidence}%
                                  </Badge>
                                </div>
                              </div>
                              
                              <p className="text-gray-600 text-sm mb-3">{insight.description}</p>
                              
                              <div className="space-y-2 text-xs">
                                <div>
                                  <span className="font-medium text-gray-700">Evidências:</span>
                                  <ul className="list-disc list-inside text-gray-600 ml-2">
                                    {insight.evidence.map((evidence, index) => (
                                      <li key={index}>{evidence}</li>
                                    ))}
                                  </ul>
                                </div>
                                
                                <div>
                                  <span className="font-medium text-gray-700">Impacto Estimado:</span>
                                  <span className="text-gray-600 ml-2">{insight.estimatedImpact}</span>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>

                    {/* Category Breakdown */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Detalhamento por Categoria</h3>
                      <div className="space-y-6">
                        {Object.entries(result.categories).map(([categoryId, categoryResult]) => {
                          const category = skillCategories.find(c => c.id === categoryId)
                          return (
                            <Card key={categoryId} className="border">
                              <CardContent className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                  <h4 className="text-lg font-semibold">{category?.name}</h4>
                                  <div className="flex items-center space-x-2">
                                    <span className="text-2xl font-bold">{categoryResult.score}%</span>
                                    <Badge className={getSkillLevelColor(categoryResult.level)}>
                                      {categoryResult.level}
                                    </Badge>
                                  </div>
                                </div>
                                
                                <Progress value={categoryResult.score} className="h-3 mb-4" />
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                  {Object.entries(categoryResult.skills).map(([skillId, skillResult]) => {
                                    const skill = category?.skills.find(s => s.id === skillId)
                                    return (
                                      <div key={skillId} className="p-3 bg-gray-50 rounded-lg">
                                        <div className="flex items-center justify-between mb-2">
                                          <h5 className="font-medium text-sm">{skill?.name}</h5>
                                          <span className="text-sm font-bold">{skillResult.score}%</span>
                                        </div>
                                        
                                        <Progress value={skillResult.score} className="h-2 mb-2" />
                                        
                                        <div className="flex items-center justify-between text-xs">
                                          <Badge className={getSkillLevelColor(skillResult.level)} size="sm">
                                            {skillResult.level}
                                          </Badge>
                                          <span className={`${skillResult.needsImprovement ? 'text-orange-600' : 'text-green-600'}`}>
                                            {skillResult.needsImprovement ? 'Melhorar' : 'Proficiente'}
                                          </span>
                                        </div>
                                        
                                        {skillResult.nextSteps.length > 0 && (
                                          <div className="mt-2">
                                            <span className="text-xs font-medium text-gray-700">Próximos passos:</span>
                                            <ul className="text-xs text-gray-600 mt-1">
                                              {skillResult.nextSteps.slice(0, 2).map((step, index) => (
                                                <li key={index} className="truncate">• {step}</li>
                                              ))}
                                            </ul>
                                          </div>
                                        )}
                                      </div>
                                    )
                                  })}
                                </div>
                              </CardContent>
                            </Card>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                )
              })()}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="gaps" className="space-y-6">
          {/* Skill Gaps Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingDown className="w-5 h-5 text-orange-600" />
                <span>Análise de Lacunas de Habilidades</span>
              </CardTitle>
              <CardDescription>
                Identificação das principais lacunas entre seu nível atual e o requerido
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {skillGaps.map((gap, index) => (
                  <Card key={index} className="border">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h4 className="font-semibold text-lg">{gap.skill}</h4>
                          <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                            <span>Atual: {gap.current}%</span>
                            <span>•</span>
                            <span>Requerido: {gap.required}%</span>
                            <span>•</span>
                            <span>Lacuna: {gap.gap} pontos</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={getPriorityColor(gap.priority)}>
                            {gap.priority}
                          </Badge>
                          <Badge variant="secondary">
                            {gap.timeToClose} dias
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Progresso para o objetivo</span>
                            <span>{Math.round((gap.current / gap.required) * 100)}%</span>
                          </div>
                          <Progress value={(gap.current / gap.required) * 100} className="h-2" />
                        </div>
                        
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div className="text-center p-2 bg-gray-50 rounded">
                            <div className="font-medium">Esforço</div>
                            <Badge className={gap.effort === 'high' ? 'bg-red-100 text-red-800' : 
                                            gap.effort === 'medium' ? 'bg-yellow-100 text-yellow-800' : 
                                            'bg-green-100 text-green-800'} size="sm">
                              {gap.effort}
                            </Badge>
                          </div>
                          <div className="text-center p-2 bg-gray-50 rounded">
                            <div className="font-medium">Impacto</div>
                            <Badge className={gap.impact === 'high' ? 'bg-green-100 text-green-800' : 
                                            gap.impact === 'medium' ? 'bg-yellow-100 text-yellow-800' : 
                                            'bg-red-100 text-red-800'} size="sm">
                              {gap.impact}
                            </Badge>
                          </div>
                          <div className="text-center p-2 bg-gray-50 rounded">
                            <div className="font-medium">Tempo</div>
                            <div className="text-xs text-gray-600">{gap.timeToClose}d</div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex justify-end space-x-2 mt-4">
                        <Button size="sm" variant="secondary">
                          <Eye className="w-3 h-3 mr-1" />
                          Ver Plano
                        </Button>
                        <Button size="sm">
                          <Rocket className="w-3 h-3 mr-1" />
                          Começar
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Gap Visualization */}
          <Card>
            <CardHeader>
              <CardTitle>Visualização de Lacunas</CardTitle>
              <CardDescription>Comparação visual entre nível atual e requerido</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={skillGaps.map(gap => ({
                  skill: gap.skill,
                  current: gap.current,
                  required: gap.required,
                  gap: gap.gap
                }))}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="skill" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Bar dataKey="current" fill="#3b82f6" name="Nível Atual" />
                  <Bar dataKey="required" fill="#10b981" name="Nível Requerido" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="improvement" className="space-y-6">
          {/* Improvement Plan */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Rocket className="w-5 h-5 text-blue-600" />
                <span>Plano de Melhoria Personalizado</span>
              </CardTitle>
              <CardDescription>
                Plano gerado pela IA baseado nos resultados da sua avaliação
              </CardDescription>
            </CardHeader>
            <CardContent>
              {(() => {
                const result = getCurrentAssessmentResult()
                const plan = result.improvementPlan
                
                return (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 bg-blue-50 rounded-lg text-center">
                        <Calendar className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                        <div className="text-2xl font-bold text-blue-600">{plan.duration}</div>
                        <div className="text-sm text-gray-600">Dias de programa</div>
                      </div>
                      <div className="p-4 bg-green-50 rounded-lg text-center">
                        <Target className="w-8 h-8 text-green-600 mx-auto mb-2" />
                        <div className="text-2xl font-bold text-green-600">{plan.phases.length}</div>
                        <div className="text-sm text-gray-600">Fases de desenvolvimento</div>
                      </div>
                      <div className="p-4 bg-purple-50 rounded-lg text-center">
                        <Award className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                        <div className="text-2xl font-bold text-purple-600">{plan.milestones.length}</div>
                        <div className="text-sm text-gray-600">Marcos importantes</div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Fases do Plano:</h4>
                      <div className="space-y-4">
                        {plan.phases.map((phase, index) => (
                          <Card key={phase.id} className="border">
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between mb-3">
                                <div>
                                  <h5 className="font-semibold text-lg">
                                    Fase {index + 1}: {phase.name}
                                  </h5>
                                  <p className="text-gray-600 text-sm">{phase.description}</p>
                                </div>
                                <Badge variant="secondary">
                                  {phase.duration} dias
                                </Badge>
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <span className="text-sm font-medium text-gray-700">Objetivos:</span>
                                  <ul className="list-disc list-inside text-sm text-gray-600 ml-2">
                                    {phase.objectives.map((objective, idx) => (
                                      <li key={idx}>{objective}</li>
                                    ))}
                                  </ul>
                                </div>
                                
                                <div>
                                  <span className="text-sm font-medium text-gray-700">Principais Atividades:</span>
                                  <ul className="list-disc list-inside text-sm text-gray-600 ml-2">
                                    {phase.activities.slice(0, 3).map((activity, idx) => (
                                      <li key={idx}>{activity}</li>
                                    ))}
                                  </ul>
                                </div>
                              </div>
                              
                              <div className="mt-3">
                                <span className="text-sm font-medium text-gray-700">Skills Foco:</span>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {phase.skills.map((skill, idx) => (
                                    <Badge key={idx} variant="secondary" className="text-xs">
                                      {skill}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Marcos e Recompensas:</h4>
                      <div className="space-y-3">
                        {plan.milestones.map((milestone) => (
                          <div key={milestone.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div>
                              <h5 className="font-medium">{milestone.title}</h5>
                              <p className="text-sm text-gray-600">{milestone.description}</p>
                              <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                                <span>Meta: {formatDateTime(milestone.targetDate)}</span>
                                <span>•</span>
                                <span>Recompensa: {milestone.reward}</span>
                              </div>
                            </div>
                            <Badge className={getStatusColor(milestone.status)}>
                              {milestone.status}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-center space-x-4">
                      <Button variant="secondary">
                        <Download className="w-4 h-4 mr-2" />
                        Baixar Plano
                      </Button>
                      <Button>
                        <Play className="w-4 h-4 mr-2" />
                        Iniciar Plano
                      </Button>
                    </div>
                  </div>
                )
              })()}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="progress" className="space-y-6">
          {/* Progress Tracking */}
          <Card>
            <CardHeader>
              <CardTitle>Evolução das Habilidades</CardTitle>
              <CardDescription>Acompanhe seu progresso ao longo do tempo</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={skillProgressData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Line type="monotone" dataKey="technical" stroke="#3b82f6" strokeWidth={2} name="Técnicas" />
                  <Line type="monotone" dataKey="business" stroke="#10b981" strokeWidth={2} name="Negócio" />
                  <Line type="monotone" dataKey="softSkills" stroke="#8b5cf6" strokeWidth={2} name="Interpessoais" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Assessment History */}
            <Card>
              <CardHeader>
                <CardTitle>Histórico de Avaliações</CardTitle>
                <CardDescription>Progresso geral ao longo das avaliações</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={assessmentHistoryData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="overall" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} name="Pontuação Geral" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Skill Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Distribuição de Proficiência</CardTitle>
                <CardDescription>Como suas habilidades estão distribuídas</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <RechartsPieChart>
                    <Pie
                      data={skillDistributionData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}%`}
                    >
                      {skillDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default SkillsAssessment
