'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Lock, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { resetPassword } from '@/lib/auth';

function RedefinirSenhaForm() {
  const searchParams = useSearchParams();
  const tokenFromUrl = searchParams?.get('token') ?? '';

  const [token, setToken] = useState(tokenFromUrl);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password.length < 8) {
      setError('A senha deve ter pelo menos 8 caracteres');
      return;
    }
    if (password !== confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }
    setIsLoading(true);
    try {
      await resetPassword({ token, password, password_confirmation: confirmPassword });
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao redefinir senha');
    } finally {
      setIsLoading(false);
    }
  };

  if (done) {
    return (
      <div className="mt-6 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800">
        Senha alterada com sucesso.{' '}
        <Link href="/login" className="font-medium underline">
          Faça login
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-4">
      {!tokenFromUrl && (
        <div>
          <Label htmlFor="token">Token do e-mail</Label>
          <Input
            id="token"
            required
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="Cole o token recebido"
            className="mt-1"
          />
        </div>
      )}
      <div>
        <Label htmlFor="password">Nova senha</Label>
        <div className="relative mt-1">
          <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <Input
            id="password"
            type="password"
            required
            minLength={8}
            className="pl-9"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
      </div>
      <div>
        <Label htmlFor="confirm">Confirmar senha</Label>
        <Input
          id="confirm"
          type="password"
          required
          minLength={8}
          className="mt-1"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? 'Salvando…' : 'Redefinir senha'}
      </Button>
    </form>
  );
}

export default function RedefinirSenhaPage() {
  return (
    <main className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-12">
      <Link
        href="/login"
        className="mb-6 inline-flex items-center text-sm text-blue-600 hover:underline"
      >
        <ArrowLeft className="mr-1 h-4 w-4" />
        Voltar ao login
      </Link>

      <h1 className="text-2xl font-bold text-slate-900">Redefinir senha</h1>
      <p className="mt-2 text-sm text-slate-600">Defina uma nova senha para sua conta.</p>

      <Suspense fallback={<p className="mt-6 text-sm text-slate-500">Carregando…</p>}>
        <RedefinirSenhaForm />
      </Suspense>
    </main>
  );
}
