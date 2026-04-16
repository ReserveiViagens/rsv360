'use client'

type ErrorProps = {
  error: Error & { digest?: string }
  reset: () => void
}

export default function Error({ reset }: ErrorProps) {
  return (
    <main className="min-h-screen flex items-center justify-center bg-white px-6">
      <div className="max-w-md text-center space-y-4">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-600">RSV360</p>
        <h1 className="text-3xl font-bold text-gray-900">Erro interno</h1>
        <p className="text-gray-600">
          Ocorreu um erro inesperado. Tente novamente em instantes.
        </p>
        <button
          type="button"
          onClick={() => reset()}
          className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Tentar novamente
        </button>
      </div>
    </main>
  )
}

export const dynamic = 'force-dynamic'
