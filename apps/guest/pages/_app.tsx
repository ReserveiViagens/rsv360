/**
 * RSV360 PMS/CRM — Reservei Viagens
 * Copyright (c) 2024-2026 Reservei Viagens LTDA. Todos os direitos reservados.
 * Desenvolvido por Douglas P. Figueiredo <douglas@reserveiviagens.com.br>
 * @author Douglas P. Figueiredo
 * @license UNLICENSED
 */
import type { AppProps } from 'next/app';
import Head from 'next/head';
import { useRouter } from 'next/router';
import '../styles/globals.css';
import { CookieConsent } from '@shared/components/CookieConsent';
import { MetadataBoot } from '@shared/components/MetadataBoot';
import { SEOHead } from '@shared/components/SEOHead';
import { QueryProvider } from '@/lib/query-client';
import { AuthProvider } from '@/lib/auth';
import { GuestLayout } from '@/components/GuestLayout';

const publicRoutes = new Set([
  '/login',
  '/politica-de-privacidade',
  '/politica-de-cookies',
  '/termos-de-uso',
  '/404',
]);

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const isPublicRoute = publicRoutes.has(router.pathname);

  const page = <Component {...pageProps} />;

  return (
    <>
      <Head>
        <SEOHead
          title="Portal do Hóspede RSV360"
          description="Acesse sua estadia, check-in, solicitações e mensagens no portal privado da Reservei Viagens."
          url={`https://www.reserveiviagens.com.br${router.pathname}`}
          noIndex
          siteName="RSV360 Guest"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#0f172a" />
      </Head>
      <MetadataBoot />
      <QueryProvider>
        <AuthProvider>
          {isPublicRoute ? page : <GuestLayout>{page}</GuestLayout>}
        </AuthProvider>
      </QueryProvider>
      <CookieConsent />
    </>
  );
}
