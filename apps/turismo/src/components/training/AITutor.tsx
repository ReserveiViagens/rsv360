'use client'

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Badge } from '@/components/ui/Badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { Progress } from '@/components/ui/Progress'
import {
  Brain,
  Lightbulb,
  Target,
  Eye,
  HelpCircle,
  BookOpen,
  ArrowRight,
  Archive,
  Settings,
  ThumbsUp,
  ThumbsDown,
  Bookmark,
  Send,
  Video,
  FileText,
  Code,
  Volume2,
  Download,
  Share,
  Save,
  Calculator,
} from 'lucide-react'

// Tipos para AI Tutor
interface ChatMessage {
  id: string
  type: 'user' | 'ai' | 'system'
  content: string
  timestamp: string
  metadata?: {
    messageType?: 'question' | 'explanation' | 'exercise' | 'resource' | 'encouragement' | 'summary'
    confidence?: number // 0-100
    complexity?: number // 1-10
    tags?: string[]
    attachments?: MessageAttachment[]
    citations?: string[]
    followUpSuggestions?: string[]
  }
  reactions?: MessageReaction[]
  isTyping?: boolean
}

interface MessageAttachment {
  id: string
  type: 'image' | 'video' | 'audio' | 'document' | 'link' | 'code' | 'diagram'
  title: string
  description?: string
  url: string
  size?: number
  duration?: number
  preview?: string
}

interface MessageReaction {
  type: 'helpful' | 'not_helpful' | 'bookmark' | 'need_clarification' | 'perfect' | 'confusing'
  timestamp: string
  feedback?: string
}

interface TutorPersonality {
  id: string
  name: string
  description: string
  avatar: string
  characteristics: string[]
  teachingStyle: string
  specialties: string[]
  tone: 'formal' | 'casual' | 'encouraging' | 'challenging' | 'balanced'
  adaptability: number // 1-10
}

interface LearningContext {
  currentTopic: string
  previousTopics: string[]
  userLevel: number // 1-10
  userGoals: string[]
  timeAvailable: number // in minutes
  preferredLearningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'reading'
  currentMood: 'motivated' | 'confused' | 'frustrated' | 'confident' | 'tired'
  recentPerformance: {
    lastQuizScore: number
    strugglingConcepts: string[]
    masteredConcepts: string[]
  }
}

interface QuickAction {
  id: string
  label: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  message: string
  category: 'learning' | 'practice' | 'help' | 'tools'
}

function createChatMessageId(suffix: string) {
  return `msg_${crypto.randomUUID()}_${suffix}`;
}

function randomTypingDelayMs() {
  return 1500 + Math.floor(Math.random() * 1000);
}

