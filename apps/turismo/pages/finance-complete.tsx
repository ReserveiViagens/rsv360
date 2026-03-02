import Head from 'next/head'
import ProtectedRoute from '../src/components/ProtectedRoute'

export default function FinanceCompletePage() {
  return (
    <ProtectedRoute>
      <>
        <Head>
          <title>Financeiro (Completo) - RSV 360</title>
        </Head>
        <div className="p-6">
          <h1 className="text-2xl font-semibold mb-2">Financeiro (Completo)</h1>
          <p className="text-gray-600">KPIs financeiros, fluxo de caixa e faturamento serão integrados.</p>
        </div>
      </>
    </ProtectedRoute>
  )
}
