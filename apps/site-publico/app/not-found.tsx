export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-white px-6">
      <div className="max-w-md text-center space-y-4">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-600">RSV360</p>
        <h1 className="text-3xl font-bold text-gray-900">Página não encontrada</h1>
        <p className="text-gray-600">
          A página que você tentou acessar não existe ou foi movida.
        </p>
      </div>
    </main>
  )
}

export const dynamic = 'force-dynamic'
