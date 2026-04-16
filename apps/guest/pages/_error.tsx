/**
 * RSV360 PMS/CRM — Reservei Viagens
 * Copyright (c) 2024-2026 Reservei Viagens LTDA. Todos os direitos reservados.
 * Desenvolvido por Douglas P. Figueiredo <douglas@reserveiviagens.com.br>
 * @author Douglas P. Figueiredo
 * @license UNLICENSED
 */
import type { NextPageContext } from 'next';
import Link from 'next/link';
import { SEOHead } from '@shared/components/SEOHead';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

type ErrorProps = {
  statusCode?: number;
};

export default function ErrorPage({ statusCode }: ErrorProps) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <SEOHead
        title="Erro | Portal do Hóspede RSV360"
        description="Ocorreu um erro ao carregar o portal do hóspede."
        url="https://www.reserveiviagens.com.br/login"
        noIndex
      />
      <Card className="w-full max-w-lg">
        <CardContent className="text-center">
          <p className="text-sm uppercase tracking-[0.2em] text-slate-400">RSV360</p>
          <h1 className="mt-3 text-2xl font-semibold text-slate-900">Algo não saiu como esperado</h1>
          <p className="mt-2 text-sm text-slate-500">
            {statusCode
              ? `Erro ${statusCode}. Tente novamente em instantes.`
              : 'Estamos ajustando o portal para você. Tente novamente em instantes.'}
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button asChild>
              <Link href="/">Tentar novamente</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/login">Ir para login</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}

ErrorPage.getInitialProps = ({ res, err }: NextPageContext) => {
  const statusCode = res?.statusCode || err?.statusCode || 500;
  return { statusCode };
};
