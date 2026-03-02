/**
 * ✅ PÁGINA: DOCUMENTAÇÃO API (Swagger UI)
 * Visualização interativa da documentação OpenAPI
 */

'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, ExternalLink } from '@/lib/lucide-icons';

export default function APIDocsPage() {
  const [swaggerUrl, setSwaggerUrl] = useState<string>('');

  useEffect(() => {
    // URL do Swagger JSON
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    setSwaggerUrl(`${baseUrl}/api/docs`);
  }, []);

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <FileText className="w-8 h-8" />
          Documentação da API
        </h1>
        <p className="text-muted-foreground mt-2">
          Documentação completa e interativa da API RSV Gen 2
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Swagger UI</CardTitle>
          <CardDescription>
            Documentação interativa da API com OpenAPI 3.0
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Button asChild>
              <a
                href={`https://petstore.swagger.io/?url=${encodeURIComponent(swaggerUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Abrir no Swagger UI
              </a>
            </Button>
            <Button variant="outline" asChild>
              <a href="/api/docs" target="_blank" rel="noopener noreferrer">
                <FileText className="w-4 h-4 mr-2" />
                Ver JSON
              </a>
            </Button>
          </div>

          <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
              Como usar:
            </p>
            <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
              <li>1. Clique em "Abrir no Swagger UI" para visualização interativa</li>
              <li>2. Use "Try it out" para testar endpoints diretamente</li>
              <li>3. Autentique-se usando o botão "Authorize" no topo</li>
              <li>4. Explore todos os endpoints disponíveis</li>
            </ul>
          </div>

          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-4">Endpoints Principais:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">Autenticação</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>POST /api/auth/login</li>
                  <li>POST /api/auth/register</li>
                  <li>POST /api/auth/refresh</li>
                </ul>
              </div>
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">Reservas</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>GET /api/bookings</li>
                  <li>POST /api/bookings</li>
                  <li>POST /api/bookings/[code]/cancel</li>
                </ul>
              </div>
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">Viagens em Grupo</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>GET /api/wishlists</li>
                  <li>POST /api/wishlists</li>
                  <li>POST /api/split-payments</li>
                </ul>
              </div>
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">Smart Pricing</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>POST /api/pricing/smart</li>
                  <li>GET /api/pricing/smart?action=history</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

