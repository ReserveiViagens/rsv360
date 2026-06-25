'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { setTokens } from '@/lib/auth-interceptor';
import { Loader2 } from 'lucide-react';

export default function SsoCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState('');

  useEffect(() => {
    const code = searchParams?.get('code')?.trim();
    const returnPath = searchParams?.get('return') || '/lab';
    const safeReturn = returnPath.startsWith('/') ? returnPath : '/lab';

    if (!code) {
      setError('Código SSO ausente.');
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const response = await fetch('/api/auth/sso/exchange', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code }),
        });
        const result = await response.json();

        if (cancelled) return;

        if (!result.success) {
          setError(result.error || 'Não foi possível concluir o login único.');
          return;
        }

        const data = result.data;
        if (data?.requires_2fa && data?.temp_token) {
          const params = new URLSearchParams({
            temp_token: data.temp_token,
            redirect: data.return_url || safeReturn,
          });
          router.replace(`/login?${params.toString()}`);
          return;
        }

        if (data?.access_token && data?.refresh_token) {
          setTokens(data.access_token, data.refresh_token);
          router.replace(data.return_url || safeReturn);
          return;
        }

        setError('Resposta de autenticação incompleta.');
      } catch {
        if (!cancelled) {
          setError('Erro de rede ao validar SSO.');
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [router, searchParams]);

  if (error) {
    return (
      <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-4 px-4 text-center">
        <h1 className="text-xl font-semibold">Login único</h1>
        <p className="text-sm text-muted-foreground">{error}</p>
        <a href="/login" className="text-sm text-primary underline">
          Voltar ao login
        </a>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-3 px-4 text-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-sm text-muted-foreground">Conectando ao Marketing Lab…</p>
    </main>
  );
}
