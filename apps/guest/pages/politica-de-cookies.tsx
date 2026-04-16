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

export default function CookiePolicyPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-4xl items-center px-4 py-10">
      <SEOHead
        title="Política de Cookies | RSV360 Guest"
        description="Política de cookies do portal do hóspede RSV360."
        url="https://www.reserveiviagens.com.br/politica-de-cookies"
        noIndex
      />
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Política de Cookies</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-slate-600">
          <p>Em construção. O banner de consentimento LGPD permanece ativo no portal.</p>
          <Button asChild>
            <Link href="/login">Voltar ao login</Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
