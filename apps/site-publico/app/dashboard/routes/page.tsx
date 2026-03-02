'use client';

import { useState } from 'react';
import { MapPin, Plus, Route, Clock, Map } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ErrorBoundary } from '@/components/ui/error-boundary';

interface RouteItem {
  id: string;
  name: string;
  description?: string;
  duration?: string;
  stops?: number;
  status?: string;
}

function RoutesPageContent() {
  const [routes, setRoutes] = useState<RouteItem[]>([]);

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Rotas e Passeios</h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1">
              Tours, percursos e experiências
            </p>
          </div>
          <Button className="w-full sm:w-auto">
            <Plus className="w-4 h-4 mr-2" />
            Nova Rota
          </Button>
        </div>

        {routes.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Route className="w-16 h-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhuma rota cadastrada</h3>
              <p className="text-muted-foreground text-center mb-4 max-w-md">
                Crie rotas de passeio, tours ou experiências para seus hóspedes.
              </p>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Cadastrar Rota
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {routes.map((r) => (
              <Card key={r.id}>
                <CardHeader className="flex flex-row items-start justify-between space-y-0">
                  <div>
                    <CardTitle className="text-base">{r.name}</CardTitle>
                    {r.description && (
                      <CardDescription>{r.description}</CardDescription>
                    )}
                  </div>
                  {r.status && (
                    <Badge variant={r.status === 'active' ? 'default' : 'secondary'}>
                      {r.status === 'active' ? 'ativo' : r.status}
                    </Badge>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    {r.duration && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {r.duration}
                      </span>
                    )}
                    {r.stops && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {r.stops} paradas
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Map className="w-4 h-4" />
              Sobre rotas
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <p>
              Rotas permitem definir passeios, tours e experiências para seus hóspedes.
              Em breve você poderá criar percursos com pontos de parada, duração e descrições.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function RoutesDashboardPage() {
  return (
    <ErrorBoundary>
      <RoutesPageContent />
    </ErrorBoundary>
  );
}
