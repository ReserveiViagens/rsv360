/**
 * RSV360 PMS/CRM — Reservei Viagens
 * Copyright (c) 2024-2026 Reservei Viagens LTDA. Todos os direitos reservados.
 * Desenvolvido por Douglas P. Figueiredo <douglas@reserveiviagens.com.br>
 * @author Douglas P. Figueiredo
 * @license UNLICENSED
 */
import type { GetServerSideProps } from 'next';
import { useEffect, useState, type FormEvent } from 'react';
import { useRouter } from 'next/router';
import { ShieldCheck, Sparkles, ArrowRight } from 'lucide-react';
import { SEOHead } from '@shared/components/SEOHead';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/use-auth';

export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated, login, verify } = useAuth();
  const [email, setEmail] = useState('');
  const [reservationCode, setReservationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (router.query.token && typeof router.query.token === 'string') {
      setReservationCode(router.query.token);
    }
  }, [router.query.token]);

  useEffect(() => {
    if (isAuthenticated) {
      void router.replace('/');
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    const token = router.query.token;
    if (!token || typeof token !== 'string' || isAuthenticated) return;

    setLoading(true);
    verify(token)
      .then(() => router.replace('/'))
      .catch(() => {
        setLoading(false);
      });
  }, [isAuthenticated, router, verify, router.query.token]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login({ email, reservationCode });
      await router.replace('/');
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : 'Não foi possível acessar o portal.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-slate-50 px-4 py-10">
      <SEOHead
        title="Acesso ao Portal do Hóspede | RSV360"
        description="Acesse seu portal privado RSV360 para check-in, reservas, serviços e mensagens."
        url="https://www.reserveiviagens.com.br/login"
        noIndex
        siteName="RSV360 Guest"
      />
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <section className="space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white px-4 py-2 text-sm font-medium text-brand-900 shadow-sm">
            <ShieldCheck className="h-4 w-4" />
            Portal privado do hóspede
          </div>
          <div className="max-w-2xl">
            <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
              Sua estadia na palma da mão.
            </h1>
            <p className="mt-4 text-lg leading-8 text-slate-600">
              Acompanhe sua reserva, faça check-in digital, solicite serviços e fale com a recepção com segurança.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { title: 'Check-in digital', text: 'Pré-preenchido e rápido.' },
              { title: 'Solicitações', text: 'Toalhas, limpeza, transfer e mais.' },
              { title: 'Mensagens', text: 'Converse com a recepção em tempo real.' },
            ].map((item) => (
              <Card key={item.title}>
                <CardContent>
                  <div className="flex items-start gap-3">
                    <div className="rounded-2xl bg-brand-50 p-2 text-brand-900">
                      <Sparkles className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{item.title}</p>
                      <p className="text-sm text-slate-500">{item.text}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <p className="text-sm text-slate-500">
            Dica: se você recebeu um link com token, cole-o no campo de código da reserva para entrar diretamente.
          </p>
        </section>

        <section>
          <Card className="mx-auto max-w-xl">
            <CardHeader>
              <CardTitle>Acessar portal</CardTitle>
              <CardDescription>Use o e-mail da reserva e o código/token enviado pela hospedagem.</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="hospede@exemplo.com"
                    autoComplete="email"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reservationCode">Código da reserva / token</Label>
                  <Input
                    id="reservationCode"
                    value={reservationCode}
                    onChange={(event) => setReservationCode(event.target.value)}
                    placeholder="Cole aqui o token do portal"
                    autoComplete="one-time-code"
                    required
                  />
                </div>
                {error ? <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p> : null}
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Entrando...' : 'Acessar Portal'}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </form>

              <div className="mt-6 flex flex-col gap-2 text-center text-sm text-slate-500">
              <a href="https://www.reserveiviagens.com.br" target="_blank" rel="noreferrer" className="font-medium text-brand-900">
                Voltar para o site principal
              </a>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  return { props: {} };
};
