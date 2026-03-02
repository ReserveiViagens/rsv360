'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authenticatedFetch } from '@/lib/auth-interceptor';
import { generatePlan, getPlanMode } from '@/lib/onboarding-plan-generator';
import { useToast } from '@/components/providers/toast-wrapper';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
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
} from 'lucide-react';

// Tipos para Onboarding Wizard
interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  type: 'welcome' | 'profile' | 'assessment' | 'preferences' | 'goals' | 'plan' | 'resources' | 'completion';
  required: boolean;
  estimatedTime: number; // minutes
  components: OnboardingComponent[];
  validationRules?: ValidationRule[];
  skipAllowed: boolean;
  nextStepLogic?: string; // AI-driven next step selection
}

interface OnboardingComponent {
  id: string;
  type: 'text' | 'input' | 'select' | 'textarea' | 'checkbox' | 'radio' | 'rating' | 'quiz' | 'interactive';
  label: string;
  description?: string;
  required: boolean;
  options?: string[];
  placeholder?: string;
  validation?: string;
  aiPowered?: boolean;
  aiContext?: string;
}

interface ValidationRule {
  field: string;
  type: 'required' | 'email' | 'minLength' | 'maxLength' | 'pattern';
  value?: any;
  message: string;
}

interface OnboardingProfile {
  name: string;
  email: string;
  role: string;
  department: string;
  experience: string;
  goals: string[];
  preferences: Record<string, any>;
  skills: string[];
  learningStyle: string;
  timeAvailability: number;
  devicePreference: string;
  language: string;
}

interface OnboardingPlan {
  id: string;
  title: string;
  description: string;
  steps: OnboardingStep[];
  estimatedDuration: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  prerequisites: string[];
  outcomes: string[];
  resources: OnboardingResource[];
  milestones: OnboardingMilestone[];
  aiRecommendations: AIRecommendation[];
}

interface OnboardingResource {
  id: string;
  title: string;
  type: 'video' | 'document' | 'interactive' | 'quiz' | 'simulation';
  url: string;
  duration: number;
  difficulty: string;
  description: string;
  tags: string[];
}

interface OnboardingMilestone {
  id: string;
  title: string;
  description: string;
  type: 'knowledge' | 'skill' | 'certification' | 'project';
  criteria: string[];
  reward: string;
  estimatedTime: number;
}

