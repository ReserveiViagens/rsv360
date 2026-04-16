/**
 * RSV360 PMS/CRM — Reservei Viagens
 * Copyright (c) 2024-2026 Reservei Viagens LTDA. Todos os direitos reservados.
 * Desenvolvido por Douglas P. Figueiredo <douglas@reserveiviagens.com.br>
 * @author Douglas P. Figueiredo
 * @license UNLICENSED
 */
import Link from 'next/link';
import { SEOHead } from '@shared/components/SEOHead';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function TermsPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-4xl items-center px-4 py-10">
      <SEOHead
        title="Termos de Uso | RSV360 Guest"
        description="Termos de uso do portal do hóspede RSV360."
        url="https://www.reserveiviagens.com.br/termos-de-uso"
        noIndex
      />
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Termos de Uso</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-slate-600">
          <p>Em construção. Os termos oficiais serão publicados nesta página.</p>
          <Button asChild>
            <Link href="/login">Voltar ao login</Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
