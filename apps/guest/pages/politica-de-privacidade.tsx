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

export default function PrivacyPolicyPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-4xl items-center px-4 py-10">
      <SEOHead
        title="Política de Privacidade | RSV360 Guest"
        description="Política de privacidade do portal do hóspede RSV360."
        url="https://www.reserveiviagens.com.br/politica-de-privacidade"
        noIndex
      />
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Política de Privacidade</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-slate-600">
          <p>Em construção. Esta página será expandida com a política formal de privacidade do portal.</p>
          <Button asChild>
            <Link href="/login">Voltar ao login</Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
