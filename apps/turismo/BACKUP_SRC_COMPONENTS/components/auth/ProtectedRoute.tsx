'use client';

import React from 'react';
import { useAuth } from './AuthProvider';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Alert } from '@/components/ui/Alert';
import { AlertDescription } from '@/components/ui/AlertDescription';
import { Shield, Lock, User, ArrowRight, Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'manager' | 'user';
  fallback?: React.ReactNode;
  redirectTo?: string;
}

export function ProtectedRoute({ 
  children, 
  requiredRole, 
  fallback,
  redirectTo = '/auth'
}: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuth();

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Card className="w-full max-w-md mx-auto">
          <CardContent className="p-8 text-center">
            <div className="flex items-center justify-center mb-4">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Verificando autenticação...
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Aguarde enquanto verificamos suas credenciais
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Usuário não autenticado
  if (!isAuthenticated || !user) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
        <Card className="w-full max-w-md mx-auto">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4">
              <Lock className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
              Acesso Restrito
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">
              Você precisa estar logado para acessar esta página
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                Esta área requer autenticação. Por favor, faça login para continuar.
              </AlertDescription>
            </Alert>

            <div className="space-y-3">
              <Button 
                className="w-full" 
                onClick={() => window.location.href = redirectTo}
              >
                <User className="w-4 h-4 mr-2" />
                Ir para Login
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => window.history.back()}
              >
                Voltar
              </Button>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Não tem uma conta?{' '}
                <Button
                  variant="ghost"
                  className="p-0 h-auto text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                  onClick={() => window.location.href = `${redirectTo}?tab=register`}
                >
                  Registre-se aqui
                </Button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Verificar role se especificado
  if (requiredRole && user.role !== requiredRole) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
        <Card className="w-full max-w-md mx-auto">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-yellow-100 dark:bg-yellow-900/20 rounded-full flex items-center justify-center mb-4">
              <Shield className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
              Acesso Negado
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">
              Você não tem permissão para acessar esta área
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <Alert variant="error">
              <Lock className="h-4 w-4" />
              <AlertDescription>
                Esta área requer permissões de <strong>{requiredRole}</strong>. 
                Sua conta atual tem permissões de <strong>{user.role}</strong>.
              </AlertDescription>
            </Alert>

            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                Sua conta atual:
              </h4>
              <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex justify-between">
                  <span>Nome:</span>
                  <span className="font-medium">{user.firstName} {user.lastName}</span>
                </div>
                <div className="flex justify-between">
                  <span>Email:</span>
                  <span className="font-medium">{user.email}</span>
                </div>
                <div className="flex justify-between">
                  <span>Função:</span>
                  <span className="font-medium capitalize">{user.role}</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Button 
                className="w-full" 
                onClick={() => window.location.href = '/dashboard'}
              >
                Ir para Dashboard
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => window.history.back()}
              >
                Voltar
              </Button>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Precisa de permissões adicionais?{' '}
                <Button
                  variant="ghost"
                  className="p-0 h-auto text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                  onClick={() => window.location.href = '/support'}
                >
                  Entre em contato com o suporte
                </Button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Usuário autenticado e com permissões - renderizar conteúdo
  return <>{children}</>;
}

// Hook para verificar permissões em componentes
export function useProtectedRoute(requiredRole?: 'admin' | 'manager' | 'user') {
  const { user, isAuthenticated, isLoading } = useAuth();

  const hasAccess = React.useMemo(() => {
    if (isLoading || !isAuthenticated || !user) return false;
    if (!requiredRole) return true;
    return user.role === requiredRole;
  }, [user, isAuthenticated, isLoading, requiredRole]);

  const canAccess = React.useMemo(() => {
    if (!requiredRole) return true;
    if (!user) return false;
    
    // Hierarquia de permissões
    const roleHierarchy = {
      'user': 1,
      'manager': 2,
      'admin': 3,
    };
    
    return roleHierarchy[user.role] >= roleHierarchy[requiredRole];
  }, [user, requiredRole]);

  return {
    hasAccess,
    canAccess,
    isLoading,
    isAuthenticated,
    user,
    requiredRole,
  };
}

// Componente de fallback padrão
export function DefaultFallback({ 
  message = "Acesso restrito", 
  description = "Você precisa estar logado para acessar esta página",
  showLoginButton = true 
}: {
  message?: string;
  description?: string;
  showLoginButton?: boolean;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
            <Shield className="w-8 h-8 text-gray-600 dark:text-gray-400" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
            {message}
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400">
            {description}
          </CardDescription>
        </CardHeader>
        
        {showLoginButton && (
          <CardContent>
            <Button 
              className="w-full" 
              onClick={() => window.location.href = '/auth'}
            >
              <User className="w-4 h-4 mr-2" />
              Fazer Login
            </Button>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
