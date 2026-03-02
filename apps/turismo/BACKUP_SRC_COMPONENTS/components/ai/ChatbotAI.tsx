'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select'
import { Badge } from '@/components/ui/Badge'
import { Textarea } from '@/components/ui/Textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/Dialog'
import { Label } from '@/components/ui/Label'
import { Progress } from '@/components/ui/Progress'
import { 
  Bot,
  MessageSquare,
  Send,
  User,
  Brain,
  Settings,
  Download,
  Upload,
  Play,
  Pause,
  RefreshCw,
  BarChart3,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertTriangle,
  Eye,
  Edit,
  Trash2,
  Plus,
  Search,
  Filter,
  Users,
  Activity,
  Target,
  Zap,
  FileText,
  Database,
  Globe,
  Calendar,
  ArrowUp,
  ArrowDown,
  ThumbsUp,
  ThumbsDown,
  Copy,
  ExternalLink,
  Lightbulb,
  HelpCircle,
  Phone,
  Mail
} from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar, PieChart, Cell } from 'recharts'

// Tipos para chatbot AI
interface ChatMessage {
  id: string
  type: 'user' | 'bot' | 'system'
  content: string
  timestamp: string
  userId?: string
  sessionId: string
  intent?: string
  confidence?: number
  entities?: { type: string; value: string; confidence: number }[]
  suggestions?: string[]
  attachments?: { type: string; url: string; name: string }[]
  feedback?: 'positive' | 'negative'
}

interface ChatSession {
  id: string
  userId: string
  userName: string
  startTime: string
  endTime?: string
  status: 'active' | 'completed' | 'transferred' | 'abandoned'
  messageCount: number
  resolution: 'resolved' | 'escalated' | 'pending'
  satisfaction?: number // 1-5
  topic: string
  tags: string[]
  assignedAgent?: string
}

interface BotKnowledge {
  id: string
  category: string
  question: string
  answer: string
  keywords: string[]
  confidence: number
  usage_count: number
  last_updated: string
  approved: boolean
  source: 'manual' | 'learned' | 'imported'
}

interface BotIntent {
  name: string
  description: string
  training_phrases: string[]
  response_templates: string[]
  actions: string[]
  confidence_threshold: number
  enabled: boolean
}

interface BotAnalytics {
  total_conversations: number
  active_sessions: number
  avg_response_time: number
  resolution_rate: number
  satisfaction_score: number
  top_intents: { intent: string; count: number }[]
  hourly_volume: { hour: number; messages: number }[]
  daily_stats: { date: string; conversations: number; resolved: number; escalated: number }[]
}

