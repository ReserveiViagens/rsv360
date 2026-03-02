'use client'

import React, { ReactNode, useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/router';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredPermissions?: string[];
  fallback?: ReactNode;
}

export default function ProtectedRoute({
  children,
  requiredPermissions = [],
  fallback = (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Verificando permissões...</p>
      </div>
    </div>
  )
}: ProtectedRouteProps) {
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  
  // IMPORTANTE: useAuth deve ser chamado sempre, na mesma ordem
  // Agora useAuth retorna valores padrão em vez de lançar erro
  const { isAuthenticated, isLoading, user } = useAuth();
  
  // IMPORTANTE: Todos os hooks devem ser chamados antes de qualquer return condicional
  // Garantir que só executa no cliente
  useEffect(() => {
    setMounted(true);
    console.log('[ProtectedRoute] Componente montado');
  }, []);

  // Debug: Log do estado de autenticação
  useEffect(() => {
    console.log('[ProtectedRoute] Estado:', {
      mounted,
      isLoading,
      isAuthenticated,
      hasUser: !!user
    });
  }, [mounted, isLoading, isAuthenticated, user]);

  // Redirecionar se não autenticado (só funciona no cliente)
  useEffect(() => {
    if (mounted && !isLoading && !isAuthenticated) {
      console.log('[ProtectedRoute] Redirecionando para /login');
      router.push('/login');
    }
  }, [mounted, isAuthenticated, isLoading, router]);

  // Durante SSR ou antes de montar, retornar fallback
  if (!mounted) {
    return <>{fallback}</>;
  }

  // Se ainda está carregando, mostrar fallback
  if (isLoading) {
    return <>{fallback}</>;
  }

  // Se não está autenticado, mostrar null (o useEffect vai redirecionar)
  if (!isAuthenticated) {
    return null;
  }

  // Verificar permissões específicas
  if (requiredPermissions.length > 0 && user) {
    const userPermissions = Array.isArray(user.permissions) ? user.permissions : [];
    const hasAllPermissions = requiredPermissions.every(permission => userPermissions.includes(permission));
    if (!hasAllPermissions) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-red-100">
              <svg className="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900">Acesso Negado</h3>
            <p className="mt-2 text-sm text-gray-600">
              Você não possui as permissões necessárias para acessar esta página.
            </p>
            <div className="mt-6">
              <button
                onClick={() => router.push('/dashboard')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
              >
                Voltar ao Painel de Controle
              </button>
            </div>
          </div>
        </div>
      );
    }
  }

  return <>{children}</>;
} 