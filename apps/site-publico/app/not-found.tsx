import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Home, Search } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <CardTitle className="text-4xl font-bold mb-2">404</CardTitle>
          <CardDescription className="text-lg">
            Página não encontrada
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">
            A página que você está procurando não existe ou foi movida.
          </p>
        </CardContent>
        <CardFooter className="flex gap-2 justify-center">
          <Link href="/">
            <Button variant="default">
              <Home className="w-4 h-4 mr-2" />
              Ir para Home
            </Button>
          </Link>
          <Link href="/hoteis">
            <Button variant="outline">
              <Search className="w-4 h-4 mr-2" />
              Buscar Hotéis
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}

