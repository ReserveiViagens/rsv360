"use client"

import { useState, useEffect } from "react"
import { MessageSquare, Send, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { getToken } from "@/lib/auth"
import Link from "next/link"
import LoadingSpinner from "@/components/ui/loading-spinner"
import FadeIn from "@/components/ui/fade-in"
import { useToast } from "@/components/providers/toast-wrapper"

export default function MensagensPage() {
  const [conversations, setConversations] = useState<any[]>([])
  const [selectedUser, setSelectedUser] = useState<number | null>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const toast = useToast()

  useEffect(() => {
    loadConversations()
  }, [])

  useEffect(() => {
    if (selectedUser) {
      loadMessages(selectedUser)
      const interval = setInterval(() => loadMessages(selectedUser), 5000)
      return () => clearInterval(interval)
    }
  }, [selectedUser])

  const loadConversations = async () => {
    try {
      const token = getToken()
      const response = await fetch('/api/messages', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const result = await response.json()
      if (result.success) {
        setConversations(result.data)
      }
    } catch (error) {
      console.error('Erro ao carregar conversas:', error)
    }
  }

  const loadMessages = async (userId: number) => {
    try {
      const token = getToken()
      const response = await fetch(`/api/messages?with_user_id=${userId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const result = await response.json()
      if (result.success) {
        setMessages(result.data)
      }
    } catch (error) {
      console.error('Erro ao carregar mensagens:', error)
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedUser) return

    setLoading(true)
    try {
      const token = getToken()
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          to_user_id: selectedUser,
          message: newMessage
        })
      })
      const result = await response.json()
      if (result.success) {
        setNewMessage("")
        loadMessages(selectedUser)
        loadConversations()
        toast.success('Mensagem enviada com sucesso!')
      } else {
        toast.error('Erro ao enviar mensagem')
      }
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error)
      toast.error('Erro ao enviar mensagem')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/perfil">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Mensagens</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Lista de conversas */}
          <Card>
            <CardContent className="p-0">
              <div className="p-4 border-b">
                <h2 className="font-semibold">Conversas</h2>
              </div>
              <div className="max-h-[600px] overflow-y-auto">
                {conversations.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    <MessageSquare className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    <p>Nenhuma conversa</p>
                  </div>
                ) : (
                  conversations.map((conv) => (
                    <div
                      key={conv.other_user_id}
                      onClick={() => setSelectedUser(conv.other_user_id)}
                      className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${
                        selectedUser === conv.other_user_id ? 'bg-blue-50' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{conv.other_user_name}</p>
                          <p className="text-sm text-gray-500 truncate">{conv.message}</p>
                        </div>
                        {conv.unread_count > 0 && (
                          <Badge className="bg-blue-600">{conv.unread_count}</Badge>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Chat */}
          <div className="md:col-span-2">
            {selectedUser ? (
              <Card className="h-[600px] flex flex-col">
                <CardContent className="p-0 flex flex-col h-full">
                  <div className="p-4 border-b">
                    <h2 className="font-semibold">
                      {conversations.find(c => c.other_user_id === selectedUser)?.other_user_name}
                    </h2>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.from_user_id === selectedUser ? 'justify-start' : 'justify-end'}`}
                      >
                        <div
                          className={`max-w-[70%] p-3 rounded-lg ${
                            msg.from_user_id === selectedUser
                              ? 'bg-gray-200'
                              : 'bg-blue-600 text-white'
                          }`}
                        >
                          <p>{msg.message}</p>
                          <p className={`text-xs mt-1 ${
                            msg.from_user_id === selectedUser ? 'text-gray-500' : 'text-blue-100'
                          }`}>
                            {new Date(msg.created_at).toLocaleTimeString('pt-BR', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="p-4 border-t flex gap-2">
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                      placeholder="Digite sua mensagem..."
                    />
                    <Button onClick={sendMessage} disabled={loading || !newMessage.trim()}>
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="h-[600px] flex items-center justify-center">
                <CardContent className="text-center text-gray-500">
                  <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p>Selecione uma conversa para começar</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

