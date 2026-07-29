'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Mail, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { requestPasswordReset } from '@/lib/auth';

export default function RecuperarSenhaPage() {
  const searchParams = useSearchParams();
  const fromParam = searchParams?.get('from') || '/login';
  const backHref =
    fromParam === '/admin/login' || fromParam.startsWith('/admin/')
      ? '/admin/login'
      : '/login';
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await requestPasswordReset(email);
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao solicitar recuperação');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-12">
      <Link
        href={backHref}
        className="mb-6 inline-flex items-center text-sm text-blue-600 hover:underline"
      >
        <ArrowLeft className="mr-1 h-4 w-4" />
        Voltar ao login
      </Link>

      <h1 className="text-2xl font-bold text-slate-900">Recuperar senha</h1>
      <p className="mt-2 text-sm text-slate-600">
        Informe seu e-mail. Se existir uma conta, enviaremos instruções.
      </p>

      {sent ? (
        <div className="mt-6 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800">
          Se o e-mail existir, você receberá instruções para redefinir sua senha.
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <Label htmlFor="email">E-mail</Label>
            <div className="relative mt-1">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input
                id="email"
                type="email"
                required
                className="pl-9"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Enviando…' : 'Enviar instruções'}
          </Button>
        </form>
      )}
    </main>
  );
}
