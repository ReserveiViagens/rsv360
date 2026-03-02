'use client';

import { Suspense, lazy, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { getTokens } from '@/lib/auth-interceptor';

const OnboardingWizard = lazy(() =>
  import('@/components/training/OnboardingWizard').then((m) => ({ default: m.default }))
);

function OnboardingLoading() {
  return (
    <div className="max-w-4xl mx-auto p-6 flex items-center justify-center min-h-[400px]">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-600">Carregando integração...</p>
      </div>
    </div>
  );
}

function hasAuthToken(): boolean {
  if (typeof window === 'undefined') return false;
  const { accessToken } = getTokens();
  const authToken = localStorage.getItem('auth_token');
  return !!(accessToken || authToken);
}

export default function OnboardingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    if (!hasAuthToken()) {
      const redirect = searchParams?.get('redirect') || '/onboarding';
      router.replace(`/login?redirect=${encodeURIComponent(redirect)}`);
    } else {
      setAuthChecked(true);
    }
  }, [router, searchParams]);

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🚀 RSV Integração 360
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Sistema completo de onboarding para agentes de turismo
          </p>
        </div>
        
        <ErrorBoundary>
          <Suspense fallback={<OnboardingLoading />}>
            <OnboardingWizard />
          </Suspense>
        </ErrorBoundary>
        
        <div className="mt-12 text-center">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <div className="text-3xl mb-3">🎯</div>
              <h3 className="font-semibold text-gray-900 mb-2">Treinamento Personalizado</h3>
              <p className="text-gray-600 text-sm">
                Método BMAD adaptado para cada perfil de agente
              </p>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <div className="text-3xl mb-3">📊</div>
              <h3 className="font-semibold text-gray-900 mb-2">Análises Avançadas</h3>
              <p className="text-gray-600 text-sm">
                Acompanhamento completo do progresso e performance
              </p>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <div className="text-3xl mb-3">🚀</div>
              <h3 className="font-semibold text-gray-900 mb-2">Automação Total</h3>
              <p className="text-gray-600 text-sm">
                Processo automatizado de capacitação e certificação
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}