'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, Home, RefreshCw } from 'lucide-react'
import Link from 'next/link'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Error:', error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center gap-2 text-red-600 mb-2">
            <AlertCircle className="w-5 h-5" />
            <CardTitle>Algo deu errado!</CardTitle>
          </div>
          <CardDescription>
            Ocorreu um erro ao carregar esta página. Por favor, tente novamente.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {(() => {
            const msg = String(error?.message ?? error?.toString?.() ?? 'Erro desconhecido');
            return msg ? (
              <div className="bg-red-50 border border-red-200 rounded p-3 mb-4">
                <p className="text-sm text-red-800 font-mono">{msg}</p>
              </div>
            ) : null;
          })()}
          {process.env.NODE_ENV === 'development' && (() => {
            const stack = error?.stack ? String(error.stack) : '';
            return stack ? (
              <details className="mt-4">
                <summary className="text-sm text-gray-600 cursor-pointer">Detalhes técnicos (dev)</summary>
                <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto max-h-40">
                  {stack}
                </pre>
              </details>
            ) : null;
          })()}
        </CardContent>
        <CardFooter className="flex gap-2">
          <Button onClick={reset} variant="default" className="flex-1">
            <RefreshCw className="w-4 h-4 mr-2" />
            Tentar novamente
          </Button>
          <Link href="/">
            <Button variant="outline" className="flex-1">
              <Home className="w-4 h-4 mr-2" />
              Ir para Home
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}

