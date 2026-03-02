import Head from 'next/head'
import ProtectedRoute from '../src/components/ProtectedRoute'
import { useEffect, useState } from 'react'

type AnalyticsStatus = {
  service: string
  status: string
  version: string
  endpoints: string[]
}

type AnalyticsData = {
  message?: string
  data?: any[]
}

export default function AnalyticsCompletePage() {
  const [status, setStatus] = useState<AnalyticsStatus | null>(null)
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const base = process.env.NEXT_PUBLIC_ANALYTICS_URL || 'http://127.0.0.1:5024'
    async function load() {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 10000)
      const headers = { Accept: 'application/json' }

      try {
        setLoading(true)
        setError(null)

        // Carregar status com fallback (/api/status -> /health)
        const statusPromise = (async () => {
          try {
            const resp = await fetch(`${base}/api/status`, { headers, signal: controller.signal })
            if (!resp.ok) throw new Error(`Status ${resp.status}`)
            return await resp.json()
          } catch {
            const resp2 = await fetch(`${base}/health`, { headers, signal: controller.signal })
            if (!resp2.ok) throw new Error(`Status ${resp2.status}`)
            const data = await resp2.json().catch(() => ({} as any))
            return {
              service: 'analytics',
              status: data?.status || 'unknown',
              version: data?.version || 'n/a',
              endpoints: ['/analytics/', '/api/status', '/health']
            } as AnalyticsStatus
          }
        })()

        // Carregar dados com fallback (/analytics/ -> /)
        const analyticsPromise = (async () => {
          try {
            const resp = await fetch(`${base}/analytics/`, { headers, signal: controller.signal })
            if (!resp.ok) throw new Error(`Status ${resp.status}`)
            return await resp.json()
          } catch {
            const resp2 = await fetch(`${base}/`, { headers, signal: controller.signal })
            if (!resp2.ok) throw new Error(`Status ${resp2.status}`)
            return await resp2.json().catch(() => ({ message: 'OK', data: [] }))
          }
        })()

        const [stResult, anResult] = await Promise.allSettled([statusPromise, analyticsPromise])
        if (stResult.status === 'fulfilled') setStatus(stResult.value as AnalyticsStatus)
        if (anResult.status === 'fulfilled') setAnalytics(anResult.value as AnalyticsData)

        if (stResult.status === 'rejected' && anResult.status === 'rejected') {
          throw new Error('Falha ao carregar status e dados de analytics')
        }
      } catch (e: any) {
        setError(e?.message || 'Falha ao carregar analytics')
      } finally {
        clearTimeout(timeout)
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <ProtectedRoute>
      <>
        <Head>
          <title>Analytics (Completo) - RSV 360</title>
        </Head>
        <div className="p-6 space-y-4">
          <h1 className="text-2xl font-semibold">Analytics (Completo)</h1>

          {loading && (
            <div className="text-gray-500">Carregando dados de analytics...</div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded">{error}</div>
          )}

          {status && (
            <div className="bg-white rounded border p-4">
              <h2 className="text-lg font-medium mb-2">Status do Serviço</h2>
              <dl className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center space-x-1"><dt className="text-gray-500">Serviço:</dt><dd>{status.service}</dd></div>
                <div className="flex items-center space-x-1"><dt className="text-gray-500">Versão:</dt><dd>{status.version}</dd></div>
                <div className="flex items-center space-x-1"><dt className="text-gray-500">Status:</dt><dd>{status.status}</dd></div>
                <div className="flex items-center space-x-1"><dt className="text-gray-500">Endpoints:</dt><dd>{status.endpoints?.join(', ')}</dd></div>
              </dl>
            </div>
          )}

          {analytics && (
            <div className="bg-white rounded border p-4">
              <h2 className="text-lg font-medium mb-2">Dados (amostra)</h2>
              <pre className="text-xs bg-gray-50 p-3 rounded overflow-auto">
                {JSON.stringify(analytics, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </>
    </ProtectedRoute>
  )
}
