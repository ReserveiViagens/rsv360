'use client'

import React, { useState, useEffect } from 'react'
import ProtectedRoute from '../../src/components/ProtectedRoute'
import { RefreshCw, CheckCircle, XCircle, Clock, Globe, Database } from 'lucide-react'
import { api } from '../../src/services/apiClient'

interface OTASyncLog {
  id: string
  ota_connection_id: number
  sync_type: 'availability' | 'reservations' | 'prices' | 'full'
  status: 'success' | 'error' | 'pending'
  records_synced: number
  error_message?: string
  started_at: string
  completed_at?: string
  duration_ms?: number
  ota_name?: string
}

interface OTAConnection {
  id: number
  ota_name: string
  status: 'active' | 'inactive' | 'error'
  last_sync?: string
  sync_frequency: number
  total_syncs: number
  successful_syncs: number
  failed_syncs: number
}

export default function OTASyncPage() {
  const [connections, setConnections] = useState<OTAConnection[]>([])
  const [syncLogs, setSyncLogs] = useState<OTASyncLog[]>([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState<string | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [connectionsRes, logsRes] = await Promise.all([
        api.get<any>('/api/v1/ota/connections'),
        api.get<any>('/api/v1/ota/sync-logs', { limit: 50 }),
      ])

      setConnections(
        Array.isArray(connectionsRes.data) 
          ? connectionsRes.data 
          : Array.isArray(connectionsRes) 
          ? connectionsRes 
          : []
      )

      setSyncLogs(
        Array.isArray(logsRes.data) 
          ? logsRes.data 
          : Array.isArray(logsRes) 
          ? logsRes 
          : []
      )
    } catch (error) {
      console.error('Erro ao carregar dados OTA:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSync = async (connectionId: number, syncType: string = 'full') => {
    try {
      setSyncing(`${connectionId}-${syncType}`)
      await api.post(`/api/v1/ota/connections/${connectionId}/sync`, {
        sync_type: syncType,
      })
      await loadData()
    } catch (error) {
      console.error('Erro ao sincronizar:', error)
    } finally {
      setSyncing(null)
    }
  }

  const formatDuration = (ms?: number) => {
    if (!ms) return '-'
    if (ms < 1000) return `${ms}ms`
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`
    return `${(ms / 60000).toFixed(1)}min`
  }

  return (
    <ProtectedRoute>
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Globe className="w-8 h-8 text-blue-500" />
              Sincronização OTA
            </h1>
            <p className="text-muted-foreground mt-2">
              Gerencie sincronizações com Booking.com, Expedia e outras OTAs
            </p>
          </div>
          <button
            onClick={loadData}
            disabled={loading}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 flex items-center gap-2 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </button>
        </div>

        {/* Conexões OTA */}
        <div className="bg-white rounded-lg border p-6">
          <h2 className="text-xl font-semibold mb-4">Conexões OTA</h2>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : connections.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Database className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <p>Nenhuma conexão OTA configurada</p>
              <p className="text-sm mt-2">
                Configure conexões no CMS Admin
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {connections.map((connection) => (
                <div
                  key={connection.id}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-lg">{connection.ota_name}</h3>
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        connection.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : connection.status === 'error'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {connection.status === 'active' ? 'Ativo' : connection.status === 'error' ? 'Erro' : 'Inativo'}
                    </span>
                  </div>

                  <div className="space-y-2 text-sm text-gray-600 mb-4">
                    <div className="flex justify-between">
                      <span>Última sincronização:</span>
                      <span className="font-medium">
                        {connection.last_sync
                          ? new Date(connection.last_sync).toLocaleString('pt-BR')
                          : 'Nunca'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Frequência:</span>
                      <span className="font-medium">A cada {connection.sync_frequency}min</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total de syncs:</span>
                      <span className="font-medium">{connection.total_syncs}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Sucessos:</span>
                      <span className="font-medium text-green-600">
                        {connection.successful_syncs}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Falhas:</span>
                      <span className="font-medium text-red-600">
                        {connection.failed_syncs}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleSync(connection.id, 'full')}
                      disabled={syncing === `${connection.id}-full`}
                      className="flex-1 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 text-sm"
                    >
                      {syncing === `${connection.id}-full` ? 'Sincronizando...' : 'Sincronizar'}
                    </button>
                    <button
                      onClick={() => handleSync(connection.id, 'availability')}
                      disabled={syncing === `${connection.id}-availability`}
                      className="px-3 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50 text-sm"
                      title="Sincronizar apenas disponibilidade"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Logs de Sincronização */}
        <div className="bg-white rounded-lg border p-6">
          <h2 className="text-xl font-semibold mb-4">Histórico de Sincronizações</h2>
          {syncLogs.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Clock className="w-12 h-12 mx-auto mb-2 text-gray-400" />
              <p>Nenhuma sincronização registrada</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">OTA</th>
                    <th className="text-left p-2">Tipo</th>
                    <th className="text-left p-2">Status</th>
                    <th className="text-left p-2">Registros</th>
                    <th className="text-left p-2">Duração</th>
                    <th className="text-left p-2">Iniciado</th>
                    <th className="text-left p-2">Erro</th>
                  </tr>
                </thead>
                <tbody>
                  {syncLogs.map((log) => (
                    <tr key={log.id} className="border-b hover:bg-gray-50">
                      <td className="p-2">{log.ota_name || 'N/A'}</td>
                      <td className="p-2">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                          {log.sync_type}
                        </span>
                      </td>
                      <td className="p-2">
                        {log.status === 'success' ? (
                          <span className="flex items-center gap-1 text-green-600">
                            <CheckCircle className="w-4 h-4" />
                            Sucesso
                          </span>
                        ) : log.status === 'error' ? (
                          <span className="flex items-center gap-1 text-red-600">
                            <XCircle className="w-4 h-4" />
                            Erro
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-yellow-600">
                            <Clock className="w-4 h-4" />
                            Pendente
                          </span>
                        )}
                      </td>
                      <td className="p-2">{log.records_synced || 0}</td>
                      <td className="p-2">{formatDuration(log.duration_ms)}</td>
                      <td className="p-2 text-sm text-gray-600">
                        {new Date(log.started_at).toLocaleString('pt-BR')}
                      </td>
                      <td className="p-2">
                        {log.error_message ? (
                          <span className="text-red-600 text-xs" title={log.error_message}>
                            {log.error_message.substring(0, 50)}...
                          </span>
                        ) : (
                          '-'
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  )
}
