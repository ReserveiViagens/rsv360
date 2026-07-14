import type { AppProps } from 'next/app';
import { AuthProvider } from '../src/context/AuthContext';
import { QueryProvider } from '../src/lib/query-client';
import { InstrutorHelpWidget } from '../components/agentes/InstrutorHelpWidget';
import '../styles/globals.css';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <QueryProvider>
      <AuthProvider>
        <Component {...pageProps} />
        <InstrutorHelpWidget />
      </AuthProvider>
    </QueryProvider>
  );
}
