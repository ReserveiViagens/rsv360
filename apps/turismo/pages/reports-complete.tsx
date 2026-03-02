import Head from 'next/head'
import ProtectedRoute from '../src/components/ProtectedRoute'
import { useEffect, useState } from 'react'

type ReportsMetrics = {
  total_reports: number
  completed_reports: number
  failed_reports: number
  scheduled_reports: number
  success_rate: number
  reports_by_category: Record<string, number>
}

type Template = { id: string; name: string; category: string; description: string; format: string }

export default function ReportsCompletePage() {
  const [metrics, setMetrics] = useState<ReportsMetrics | null>(null)
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const base = process.env.NEXT_PUBLIC_REPORTS_URL || 'http://127.0.0.1:5025'
    async function load() {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 10000)
      const headers = { Accept: 'application/json' }

      try {
        setLoading(true)
        setError(null)

        const metricsPromise = (async () => {
          try {
            const resp = await fetch(`${base}/reports/metrics/`, { headers, signal: controller.signal })
            if (!resp.ok) throw new Error(`Status ${resp.status}`)
            return await resp.json()
          } catch {
            // Fallback simples para não quebrar UI
            return {
              total_reports: 0,
              completed_reports: 0,
              failed_reports: 0,
              scheduled_reports: 0,
              success_rate: 0,
              reports_by_category: {}
            } as ReportsMetrics
          }
        })()

        const templatesPromise = (async () => {
          try {
            const resp = await fetch(`${base}/templates/`, { headers, signal: controller.signal })
            if (!resp.ok) throw new Error(`Status ${resp.status}`)
            return await resp.json()
          } catch {
            return [] as Template[]
          }
        })()

        const [mResult, tResult] = await Promise.allSettled([metricsPromise, templatesPromise])
        if (mResult.status === 'fulfilled') setMetrics(mResult.value as ReportsMetrics)
        if (tResult.status === 'fulfilled') setTemplates(tResult.value as Template[])

        if (mResult.status === 'rejected' && tResult.status === 'rejected') {
          throw new Error('Falha ao carregar métricas e templates de relatórios')
        }
      } catch (e: any) {
        setError(e?.message || 'Falha ao carregar relatórios')
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
          <title>Relatórios (Completo) - RSV 360</title>
        </Head>
        <div className="p-6 space-y-4">
          <h1 className="text-2xl font-semibold">Relatórios (Completo)</h1>

          {loading && <div className="text-gray-500">Carregando dados de relatórios...</div>}
          {error && <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded">{error}</div>}

          {metrics && (
            <div className="bg-white rounded border p-4">
              <h2 className="text-lg font-medium mb-2">Métricas</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="p-3 bg-gray-50 rounded"><div className="text-gray-500">Total</div><div className="text-xl font-semibold">{metrics.total_reports}</div></div>
                <div className="p-3 bg-green-50 rounded"><div className="text-gray-500">Concluídos</div><div className="text-xl font-semibold">{metrics.completed_reports}</div></div>
                <div className="p-3 bg-red-50 rounded"><div className="text-gray-500">Falhas</div><div className="text-xl font-semibold">{metrics.failed_reports}</div></div>
                <div className="p-3 bg-blue-50 rounded"><div className="text-gray-500">Agendados</div><div className="text-xl font-semibold">{metrics.scheduled_reports}</div></div>
              </div>
              <div className="mt-3 text-sm"><span className="text-gray-500">Sucesso:</span> {metrics.success_rate.toFixed(2)}%</div>
              <div className="mt-3">
                <h3 className="font-medium mb-1">Por categoria</h3>
                <pre className="text-xs bg-gray-50 p-3 rounded overflow-auto">{JSON.stringify(metrics.reports_by_category, null, 2)}</pre>
              </div>
            </div>
          )}

          {templates?.length > 0 && (
            <div className="bg-white rounded border p-4">
              <h2 className="text-lg font-medium mb-2">Templates disponíveis</h2>
              <ul className="list-disc pl-5 text-sm space-y-1">
                {templates.map(t => (
                  <li key={t.id}><span className="font-medium">{t.name}</span> — <span className="text-gray-500">{t.category}</span> ({t.format})</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </>
    </ProtectedRoute>
  )
}