interface AIRecommendation {
  id: string;
  title: string;
  description: string;
  type: 'learning' | 'practice' | 'assessment' | 'resource';
  priority: 'high' | 'medium' | 'low';
  reasoning: string;
  category: string;
  actionable: boolean;
  estimatedImpact: string;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const OnboardingWizard: React.FC = () => {
  const router = useRouter();
  const toast = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [profile, setProfile] = useState<Partial<OnboardingProfile>>({});
  const [answers, setAnswers] = useState<Record<string, any>>({
    assessment: {},
    preferences: {},
    goals: {},
  });
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<OnboardingPlan | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

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
      description: 'Conte-nos sobre você para personalizar sua experiência',
      type: 'profile',
      required: true,
      estimatedTime: 5,
      skipAllowed: false,
      components: [
        {
          id: 'name',
          type: 'input',
          label: 'Nome Completo',
          placeholder: 'Digite seu nome completo',
          required: true
        },
        {
          id: 'email',
          type: 'input',
          label: 'Email',
          placeholder: 'seu@email.com',
          required: true,
          validation: 'email'
        },
        {
          id: 'role',
          type: 'select',
          label: 'Cargo/Função',
          required: true,
          options: ['Agente de Viagens', 'Gerente', 'Atendente', 'Supervisor', 'Diretor', 'Outro']
        },
        {
          id: 'department',
          type: 'select',
          label: 'Departamento',
          required: true,
          options: ['Vendas', 'Atendimento', 'Operações', 'Marketing', 'Financeiro', 'RH', 'TI']
        },
        {
          id: 'experience',
          type: 'select',
          label: 'Experiência no Setor',
          required: true,
          options: ['Iniciante (0-1 anos)', 'Júnior (1-3 anos)', 'Pleno (3-5 anos)', 'Sênior (5+ anos)']
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
      description: 'Configure como você prefere aprender',
      type: 'preferences',
      required: false,
      estimatedTime: 3,
      skipAllowed: true,
      components: [
        {
          id: 'learning_style',
          type: 'select',
          label: 'Estilo de Aprendizado',
          required: false,
          options: ['Visual', 'Auditivo', 'Cinestésico', 'Leitura/Escrita', 'Misto']
        },
        {
          id: 'time_availability',
          type: 'select',
          label: 'Tempo Disponível por Semana',
          required: false,
          options: ['1-2 horas', '3-5 horas', '6-10 horas', '10+ horas']
        },
        {
          id: 'device_preference',
          type: 'select',
          label: 'Dispositivo Preferido',
          required: false,
          options: ['Desktop', 'Laptop', 'Tablet', 'Smartphone', 'Qualquer']
        }
      ]
    },
    {
      id: 'goals',
      title: 'Objetivos e Metas',
      description: 'O que você espera alcançar com o sistema?',
      type: 'goals',
      required: false,
      estimatedTime: 5,
      skipAllowed: true,
      components: [
        {
          id: 'primary_goals',
          type: 'checkbox',
          label: 'Objetivos Principais',
          required: false,
          options: [
            'Aprender a usar o sistema RSV',
            'Melhorar produtividade',
            'Aumentar vendas',
            'Melhorar atendimento ao cliente',
            'Gerenciar reservas eficientemente',
            'Entender relatórios e analytics'
          ]
        },
        {
          id: 'specific_goals',
          type: 'textarea',
          label: 'Metas Específicas',
          placeholder: 'Descreva suas metas específicas...',
          required: false
        }
      ]
    },
    {
      id: 'plan',
      title: 'Plano Personalizado',
      description: 'Seu plano de onboarding foi criado com base nas suas respostas',
      type: 'plan',
      required: true,
      estimatedTime: 2,
      skipAllowed: false,
      components: [
        {
          id: 'generated_plan',
          type: 'interactive',
          label: 'Plano de Onboarding',
          description: 'Plano personalizado gerado por IA',
          required: false,
          aiPowered: true,
          aiContext: 'plan_generation'
        }
      ]
    },
    {
      id: 'resources',
      title: 'Recursos e Materiais',
      description: 'Aqui estão os recursos recomendados para você',
      type: 'resources',
      required: false,
      estimatedTime: 3,
      skipAllowed: true,
      components: [
        {
          id: 'recommended_resources',
          type: 'interactive',
          label: 'Recursos Recomendados',
          description: 'Materiais personalizados para seu perfil',
          required: false,
          aiPowered: true,
          aiContext: 'resource_recommendation'
        }
      ]
    },
    {
      id: 'completion',
      title: 'Onboarding Concluído!',
      description: 'Parabéns! Você está pronto para começar',
      type: 'completion',
      required: true,
      estimatedTime: 1,
      skipAllowed: false,
      components: [
        {
          id: 'completion_summary',
          type: 'interactive',
          label: 'Resumo da Conclusão',
          description: 'Resumo do que foi configurado',
          required: false
        }
      ]
    }
  ]);

