import Head from 'next/head'
import ProtectedRoute from '../src/components/ProtectedRoute'

export default function SettingsCompletePage() {
  return (
    <ProtectedRoute>
      <>
        <Head>
          <title>Configurações (Completo) - RSV 360</title>
        </Head>
        <div className="p-6">
          <h1 className="text-2xl font-semibold mb-2">Configurações (Completo)</h1>
          <p className="text-gray-600">Gerenciamento de preferências, usuários e integrações.</p>
        </div>
      </>
    </ProtectedRoute>
  )
}
