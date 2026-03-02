/**
 * PÁGINA: QUALIDADE - Índice de qualidade
 * Links para Dashboard e Leaderboard de qualidade
 */

'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart3, Trophy, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function QualityPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Qualidade</h1>
        <p className="text-muted-foreground text-lg">
          Métricas de qualidade, performance e ranking de hosts e acomodações
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Dashboard de Qualidade
            </CardTitle>
            <CardDescription>
              Visualize métricas de qualidade e performance dos hosts. Insira o ID do host para carregar o dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/quality/dashboard">
              <Button className="w-full">
                Acessar Dashboard
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5" />
              Ranking
            </CardTitle>
            <CardDescription>
              Confira o ranking dos melhores hosts e acomodações baseado em avaliações e métricas de qualidade.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/quality/leaderboard">
              <Button variant="outline" className="w-full">
                Ver Ranking
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