const AITutor: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [currentMessage, setCurrentMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [selectedPersonality, setSelectedPersonality] = useState('adaptive')
  const [learningContext] = useState<LearningContext>({
    currentTopic: 'Sistema RSV - Fundamentos',
    previousTopics: ['Navegação básica', 'Cadastros'],
    userLevel: 6,
    userGoals: ['Dominar o sistema', 'Melhorar produtividade'],
    timeAvailable: 30,
    preferredLearningStyle: 'visual',
    currentMood: 'motivated',
    recentPerformance: {
      lastQuizScore: 85,
      strugglingConcepts: ['Relatórios avançados'],
      masteredConcepts: ['Navegação', 'Cadastros básicos']
    }
  })
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const addQuickMessage = useCallback((message: string) => {
    setCurrentMessage(message)
    inputRef.current?.focus()
  }, [])

  // Dados mock para demonstração
  const [tutorPersonalities] = useState<TutorPersonality[]>([
    {
      id: 'adaptive',
      name: 'ARIA - Assistente Adaptativo',
      description: 'Tutor inteligente que se adapta ao seu estilo de aprendizagem',
      avatar: '🤖',
      characteristics: ['Adaptável', 'Paciente', 'Inteligente', 'Encorajadora'],
      teachingStyle: 'Adapta-se ao estudante, identificando o melhor método para cada pessoa',
      specialties: ['Personalização', 'Análise de padrões', 'Motivação', 'Feedback inteligente'],
      tone: 'balanced',
      adaptability: 10
    },
    {
      id: 'mentor',
      name: 'Professor Silva - O Mentor',
      description: 'Experiente professor com abordagem tradicional e estruturada',
      avatar: '👨‍🏫',
      characteristics: ['Experiente', 'Estruturado', 'Detalhista', 'Tradicional'],
      teachingStyle: 'Abordagem sistemática e progressiva, com foco em fundamentos sólidos',
      specialties: ['Fundamentos', 'Teoria', 'Estrutura', 'Disciplina'],
      tone: 'formal',
      adaptability: 6
    },
    {
      id: 'coach',
      name: 'Alex - O Coach',
      description: 'Tutor energético focado em resultados práticos e motivação',
      avatar: '💪',
      characteristics: ['Energético', 'Motivador', 'Prático', 'Desafiador'],
      teachingStyle: 'Foco na prática, desafios constantes e celebração de conquistas',
      specialties: ['Motivação', 'Prática', 'Desafios', 'Resultados'],
      tone: 'encouraging',
      adaptability: 8
    },
    {
      id: 'friend',
      name: 'Sam - O Amigo',
      description: 'Tutor casual e amigável para aprendizado descontraído',
      avatar: '😊',
      characteristics: ['Amigável', 'Casual', 'Paciente', 'Compreensivo'],
      teachingStyle: 'Conversa natural, explicações simples e ambiente descontraído',
      specialties: ['Simplicidade', 'Paciência', 'Clareza', 'Conforto'],
      tone: 'casual',
      adaptability: 7
    }
  ])

  const quickActions = useMemo<QuickAction[]>(() => [
    {
      id: 'explain',
      label: 'Explique um conceito',
      description: 'Peça uma explicação detalhada',
      icon: Lightbulb,
      message: 'Pode me explicar o conceito de [conceito] de forma simples?',
      category: 'learning'
    },
    {
      id: 'practice',
      label: 'Quero praticar',
      description: 'Solicite exercícios práticos',
      icon: Target,
      message: 'Gostaria de fazer alguns exercícios práticos sobre o tópico atual',
      category: 'practice'
    },
    {
      id: 'examples',
      label: 'Mostre exemplos',
      description: 'Veja exemplos reais',
      icon: Eye,
      message: 'Pode me mostrar alguns exemplos práticos deste conceito?',
      category: 'learning'
    },
    {
      id: 'confused',
      label: 'Estou confuso',
      description: 'Peça esclarecimentos',
      icon: HelpCircle,
      message: 'Estou tendo dificuldades para entender. Pode explicar de outra forma?',
      category: 'help'
    },
    {
      id: 'summary',
      label: 'Resumir tópico',
      description: 'Peça um resumo do que aprendeu',
      icon: BookOpen,
      message: 'Pode fazer um resumo do que aprendemos até agora?',
      category: 'learning'
    },
    {
      id: 'next',
      label: 'Próximo tópico',
      description: 'Avance para o próximo assunto',
      icon: ArrowRight,
      message: 'Estou pronto para o próximo tópico. O que vamos aprender agora?',
      category: 'learning'
    },
    {
      id: 'quiz',
      label: 'Quiz rápido',
      description: 'Teste seus conhecimentos',
      icon: Brain,
      message: 'Gostaria de fazer um quiz rápido para testar meu conhecimento',
      category: 'practice'
    },
    {
      id: 'resources',
      label: 'Mais recursos',
      description: 'Solicite materiais adicionais',
      icon: Archive,
      message: 'Tem alguns recursos adicionais que posso estudar sobre este tema?',
      category: 'tools'
    }
  ], [])

  // Simular mensagens iniciais
  useEffect(() => {
    if (messages.length === 0) {
      const initialMessages: ChatMessage[] = [
        {
          id: 'msg_001',
          type: 'ai',
          content: `Olá! 👋 Sou ARIA, sua tutora de IA personalizada. Vejo que você está estudando "${learningContext.currentTopic}". 

Baseado no seu perfil, sei que você:
• Prefere aprendizado visual
• Tem ${learningContext.timeAvailable} minutos disponíveis
• Já domina: ${learningContext.recentPerformance.masteredConcepts.join(', ')}
• Quer melhorar em: ${learningContext.recentPerformance.strugglingConcepts.join(', ')}

Como posso ajudá-lo hoje? Posso explicar conceitos, criar exercícios, dar exemplos práticos ou responder suas dúvidas!`,
          timestamp: new Date().toISOString(),
          metadata: {
            messageType: 'explanation',
            confidence: 95,
            complexity: 3,
            tags: ['welcome', 'personalization', 'introduction'],
            followUpSuggestions: [
              'Vamos começar com o básico',
              'Quero praticar o que já sei',
              'Tenho uma dúvida específica',
              'Me sugira um plano de estudo'
            ]
          }
        }
      ]
      // eslint-disable-next-line react-hooks/set-state-in-effect -- seed welcome message on mount
      setMessages(initialMessages)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- run once on mount
  }, [])

  // Auto-scroll para a última mensagem
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async () => {
    if (!currentMessage.trim()) return

    const userMessage: ChatMessage = {
      id: createChatMessageId('user'),
      type: 'user',
      content: currentMessage,
      timestamp: new Date().toISOString()
    }

    setMessages(prev => [...prev, userMessage])
    setCurrentMessage('')
    setIsTyping(true)

    setTimeout(() => {
      const aiResponse = generateAIResponse(currentMessage)
      setMessages(prev => [...prev, aiResponse])
      setIsTyping(false)
    }, randomTypingDelayMs())
  }

  const generateAIResponse = (_userInput: string): ChatMessage => {
    const responses = [
      {
        content: `Ótima pergunta! Vou explicar isso de forma visual, já que sei que você aprende melhor assim. 

📊 **Conceito Principal:**
Imagine o sistema RSV como uma casa com vários cômodos:
- **Hall de entrada** = Dashboard principal
- **Escritório** = Área de relatórios  
- **Arquivo** = Base de dados
- **Comunicação** = Chat e notificações

🎯 **Exemplo Prático:**
Quando você acessa um relatório, é como ir do hall (dashboard) até o escritório (relatórios). O caminho sempre começa no menu principal!

💡 **Dica Visual:** Use os ícones do menu como "sinalizações" - cada um te leva a uma "área" específica do sistema.

Gostaria que eu mostre isso na prática ou tem alguma parte específica que quer que eu detalhe mais?`,
        messageType: 'explanation' as const,
        confidence: 92,
        complexity: 4,
        tags: ['visual-learning', 'metaphor', 'practical-example'],
        followUpSuggestions: [
          'Mostre na prática',
          'Explique os ícones do menu',
          'Como navegar mais rápido?',
          'Próximo conceito'
        ]
      },
      {
        content: `Perfeito! Vamos praticar então. Vou criar um exercício personalizado para você.

🎮 **Exercício Prático - Navegação Rápida**

**Cenário:** Você precisa gerar um relatório de vendas dos últimos 30 dias.

**Seus passos devem ser:**
1. ? (me diga qual seria o primeiro passo)
2. ? (e depois?)
3. ? (como finalizar?)

💭 **Dica:** Lembre-se da nossa "metáfora da casa" - você está no hall e precisa chegar ao escritório!

⭐ **Bônus:** Se completar em menos de 3 cliques, você será um "Navegador Expert"!

Qual seria seu primeiro passo?`,
        messageType: 'exercise' as const,
        confidence: 88,
        complexity: 5,
        tags: ['practice', 'gamification', 'step-by-step'],
        followUpSuggestions: [
          'Vou ao menu Relatórios',
          'Clico no Dashboard',
          'Preciso de uma dica',
          'Muito difícil, simplifique'
        ]
      },
      {
        content: `Entendo sua confusão! Vamos quebrar isso em pedaços menores. 🧩

🔄 **Vou explicar de 3 formas diferentes:**

**1. SUPER SIMPLES:** 
Pense no sistema como um smartphone - você toca nos apps (ícones) para abrir as funções.

**2. PASSO A PASSO:**
• Vejo o menu → Escolho a função → Uso a ferramenta
• É sempre: Onde quero ir → Como chego lá → O que fazer

**3. ANALOGIA:**
Como dirigir: Destino (o que quero) → Rota (onde clicar) → Chegada (resultado)

🤔 **Qual dessas explicações fez mais sentido para você?**

Ou prefere que eu:
- 📹 Mostre um vídeo demonstrativo?
- 📝 Crie um guia escrito passo-a-passo?
- 🎯 Pratique junto comigo?`,
        messageType: 'explanation' as const,
        confidence: 85,
        complexity: 3,
        tags: ['clarification', 'multiple-approaches', 'support'],
        followUpSuggestions: [
          'A analogia do smartphone',
          'Quero o passo-a-passo',
          'Mostre o vídeo',
          'Vamos praticar junto'
        ]
      }
    ]

    const randomResponse = responses[Math.floor(Math.random() * responses.length)]
    
    return {
      id: createChatMessageId('ai'),
      type: 'ai',
      content: randomResponse.content,
      timestamp: new Date().toISOString(),
      metadata: randomResponse
    }
  }

  const handleMessageReaction = (messageId: string, reaction: MessageReaction) => {
    setMessages(prev => 
      prev.map(msg => 
        msg.id === messageId 
          ? { ...msg, reactions: [...(msg.reactions || []), reaction] }
          : msg
      )
    )
  }

  const getCurrentPersonality = () => {
    return tutorPersonalities.find(p => p.id === selectedPersonality) || tutorPersonalities[0]
  }

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="h-full flex flex-col max-h-screen">
      <div className="flex-shrink-0 border-b bg-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="text-2xl">{getCurrentPersonality().avatar}</div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{getCurrentPersonality().name}</h1>
              <p className="text-sm text-gray-600">{getCurrentPersonality().description}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Select value={selectedPersonality} onValueChange={setSelectedPersonality}>
              {tutorPersonalities.map(personality => (
                <option key={personality.id} value={personality.id}>
                  {personality.avatar} {personality.name}
                </option>
              ))}
            </Select>
            <Button variant="secondary" size="sm">
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        {/* Learning Context Display */}
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-4">
              <span className="font-medium">📚 {learningContext.currentTopic}</span>
              <span className="text-gray-600">⏱️ {learningContext.timeAvailable}min disponíveis</span>
              <span className="text-gray-600">📊 Nível {learningContext.userLevel}/10</span>
            </div>
            <Badge className="bg-green-100 text-green-800">
              {learningContext.currentMood}
            </Badge>
          </div>
        </div>
      </div>

      <div className="flex-1 flex min-h-0">
        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-3xl ${message.type === 'user' ? 'order-2' : 'order-1'}`}>
                  <div
                    className={`rounded-2xl p-4 ${
                      message.type === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{message.content}</div>
                    
                    {message.metadata?.followUpSuggestions && (
                      <div className="mt-3 space-y-2">
                        <div className="text-xs text-gray-600 font-medium">Sugestões de continuação:</div>
                        <div className="flex flex-wrap gap-2">
                          {message.metadata.followUpSuggestions.map((suggestion, index) => (
                            <Button
                              key={index}
                              variant="secondary"
                              size="sm"
                              className="text-xs h-7"
                              onClick={() => addQuickMessage(suggestion)}
                            >
                              {suggestion}
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className={`flex items-center mt-2 space-x-2 ${
                    message.type === 'user' ? 'justify-end' : 'justify-start'
                  }`}>
                    <span className="text-xs text-gray-500">
                      {formatTime(message.timestamp)}
                    </span>
                    
                    {message.metadata?.confidence && (
                      <Badge variant="secondary" className="text-xs">
                        {message.metadata.confidence}% confiança
                      </Badge>
                    )}
                    
                    {message.type === 'ai' && (
                      <div className="flex space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => handleMessageReaction(message.id, {
                            type: 'helpful',
                            timestamp: new Date().toISOString()
                          })}
                        >
                          <ThumbsUp className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => handleMessageReaction(message.id, {
                            type: 'not_helpful',
                            timestamp: new Date().toISOString()
                          })}
                        >
                          <ThumbsDown className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => handleMessageReaction(message.id, {
                            type: 'bookmark',
                            timestamp: new Date().toISOString()
                          })}
                        >
                          <Bookmark className="w-3 h-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-2xl p-4 max-w-3xl">
                  <div className="flex items-center space-x-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-75"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"></div>
                    </div>
                    <span className="text-sm text-gray-500">ARIA está digitando...</span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions */}
          <div className="flex-shrink-0 border-t bg-gray-50 p-4">
            <div className="mb-3">
              <span className="text-sm font-medium text-gray-700">Ações Rápidas:</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {quickActions.slice(0, 8).map((action) => (
                <Button
                  key={action.id}
                  variant="secondary"
                  size="sm"
                  className="justify-start text-left h-auto p-2"
                  onClick={() => addQuickMessage(action.message)}
                >
                  <div className="flex items-center space-x-2">
                    <action.icon className="w-4 h-4 flex-shrink-0" />
                    <div className="min-w-0">
                      <div className="text-xs font-medium truncate">{action.label}</div>
                      <div className="text-xs text-gray-500 truncate">{action.description}</div>
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          </div>

          {/* Message Input */}
          <div className="flex-shrink-0 border-t bg-white p-4">
            <div className="flex space-x-3">
              <div className="flex-1">
                <Input
                  ref={inputRef}
                  value={currentMessage}
                  onChange={(e) => setCurrentMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Digite sua pergunta ou dúvida..."
                  className="w-full"
                />
              </div>
              <Button onClick={sendMessage} disabled={!currentMessage.trim() || isTyping}>
                <Send className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
              <span>Pressione Enter para enviar</span>
              <span>{currentMessage.length}/1000</span>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-80 border-l bg-gray-50 flex-shrink-0">
          <Tabs defaultValue="context" className="h-full flex flex-col">
            <TabsList className="flex-shrink-0 grid w-full grid-cols-3 m-2">
              <TabsTrigger value="context">Contexto</TabsTrigger>
              <TabsTrigger value="progress">Progresso</TabsTrigger>
              <TabsTrigger value="tools">Ferramentas</TabsTrigger>
            </TabsList>

            <TabsContent value="context" className="flex-1 overflow-y-auto p-4 space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Perfil de Aprendizagem</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm">
                    <div className="font-medium mb-1">Estilo Preferido:</div>
                    <Badge className="bg-blue-100 text-blue-800">
                      {learningContext.preferredLearningStyle}
                    </Badge>
                  </div>
                  
                  <div className="text-sm">
                    <div className="font-medium mb-1">Nível Atual:</div>
                    <div className="flex items-center space-x-2">
                      <Progress value={learningContext.userLevel * 10} className="flex-1 h-2" />
                      <span className="text-xs">{learningContext.userLevel}/10</span>
                    </div>
                  </div>
                  
                  <div className="text-sm">
                    <div className="font-medium mb-1">Objetivos:</div>
                    <div className="space-y-1">
                      {learningContext.userGoals.map((goal, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <Target className="w-3 h-3 text-blue-600" />
                          <span className="text-xs">{goal}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Status Atual</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm">
                    <div className="font-medium mb-1">Conceitos Dominados:</div>
                    <div className="flex flex-wrap gap-1">
                      {learningContext.recentPerformance.masteredConcepts.map((concept, index) => (
                        <Badge key={index} className="bg-green-100 text-green-800 text-xs">
                          ✓ {concept}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div className="text-sm">
                    <div className="font-medium mb-1">Em Desenvolvimento:</div>
                    <div className="flex flex-wrap gap-1">
                      {learningContext.recentPerformance.strugglingConcepts.map((concept, index) => (
                        <Badge key={index} className="bg-yellow-100 text-yellow-800 text-xs">
                          📈 {concept}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div className="text-sm">
                    <div className="font-medium mb-1">Última Avaliação:</div>
                    <div className="flex items-center space-x-2">
                      <span className="text-lg font-bold text-green-600">
                        {learningContext.recentPerformance.lastQuizScore}%
                      </span>
                      <Badge className="bg-green-100 text-green-800 text-xs">Aprovado</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="progress" className="flex-1 overflow-y-auto p-4 space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Sessão Atual</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Tempo decorrido:</span>
                    <span className="font-medium">12 min</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Perguntas feitas:</span>
                    <span className="font-medium">3</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Conceitos explicados:</span>
                    <span className="font-medium">2</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Exercícios propostos:</span>
                    <span className="font-medium">1</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Estatísticas Gerais</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">15</div>
                    <div className="text-xs text-gray-600">Sessões completadas</div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 text-center">
                    <div>
                      <div className="text-lg font-bold text-green-600">8.5h</div>
                      <div className="text-xs text-gray-600">Tempo total</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-purple-600">4.2</div>
                      <div className="text-xs text-gray-600">Avaliação média</div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="text-sm font-medium">Progresso por área:</div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span>Sistema RSV</span>
                        <span>85%</span>
                      </div>
                      <Progress value={85} className="h-1" />
                      
                      <div className="flex justify-between text-xs">
                        <span>Relatórios</span>
                        <span>60%</span>
                      </div>
                      <Progress value={60} className="h-1" />
                      
                      <div className="flex justify-between text-xs">
                        <span>Integrações</span>
                        <span>30%</span>
                      </div>
                      <Progress value={30} className="h-1" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="tools" className="flex-1 overflow-y-auto p-4 space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Ferramentas Rápidas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="secondary" size="sm" className="w-full justify-start">
                    <Calculator className="w-4 h-4 mr-2" />
                    Calculadora de Fórmulas
                  </Button>
                  <Button variant="secondary" size="sm" className="w-full justify-start">
                    <BookOpen className="w-4 h-4 mr-2" />
                    Glossário de Termos
                  </Button>
                  <Button variant="secondary" size="sm" className="w-full justify-start">
                    <Video className="w-4 h-4 mr-2" />
                    Vídeos Tutoriais
                  </Button>
                  <Button variant="secondary" size="sm" className="w-full justify-start">
                    <FileText className="w-4 h-4 mr-2" />
                    Guias PDF
                  </Button>
                  <Button variant="secondary" size="sm" className="w-full justify-start">
                    <Code className="w-4 h-4 mr-2" />
                    Exemplos de Código
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Configurações</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <label className="text-sm font-medium">Velocidade da IA:</label>
                    <Select defaultValue="normal">
                      <option value="slow">Devagar</option>
                      <option value="normal">Normal</option>
                      <option value="fast">Rápido</option>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Complexidade:</label>
                    <Select defaultValue="adaptive">
                      <option value="simple">Simples</option>
                      <option value="adaptive">Adaptativo</option>
                      <option value="advanced">Avançado</option>
                    </Select>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Som habilitado:</span>
                    <Button variant="ghost" size="sm">
                      <Volume2 className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Modo escuro:</span>
                    <Button variant="ghost" size="sm">
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Exportar Sessão</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="secondary" size="sm" className="w-full justify-start">
                    <Download className="w-4 h-4 mr-2" />
                    Baixar Chat
                  </Button>
                  <Button variant="secondary" size="sm" className="w-full justify-start">
                    <Share className="w-4 h-4 mr-2" />
                    Compartilhar
                  </Button>
                  <Button variant="secondary" size="sm" className="w-full justify-start">
                    <Save className="w-4 h-4 mr-2" />
                    Salvar Favoritos
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}

export default AITutor
