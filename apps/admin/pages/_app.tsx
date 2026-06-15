import type { AppProps } from 'next/app';
import Head from 'next/head';
import { QueryProvider } from '@/src/lib/query-client';
import { AuthSessionProviders } from '@/lib/auth/AuthSessionProviders';
import { AppShell } from '@/components/AppShell';
import '@/styles/globals.css';
import { SEOHead } from '../../shared/components/SEOHead';
import { MetadataBoot } from '../../shared/components/MetadataBoot';
import { CookieConsent } from '../../shared/components/CookieConsent';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <SEOHead
          title="RSV360 Admin"
          description="Painel administrativo oficial da RSV360, com módulos operacionais, comerciais e de compliance."
          url="https://www.reserveiviagens.com.br/admin"
          noIndex
          siteName="RSV360 Admin"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <MetadataBoot />
      <QueryProvider>
        <AuthSessionProviders>
          <AppShell>
            <Component {...pageProps} />
          </AppShell>
        </AuthSessionProviders>
      </QueryProvider>
      <CookieConsent />
    </>
  );
}