  const saveProgress = async (step?: number) => {
    try {
      await authenticatedFetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile,
          assessment: answers.assessment || {},
          preferences: answers.preferences || {},
          goals: answers.goals || {},
          planData: generatedPlan || {},
          currentStep: step ?? currentStep,
        }),
      });
    } catch (err) {
      console.error('Erro ao salvar onboarding:', err);
    }
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await authenticatedFetch('/api/onboarding');
        const json = await res.json();
        if (cancelled || !json.success) return;
        const d = json.data;
        if (d) {
          if (d.profile && Object.keys(d.profile).length) setProfile(d.profile);
          if (d.assessment && Object.keys(d.assessment).length) setAnswers((a) => ({ ...a, assessment: d.assessment }));
          if (d.preferences && Object.keys(d.preferences).length) setAnswers((a) => ({ ...a, preferences: d.preferences }));
          if (d.goals && Object.keys(d.goals).length) setAnswers((a) => ({ ...a, goals: d.goals }));
          if (d.planData && Object.keys(d.planData).length) setGeneratedPlan(d.planData);
          if (typeof d.currentStep === 'number' && d.currentStep >= 0) setCurrentStep(d.currentStep);
        }
      } catch {
        // Ignorar erro de carregamento
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const validateStep = (stepIndex: number): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];
    const step = onboardingSteps[stepIndex];
    if (step.type === 'profile') {
      if (!profile.name?.trim()) errors.push('Nome completo é obrigatório');
      if (!profile.email?.trim()) errors.push('E-mail é obrigatório');
      else if (!EMAIL_REGEX.test(profile.email)) errors.push('E-mail inválido');
      if (!profile.role) errors.push('Cargo/função é obrigatório');
      if (!profile.department) errors.push('Departamento é obrigatório');
      if (!profile.experience) errors.push('Experiência no setor é obrigatória');
    }
    return { valid: errors.length === 0, errors };
  };

  const handleNext = async () => {
    setValidationErrors([]);
    const { valid, errors } = validateStep(currentStep);
    if (!valid) {
      setValidationErrors(errors);
      toast.error(errors[0] || 'Preencha os campos obrigatórios');
      return;
    }
    if (currentStep === onboardingSteps.length - 1) {
      try {
        await authenticatedFetch('/api/onboarding', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            profile,
            assessment: answers.assessment || {},
            preferences: answers.preferences || {},
            goals: answers.goals || {},
            planData: generatedPlan || {},
            currentStep,
            completedAt: new Date().toISOString(),
          }),
        });
        toast.success('Onboarding concluído!');
        router.push('/minhas-reservas');
      } catch (err) {
        toast.error('Erro ao finalizar. Tente novamente.');
      }
      return;
    }
    await saveProgress(currentStep + 1);
    setCurrentStep((prev) => (prev < onboardingSteps.length - 1 ? prev + 1 : prev));
  };

  const handlePrevious = () => {
    setValidationErrors([]);
    setCurrentStep((prev) => (prev > 0 ? prev - 1 : prev));
  };

  const handleSkip = () => {
    setValidationErrors([]);
    setCurrentStep((prev) => {
      if (onboardingSteps[prev].skipAllowed && prev < onboardingSteps.length - 1) return prev + 1;
      return prev;
    });
  };

  const doGeneratePlan = async () => {
    setIsGeneratingPlan(true);
    setValidationErrors([]);
    try {
      const plan = await generatePlan(getPlanMode(), {
        profile: { name: profile.name, email: profile.email, role: profile.role, department: profile.department, experience: profile.experience },
        assessment: answers.assessment || {},
        preferences: answers.preferences || {},
        goals: answers.goals || {},
      });
      setGeneratedPlan({
        id: plan.id,
        title: plan.title,
        description: plan.description,
        steps: onboardingSteps,
        estimatedDuration: plan.estimatedDuration,
        difficulty: plan.difficulty,
        prerequisites: [],
        outcomes: [],
        resources: (plan.resources || []).map((r) => ({ id: r.title, title: r.title, type: r.type, url: '', duration: r.duration, difficulty: '', description: '', tags: [] })),
        milestones: [],
        aiRecommendations: [],
      });
    } catch (err: any) {
      toast.error(err.message || 'Erro ao gerar plano');
    } finally {
      setIsGeneratingPlan(false);
    }
  };

  const currentStepData = onboardingSteps[currentStep];
  const progress = ((currentStep + 1) / onboardingSteps.length) * 100;

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6 flex items-center justify-center min-h-[300px]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Carregando seu progresso...</p>
        </div>
      </div>
    );
  }

  const renderStepContent = () => {
    switch (currentStepData.type) {
      case 'welcome':
        return (
          <div className="text-center space-y-6">
            <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
              <Rocket className="w-12 h-12 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Bem-vindo ao Sistema RSV!
              </h2>
              <p className="text-gray-600 max-w-md mx-auto">
                Vamos criar um plano de onboarding personalizado para você.
                Este processo levará apenas alguns minutos e garantirá que você tenha a melhor experiência possível.
              </p>
            </div>
            <div className="flex justify-center space-x-4">
              <Badge variant="outline" className="flex items-center space-x-1">
                <Clock className="w-4 h-4" />
                <span>~15 minutos</span>
              </Badge>
              <Badge variant="outline" className="flex items-center space-x-1">
                <Brain className="w-4 h-4" />
                <span>IA Personalizada</span>
              </Badge>
            </div>
          </div>
        );

      case 'profile':
        return (
          <div className="space-y-6">
            {validationErrors.length > 0 && (
              <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                <ul className="list-disc list-inside">{validationErrors.map((e, i) => <li key={i}>{e}</li>)}</ul>
              </div>
            )}
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Perfil Pessoal e Profissional
              </h2>
              <p className="text-gray-600">
                Conte-nos sobre você para personalizar sua experiência
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nome Completo</label>
                <Input placeholder="Digite seu nome completo" value={profile.name || ''} onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <Input type="email" placeholder="seu@email.com" value={profile.email || ''} onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Cargo/Função</label>
                <Select value={profile.role || ''} onValueChange={(v) => setProfile((p) => ({ ...p, role: v }))}>
                  <SelectTrigger><SelectValue placeholder="Selecione seu cargo" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Agente de Viagens">Agente de Viagens</SelectItem>
                    <SelectItem value="Gerente">Gerente</SelectItem>
                    <SelectItem value="Atendente">Atendente</SelectItem>
                    <SelectItem value="Supervisor">Supervisor</SelectItem>
                    <SelectItem value="Diretor">Diretor</SelectItem>
                    <SelectItem value="Outro">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Departamento</label>
                <Select value={profile.department || ''} onValueChange={(v) => setProfile((p) => ({ ...p, department: v }))}>
                  <SelectTrigger><SelectValue placeholder="Selecione seu departamento" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Vendas">Vendas</SelectItem>
                    <SelectItem value="Atendimento">Atendimento</SelectItem>
                    <SelectItem value="Operações">Operações</SelectItem>
                    <SelectItem value="Marketing">Marketing</SelectItem>
                    <SelectItem value="Financeiro">Financeiro</SelectItem>
                    <SelectItem value="RH">RH</SelectItem>
                    <SelectItem value="TI">TI</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Experiência no Setor</label>
                <Select value={profile.experience || ''} onValueChange={(v) => setProfile((p) => ({ ...p, experience: v }))}>
                  <SelectTrigger><SelectValue placeholder="Selecione sua experiência" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Iniciante (0-1 anos)">Iniciante (0-1 anos)</SelectItem>
                    <SelectItem value="Júnior (1-3 anos)">Júnior (1-3 anos)</SelectItem>
                    <SelectItem value="Pleno (3-5 anos)">Pleno (3-5 anos)</SelectItem>
                    <SelectItem value="Sênior (5+ anos)">Sênior (5+ anos)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );

      case 'assessment': {
        const ass = answers.assessment || {};
        const RatingStars = ({ value, onChange }: { value: number; onChange: (v: number) => void }) => (
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <button key={n} type="button" onClick={() => onChange(n)} className="p-1 rounded hover:bg-gray-100" aria-label={`${n} estrelas`}>
                <Star className={`w-8 h-8 ${n <= value ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`} />
              </button>
            ))}
          </div>
        );
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Avaliação de Conhecimento</h2>
              <p className="text-gray-600">Vamos avaliar seu nível atual para personalizar o treinamento</p>
            </div>
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Brain className="w-5 h-5 text-purple-600" />
                    <span>Conhecimento do Sistema RSV</span>
                  </CardTitle>
                  <CardDescription>Responda algumas perguntas sobre sistemas de gestão</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="font-medium mb-2">Você já usou sistemas de gestão de reservas?</p>
                    <div className="flex flex-wrap gap-4">
                      {['never', 'basic', 'intermediate', 'advanced'].map((v) => (
                        <label key={v} className="flex items-center space-x-2 cursor-pointer">
                          <input type="radio" name="system_experience" value={v} checked={ass.systemKnowledge === v} onChange={() => setAnswers((a) => ({ ...a, assessment: { ...(a.assessment || {}), systemKnowledge: v } }))} />
                          <span>{v === 'never' ? 'Nunca' : v === 'basic' ? 'Básico' : v === 'intermediate' ? 'Intermediário' : 'Avançado'}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Conhecimento do Setor de Turismo</CardTitle>
                  <CardDescription>Avalie de 1 a 5 estrelas</CardDescription>
                </CardHeader>
                <CardContent>
                  <RatingStars value={ass.industryKnowledge ?? 0} onChange={(v) => setAnswers((a) => ({ ...a, assessment: { ...(a.assessment || {}), industryKnowledge: v } }))} />
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Conforto com Software</CardTitle>
                  <CardDescription>Quão confortável você se sente usando novos softwares?</CardDescription>
                </CardHeader>
                <CardContent>
                  <RatingStars value={ass.softwareComfort ?? 0} onChange={(v) => setAnswers((a) => ({ ...a, assessment: { ...(a.assessment || {}), softwareComfort: v } }))} />
                </CardContent>
              </Card>
            </div>
          </div>
        );
      }

      case 'preferences': {
        const prefs = answers.preferences || {};
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Preferências de Aprendizado</h2>
              <p className="text-gray-600">Configure como você prefere aprender</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-1 gap-4 max-w-xl mx-auto">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Estilo de Aprendizado</label>
                <Select value={prefs.learningStyle || ''} onValueChange={(v) => setAnswers((a) => ({ ...a, preferences: { ...(a.preferences || {}), learningStyle: v } }))}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Visual">Visual</SelectItem>
                    <SelectItem value="Auditivo">Auditivo</SelectItem>
                    <SelectItem value="Cinestésico">Cinestésico</SelectItem>
                    <SelectItem value="Leitura/Escrita">Leitura/Escrita</SelectItem>
                    <SelectItem value="Misto">Misto</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tempo Disponível por Semana</label>
                <Select value={prefs.timeAvailability || ''} onValueChange={(v) => setAnswers((a) => ({ ...a, preferences: { ...(a.preferences || {}), timeAvailability: v } }))}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1-2 horas">1-2 horas</SelectItem>
                    <SelectItem value="3-5 horas">3-5 horas</SelectItem>
                    <SelectItem value="6-10 horas">6-10 horas</SelectItem>
                    <SelectItem value="10+ horas">10+ horas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Dispositivo Preferido</label>
                <Select value={prefs.devicePreference || ''} onValueChange={(v) => setAnswers((a) => ({ ...a, preferences: { ...(a.preferences || {}), devicePreference: v } }))}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Desktop">Desktop</SelectItem>
                    <SelectItem value="Laptop">Laptop</SelectItem>
                    <SelectItem value="Tablet">Tablet</SelectItem>
                    <SelectItem value="Smartphone">Smartphone</SelectItem>
                    <SelectItem value="Qualquer">Qualquer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );
      }

      case 'goals': {
        const g = answers.goals || {};
        const goalsList = ['Aprender a usar o sistema RSV', 'Melhorar produtividade', 'Aumentar vendas', 'Melhorar atendimento ao cliente', 'Gerenciar reservas eficientemente', 'Entender relatórios e analytics'];
        const selected = (g.primaryGoals as string[]) || [];
        const toggle = (item: string) => {
          const next = selected.includes(item) ? selected.filter((x) => x !== item) : [...selected, item];
          setAnswers((a) => ({ ...a, goals: { ...(a.goals || {}), primaryGoals: next } }));
        };
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Objetivos e Metas</h2>
              <p className="text-gray-600">O que você espera alcançar com o sistema?</p>
            </div>
            <div className="space-y-4 max-w-xl mx-auto">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Objetivos Principais</label>
                <div className="space-y-2">
                  {goalsList.map((item) => (
                    <label key={item} className="flex items-center space-x-2 cursor-pointer">
                      <input type="checkbox" checked={selected.includes(item)} onChange={() => toggle(item)} />
                      <span>{item}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Metas Específicas</label>
                <Textarea placeholder="Descreva suas metas específicas..." value={g.specificGoals || ''} onChange={(e) => setAnswers((a) => ({ ...a, goals: { ...(a.goals || {}), specificGoals: e.target.value } }))} rows={4} />
              </div>
            </div>
          </div>
        );
      }

      case 'plan':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Plano Personalizado
              </h2>
              <p className="text-gray-600">
                Seu plano de onboarding foi criado com base nas suas respostas
              </p>
            </div>
            {!generatedPlan ? (
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                  <Brain className="w-8 h-8 text-blue-600" />
                </div>
                <p className="text-gray-600">
                  Clique para gerar seu plano personalizado
                </p>
                <Button type="button" onClick={doGeneratePlan} disabled={isGeneratingPlan}>
                  {isGeneratingPlan ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Gerando...
                    </>
                  ) : (
                    <>
                      <Brain className="w-4 h-4 mr-2" />
                      Gerar Plano
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span>Plano de Onboarding Criado!</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <Clock className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                        <p className="font-semibold">Duração</p>
                        <p className="text-sm text-gray-600">{Math.round((generatedPlan.estimatedDuration || 120) / 60)} horas</p>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <Target className="w-8 h-8 text-green-600 mx-auto mb-2" />
                        <p className="font-semibold">Nível</p>
                        <p className="text-sm text-gray-600 capitalize">{generatedPlan.difficulty || 'Intermediário'}</p>
                      </div>
                      <div className="text-center p-4 bg-purple-50 rounded-lg">
                        <BookOpen className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                        <p className="font-semibold">Etapas</p>
                        <p className="text-sm text-gray-600">{generatedPlan.steps?.length || 8} etapas</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        );

      case 'resources': {
        const resources = [
          { title: 'Vídeo: Primeiros passos no RSV', type: 'video', duration: 10 },
          { title: 'Guia: Manual do sistema', type: 'document', duration: 30 },
          { title: 'Quiz: Avaliação de conhecimento', type: 'quiz', duration: 15 },
          { title: 'Tutorial: Dashboard e relatórios', type: 'video', duration: 12 },
        ];
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Recursos e Materiais</h2>
              <p className="text-gray-600">Aqui estão os recursos recomendados para você</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {resources.map((r, i) => (
                <Card key={i}>
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-blue-100">
                        <BookOpen className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-semibold">{r.title}</p>
                        <p className="text-sm text-gray-500 capitalize">{r.type} • {r.duration} min</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );
      }

      case 'completion':
        return (
          <div className="text-center space-y-6">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Onboarding Concluído!
              </h2>
              <p className="text-gray-600 max-w-md mx-auto">
                Parabéns! Você está pronto para começar a usar o Sistema RSV.
                Seu perfil foi configurado e você receberá recomendações personalizadas.
              </p>
            </div>
            <div className="flex justify-center space-x-4">
              <Badge variant="outline" className="flex items-center space-x-1">
                <Award className="w-4 h-4" />
                <span>Perfil Completo</span>
              </Badge>
              <Badge variant="outline" className="flex items-center space-x-1">
                <Rocket className="w-4 h-4" />
                <span>Pronto para Começar</span>
              </Badge>
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center">
            <p className="text-gray-600">Conteúdo da etapa em desenvolvimento...</p>
          </div>
        );
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between mb-4">
            <div>
              <CardTitle className="text-xl">
                {currentStepData.title}
              </CardTitle>
              <CardDescription>
                {currentStepData.description}
              </CardDescription>
            </div>
            <Badge variant="outline" className="flex items-center space-x-1">
              <Clock className="w-4 h-4" />
              <span>{currentStepData.estimatedTime} min</span>
            </Badge>
          </div>
          <Progress value={progress} className="w-full" />
          <div className="flex justify-between text-sm text-gray-500 mt-2">
            <span>Etapa {currentStep + 1} de {onboardingSteps.length}</span>
            <span>{Math.round(progress)}% concluído</span>
          </div>
        </CardHeader>
        <CardContent className="transition-opacity duration-300">
          {currentStep >= 3 && currentStep < 7 && (
            <p className="text-center text-sm text-blue-600 mb-4 font-medium">Você está indo bem!</p>
          )}
          {currentStep === 7 && (
            <p className="text-center text-sm text-green-600 mb-4 font-medium">Quase lá!</p>
          )}
          {renderStepContent()}
        </CardContent>
        <div className="flex justify-between p-6 pt-0">
          <Button
            type="button"
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 0}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Anterior
          </Button>

          <div className="flex space-x-2">
            {currentStepData.skipAllowed && (
              <Button type="button" variant="ghost" onClick={handleSkip}>
                Pular
              </Button>
            )}
            <Button type="button" onClick={handleNext}>
              {currentStep === onboardingSteps.length - 1 ? 'Finalizar' : 'Próximo'}
              {currentStep < onboardingSteps.length - 1 && (
                <ArrowRight className="w-4 h-4 ml-2" />
              )}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default OnboardingWizard;
