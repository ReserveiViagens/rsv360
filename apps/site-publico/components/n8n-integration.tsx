"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Settings, Zap, MessageSquare, BarChart3, Webhook, Calendar, Users } from "lucide-react"

interface N8NConfig {
  webhookUrl: string
  status: "connected" | "disconnected" | "error"
}

interface ChatMetrics {
  totalChats: number
  activeChats: number
  resolvedChats: number
  averageResponseTime: number
  customerSatisfaction: number
  calendarEvents: number
  bookingConversions: number
}

export default function N8NIntegration() {
  const [config, setConfig] = useState<N8NConfig>({
    webhookUrl: process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL || "",
    status: "disconnected",
  })

  const [metrics, setMetrics] = useState<ChatMetrics>({
    totalChats: 0,
    activeChats: 0,
    resolvedChats: 0,
    averageResponseTime: 0,
    customerSatisfaction: 0,
    calendarEvents: 0,
    bookingConversions: 0,
  })

  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    checkConnection()
    loadMetrics()
  }, [])

  const checkConnection = async () => {
    try {
      setIsLoading(true)

      const response = await fetch("/api/n8n", {
        method: "GET",
      })

      if (response.ok) {
        const data = await response.json()
        setConfig((prev) => ({
          ...prev,
          status: data.status === "connected" ? "connected" : data.status === "error" ? "error" : "disconnected",
        }))
      } else {
        setConfig((prev) => ({ ...prev, status: "error" }))
      }
    } catch (error) {
      console.log("N8N connection error:", error)
      setConfig((prev) => ({ ...prev, status: "error" }))
    } finally {
      setIsLoading(false)
    }
  }

  const loadMetrics = async () => {
    try {
      // Simulate loading metrics from n8n
      const mockMetrics: ChatMetrics = {
        totalChats: 156,
        activeChats: 8,
        resolvedChats: 148,
        averageResponseTime: 2.3,
        customerSatisfaction: 4.8,
        calendarEvents: 42,
        bookingConversions: 28,
      }
      setMetrics(mockMetrics)
    } catch (error) {
      console.error("Error loading metrics:", error)
    }
  }

  const testWebhook = async () => {
    try {
      setIsLoading(true)

      const testPayload = {
        type: "test",
        message: "Test connection from Reservei Viagens",
        timestamp: new Date().toISOString(),
        bookingData: {
          checkIn: "2025-02-01",
          checkOut: "2025-02-05",
          adults: 2,
          children: 1,
          babies: 0,
        },
        calendarData: {
          title: "Test Event - Reservei Viagens",
          description: "Test calendar integration",
          startDate: "2025-02-01",
          endDate: "2025-02-05",
        },
      }

      const response = await fetch("/api/n8n", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(testPayload),
      })

      if (response.ok) {
        alert("✅ Webhook testado com sucesso! Verifique o Google Agenda para o evento de teste.")
        setConfig((prev) => ({ ...prev, status: "connected" }))
      } else {
        alert(`❌ Erro ao testar webhook: ${response.status} ${response.statusText}`)
        setConfig((prev) => ({ ...prev, status: "error" }))
      }
    } catch (error) {
      alert(`❌ Erro de conexão: ${error.message}`)
      setConfig((prev) => ({ ...prev, status: "error" }))
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "connected":
        return "bg-green-100 text-green-800 border-green-200"
      case "error":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "connected":
        return "🟢"
      case "error":
        return "🔴"
      default:
        return "⚪"
    }
  }

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-blue-600" />
              <h3 className="font-bold text-lg">Integração N8N + Google Agenda</h3>
            </div>
            <Badge className={getStatusColor(config.status)}>
              {getStatusIcon(config.status)} {config.status.toUpperCase()}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Webhook URL:</label>
              <p className="text-xs text-gray-600 bg-gray-50 p-2 rounded mt-1 font-mono">
                {config.webhookUrl || "Configurado via variáveis de ambiente"}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Status da API:</label>
              <p className="text-xs text-gray-600 mt-1">
                {config.status === "connected"
                  ? "✅ Conectado - Chat + Google Agenda funcionando"
                  : config.status === "error"
                    ? "❌ Erro de conexão"
                    : "⚪ Aguardando configuração"}
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={checkConnection} disabled={isLoading} size="sm" variant="outline">
              <Settings className="w-4 h-4 mr-2" />
              {isLoading ? "Verificando..." : "Verificar Conexão"}
            </Button>
            <Button onClick={testWebhook} disabled={isLoading} size="sm">
              <Webhook className="w-4 h-4 mr-2" />
              Testar Webhook + Agenda
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Chat Metrics */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-green-600" />
            <h3 className="font-bold text-lg">Métricas do Chat + Agendamentos</h3>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{metrics.totalChats}</div>
              <div className="text-xs text-gray-600">Total de Chats</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{metrics.activeChats}</div>
              <div className="text-xs text-gray-600">Chats Ativos</div>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{metrics.calendarEvents}</div>
              <div className="text-xs text-gray-600">Eventos Agendados</div>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{metrics.bookingConversions}</div>
              <div className="text-xs text-gray-600">Conversões</div>
            </div>
            <div className="text-center p-3 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">{metrics.averageResponseTime}min</div>
              <div className="text-xs text-gray-600">Tempo Médio</div>
            </div>
            <div className="text-center p-3 bg-pink-50 rounded-lg">
              <div className="text-2xl font-bold text-pink-600">{metrics.customerSatisfaction}</div>
              <div className="text-xs text-gray-600">Satisfação</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Workflow Configuration */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-purple-600" />
            <h3 className="font-bold text-lg">Workflow Chat + Google Agenda</h3>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold text-sm mb-2">🔄 Fluxo Automático Completo:</h4>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>• Recebe mensagem do chat</li>
              <li>• Coleta dados de viagem (datas, pessoas)</li>
              <li>• Processa com IA (ChatGPT/Claude)</li>
              <li>• Cria evento no Google Agenda</li>
              <li>• Notifica consultores via email/Slack</li>
              <li>• Integra com WhatsApp Business</li>
              <li>• Cria tickets no CRM</li>
              <li>• Gera relatórios automáticos</li>
            </ul>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold text-sm mb-2">📊 Integrações Ativas:</h4>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="text-xs">
                Google Calendar API
              </Badge>
              <Badge variant="outline" className="text-xs">
                WhatsApp API
              </Badge>
              <Badge variant="outline" className="text-xs">
                OpenAI GPT
              </Badge>
              <Badge variant="outline" className="text-xs">
                Google Sheets
              </Badge>
              <Badge variant="outline" className="text-xs">
                Email SMTP
              </Badge>
              <Badge variant="outline" className="text-xs">
                Slack Notifications
              </Badge>
            </div>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="font-semibold text-sm mb-2">🎯 Automações Configuradas:</h4>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>✅ Resposta automática inicial</li>
              <li>✅ Coleta de dados de viagem</li>
              <li>✅ Criação de eventos no Google Agenda</li>
              <li>✅ Notificação para consultores</li>
              <li>✅ Transferência para WhatsApp</li>
              <li>✅ Classificação de intenção</li>
              <li>✅ Follow-up automático</li>
              <li>✅ Relatório diário por email</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Google Calendar Integration */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-lg">Integração Google Agenda</h3>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold text-sm mb-2">📅 Funcionalidades do Google Agenda:</h4>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>• Criação automática de eventos para cada reserva</li>
              <li>• Sincronização com agenda dos consultores</li>
              <li>• Notificações automáticas por email</li>
              <li>• Lembretes configuráveis</li>
              <li>• Compartilhamento com equipe</li>
              <li>• Integração com Google Meet para reuniões</li>
            </ul>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="font-semibold text-sm mb-2">📋 Dados Incluídos no Evento:</h4>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>• Nome e contato do cliente</li>
              <li>• Datas de check-in e check-out</li>
              <li>• Número de pessoas (adultos, crianças, bebês)</li>
              <li>• Contexto da conversa</li>
              <li>• Interesses manifestados</li>
              <li>• Status da reserva</li>
            </ul>
          </div>

          <div className="bg-yellow-50 p-4 rounded-lg">
            <h4 className="font-semibold text-sm mb-2">⚙️ Configurações Recomendadas:</h4>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>• Agenda compartilhada: reservei.consultores@gmail.com</li>
              <li>• Fuso horário: America/Sao_Paulo (Brasília)</li>
              <li>• Lembretes: 24h e 2h antes do check-in</li>
              <li>• Duração padrão: período completo da estadia</li>
              <li>• Cor do evento: Azul (reservas) / Verde (confirmadas)</li>
              <li>• Convites automáticos para equipe de vendas</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* API Documentation */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-gray-600" />
            <h3 className="font-bold text-lg">Documentação da API</h3>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-xs overflow-x-auto">
            <div className="mb-2 text-gray-400">// Exemplo de payload com dados de agendamento</div>
            <pre>{`{
  "sessionId": "session_123456",
  "message": "Quero fazer uma reserva",
  "messageType": "booking_data",
  "userInfo": {
    "name": "João Silva",
    "email": "joao@email.com",
    "phone": "(64) 99999-9999"
  },
  "bookingData": {
    "checkIn": "2025-02-15",
    "checkOut": "2025-02-20",
    "adults": 2,
    "children": 1,
    "babies": 0,
    "totalDays": 5,
    "interests": ["hotel", "parque aquático"]
  },
  "calendarData": {
    "title": "Reserva Caldas Novas - João Silva (3 pessoas)",
    "description": "Reserva via Chat Serena...",
    "startDate": "2025-02-15",
    "endDate": "2025-02-20",
    "attendees": ["joao@email.com"]
  },
  "timestamp": "2025-01-20T15:30:00Z",
  "source": "website_chat"
}`}</pre>
          </div>

          <div className="bg-gray-900 text-blue-400 p-4 rounded-lg font-mono text-xs overflow-x-auto">
            <div className="mb-2 text-gray-400">// Exemplo de resposta com confirmação de agendamento</div>
            <pre>{`{
  "reply": "✅ Agendamento criado com sucesso!",
  "isHuman": false,
  "type": "calendar_confirmation",
  "metadata": {
    "calendarEventId": "evt_abc123",
    "calendarUrl": "https://calendar.google.com/...",
    "consultorNotified": true,
    "nextAction": "whatsapp_transfer"
  },
  "calendarEvent": {
    "id": "evt_abc123",
    "status": "confirmed",
    "htmlLink": "https://calendar.google.com/..."
  }
}`}</pre>
          </div>
        </CardContent>
      </Card>

      {/* Setup Instructions */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-orange-600" />
            <h3 className="font-bold text-lg">Instruções de Configuração</h3>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-orange-50 p-4 rounded-lg">
            <h4 className="font-semibold text-sm mb-2">🔧 Passos para Configuração:</h4>
            <ol className="text-xs text-gray-600 space-y-1 list-decimal list-inside">
              <li>Criar conta de serviço no Google Cloud Console</li>
              <li>Ativar Google Calendar API</li>
              <li>Baixar credenciais JSON da conta de serviço</li>
              <li>Configurar N8N com node do Google Calendar</li>
              <li>Criar agenda compartilhada para consultores</li>
              <li>Configurar webhook no N8N para receber dados do chat</li>
              <li>Testar integração com evento de exemplo</li>
              <li>Configurar notificações por email/Slack</li>
            </ol>
          </div>

          <div className="bg-red-50 p-4 rounded-lg">
            <h4 className="font-semibold text-sm mb-2">⚠️ Variáveis de Ambiente Necessárias:</h4>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>• N8N_WEBHOOK_URL (servidor)</li>
              <li>• N8N_API_KEY (servidor)</li>
              <li>• GOOGLE_CALENDAR_CREDENTIALS (JSON)</li>
              <li>• GOOGLE_CALENDAR_ID</li>
              <li>• SMTP_CONFIG (para notificações)</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
