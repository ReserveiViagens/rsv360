"use client"

import { useState, useEffect } from "react"
import { Bell, Check, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getToken } from "@/lib/auth"
import Link from "next/link"
import { useToast } from "@/components/providers/toast-wrapper"
import FadeIn from "@/components/ui/fade-in"
import LoadingSpinner from "@/components/ui/loading-spinner"

export default function NotificacoesPage() {
  const [notifications, setNotifications] = useState<any[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const toast = useToast()

  useEffect(() => {
    loadNotifications()
  }, [])

  const loadNotifications = async () => {
    try {
      const token = getToken()
      const response = await fetch('/api/notifications', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const result = await response.json()
      if (result.success) {
        setNotifications(result.data)
        setUnreadCount(result.unread_count)
      }
    } catch (error) {
      console.error('Erro ao carregar notificações:', error)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (id: number) => {
    try {
      const token = getToken()
      await fetch(`/api/notifications/${id}/read`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      loadNotifications()
      toast.success('Notificação marcada como lida')
    } catch (error) {
      console.error('Erro ao marcar como lida:', error)
      toast.error('Erro ao marcar notificação como lida')
    }
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'review': return '⭐'
      case 'booking': return '📅'
      case 'message': return '💬'
      case 'update': return '🔔'
      default: return '📢'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link href="/perfil">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Bell className="w-6 h-6" />
                Notificações
              </h1>
              {unreadCount > 0 && (
                <p className="text-sm text-gray-500">{unreadCount} não lidas</p>
              )}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <FadeIn>
              <LoadingSpinner size="lg" text="Carregando notificações..." />
            </FadeIn>
          </div>
        ) : notifications.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Bell className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500">Nenhuma notificação</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {notifications.map((notif) => (
              <Card key={notif.id} className={!notif.read ? 'border-blue-500' : ''}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="text-2xl">{getIcon(notif.type)}</div>
                      <div className="flex-1">
                        <h3 className="font-semibold mb-1">{notif.title}</h3>
                        {notif.message && (
                          <p className="text-sm text-gray-600 mb-2">{notif.message}</p>
                        )}
                        <p className="text-xs text-gray-400">
                          {new Date(notif.created_at).toLocaleString('pt-BR')}
                        </p>
                        {notif.link && (
                          <Link href={notif.link} className="text-sm text-blue-600 hover:underline">
                            Ver mais →
                          </Link>
                        )}
                      </div>
                    </div>
                    {!notif.read && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => markAsRead(notif.id)}
                      >
                        <Check className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

