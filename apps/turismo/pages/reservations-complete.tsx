import Head from 'next/head'
import ProtectedRoute from '../src/components/ProtectedRoute'

export default function ReservationsCompletePage() {
  return (
    <ProtectedRoute>
      <>
        <Head>
          <title>Reservas (Completo) - RSV 360</title>
        </Head>
        <div className="p-6">
          <h1 className="text-2xl font-semibold mb-2">Reservas (Completo)</h1>
          <p className="text-gray-600">Página em construção. CRUD completo de reservas será adicionado.</p>
        </div>
      </>
    </ProtectedRoute>
  )
}
