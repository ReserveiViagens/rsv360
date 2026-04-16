/**
 * RSV360 PMS/CRM — Reservei Viagens
 * Copyright (c) 2024-2026 Reservei Viagens LTDA. Todos os direitos reservados.
 * Desenvolvido por Douglas P. Figueiredo <douglas@reserveiviagens.com.br>
 * @author Douglas P. Figueiredo
 * @license UNLICENSED
 */
import Link from 'next/link';
import { SEOHead } from '@shared/components/SEOHead';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function NotFoundPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <SEOHead
        title="Página não encontrada | RSV360 Guest"
        description="A página solicitada não foi encontrada no portal do hóspede."
        url="https://www.reserveiviagens.com.br/login"
        noIndex
      />
      <Card className="w-full max-w-lg">
        <CardContent className="text-center">
          <p className="text-sm uppercase tracking-[0.2em] text-slate-400">404</p>
          <h1 className="mt-3 text-2xl font-semibold text-slate-900">Página não encontrada</h1>
          <p className="mt-2 text-sm text-slate-500">O endereço que você tentou acessar não está disponível.</p>
          <div className="mt-6">
            <Button asChild>
              <Link href="/">Voltar ao início</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