const ChatbotAI: React.FC = () => {
  const [activeTab, setActiveTab] = useState('chat')
  const [isKnowledgeModalOpen, setIsKnowledgeModalOpen] = useState(false)
  const [selectedSession, setSelectedSession] = useState<ChatSession | null>(null)
  const [currentMessage, setCurrentMessage] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Dados mock para demonstração
  const [botKnowledge] = useState<BotKnowledge[]>([
    {
      id: '1',
      category: 'Produtos',
      question: 'Como faço para cancelar minha reserva?',
      answer: 'Para cancelar sua reserva, acesse sua conta, vá em "Minhas Reservas" e clique em "Cancelar". O reembolso será processado conforme nossa política de cancelamento.',
      keywords: ['cancelar', 'reserva', 'reembolso', 'política'],
      confidence: 95.2,
      usage_count: 247,
      last_updated: '2025-01-15T10:00:00Z',
      approved: true,
      source: 'manual'
    },
    {
      id: '2',
      category: 'Suporte',
      question: 'Qual o horário de funcionamento do suporte?',
      answer: 'Nosso suporte funciona de segunda a sexta das 8h às 18h, e sábados das 8h às 12h. Fora desses horários, você pode deixar uma mensagem que responderemos assim que possível.',
      keywords: ['horário', 'suporte', 'funcionamento', 'atendimento'],
      confidence: 98.7,
      usage_count: 156,
      last_updated: '2025-01-14T16:30:00Z',
      approved: true,
      source: 'manual'
    },
    {
      id: '3',
      category: 'Pagamento',
      question: 'Quais formas de pagamento vocês aceitam?',
      answer: 'Aceitamos cartões de crédito (Visa, Mastercard, Elo), PIX, boleto bancário e transferência bancária. Para parcelamento, consulte as condições no momento da compra.',
      keywords: ['pagamento', 'cartão', 'pix', 'boleto', 'parcelamento'],
      confidence: 92.1,
      usage_count: 198,
      last_updated: '2025-01-13T14:20:00Z',
      approved: true,
      source: 'manual'
    },
    {
      id: '4',
      category: 'Produtos',
      question: 'Como alterar dados da reserva?',
      answer: 'Para alterar dados da reserva, acesse sua conta e clique em "Editar Reserva". Algumas alterações podem estar sujeitas a taxas conforme nossa política.',
      keywords: ['alterar', 'dados', 'reserva', 'editar', 'modificar'],
      confidence: 87.3,
      usage_count: 89,
      last_updated: '2025-01-12T11:45:00Z',
      approved: true,
      source: 'learned'
    }
  ])

  const [sessions] = useState<ChatSession[]>([
    {
      id: '1',
      userId: 'user_123',
      userName: 'João Silva',
      startTime: '2025-01-15T14:30:00Z',
      status: 'active',
      messageCount: 8,
      resolution: 'pending',
      topic: 'Cancelamento de reserva',
      tags: ['cancelamento', 'urgente'],
      satisfaction: 4
    },
    {
      id: '2',
      userId: 'user_456',
      userName: 'Maria Santos',
      startTime: '2025-01-15T13:15:00Z',
      endTime: '2025-01-15T13:45:00Z',
      status: 'completed',
      messageCount: 12,
      resolution: 'resolved',
      topic: 'Dúvidas sobre pagamento',
      tags: ['pagamento', 'cartão'],
      satisfaction: 5
    },
    {
      id: '3',
      userId: 'user_789',
      userName: 'Carlos Oliveira',
      startTime: '2025-01-15T12:00:00Z',
      endTime: '2025-01-15T12:30:00Z',
      status: 'transferred',
      messageCount: 15,
      resolution: 'escalated',
      topic: 'Problema técnico complexo',
      tags: ['técnico', 'escalado'],
      assignedAgent: 'Ana Costa'
    }
  ])

  const [analytics] = useState<BotAnalytics>({
    total_conversations: 1247,
    active_sessions: 12,
    avg_response_time: 1.2,
    resolution_rate: 87.3,
    satisfaction_score: 4.2,
    top_intents: [
      { intent: 'cancelamento', count: 145 },
      { intent: 'informações_produto', count: 132 },
      { intent: 'suporte_pagamento', count: 98 },
      { intent: 'alteração_reserva', count: 76 },
      { intent: 'horário_funcionamento', count: 54 }
    ],
    hourly_volume: [
      { hour: 8, messages: 45 }, { hour: 9, messages: 78 }, { hour: 10, messages: 92 },
      { hour: 11, messages: 87 }, { hour: 12, messages: 65 }, { hour: 13, messages: 58 },
      { hour: 14, messages: 89 }, { hour: 15, messages: 95 }, { hour: 16, messages: 102 },
      { hour: 17, messages: 76 }, { hour: 18, messages: 34 }
    ],
    daily_stats: [
      { date: '2025-01-10', conversations: 89, resolved: 76, escalated: 13 },
      { date: '2025-01-11', conversations: 92, resolved: 81, escalated: 11 },
      { date: '2025-01-12', conversations: 87, resolved: 78, escalated: 9 },
      { date: '2025-01-13', conversations: 95, resolved: 85, escalated: 10 },
      { date: '2025-01-14', conversations: 103, resolved: 92, escalated: 11 },
      { date: '2025-01-15', conversations: 78, resolved: 68, escalated: 10 }
    ]
  })

  // Mensagens iniciais do chat
  useEffect(() => {
    setMessages([
      {
        id: '1',
        type: 'bot',
        content: 'Olá! Sou o assistente virtual da Reservei Viagens. Como posso ajudá-lo hoje?',
        timestamp: new Date().toISOString(),
        sessionId: 'demo_session',
        suggestions: ['Cancelar reserva', 'Formas de pagamento', 'Horário de funcionamento', 'Falar com atendente']
      }
    ])
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSendMessage = async () => {
    if (!currentMessage.trim()) return

    // Adicionar mensagem do usuário
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: currentMessage,
      timestamp: new Date().toISOString(),
      sessionId: 'demo_session'
    }

    setMessages(prev => [...prev, userMessage])
    setCurrentMessage('')
    setIsTyping(true)

    // Simular processamento do bot
    setTimeout(() => {
      const botResponse = generateBotResponse(currentMessage)
      setMessages(prev => [...prev, botResponse])
      setIsTyping(false)
    }, 1500)
  }

  const generateBotResponse = (userMessage: string): ChatMessage => {
    const lowerMessage = userMessage.toLowerCase()
    
    // Buscar resposta na base de conhecimento
    const knowledge = botKnowledge.find(k => 
      k.keywords.some(keyword => lowerMessage.includes(keyword.toLowerCase()))
    )

    if (knowledge) {
      return {
        id: Date.now().toString(),
        type: 'bot',
        content: knowledge.answer,
        timestamp: new Date().toISOString(),
        sessionId: 'demo_session',
        intent: knowledge.category.toLowerCase(),
        confidence: knowledge.confidence,
        suggestions: ['Isso resolveu sua dúvida?', 'Precisa de mais alguma coisa?', 'Falar com atendente']
      }
    }

    // Resposta padrão
    return {
      id: Date.now().toString(),
      type: 'bot',
      content: 'Entendo sua dúvida. Deixe-me conectá-lo com um de nossos atendentes especializados que poderá ajudá-lo melhor. Um momento, por favor.',
      timestamp: new Date().toISOString(),
      sessionId: 'demo_session',
      intent: 'fallback',
      confidence: 70,
      suggestions: ['Aguardar atendente', 'Tentar outra pergunta', 'Ver FAQ']
    }
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR')
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'completed': return 'bg-blue-100 text-blue-800'
      case 'transferred': return 'bg-yellow-100 text-yellow-800'
      case 'abandoned': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getResolutionColor = (resolution: string) => {
    switch (resolution) {
      case 'resolved': return 'bg-green-100 text-green-800'
      case 'escalated': return 'bg-yellow-100 text-yellow-800'
      case 'pending': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const KnowledgeForm: React.FC = () => (
    <form className="grid gap-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="knowledge-category">Categoria</Label>
          <Select>
            <SelectTrigger title="Selecionar categoria">
              <SelectValue placeholder="Selecionar categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="produtos">Produtos</SelectItem>
              <SelectItem value="suporte">Suporte</SelectItem>
              <SelectItem value="pagamento">Pagamento</SelectItem>
              <SelectItem value="conta">Conta</SelectItem>
              <SelectItem value="geral">Geral</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="confidence">Nível de Confiança (%)</Label>
          <Input 
            id="confidence"
            type="number" 
            placeholder="95"
            min="0"
            max="100"
            title="Nível de confiança da resposta"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="question">Pergunta/Intenção</Label>
        <Input 
          id="question"
          placeholder="Como cancelar minha reserva?"
          title="Pergunta ou intenção do usuário"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="answer">Resposta</Label>
        <Textarea 
          id="answer"
          placeholder="Para cancelar sua reserva..."
          title="Resposta que o bot deve dar"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="keywords">Palavras-chave (separadas por vírgula)</Label>
        <Input 
          id="keywords"
          placeholder="cancelar, reserva, reembolso, política"
          title="Palavras-chave que identificam esta intenção"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="source">Fonte</Label>
        <Select>
          <SelectTrigger title="Selecionar fonte">
            <SelectValue placeholder="Selecionar fonte" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="manual">Manual</SelectItem>
            <SelectItem value="learned">Aprendido</SelectItem>
            <SelectItem value="imported">Importado</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </form>
  )

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Chatbot Inteligente</h1>
          <p className="text-gray-600">Sistema de atendimento automatizado com IA</p>
        </div>
        <div className="flex space-x-2">
          <Dialog open={isKnowledgeModalOpen} onOpenChange={setIsKnowledgeModalOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Conhecimento
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Adicionar Conhecimento ao Bot</DialogTitle>
                <DialogDescription>
                  Ensine o bot a responder novas perguntas
                </DialogDescription>
              </DialogHeader>
              <KnowledgeForm />
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsKnowledgeModalOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={() => setIsKnowledgeModalOpen(false)}>
                  Adicionar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Button variant="outline">
            <Settings className="w-4 h-4 mr-2" />
            Configurações
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="chat">Chat Demo</TabsTrigger>
          <TabsTrigger value="sessions">Sessões</TabsTrigger>
          <TabsTrigger value="knowledge">Base de Conhecimento</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="training">Treinamento</TabsTrigger>
          <TabsTrigger value="settings">Configurações</TabsTrigger>
        </TabsList>

        <TabsContent value="chat" className="space-y-6">
          {/* Chat Interface */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card className="h-[600px] flex flex-col">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Bot className="h-5 w-5 text-blue-600" />
                    <span>Chat com Assistente Virtual</span>
                    <Badge variant="outline" className="ml-auto">Demo</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  {/* Messages Area */}
                  <div className="flex-1 overflow-y-auto mb-4 space-y-4 max-h-96">
                    {messages.map((message) => (
                      <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`flex items-start space-x-2 max-w-xs lg:max-w-md ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${message.type === 'user' ? 'bg-blue-500' : 'bg-green-500'}`}>
                            {message.type === 'user' ? (
                              <User className="w-4 h-4 text-white" />
                            ) : (
                              <Bot className="w-4 h-4 text-white" />
                            )}
                          </div>
                          <div className={`p-3 rounded-lg ${message.type === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}>
                            <p className="text-sm">{message.content}</p>
                            {message.confidence && (
                              <p className="text-xs opacity-75 mt-1">
                                Confiança: {message.confidence}%
                              </p>
                            )}
                            {message.suggestions && (
                              <div className="mt-2 space-y-1">
                                {message.suggestions.map((suggestion, index) => (
                                  <button
                                    key={index}
                                    className="block w-full text-left text-xs p-1 bg-white bg-opacity-20 rounded hover:bg-opacity-30 transition-colors"
                                    onClick={() => setCurrentMessage(suggestion)}
                                  >
                                    {suggestion}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {isTyping && (
                      <div className="flex justify-start">
                        <div className="flex items-start space-x-2">
                          <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                            <Bot className="w-4 h-4 text-white" />
                          </div>
                          <div className="bg-gray-100 p-3 rounded-lg">
                            <div className="flex space-x-1">
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Input Area */}
                  <div className="flex space-x-2">
                    <Input
                      value={currentMessage}
                      onChange={(e) => setCurrentMessage(e.target.value)}
                      placeholder="Digite sua mensagem..."
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      className="flex-1"
                      title="Digite sua mensagem"
                    />
                    <Button onClick={handleSendMessage} disabled={!currentMessage.trim()}>
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Chat Stats Sidebar */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Estatísticas em Tempo Real</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Sessões Ativas</span>
                      <Badge variant="outline">{analytics.active_sessions}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Tempo Médio de Resposta</span>
                      <Badge variant="outline">{analytics.avg_response_time}s</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Taxa de Resolução</span>
                      <Badge variant="outline">{analytics.resolution_rate}%</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Satisfação Média</span>
                      <Badge variant="outline">{analytics.satisfaction_score}/5</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Principais Intenções</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analytics.top_intents.slice(0, 5).map((intent, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm capitalize">{intent.intent.replace('_', ' ')}</span>
                        <div className="flex items-center space-x-2">
                          <Progress value={(intent.count / analytics.top_intents[0].count) * 100} className="w-16 h-2" />
                          <Badge variant="outline" className="text-xs">{intent.count}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="sessions" className="space-y-6">
          {/* Sessões Ativas */}
          <Card>
            <CardHeader>
              <CardTitle>Sessões de Chat</CardTitle>
              <CardDescription>Conversas ativas e histórico recente</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sessions.map((session) => (
                  <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <User className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium">{session.userName}</p>
                        <p className="text-sm text-gray-600">{session.topic}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="text-xs text-gray-500">
                            Iniciado: {formatDateTime(session.startTime)}
                          </span>
                          {session.endTime && (
                            <span className="text-xs text-gray-500">
                              • Finalizado: {formatDateTime(session.endTime)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="text-right space-y-2">
                      <div className="flex items-center space-x-2">
                        <Badge className={getStatusColor(session.status)}>
                          {session.status}
                        </Badge>
                        <Badge className={getResolutionColor(session.resolution)}>
                          {session.resolution}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-600">
                        {session.messageCount} mensagens
                      </div>
                      {session.satisfaction && (
                        <div className="flex items-center space-x-1">
                          <span className="text-xs text-gray-500">Satisfação:</span>
                          <span className="text-xs font-medium">{session.satisfaction}/5</span>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col space-y-1 ml-4">
                      <div className="flex flex-wrap gap-1">
                        {session.tags.map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <div className="flex space-x-1">
                        <Button variant="outline" size="sm">
                          <Eye className="h-3 w-3 mr-1" />
                          Ver Chat
                        </Button>
                        {session.status === 'active' && (
                          <Button size="sm">
                            <MessageSquare className="h-3 w-3 mr-1" />
                            Entrar
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="knowledge" className="space-y-6">
          {/* Base de Conhecimento */}
          <Card>
            <CardHeader>
              <CardTitle>Base de Conhecimento do Bot</CardTitle>
              <CardDescription>Perguntas e respostas que o bot conhece</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {botKnowledge.map((knowledge) => (
                  <div key={knowledge.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold">{knowledge.question}</h4>
                        <p className="text-gray-600 mt-2">{knowledge.answer}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">
                          {knowledge.confidence}% confiança
                        </Badge>
                        <Badge variant="outline" className={
                          knowledge.source === 'manual' ? 'border-blue-300 text-blue-700' :
                          knowledge.source === 'learned' ? 'border-green-300 text-green-700' :
                          'border-purple-300 text-purple-700'
                        }>
                          {knowledge.source}
                        </Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                      <div>
                        <p className="text-sm text-gray-600">Categoria</p>
                        <p className="font-medium">{knowledge.category}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Uso</p>
                        <p className="font-medium">{knowledge.usage_count} vezes</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Atualizado</p>
                        <p className="text-sm">{formatDateTime(knowledge.last_updated)}</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-600 mb-2">Palavras-chave:</p>
                        <div className="flex flex-wrap gap-2">
                          {knowledge.keywords.map((keyword, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {keyword}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t">
                        <div className="flex items-center space-x-2">
                          {knowledge.approved ? (
                            <Badge className="bg-green-100 text-green-800">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Aprovado
                            </Badge>
                          ) : (
                            <Badge className="bg-yellow-100 text-yellow-800">
                              <Clock className="h-3 w-3 mr-1" />
                              Pendente
                            </Badge>
                          )}
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            <Edit className="h-3 w-3 mr-1" />
                            Editar
                          </Button>
                          <Button variant="outline" size="sm">
                            <Play className="h-3 w-3 mr-1" />
                            Testar
                          </Button>
                          <Button variant="outline" size="sm">
                            <Trash2 className="h-3 w-3 mr-1" />
                            Remover
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          {/* Analytics Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Conversas</CardTitle>
                <MessageSquare className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {analytics.total_conversations.toLocaleString()}
                </div>
                <p className="text-xs text-gray-600">
                  +12% vs mês anterior
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Taxa de Resolução</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {analytics.resolution_rate}%
                </div>
                <p className="text-xs text-gray-600">
                  +5% vs mês anterior
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tempo de Resposta</CardTitle>
                <Clock className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">
                  {analytics.avg_response_time}s
                </div>
                <p className="text-xs text-gray-600">
                  -0.3s vs mês anterior
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Satisfação</CardTitle>
                <ThumbsUp className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {analytics.satisfaction_score}/5
                </div>
                <p className="text-xs text-gray-600">
                  +0.2 vs mês anterior
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Volume por Hora */}
          <Card>
            <CardHeader>
              <CardTitle>Volume de Mensagens por Hora</CardTitle>
              <CardDescription>Distribuição do volume ao longo do dia</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={analytics.hourly_volume}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="messages" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} name="Mensagens" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Conversas Diárias */}
            <Card>
              <CardHeader>
                <CardTitle>Conversas Diárias</CardTitle>
                <CardDescription>Evolução das conversas nos últimos dias</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={analytics.daily_stats}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="resolved" fill="#10b981" name="Resolvidas" />
                    <Bar dataKey="escalated" fill="#f59e0b" name="Escaladas" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Top Intenções */}
            <Card>
              <CardHeader>
                <CardTitle>Principais Intenções</CardTitle>
                <CardDescription>Assuntos mais discutidos</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={analytics.top_intents}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="count"
                      label={({ intent, count }) => `${intent}: ${count}`}
                    >
                      {analytics.top_intents.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={`hsl(${index * 45}, 70%, 60%)`} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="training" className="space-y-6">
          {/* Treinamento do Bot */}
          <Card>
            <CardHeader>
              <CardTitle>Treinamento e Melhorias</CardTitle>
              <CardDescription>Ferramentas para melhorar a performance do bot</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  {
                    title: 'Conversas Não Resolvidas',
                    description: 'Analise conversas que precisaram de escalação',
                    icon: AlertTriangle,
                    color: 'bg-red-500',
                    count: 23
                  },
                  {
                    title: 'Feedback Negativo',
                    description: 'Conversas com baixa satisfação',
                    icon: ThumbsDown,
                    color: 'bg-orange-500',
                    count: 8
                  },
                  {
                    title: 'Intenções Não Identificadas',
                    description: 'Mensagens que o bot não entendeu',
                    icon: HelpCircle,
                    color: 'bg-purple-500',
                    count: 15
                  },
                  {
                    title: 'Sugestões de Melhoria',
                    description: 'Otimizações recomendadas pela IA',
                    icon: Lightbulb,
                    color: 'bg-green-500',
                    count: 6
                  }
                ].map((item, index) => {
                  const IconComponent = item.icon
                  return (
                    <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-center space-x-4 mb-4">
                          <div className={`p-3 rounded-lg ${item.color}`}>
                            <IconComponent className="h-6 w-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold">{item.title}</h3>
                            <p className="text-sm text-gray-600">{item.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <Badge variant="outline">{item.count} itens</Badge>
                          <Button size="sm" variant="outline">
                            <Eye className="w-3 h-3 mr-1" />
                            Analisar
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Ações de Treinamento */}
          <Card>
            <CardHeader>
              <CardTitle>Ações de Treinamento</CardTitle>
              <CardDescription>Ferramentas para melhorar o bot</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button className="h-20 flex flex-col items-center justify-center space-y-2">
                  <Upload className="w-6 h-6" />
                  <span>Importar FAQ</span>
                </Button>
                <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2">
                  <RefreshCw className="w-6 h-6" />
                  <span>Retreinar Modelo</span>
                </Button>
                <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2">
                  <BarChart3 className="w-6 h-6" />
                  <span>Teste A/B</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          {/* Configurações do Bot */}
          <Card>
            <CardHeader>
              <CardTitle>Configurações do Chatbot</CardTitle>
              <CardDescription>Ajustes de comportamento e personalização</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="bot-name">Nome do Bot</Label>
                    <Input 
                      id="bot-name"
                      defaultValue="Assistente Virtual"
                      title="Nome que aparece no chat"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confidence-threshold">Limite de Confiança (%)</Label>
                    <Input 
                      id="confidence-threshold"
                      type="number" 
                      defaultValue="80"
                      min="0"
                      max="100"
                      title="Confiança mínima para resposta automática"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="welcome-message">Mensagem de Boas-vindas</Label>
                  <Textarea 
                    id="welcome-message"
                    defaultValue="Olá! Sou o assistente virtual da Reservei Viagens. Como posso ajudá-lo hoje?"
                    title="Primeira mensagem que o usuário vê"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fallback-message">Mensagem de Fallback</Label>
                  <Textarea 
                    id="fallback-message"
                    defaultValue="Desculpe, não entendi sua pergunta. Deixe-me conectá-lo com um atendente."
                    title="Mensagem quando o bot não entende"
                  />
                </div>

                <div className="space-y-4">
                  <Label>Comportamento</Label>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <input 
                        type="checkbox" 
                        id="auto-learn"
                        defaultChecked
                        className="rounded border-gray-300"
                        title="Aprender automaticamente com conversas"
                      />
                      <Label htmlFor="auto-learn">Aprendizado automático</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input 
                        type="checkbox" 
                        id="escalate-complex"
                        defaultChecked
                        className="rounded border-gray-300"
                        title="Escalar automaticamente perguntas complexas"
                      />
                      <Label htmlFor="escalate-complex">Escalação automática para casos complexos</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input 
                        type="checkbox" 
                        id="collect-feedback"
                        defaultChecked
                        className="rounded border-gray-300"
                        title="Coletar feedback após cada conversa"
                      />
                      <Label htmlFor="collect-feedback">Coletar feedback dos usuários</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input 
                        type="checkbox" 
                        id="typing-indicator"
                        defaultChecked
                        className="rounded border-gray-300"
                        title="Mostrar indicador de digitação"
                      />
                      <Label htmlFor="typing-indicator">Indicador de digitação</Label>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <Label>Horário de Funcionamento</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="start-time">Início</Label>
                      <Input 
                        id="start-time"
                        type="time"
                        defaultValue="08:00"
                        title="Horário de início do atendimento"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="end-time">Fim</Label>
                      <Input 
                        id="end-time"
                        type="time"
                        defaultValue="18:00"
                        title="Horário de fim do atendimento"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex space-x-4">
                  <Button>Salvar Configurações</Button>
                  <Button variant="outline">Restaurar Padrões</Button>
                  <Button variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Exportar Config
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default ChatbotAI
