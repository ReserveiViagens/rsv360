/**
 * PÁGINA: VIAGENS EM GRUPO (PT-BR)
 * Versão em português brasileiro - Listagem e funcionalidades de viagens em grupo
 */

'use client';

import { Suspense } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, DollarSign, Mail, MessageSquare, Globe, ArrowRight } from 'lucide-react';
import Link from 'next/link';

function GroupTravelContent() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Viagens em Grupo</h1>
        <p className="text-muted-foreground text-lg">
          Planeje viagens com amigos e família. Listas de desejos compartilhadas, divisão de pagamentos, convites e chat em grupo.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Heart className="w-5 h-5" />
              Listas de Desejos Compartilhadas
            </CardTitle>
            <CardDescription>
              Crie e compartilhe listas de desejos para suas viagens em grupo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/group-travel/shared-wishlist">
                Ver <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <DollarSign className="w-5 h-5" />
              Planejamento de Viagem
            </CardTitle>
            <CardDescription>
              Planeje seu roteiro e divida os custos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/group-travel/trip-planning">
                Planejar Viagem <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Mail className="w-5 h-5" />
              Convites
            </CardTitle>
            <CardDescription>
              Convide amigos para participar da sua viagem
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/viagens-grupo?tab=invitations">
                Enviar Convites <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <MessageSquare className="w-5 h-5" />
              Chat em Grupo
            </CardTitle>
            <CardDescription>
              Converse com seus companheiros de viagem
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/viagens-grupo?tab=chat">
                Abrir Chat <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Globe className="w-10 h-10 text-primary" />
              <div>
                <p className="font-semibold">Experiência Completa de Viagens em Grupo</p>
                <p className="text-sm text-muted-foreground">
                  Acesse o painel completo com listas de desejos, divisão de pagamentos e chat em grupo
                </p>
              </div>
            </div>
            <Button asChild>
              <Link href="/viagens-grupo">Ir para o Painel Completo</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function GroupTravelPage() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-8">Carregando...</div>}>
      <GroupTravelContent />
    </Suspense>
  );
}
