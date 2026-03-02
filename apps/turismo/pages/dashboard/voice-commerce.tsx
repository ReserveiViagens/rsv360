'use client'

import React, { useState, useEffect } from 'react'
import ProtectedRoute from '../../src/components/ProtectedRoute'
import { Phone, TrendingUp, DollarSign, Clock, Users, BarChart3, Filter } from 'lucide-react'
import { Button } from '../../src/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../../src/components/ui/card'
import { Input } from '../../src/components/ui/input'
import { Label } from '../../src/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../src/components/ui/select'
import { Badge } from '../../src/components/ui/badge'
import { toast } from 'react-hot-toast'
import { api } from '../../src/services/apiClient'

interface VoiceSession {
  id: number;
  phone_number: string;
  customer_id?: number;
  status: 'active' | 'completed' | 'abandoned' | 'failed';
  intent?: string;
  started_at: string;
  ended_at?: string;
  duration_seconds?: number;
}

interface VoiceCall {
  id: number;
  session_id: number;
  call_sid: string;
  direction: 'inbound' | 'outbound';
  from_number: string;
  to_number: string;
  status: 'initiated' | 'ringing' | 'in-progress' | 'completed' | 'failed';
  duration_seconds?: number;
  transcription?: string;
  intent_detected?: string;
  booking_created: boolean;
  booking_id?: number;
  conversion_value?: number;
  started_at: string;
  ended_at?: string;
}

interface Interaction {
  id: number;
  call_id: number;
  turn_number: number;
  speaker: 'user' | 'assistant';
  user_input?: string;
  assistant_response?: string;
  intent?: string;
  confidence?: number;
  created_at: string;
}

export default function VoiceCommercePage() {
  const [sessions, setSessions] = useState<VoiceSession[]>([])
  const [calls, setCalls] = useState<VoiceCall[]>([])
  const [selectedCall, setSelectedCall] = useState<VoiceCall | null>(null)
  const [interactions, setInteractions] = useState<Interaction[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    period: 'last_30_days',
    status: 'all',
  })

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    if (selectedCall) {
      loadCallInteractions(selectedCall.id)
    }
  }, [selectedCall])

  const loadData = async () => {
    setLoading(true)
    try {
      // TODO: Implementar endpoints para listar sessões e chamadas
      // Por enquanto, usar dados mockados ou implementar quando disponível
      setSessions([])
      setCalls([])
    } catch (error) {
      console.error('Failed to load voice commerce data:', error)
      toast.error('Erro ao carregar dados de Voice Commerce.')
    } finally {
      setLoading(false)
    }
  }

  const loadCallInteractions = async (callId: number) => {
    try {
      const response = await api.get<Interaction[]>(`/api/v1/voice-commerce/calls/${callId}/interactions`)
      setInteractions(Array.isArray(response) ? response : [])
    } catch (error) {
      console.error('Failed to load call interactions:', error)
      toast.error('Erro ao carregar interações da chamada.')
    }
  }

  // Calcular estatísticas
  const totalCalls = calls.length
  const completedCalls = calls.filter(c => c.status === 'completed').length
  const bookingsCreated = calls.filter(c => c.booking_created).length
  const conversionRate = totalCalls > 0 ? (bookingsCreated / totalCalls) * 100 : 0
  const totalRevenue = calls.reduce((sum, c) => sum + (c.conversion_value || 0), 0)

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="container mx-auto p-6 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary inline-block"></div>
          <p className="mt-4 text-gray-600">Carregando Voice Commerce...</p>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="container mx-auto p-6 space-y-8">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Phone className="w-8 h-8 text-green-600" />
          Voice Commerce
        </h1>
        <p className="text-muted-foreground">
          Gerencie vendas por voz usando Twilio e GPT-4o.
        </p>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Chamadas</CardTitle>
              <Phone className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalCalls}</div>
              <p className="text-xs text-muted-foreground">{completedCalls} completadas</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Taxa de Conversão</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{conversionRate.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">{bookingsCreated} reservas criadas</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Receita Gerada</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R$ {totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
              <p className="text-xs text-muted-foreground">Total de conversões</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sessões Ativas</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{sessions.filter(s => s.status === 'active').length}</div>
              <p className="text-xs text-muted-foreground">Em andamento</p>
            </CardContent>
          </Card>
        </div>

        {/* Chamadas Recentes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Chamadas Recentes ({calls.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {calls.length === 0 ? (
              <p className="text-muted-foreground">Nenhuma chamada encontrada.</p>
            ) : (
              <div className="space-y-4">
                {calls.map((call) => (
                  <div
                    key={call.id}
                    className="border rounded-lg p-4 cursor-pointer hover:bg-gray-50"
                    onClick={() => setSelectedCall(call)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-semibold">Chamada #{call.id}</h3>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant={call.status === 'completed' ? 'default' : 'secondary'}>
                            {call.status}
                          </Badge>
                          {call.booking_created && (
                            <Badge variant="default">Reserva Criada</Badge>
                          )}
                          {call.intent_detected && (
                            <Badge variant="outline">{call.intent_detected}</Badge>
                          )}
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 text-sm">
                          <div>
                            <span className="font-medium">De:</span> {call.from_number}
                          </div>
                          <div>
                            <span className="font-medium">Para:</span> {call.to_number}
                          </div>
                          <div>
                            <span className="font-medium">Duração:</span> {call.duration_seconds ? `${call.duration_seconds}s` : '-'}
                          </div>
                          {call.conversion_value && (
                            <div>
                              <span className="font-medium">Valor:</span> R$ {call.conversion_value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </div>
                          )}
                        </div>
                        {call.transcription && (
                          <p className="text-sm text-muted-foreground mt-2">
                            <span className="font-medium">Transcrição:</span> {call.transcription.substring(0, 100)}...
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Detalhes da Chamada Selecionada */}
        {selectedCall && (
          <Card>
            <CardHeader>
              <CardTitle>Detalhes da Chamada #{selectedCall.id}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label>Status</Label>
                  <Badge variant={selectedCall.status === 'completed' ? 'default' : 'secondary'}>
                    {selectedCall.status}
                  </Badge>
                </div>
                {selectedCall.transcription && (
                  <div>
                    <Label>Transcrição Completa</Label>
                    <p className="text-sm bg-gray-50 p-4 rounded-lg mt-2">{selectedCall.transcription}</p>
                  </div>
                )}
                {selectedCall.intent_detected && (
                  <div>
                    <Label>Intenção Detectada</Label>
                    <p className="text-sm font-semibold mt-1">{selectedCall.intent_detected}</p>
                  </div>
                )}
                {interactions.length > 0 && (
                  <div>
                    <Label>Interações ({interactions.length})</Label>
                    <div className="space-y-2 mt-2">
                      {interactions.map((interaction) => (
                        <div key={interaction.id} className="bg-gray-50 p-3 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant={interaction.speaker === 'user' ? 'default' : 'secondary'}>
                              {interaction.speaker === 'user' ? 'Usuário' : 'Assistente'}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              Turno {interaction.turn_number}
                            </span>
                          </div>
                          {interaction.user_input && (
                            <p className="text-sm mb-1"><strong>Usuário:</strong> {interaction.user_input}</p>
                          )}
                          {interaction.assistant_response && (
                            <p className="text-sm"><strong>Assistente:</strong> {interaction.assistant_response}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </ProtectedRoute>
  )
}
