/**
 * PÁGINA: RESERVA - Página principal de reservas
 * Redireciona para busca de hotéis ou exibe fluxo de reserva
 */

'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Users, Search } from 'lucide-react';
import Link from 'next/link';

export default function BookingPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Fazer uma Reserva</h1>
        <p className="text-muted-foreground text-lg">
          Encontre as melhores opções de hospedagem e reserve com facilidade
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              Buscar Hotéis
            </CardTitle>
            <CardDescription>
              Explore nossa seleção de hotéis e encontre a hospedagem ideal
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/hoteis">
              <Button className="w-full">Buscar Hotéis</Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Busca Avançada
            </CardTitle>
            <CardDescription>
              Use filtros detalhados para encontrar exatamente o que procura
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/hoteis/busca/completa">
              <Button variant="outline" className="w-full">Busca Completa</Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Pagar Depois
            </CardTitle>
            <CardDescription>
              Reserve agora e pague depois. Ideal para planejamento com antecedência
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/booking/pay-later">
              <Button variant="secondary" className="w-full md:w-auto">
                Ver opção Pagar Depois
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 text-center">
        <p className="text-muted-foreground text-sm">
          Já tem uma reserva?{' '}
          <Link href="/minhas-reservas" className="text-primary font-medium hover:underline">
            Acesse Minhas Reservas
          </Link>
        </p>
      </div>
    </div>
  );
}
