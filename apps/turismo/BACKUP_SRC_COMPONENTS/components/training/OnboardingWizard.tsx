'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Badge } from '@/components/ui/Badge'
import { Textarea } from '@/components/ui/Textarea'
import { Progress } from '@/components/ui/Progress'
import { 
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  Clock,
  User,
  Target,
  Brain,
  Star,
  Play,
  BookOpen,
  Award,
  Lightbulb,
  Users,
  TrendingUp,
  Rocket,
  Shield,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Building,
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
  Download,
  Upload,
  Eye,
  EyeOff,
  Settings,
  Info,
  Warning,
  AlertTriangle,
  CheckSquare,
  Square,
  ChevronDown,
  ChevronUp,
  Plus,
  Minus,
  Zap,
  Activity,
  BarChart3,
  PieChart,
  LineChart
} from 'lucide-react'

// Tipos para Onboarding Wizard
interface OnboardingStep {
  id: string
  title: string
  description: string
  type: 'welcome' | 'profile' | 'assessment' | 'preferences' | 'goals' | 'plan' | 'resources' | 'completion'
  required: boolean
  estimatedTime: number // minutes
  components: OnboardingComponent[]
  validationRules?: ValidationRule[]
  skipAllowed: boolean
  nextStepLogic?: string // AI-driven next step selection
}

interface OnboardingComponent {
  id: string
  type: 'text' | 'select' | 'multiselect' | 'rating' | 'quiz' | 'upload' | 'video' | 'interactive'
  label: string
  description?: string
  placeholder?: string
  options?: { value: string; label: string; description?: string }[]
  required: boolean
  validation?: ValidationRule
  aiPowered?: boolean
  aiContext?: string
}

interface ValidationRule {
  type: 'required' | 'minLength' | 'maxLength' | 'email' | 'phone' | 'custom'
  value?: any
  message: string
}

interface OnboardingProfile {
  personal: {
    fullName: string
    email: string
    phone: string
    department: string
    role: string
    manager: string
    startDate: string
    location: string
    timezone: string
  }
  professional: {
    experience: string
    previousRoles: string[]
    skills: string[]
    certifications: string[]
    education: string
    languages: string[]
  }
  preferences: {
    learningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'reading'
    devicePreference: 'desktop' | 'mobile' | 'tablet' | 'mixed'
    schedulePreference: 'morning' | 'afternoon' | 'evening' | 'flexible'
    contentFormat: string[]
    notifications: boolean
    reminderFrequency: 'daily' | 'weekly' | 'bi_weekly'
  }
  goals: {
    shortTerm: string[]
    longTerm: string[]
    skillsToImprove: string[]
    careerObjectives: string[]
    learningPriorities: string[]
  }
  assessment: {
    technicalSkills: Record<string, number>
    softSkills: Record<string, number>
    productKnowledge: Record<string, number>
    overallScore: number
    strengths: string[]
    improvementAreas: string[]
  }
}

interface OnboardingPlan {
  id: string
  userId: string
  profile: OnboardingProfile
  generatedAt: string
  duration: number // days
  phases: OnboardingPhase[]
  milestones: Milestone[]
  assignments: Assignment[]
  checkpoints: Checkpoint[]
  aiRecommendations: AIRecommendation[]
  progress: {
    overall: number
    currentPhase: string
    completedMilestones: string[]
    upcomingDeadlines: string[]
  }
  customizations: {
    pace: 'accelerated' | 'standard' | 'extended'
    focus: string[]
    adaptations: string[]
  }
}

interface OnboardingPhase {
  id: string
  name: string
  description: string
  duration: number // days
  order: number
  objectives: string[]
  activities: string[]
  resources: string[]
  assessments: string[]
  prerequisites: string[]
  deliverables: string[]
}

interface Milestone {
  id: string
  title: string
  description: string
  dueDate: string
  priority: 'high' | 'medium' | 'low'
  category: 'learning' | 'assessment' | 'project' | 'social'
  requirements: string[]
  status: 'pending' | 'in_progress' | 'completed' | 'overdue'
  rewards: string[]
}

interface Assignment {
  id: string
  title: string
  description: string
  type: 'reading' | 'video' | 'practice' | 'project' | 'assessment'
  estimatedTime: number // minutes
  dueDate: string
  priority: 'high' | 'medium' | 'low'
  resources: string[]
  rubric: string[]
  submissionFormat: string
  status: 'assigned' | 'in_progress' | 'submitted' | 'reviewed' | 'completed'
}

