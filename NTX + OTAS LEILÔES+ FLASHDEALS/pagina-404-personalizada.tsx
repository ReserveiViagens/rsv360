// pages/404.tsx - Página 404 Personalizada

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function NotFound() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(10);
  const [isAutoRedirect, setIsAutoRedirect] = useState(false);

  useEffect(() => {
    // Auto-redirect após 10 segundos
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setIsAutoRedirect(true);
          router.push('/');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router]);

  const handleGoHome = () => {
    router.push('/');
  };

  const handleGoBack = () => {
    router.back();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        
        {/* Animação 404 */}
        <div className="mb-8">
          <div className="relative">
            {/* Círculo de fundo animado */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-200 to-blue-100 rounded-full blur-2xl opacity-30 animate-pulse"></div>
            
            {/* Número 404 */}
            <div className="relative z-10">
              <h1 className="text-9xl font-black text-transparent bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text mb-4">
                404
              </h1>
              
              {/* Ícone de erro com animação */}
              <div className="mb-6">
                <div className="inline-block relative">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-r from-blue-100 to-blue-50 flex items-center justify-center mb-4">
                    <span className="text-5xl">🧭</span>
                  </div>
                  <div className="absolute top-0 right-0 w-6 h-6 rounded-full bg-red-400 animate-bounce"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Título */}
        <h2 className="text-3xl font-bold text-gray-900 mb-3">
          Página Não Encontrada
        </h2>

        {/* Descrição */}
        <p className="text-gray-600 text-lg mb-6">
          Oops! Parece que você se perdeu. A página que você está procurando não existe ou foi removida.
        </p>

        {/* Sugestões */}
        <div className="bg-blue-50 rounded-lg p-4 mb-8 border border-blue-200">
          <p className="text-sm text-gray-700 mb-3 font-semibold">
            O que você pode fazer:
          </p>
          <ul className="text-sm text-gray-600 space-y-2">
            <li>✓ Verificar a URL da página</li>
            <li>✓ Usar a busca para encontrar o conteúdo</li>
            <li>✓ Voltar à página anterior</li>
            <li>✓ Ir para a página inicial</li>
          </ul>
        </div>

        {/* Botões */}
        <div className="flex flex-col gap-3 mb-6">
          {/* Botão Principal - Ir para Home */}
          <button
            onClick={handleGoHome}
            className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-blue-600 transition-all transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
          >
            ← Voltar para Home
          </button>

          {/* Botão Secundário - Voltar */}
          <button
            onClick={handleGoBack}
            className="w-full px-6 py-3 bg-white text-blue-600 rounded-lg font-semibold border-2 border-blue-600 hover:bg-blue-50 transition-all transform hover:scale-105 active:scale-95"
          >
            ← Voltar à Página Anterior
          </button>
        </div>

        {/* Links de Navegação Rápida */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <Link
            href="/hoteis"
            className="p-3 bg-gradient-to-br from-purple-100 to-purple-50 rounded-lg hover:from-purple-200 hover:to-purple-100 transition text-gray-700 font-medium text-sm"
          >
            🏨 Hotéis
          </Link>
          <Link
            href="/atracoes"
            className="p-3 bg-gradient-to-br from-yellow-100 to-yellow-50 rounded-lg hover:from-yellow-200 hover:to-yellow-100 transition text-gray-700 font-medium text-sm"
          >
            🎡 Atrações
          </Link>
          <Link
            href="/parks"
            className="p-3 bg-gradient-to-br from-green-100 to-green-50 rounded-lg hover:from-green-200 hover:to-green-100 transition text-gray-700 font-medium text-sm"
          >
            🎢 Parques
          </Link>
          <Link
            href="/leiloes"
            className="p-3 bg-gradient-to-br from-pink-100 to-pink-50 rounded-lg hover:from-pink-200 hover:to-pink-100 transition text-gray-700 font-medium text-sm"
          >
            🎯 Leilões
          </Link>
        </div>

        {/* Auto-redirect countdown */}
        <div className="bg-gray-100 rounded-lg p-4">
          {isAutoRedirect ? (
            <p className="text-gray-700 font-semibold animate-pulse">
              Redirecionando... ✨
            </p>
          ) : (
            <p className="text-gray-600 text-sm">
              Redirecionando automaticamente em{' '}
              <span className="font-bold text-blue-600">{countdown}s</span>
            </p>
          )}
        </div>

        {/* Contato */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-gray-600 text-sm mb-3">
            Ainda não conseguiu encontrar o que procurava?
          </p>
          <div className="flex flex-col gap-2 text-sm">
            <Link
              href="/contact"
              className="text-blue-600 hover:underline font-semibold"
            >
              📧 Entre em contato conosco
            </Link>
            <Link
              href="/faq"
              className="text-blue-600 hover:underline font-semibold"
            >
              ❓ Consulte nossas FAQ
            </Link>
          </div>
        </div>
      </div>

      {/* Elemento decorativo flutuante */}
      <div className="fixed bottom-4 right-4 opacity-20 pointer-events-none">
        <div className="w-32 h-32 rounded-full bg-blue-400 blur-3xl animate-pulse"></div>
      </div>
      
      <div className="fixed top-20 left-4 opacity-20 pointer-events-none">
        <div className="w-40 h-40 rounded-full bg-blue-300 blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>
    </div>
  );
}

/* ============================================ */
/* CSS Adicional (adicionar ao tailwind.css)   */
/* ============================================ */

/*
@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
}

@keyframes gradient-shift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

.animate-float {
  animation: float 3s ease-in-out infinite;
}

.animate-gradient-shift {
  animation: gradient-shift 3s ease infinite;
}
*/
