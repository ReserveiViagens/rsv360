import Head from 'next/head'
import ProtectedRoute from '../src/components/ProtectedRoute'

export default function ActivitiesPage() {
  return (
    <ProtectedRoute>
      <>
        <Head>
          <title>Atividades Recentes - RSV 360</title>
        </Head>
        <div className="p-6">
          <h1 className="text-2xl font-semibold mb-2">Atividades Recentes</h1>
          <p className="text-gray-600">Log de atividades recentes será exibido aqui.</p>
        </div>
      </>
    </ProtectedRoute>
  )
}
