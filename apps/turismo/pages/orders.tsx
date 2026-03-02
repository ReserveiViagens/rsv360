import Head from 'next/head'
import ProtectedRoute from '../src/components/ProtectedRoute'

export default function OrdersPage() {
  return (
    <ProtectedRoute>
      <>
        <Head>
          <title>Pedidos - RSV 360</title>
        </Head>
        <div className="p-6">
          <h1 className="text-2xl font-semibold mb-2">Pedidos</h1>
          <p className="text-gray-600">Página em construção. Integração com serviços de vendas virá aqui.</p>
        </div>
      </>
    </ProtectedRoute>
  )
}
