'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, Home, RefreshCw } from 'lucide-react'
import Link from 'next/link'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Global Error:', error)
  }, [error])

  return (
    <html lang="pt-BR">
      <body>
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <div className="flex items-center gap-2 text-red-600 mb-2">
                <AlertCircle className="w-5 h-5" />
                <CardTitle>Erro Crítico!</CardTitle>
              </div>
              <CardDescription>
                Ocorreu um erro crítico na aplicação. Por favor, tente novamente.
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
      </body>
    </html>
  )
}