interface Checkpoint {
  id: string
  name: string
  scheduledDate: string
  type: 'manager_meeting' | 'peer_feedback' | 'self_assessment' | 'mentor_check'
  agenda: string[]
  participants: string[]
  objectives: string[]
  status: 'scheduled' | 'completed' | 'rescheduled' | 'cancelled'
}

interface AIRecommendation {
  id: string
  type: 'learning_path' | 'skill_focus' | 'pace_adjustment' | 'resource' | 'connection'
  title: string
  description: string
  reasoning: string
  confidence: number // percentage
  priority: 'high' | 'medium' | 'low'
  category: string
  actionable: boolean
  estimatedImpact: string
}

const OnboardingWizard: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0)
  const [profile, setProfile] = useState<Partial<OnboardingProfile>>({})
  const [answers, setAnswers] = useState<Record<string, any>>({})
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false)
  const [generatedPlan, setGeneratedPlan] = useState<OnboardingPlan | null>(null)

  // Dados mock para demonstração
  const [onboardingSteps] = useState<OnboardingStep[]>([
    {
      id: 'welcome',
      title: 'Bem-vindo ao Sistema RSV!',
      description: 'Vamos criar um plano de onboarding personalizado para você',
      type: 'welcome',
      required: true,
      estimatedTime: 2,
      skipAllowed: false,
      components: [
        {
          id: 'welcome_message',
          type: 'interactive',
          label: 'Mensagem de Boas-vindas',
          description: 'Introdução ao processo de onboarding',
          required: false
        }
      ]
    },
    {
      id: 'profile',
      title: 'Perfil Pessoal e Profissional',
      description: 'Conte-nos mais sobre você para personalizarmos sua experiência',
      type: 'profile',
      required: true,
      estimatedTime: 8,
      skipAllowed: false,
      components: [
        {
          id: 'fullName',
          type: 'text',
          label: 'Nome Completo',
          placeholder: 'Digite seu nome completo',
          required: true,
          validation: {
            type: 'required',
            message: 'Nome é obrigatório'
          }
        },
        {
          id: 'email',
          type: 'text',
          label: 'E-mail Corporativo',
          placeholder: 'seu.email@empresa.com',
          required: true,
          validation: {
            type: 'email',
            message: 'E-mail inválido'
          }
        },
        {
          id: 'department',
          type: 'select',
          label: 'Departamento',
          required: true,
          options: [
            { value: 'sales', label: 'Vendas' },
            { value: 'marketing', label: 'Marketing' },
            { value: 'operations', label: 'Operações' },
            { value: 'finance', label: 'Financeiro' },
            { value: 'hr', label: 'Recursos Humanos' },
            { value: 'it', label: 'Tecnologia' },
            { value: 'customer_service', label: 'Atendimento ao Cliente' }
          ]
        },
        {
          id: 'role',
          type: 'text',
          label: 'Cargo/Função',
          placeholder: 'Ex: Analista de Vendas',
          required: true
        },
        {
          id: 'experience',
          type: 'select',
          label: 'Nível de Experiência',
          required: true,
          options: [
            { value: 'entry', label: 'Iniciante (0-2 anos)' },
            { value: 'junior', label: 'Júnior (2-5 anos)' },
            { value: 'mid', label: 'Pleno (5-8 anos)' },
            { value: 'senior', label: 'Sênior (8+ anos)' },
            { value: 'lead', label: 'Liderança' }
          ]
        },
        {
          id: 'skills',
          type: 'multiselect',
          label: 'Habilidades Atuais',
          description: 'Selecione suas principais habilidades',
          required: false,
          options: [
            { value: 'communication', label: 'Comunicação' },
            { value: 'leadership', label: 'Liderança' },
            { value: 'analytics', label: 'Análise de Dados' },
            { value: 'project_management', label: 'Gestão de Projetos' },
            { value: 'customer_service', label: 'Atendimento ao Cliente' },
            { value: 'sales', label: 'Vendas' },
            { value: 'marketing', label: 'Marketing' },
            { value: 'technical', label: 'Técnicas' }
          ]
        }
      ]
    },
    {
      id: 'assessment',
      title: 'Avaliação de Conhecimento',
      description: 'Vamos avaliar seu nível atual para personalizar o treinamento',
      type: 'assessment',
      required: true,
      estimatedTime: 15,
      skipAllowed: true,
      components: [
        {
          id: 'system_knowledge',
          type: 'quiz',
          label: 'Conhecimento do Sistema RSV',
          description: 'Responda algumas perguntas sobre sistemas de gestão',
          required: false,
          aiPowered: true,
          aiContext: 'adaptive_assessment'
        },
        {
          id: 'industry_knowledge',
          type: 'rating',
          label: 'Conhecimento do Setor de Turismo',
          description: 'Avalie seu conhecimento de 1 a 5',
          required: false
        },
        {
          id: 'software_comfort',
          type: 'rating',
          label: 'Conforto com Software',
          description: 'Quão confortável você se sente usando novos softwares?',
          required: false
        }
      ]
    },
    {
      id: 'preferences',
      title: 'Preferências de Aprendizado',
      description: 'Como você prefere aprender? Vamos personalizar sua experiência',
      type: 'preferences',
      required: true,
      estimatedTime: 5,
      skipAllowed: false,
      components: [
        {
          id: 'learning_style',
          type: 'select',
          label: 'Estilo de Aprendizado',
          required: true,
          options: [
            { value: 'visual', label: 'Visual (diagramas, vídeos)', description: 'Aprendo melhor vendo' },
            { value: 'auditory', label: 'Auditivo (explicações, discussões)', description: 'Aprendo melhor ouvindo' },
            { value: 'kinesthetic', label: 'Prático (hands-on, experimentação)', description: 'Aprendo melhor fazendo' },
            { value: 'reading', label: 'Leitura (textos, documentos)', description: 'Aprendo melhor lendo' }
          ]
        },
        {
          id: 'device_preference',
          type: 'select',
          label: 'Dispositivo Preferido',
          required: true,
          options: [
            { value: 'desktop', label: 'Desktop/Computador' },
            { value: 'mobile', label: 'Celular' },
            { value: 'tablet', label: 'Tablet' },
            { value: 'mixed', label: 'Misto (vários dispositivos)' }
          ]
        },
        {
          id: 'schedule_preference',
          type: 'select',
          label: 'Horário Preferido para Estudar',
          required: true,
          options: [
            { value: 'morning', label: 'Manhã (8h-12h)' },
            { value: 'afternoon', label: 'Tarde (13h-17h)' },
            { value: 'evening', label: 'Noite (18h-22h)' },
            { value: 'flexible', label: 'Flexível' }
          ]
        },
        {
          id: 'content_format',
          type: 'multiselect',
          label: 'Formatos de Conteúdo Preferidos',
          required: false,
          options: [
            { value: 'video', label: 'Vídeos' },
            { value: 'text', label: 'Textos/Artigos' },
            { value: 'interactive', label: 'Conteúdo Interativo' },
            { value: 'quiz', label: 'Quizzes/Testes' },
            { value: 'simulation', label: 'Simulações' },
            { value: 'webinar', label: 'Webinars' }
          ]
        },
        {
          id: 'pace',
          type: 'select',
          label: 'Ritmo de Aprendizado',
          required: true,
          options: [
            { value: 'accelerated', label: 'Acelerado (concluir rapidamente)' },
            { value: 'standard', label: 'Padrão (ritmo normal)' },
            { value: 'extended', label: 'Estendido (mais tempo para absorver)' }
          ]
        }
      ]
    },
    {
      id: 'goals',
      title: 'Objetivos e Metas',
      description: 'Quais são seus objetivos com o treinamento?',
      type: 'goals',
      required: true,
      estimatedTime: 7,
      skipAllowed: false,
      components: [
        {
          id: 'short_term_goals',
          type: 'multiselect',
          label: 'Objetivos de Curto Prazo (30 dias)',
          required: true,
          options: [
            { value: 'system_basics', label: 'Dominar funcionalidades básicas do sistema' },
            { value: 'daily_tasks', label: 'Executar tarefas diárias com confiança' },
            { value: 'team_integration', label: 'Integrar-se com a equipe' },
            { value: 'process_understanding', label: 'Entender processos da empresa' },
            { value: 'customer_interaction', label: 'Interagir efetivamente com clientes' }
          ]
        },
        {
          id: 'long_term_goals',
          type: 'multiselect',
          label: 'Objetivos de Longo Prazo (90 dias)',
          required: true,
          options: [
            { value: 'advanced_features', label: 'Usar recursos avançados do sistema' },
            { value: 'process_optimization', label: 'Otimizar processos de trabalho' },
            { value: 'mentoring', label: 'Mentorar novos colaboradores' },
            { value: 'leadership', label: 'Desenvolver habilidades de liderança' },
            { value: 'specialization', label: 'Especializar-me em área específica' }
          ]
        },
        {
          id: 'skills_to_improve',
          type: 'multiselect',
          label: 'Habilidades que Gostaria de Melhorar',
          required: false,
          options: [
            { value: 'communication', label: 'Comunicação' },
            { value: 'time_management', label: 'Gestão de Tempo' },
            { value: 'problem_solving', label: 'Resolução de Problemas' },
            { value: 'data_analysis', label: 'Análise de Dados' },
            { value: 'customer_service', label: 'Atendimento ao Cliente' },
            { value: 'sales_skills', label: 'Habilidades de Vendas' },
            { value: 'technical_skills', label: 'Habilidades Técnicas' }
          ]
        },
        {
          id: 'success_metrics',
          type: 'text',
          label: 'Como você medirá seu sucesso?',
          placeholder: 'Ex: Processar 20 reservas por dia sem ajuda',
          required: false
        }
      ]
    },
    {
      id: 'plan',
      title: 'Seu Plano Personalizado',
      description: 'Baseado em suas respostas, criamos um plano único para você',
      type: 'plan',
      required: true,
      estimatedTime: 3,
      skipAllowed: false,
      components: [
        {
          id: 'plan_preview',
          type: 'interactive',
          label: 'Visualização do Plano',
          description: 'Revise e customize seu plano de onboarding',
          required: false,
          aiPowered: true,
          aiContext: 'plan_generation'
        }
      ]
    },
    {
      id: 'resources',
      title: 'Recursos e Suporte',
      description: 'Conheça os recursos disponíveis para seu sucesso',
      type: 'resources',
      required: false,
      estimatedTime: 5,
      skipAllowed: true,
      components: [
        {
          id: 'mentor_assignment',
          type: 'interactive',
          label: 'Atribuição de Mentor',
          description: 'Conheça seu mentor e como ele pode ajudá-lo',
          required: false
        },
        {
          id: 'support_channels',
          type: 'interactive',
          label: 'Canais de Suporte',
          description: 'Saiba onde buscar ajuda quando precisar',
          required: false
        }
      ]
    },
    {
      id: 'completion',
      title: 'Pronto para Começar!',
      description: 'Seu onboarding foi configurado com sucesso',
      type: 'completion',
      required: true,
      estimatedTime: 2,
      skipAllowed: false,
      components: [
        {
          id: 'completion_summary',
          type: 'interactive',
          label: 'Resumo do Onboarding',
          description: 'Próximos passos e cronograma',
          required: false
        }
      ]
    }
  ])

  const sampleGeneratedPlan: OnboardingPlan = {
    id: 'plan_001',
    userId: 'user_001',
    profile: {} as OnboardingProfile,
    generatedAt: '2025-01-16T00:00:00Z',
    duration: 90,
    phases: [
      {
        id: 'phase_1',
        name: 'Fundamentos',
        description: 'Conhecimento básico do sistema e processos',
        duration: 14,
        order: 1,
        objectives: [
          'Navegar pelo sistema com confiança',
          'Executar operações básicas',
          'Compreender fluxos de trabalho principais'
        ],
        activities: [
          'Curso: Fundamentos do Sistema RSV',
          'Simulação: Primeira reserva',
          'Projeto: Processar 5 reservas supervisionadas'
        ],
        resources: [
          'Manual do usuário',
          'Vídeos tutoriais',
          'FAQ interativo'
        ],
        assessments: [
          'Quiz: Navegação básica',
          'Avaliação prática: Operações básicas'
        ],
        prerequisites: [],
        deliverables: [
          'Certificação: RSV Básico',
          'Relatório: Primeiras impressões'
        ]
      },
      {
        id: 'phase_2',
        name: 'Desenvolvimento',
        description: 'Aprofundamento em funcionalidades específicas',
        duration: 45,
        order: 2,
        objectives: [
          'Dominar funcionalidades avançadas',
          'Otimizar processos de trabalho',
          'Desenvolver habilidades específicas da função'
        ],
        activities: [
          'Curso: Gestão Avançada de Reservas',
          'Workshop: Atendimento ao Cliente',
          'Mentoring: Sessões semanais'
        ],
        resources: [
          'Guias avançados',
          'Casos de estudo',
          'Comunidade de prática'
        ],
        assessments: [
          'Projeto: Otimização de processo',
          'Peer review: Habilidades interpessoais'
        ],
        prerequisites: ['phase_1'],
        deliverables: [
          'Plano de otimização implementado',
          'Apresentação de melhores práticas'
        ]
      },
      {
        id: 'phase_3',
        name: 'Especialização',
        description: 'Foco em excelência e liderança',
        duration: 31,
        order: 3,
        objectives: [
          'Tornar-se referência na função',
          'Mentorar novos colaboradores',
          'Contribuir para melhorias do sistema'
        ],
        activities: [
          'Projeto de melhoria',
          'Mentoring reverso',
          'Participação em comitês'
        ],
        resources: [
          'Acesso a dados avançados',
          'Conexão com especialistas',
          'Ferramentas de análise'
        ],
        assessments: [
          'Avaliação 360°',
          'Impacto do projeto de melhoria'
        ],
        prerequisites: ['phase_2'],
        deliverables: [
          'Projeto de melhoria implementado',
          'Documentação de boas práticas'
        ]
      }
    ],
    milestones: [
      {
        id: 'milestone_1',
        title: 'Primeira Semana Completa',
        description: 'Completar treinamento básico e processar primeiras reservas',
        dueDate: '2025-01-23T17:00:00Z',
        priority: 'high',
        category: 'learning',
        requirements: [
          'Completar curso básico',
          'Processar 5 reservas supervisionadas',
          'Reunião com mentor'
        ],
        status: 'pending',
        rewards: [
          'Badge: Primeiro Marco',
          'Acesso a recursos intermediários'
        ]
      },
      {
        id: 'milestone_2',
        title: 'Autonomia Operacional',
        description: 'Trabalhar de forma independente com confiança',
        dueDate: '2025-02-15T17:00:00Z',
        priority: 'high',
        category: 'assessment',
        requirements: [
          'Avalição prática aprovada',
          'Feedback positivo do supervisor',
          'Autoavaliação de confiança'
        ],
        status: 'pending',
        rewards: [
          'Certificação: Operador Independente',
          'Aumento de responsabilidades'
        ]
      }
    ],
    assignments: [
      {
        id: 'assignment_1',
        title: 'Módulo de Introdução',
        description: 'Complete o módulo introdutório do sistema RSV',
        type: 'video',
        estimatedTime: 45,
        dueDate: '2025-01-18T17:00:00Z',
        priority: 'high',
        resources: [
          'Vídeo: Visão geral do sistema',
          'Documento: Glossário de termos',
          'Quiz: Conceitos básicos'
        ],
        rubric: [
          'Assistir todo o vídeo',
          'Ler documentação',
          'Nota mínima 80% no quiz'
        ],
        submissionFormat: 'quiz_completion',
        status: 'assigned'
      }
    ],
    checkpoints: [
      {
        id: 'checkpoint_1',
        name: 'Check-in Semanal',
        scheduledDate: '2025-01-23T14:00:00Z',
        type: 'manager_meeting',
        agenda: [
          'Progresso na primeira semana',
          'Dificuldades encontradas',
          'Ajustes necessários no plano'
        ],
        participants: ['user_001', 'manager_001'],
        objectives: [
          'Avaliar adaptação',
          'Identificar necessidades de suporte',
          'Planejar próxima semana'
        ],
        status: 'scheduled'
      }
    ],
    aiRecommendations: [
      {
        id: 'rec_1',
        type: 'learning_path',
        title: 'Foco em Habilidades Práticas',
        description: 'Baseado no seu perfil, recomendamos priorizar exercícios práticos',
        reasoning: 'Seu estilo de aprendizado kinestético indica melhor absorção através da prática',
        confidence: 92,
        priority: 'high',
        category: 'Metodologia',
        actionable: true,
        estimatedImpact: 'Melhoria de 40% na retenção de conhecimento'
      },
      {
        id: 'rec_2',
        type: 'pace_adjustment',
        title: 'Ritmo Acelerado Recomendado',
        description: 'Sua experiência prévia sugere capacidade para ritmo mais rápido',
        reasoning: 'Alto nível de experiência em software e facilidade com tecnologia',
        confidence: 85,
        priority: 'medium',
        category: 'Cronograma',
        actionable: true,
        estimatedImpact: 'Redução de 25% no tempo total de onboarding'
      }
    ],
    progress: {
      overall: 0,
      currentPhase: 'phase_1',
      completedMilestones: [],
      upcomingDeadlines: ['2025-01-18T17:00:00Z', '2025-01-23T17:00:00Z']
    },
    customizations: {
      pace: 'accelerated',
      focus: ['practical_skills', 'system_mastery'],
      adaptations: ['kinesthetic_learning', 'accelerated_timeline']
    }
  }

  // Funções auxiliares
  const getTotalSteps = () => onboardingSteps.length
  const getProgress = () => Math.round((currentStep / (getTotalSteps() - 1)) * 100)
  const getTotalEstimatedTime = () => onboardingSteps.reduce((sum, step) => sum + step.estimatedTime, 0)
  const getCompletedTime = () => onboardingSteps.slice(0, currentStep + 1).reduce((sum, step) => sum + step.estimatedTime, 0)

  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleInputChange = (componentId: string, value: any) => {
    setAnswers(prev => ({
      ...prev,
      [componentId]: value
    }))
  }

  const generatePersonalizedPlan = async () => {
    setIsGeneratingPlan(true)
    
    // Simular IA gerando plano personalizado
    setTimeout(() => {
      setGeneratedPlan(sampleGeneratedPlan)
      setIsGeneratingPlan(false)
    }, 3000)
  }

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

  const getStepIcon = (type: string) => {
    switch (type) {
      case 'welcome': return <Star className="h-5 w-5" />
      case 'profile': return <User className="h-5 w-5" />
      case 'assessment': return <Target className="h-5 w-5" />
      case 'preferences': return <Settings className="h-5 w-5" />
      case 'goals': return <TrendingUp className="h-5 w-5" />
      case 'plan': return <Rocket className="h-5 w-5" />
      case 'resources': return <BookOpen className="h-5 w-5" />
      case 'completion': return <Award className="h-5 w-5" />
      default: return <CheckCircle className="h-5 w-5" />
    }
  }

  const getStepColor = (stepIndex: number) => {
    if (stepIndex < currentStep) return 'text-green-600 bg-green-100'
    if (stepIndex === currentStep) return 'text-blue-600 bg-blue-100'
    return 'text-gray-400 bg-gray-100'
  }

  const renderComponent = (component: OnboardingComponent) => {
    const value = answers[component.id] || ''

    switch (component.type) {
      case 'text':
        return (
          <div key={component.id} className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {component.label}
              {component.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            {component.description && (
              <p className="text-sm text-gray-600">{component.description}</p>
            )}
            <Input
              placeholder={component.placeholder}
              value={value}
              onChange={(e) => handleInputChange(component.id, e.target.value)}
              required={component.required}
            />
          </div>
        )

      case 'select':
        return (
          <div key={component.id} className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {component.label}
              {component.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            {component.description && (
              <p className="text-sm text-gray-600">{component.description}</p>
            )}
            <Select
              title={component.label}
              options={component.options || []}
              value={value}
              onChange={(newValue) => handleInputChange(component.id, newValue)}
            />
          </div>
        )

      case 'multiselect':
        return (
          <div key={component.id} className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {component.label}
              {component.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            {component.description && (
              <p className="text-sm text-gray-600">{component.description}</p>
            )}
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {component.options?.map((option) => (
                <label key={option.value} className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={(value as string[])?.includes(option.value) || false}
                    onChange={(e) => {
                      const currentValues = (value as string[]) || []
                      const newValues = e.target.checked
                        ? [...currentValues, option.value]
                        : currentValues.filter(v => v !== option.value)
                      handleInputChange(component.id, newValues)
                    }}
                    className="mt-1"
                  />
                  <div>
                    <div className="font-medium">{option.label}</div>
                    {option.description && (
                      <div className="text-sm text-gray-600">{option.description}</div>
                    )}
                  </div>
                </label>
              ))}
            </div>
          </div>
        )

      case 'rating':
        return (
          <div key={component.id} className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {component.label}
              {component.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            {component.description && (
              <p className="text-sm text-gray-600">{component.description}</p>
            )}
            <div className="flex space-x-2">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  onClick={() => handleInputChange(component.id, rating)}
                  className={`w-10 h-10 rounded-full border-2 flex items-center justify-center font-medium transition-colors ${
                    value === rating
                      ? 'border-blue-600 bg-blue-600 text-white'
                      : 'border-gray-300 text-gray-600 hover:border-blue-300'
                  }`}
                >
                  {rating}
                </button>
              ))}
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>Muito baixo</span>
              <span>Muito alto</span>
            </div>
          </div>
        )

      case 'interactive':
        if (component.id === 'welcome_message') {
          return (
            <div key={component.id} className="text-center py-8">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Rocket className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Bem-vindo à Reservei Viagens! 🎉
              </h2>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Estamos muito felizes em tê-lo(a) em nossa equipe! Vamos criar um plano de onboarding 
                personalizado para garantir seu sucesso desde o primeiro dia.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8 text-sm">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <Brain className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <h4 className="font-semibold mb-1">Personalizado com IA</h4>
                  <p className="text-gray-600">Plano adaptado ao seu perfil</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <Target className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <h4 className="font-semibold mb-1">Orientado a Objetivos</h4>
                  <p className="text-gray-600">Foco no que você quer alcançar</p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <Users className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                  <h4 className="font-semibold mb-1">Suporte Completo</h4>
                  <p className="text-gray-600">Mentores e recursos à disposição</p>
                </div>
              </div>
            </div>
          )
        }

        if (component.id === 'plan_preview') {
          return (
            <div key={component.id} className="space-y-6">
              {isGeneratingPlan ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Gerando seu plano personalizado...
                  </h3>
                  <p className="text-gray-600">
                    Nossa IA está analisando suas respostas para criar o plano perfeito para você.
                  </p>
                </div>
              ) : generatedPlan ? (
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      Seu Plano Está Pronto! 🎯
                    </h3>
                    <p className="text-gray-600">
                      Baseado em suas respostas, criamos um plano personalizado de {generatedPlan.duration} dias.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="p-4 bg-blue-50 rounded-lg text-center">
                      <Calendar className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-blue-600">{generatedPlan.duration}</div>
                      <div className="text-sm text-gray-600">Dias de programa</div>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg text-center">
                      <Target className="w-8 h-8 text-green-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-green-600">{generatedPlan.phases.length}</div>
                      <div className="text-sm text-gray-600">Fases de aprendizado</div>
                    </div>
                    <div className="p-4 bg-purple-50 rounded-lg text-center">
                      <Award className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-purple-600">{generatedPlan.milestones.length}</div>
                      <div className="text-sm text-gray-600">Marcos importantes</div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900">Fases do Seu Plano:</h4>
                    {generatedPlan.phases.map((phase, index) => (
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
                          
                          <div className="space-y-2">
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
                                {phase.activities.slice(0, 2).map((activity, idx) => (
                                  <li key={idx}>{activity}</li>
                                ))}
                                {phase.activities.length > 2 && (
                                  <li className="text-blue-600">+{phase.activities.length - 2} atividades</li>
                                )}
                              </ul>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900">Recomendações da IA:</h4>
                    {generatedPlan.aiRecommendations.map((rec) => (
                      <div key={rec.id} className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="flex items-start justify-between mb-2">
                          <h5 className="font-semibold text-yellow-900">{rec.title}</h5>
                          <Badge className="bg-yellow-100 text-yellow-800" size="sm">
                            {rec.confidence}% confiança
                          </Badge>
                        </div>
                        <p className="text-yellow-800 text-sm mb-2">{rec.description}</p>
                        <p className="text-yellow-700 text-xs">
                          <strong>Impacto esperado:</strong> {rec.estimatedImpact}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-center space-x-4 pt-6">
                    <Button variant="secondary">
                      <Edit className="w-4 h-4 mr-2" />
                      Personalizar Plano
                    </Button>
                    <Button>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Aprovar e Iniciar
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Button onClick={generatePersonalizedPlan} size="lg">
                    <Brain className="w-5 h-5 mr-2" />
                    Gerar Plano Personalizado
                  </Button>
                </div>
              )}
            </div>
          )
        }

        if (component.id === 'completion_summary') {
          return (
            <div key={component.id} className="text-center py-8">
              <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Tudo Configurado! 🚀
              </h2>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Seu plano de onboarding personalizado está pronto. Você receberá todas as informações 
                por e-mail e pode acessar seu progresso a qualquer momento.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 max-w-lg mx-auto">
                <div className="p-4 bg-green-50 rounded-lg">
                  <Calendar className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <h4 className="font-semibold mb-1">Próximo Passo</h4>
                  <p className="text-sm text-gray-600">Segunda-feira às 9h</p>
                  <p className="text-xs text-green-600 font-medium">Reunião com seu mentor</p>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg">
                  <BookOpen className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <h4 className="font-semibold mb-1">Primeiro Curso</h4>
                  <p className="text-sm text-gray-600">Fundamentos RSV</p>
                  <p className="text-xs text-blue-600 font-medium">Disponível agora</p>
                </div>
              </div>

              <div className="flex justify-center space-x-4">
                <Button variant="secondary">
                  <Download className="w-4 h-4 mr-2" />
                  Baixar Cronograma
                </Button>
                <Button>
                  <Play className="w-4 h-4 mr-2" />
                  Começar Agora
                </Button>
              </div>
            </div>
          )
        }

        return null

      default:
        return null
    }
  }

  const currentStepData = onboardingSteps[currentStep]

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header com Progress */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Onboarding Inteligente</h1>
        <p className="text-gray-600 mb-6">
          Vamos criar um plano personalizado para seu sucesso
        </p>
        
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Progresso</span>
            <span>{getProgress()}% completo</span>
          </div>
          <Progress value={getProgress()} className="h-3" />
          <div className="flex justify-between text-xs text-gray-500 mt-2">
            <span>Tempo gasto: {formatDuration(getCompletedTime())}</span>
            <span>Tempo total estimado: {formatDuration(getTotalEstimatedTime())}</span>
          </div>
        </div>
      </div>

      {/* Step Navigation */}
      <div className="flex justify-center mb-8">
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {onboardingSteps.map((step, index) => (
            <div
              key={step.id}
              className={`flex items-center space-x-2 px-3 py-2 rounded-full text-sm font-medium transition-colors ${getStepColor(index)}`}
            >
              <div className={`p-1 rounded-full ${getStepColor(index)}`}>
                {getStepIcon(step.type)}
              </div>
              <span className="hidden sm:inline">{step.title}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Current Step Content */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${getStepColor(currentStep)}`}>
                  {getStepIcon(currentStepData.type)}
                </div>
                <span>{currentStepData.title}</span>
              </CardTitle>
              <CardDescription>{currentStepData.description}</CardDescription>
            </div>
            <div className="text-right text-sm text-gray-600">
              <div>Passo {currentStep + 1} de {getTotalSteps()}</div>
              <div className="flex items-center space-x-1 mt-1">
                <Clock className="w-3 h-3" />
                <span>{formatDuration(currentStepData.estimatedTime)}</span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {currentStepData.components.map(component => renderComponent(component))}
          </div>
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <Button
          variant="secondary"
          onClick={handlePrevious}
          disabled={currentStep === 0}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Anterior
        </Button>

        <div className="flex space-x-2">
          {currentStepData.skipAllowed && currentStep < onboardingSteps.length - 1 && (
            <Button
              variant="secondary"
              onClick={() => setCurrentStep(currentStep + 1)}
            >
              Pular Etapa
            </Button>
          )}
          
          {currentStep < onboardingSteps.length - 1 ? (
            <Button onClick={handleNext}>
              Próximo
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button>
              <CheckCircle className="w-4 h-4 mr-2" />
              Finalizar
            </Button>
          )}
        </div>
      </div>

      {/* Help/Support */}
      <div className="text-center py-4 border-t">
        <p className="text-sm text-gray-600 mb-2">
          Precisa de ajuda? Nossa equipe está aqui para apoiá-lo.
        </p>
        <div className="flex justify-center space-x-4 text-sm">
          <Button variant="secondary" size="sm">
            <Mail className="w-3 h-3 mr-1" />
            Email Suporte
          </Button>
          <Button variant="secondary" size="sm">
            <Phone className="w-3 h-3 mr-1" />
            Chat ao Vivo
          </Button>
          <Button variant="secondary" size="sm">
            <BookOpen className="w-3 h-3 mr-1" />
            Central de Ajuda
          </Button>
        </div>
      </div>
    </div>
  )
}

export default OnboardingWizard
