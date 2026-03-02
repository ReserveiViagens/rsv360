"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { MessageSquare, Users, Clock, Phone, Mail, Settings, BarChart3, Download, Search } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import N8NIntegration from "@/components/n8n-integration"

interface ChatSession {
  id: string
  customerName: string
  customerEmail: string
  customerPhone: string
  status: "active" | "waiting" | "closed"
  startTime: Date
  lastMessage: string
  messageCount: number
  agent?: string
}

export default function ChatAdminPage() {
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [selectedSession, setSelectedSession] = useState<ChatSession | null>(null)
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    // Load mock data
    const mockSessions: ChatSession[] = [
      {
        id: "session_001",
        customerName: "Maria Silva",
        customerEmail: "maria@email.com",
        customerPhone: "(64) 99999-1111",
        status: "active",
        startTime: new Date(Date.now() - 300000), // 5 minutes ago
        lastMessage: "Gostaria de informações sobre pacotes para família",
        messageCount: 8,
        agent: "Ana Costa",
      },
      {
        id: "session_002",
        customerName: "João Santos",
        customerEmail: "joao@email.com",
        customerPhone: "(64) 99999-2222",
        status: "waiting",
        startTime: new Date(Date.now() - 600000), // 10 minutes ago
        lastMessage: "Qual o preço do hotel DiRoma?",
        messageCount: 3,
      },
      {
        id: "session_003",
        customerName: "Ana Oliveira",
        customerEmail: "ana@email.com",
        customerPhone: "(64) 99999-3333",
        status: "closed",
        startTime: new Date(Date.now() - 3600000), // 1 hour ago
        lastMessage: "Obrigada! Reserva confirmada.",
        messageCount: 15,
        agent: "Carlos Lima",
      },
    ]
    setSessions(mockSessions)
  }, [])

  const filteredSessions = sessions.filter((session) => {
    const matchesStatus = filterStatus === "all" || session.status === filterStatus
    const matchesSearch =
      searchQuery === "" ||
      session.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      session.customerEmail.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesStatus && matchesSearch
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "waiting":
        return "bg-yellow-100 text-yellow-800"
      case "closed":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "active":
        return "Ativo"
      case "waiting":
        return "Aguardando"
      case "closed":
        return "Finalizado"
      default:
        return status
    }
  }

  const formatTime = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(minutes / 60)

    if (hours > 0) {
      return `${hours}h ${minutes % 60}min atrás`
    }
    return `${minutes}min atrás`
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Painel de Chat</h1>
          <p className="text-gray-600">Gerencie conversas e integrações com N8N</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
          <Button size="sm">
            <Settings className="w-4 h-4 mr-2" />
            Configurações
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Chats Ativos</p>
                <p className="text-2xl font-bold text-green-600">
                  {sessions.filter((s) => s.status === "active").length}
                </p>
              </div>
              <MessageSquare className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Aguardando</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {sessions.filter((s) => s.status === "waiting").length}
                </p>
              </div>
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Finalizados</p>
                <p className="text-2xl font-bold text-gray-600">
                  {sessions.filter((s) => s.status === "closed").length}
                </p>
              </div>
              <Users className="w-8 h-8 text-gray-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Hoje</p>
                <p className="text-2xl font-bold text-blue-600">{sessions.length}</p>
              </div>
              <BarChart3 className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="chats" className="space-y-4">
        <TabsList>
          <TabsTrigger value="chats">Conversas</TabsTrigger>
          <TabsTrigger value="n8n">Integração N8N</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="chats" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Buscar por nome ou email..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant={filterStatus === "all" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilterStatus("all")}
                  >
                    Todos
                  </Button>
                  <Button
                    variant={filterStatus === "active" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilterStatus("active")}
                  >
                    Ativos
                  </Button>
                  <Button
                    variant={filterStatus === "waiting" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilterStatus("waiting")}
                  >
                    Aguardando
                  </Button>
                  <Button
                    variant={filterStatus === "closed" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilterStatus("closed")}
                  >
                    Finalizados
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Chat Sessions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Sessions List */}
            <Card>
              <CardHeader>
                <h3 className="font-semibold">Sessões de Chat ({filteredSessions.length})</h3>
              </CardHeader>
              <CardContent className="p-0">
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {filteredSessions.map((session) => (
                    <div
                      key={session.id}
                      className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${
                        selectedSession?.id === session.id ? "bg-blue-50 border-blue-200" : ""
                      }`}
                      onClick={() => setSelectedSession(session)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{session.customerName}</h4>
                        <Badge className={getStatusColor(session.status)}>{getStatusLabel(session.status)}</Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{session.lastMessage}</p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{formatTime(session.startTime)}</span>
                        <span>{session.messageCount} mensagens</span>
                      </div>
                      {session.agent && (
                        <div className="mt-2">
                          <Badge variant="outline" className="text-xs">
                            👤 {session.agent}
                          </Badge>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Session Details */}
            <Card>
              <CardHeader>
                <h3 className="font-semibold">
                  {selectedSession ? `Detalhes - ${selectedSession.customerName}` : "Selecione uma conversa"}
                </h3>
              </CardHeader>
              <CardContent>
                {selectedSession ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700">Nome:</label>
                        <p className="text-sm">{selectedSession.customerName}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Status:</label>
                        <Badge className={getStatusColor(selectedSession.status)}>
                          {getStatusLabel(selectedSession.status)}
                        </Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700">Email:</label>
                        <p className="text-sm">{selectedSession.customerEmail}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Telefone:</label>
                        <p className="text-sm">{selectedSession.customerPhone}</p>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700">Última mensagem:</label>
                      <p className="text-sm bg-gray-50 p-2 rounded mt-1">{selectedSession.lastMessage}</p>
                    </div>

                    <div className="flex gap-2">
                      <Button size="sm" className="flex-1">
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Abrir Chat
                      </Button>
                      <Button size="sm" variant="outline">
                        <Phone className="w-4 h-4 mr-2" />
                        WhatsApp
                      </Button>
                      <Button size="sm" variant="outline">
                        <Mail className="w-4 h-4 mr-2" />
                        Email
                      </Button>
                    </div>

                    {selectedSession.status === "waiting" && (
                      <div className="bg-yellow-50 p-3 rounded-lg">
                        <p className="text-sm text-yellow-800 mb-2">⏰ Cliente aguardando resposta</p>
                        <Button size="sm" className="bg-yellow-600 hover:bg-yellow-700">
                          Assumir Conversa
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Selecione uma conversa para ver os detalhes</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="n8n">
          <N8NIntegration />
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <h3 className="font-semibold">Analytics do Chat</h3>
            </CardHeader>
            <CardContent>
              <div className="text-center text-gray-500 py-8">
                <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Relatórios e métricas em desenvolvimento</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
