'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, ArrowLeft, KeyRound, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useToast } from '@/components/providers/toast-wrapper';

export default function RecuperarSenhaPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const toast = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
        toast.success('Email de recuperação enviado! Verifique sua caixa de entrada.');
      } else {
        const errorMsg = data.error || 'Erro ao processar solicitação';
        setError(errorMsg);
        toast.error(errorMsg);
      }
    } catch (err) {
      const errorMsg = 'Erro ao conectar com o servidor';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Painel esquerdo - Branding (desktop) */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-3/5 relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 p-12 xl:p-16">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.05\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-50" />
        <div className="relative z-10 flex flex-col justify-between max-w-xl">
          <Link href="/" className="inline-flex items-center gap-2 text-white/90 hover:text-white transition-colors w-fit">
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/favicon-reservei-viagens-VVm0zxcolWbkv9Lf5Yj0PUoxLJrARl.png"
              alt="Reservei Viagens"
              width={48}
              height={48}
              className="rounded-xl bg-white/10 p-1.5"
            />
            <span className="text-xl font-bold">Reservei Viagens</span>
          </Link>
          <div className="space-y-8 mt-16">
            <div>
              <h1 className="text-4xl xl:text-5xl font-bold text-white leading-tight">
                Recupere o acesso
                <br />
                <span className="text-blue-200">à sua conta</span>
              </h1>
              <p className="mt-4 text-lg text-blue-100/90 max-w-md">
                Não se preocupe! Enviaremos instruções para redefinir sua senha de forma segura. Verifique sua caixa de entrada e spam.
              </p>
            </div>
            <div className="flex items-center gap-3 text-white/90">
              <div className="p-3 rounded-xl bg-white/10">
                <KeyRound className="w-8 h-8" />
              </div>
              <div>
                <p className="font-semibold">Processo seguro</p>
                <p className="text-sm text-blue-200/80">Link válido por tempo limitado para sua segurança</p>
              </div>
            </div>
          </div>
          <p className="text-sm text-blue-200/70 mt-8">
            © {new Date().getFullYear()} Reservei Viagens. Todos os direitos reservados.
          </p>
        </div>
      </div>

      {/* Painel direito - Formulário */}
      <div className="flex-1 flex flex-col justify-center px-4 py-8 sm:px-6 lg:px-12 xl:px-16 bg-gray-50/50 dark:bg-gray-900/50">
        {/* Header mobile */}
        <div className="lg:hidden mb-8">
          <Link href="/login" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/favicon-reservei-viagens-VVm0zxcolWbkv9Lf5Yj0PUoxLJrARl.png"
              alt="Logo"
              width={36}
              height={36}
              className="rounded-lg"
            />
            <span className="font-semibold">Reservei Viagens</span>
          </Link>
        </div>

        <div className="w-full max-w-md mx-auto">
          <div className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              Recuperar senha
            </h2>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Digite seu e-mail e enviaremos as instruções
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-gray-700 p-6 sm:p-8">
            {success ? (
              <div className="space-y-6">
                <div className="flex flex-col items-center text-center py-4">
                  <div className="p-4 rounded-full bg-green-100 dark:bg-green-900/30 mb-4">
                    <CheckCircle2 className="w-12 h-12 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    E-mail enviado!
                  </h3>
                  <p className="mt-2 text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                    Se o e-mail existir em nossa base, você receberá instruções para redefinir sua senha em alguns minutos.
                    Verifique sua caixa de entrada e a pasta de spam.
                  </p>
                </div>
                <Button asChild variant="outline" className="w-full h-11 rounded-xl">
                  <Link href="/login" className="flex items-center justify-center gap-2">
                    <ArrowLeft className="w-4 h-4" />
                    Voltar ao login
                  </Link>
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm">
                    {error}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="seu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-11 h-11 rounded-xl"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-base font-medium"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Enviando...
                    </span>
                  ) : (
                    <>
                      <Mail className="mr-2 h-5 w-5" />
                      Enviar instruções
                    </>
                  )}
                </Button>
              </form>
            )}

            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Lembrou sua senha?{' '}
                <Link href="/login" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium hover:underline">
                  Fazer login
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
