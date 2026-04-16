import type { NextPageContext } from 'next'

type ErrorPageProps = {
  statusCode?: number
}

export default function ErrorPage({ statusCode }: ErrorPageProps) {
  const code = statusCode ?? 500

  return (
    <main className="min-h-screen flex items-center justify-center bg-white px-6">
      <div className="max-w-md text-center space-y-4">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-600">RSV360</p>
        <h1 className="text-3xl font-bold text-gray-900">
          {code === 404 ? 'Página não encontrada' : 'Erro interno'}
        </h1>
        <p className="text-gray-600">
          {code === 404
            ? 'A página que você tentou acessar não existe ou foi movida.'
            : 'Ocorreu um erro inesperado. Tente novamente em instantes.'}
        </p>
      </div>
    </main>
  )
}

ErrorPage.getInitialProps = ({ res, err }: NextPageContext) => {
  const statusCode = res?.statusCode || err?.statusCode || 500
  return { statusCode }
}
