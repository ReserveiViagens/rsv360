import React, { useEffect, useState, ReactNode } from 'react';
import { Shield, Lock, UserCheck, AlertTriangle } from 'lucide-react';
import { Button, Alert, AlertDescription } from '../ui';

export interface Permission {
  resource: string;
  action: string;
}

export interface RouteConfig {
  path: string;
  permissions?: Permission[];
  requiresAuth?: boolean;
  redirectTo?: string;
  fallback?: ReactNode;
}

export interface NavigationGuardProps {
  children: ReactNode;
  route: RouteConfig;
  userPermissions?: Permission[];
  isAuthenticated?: boolean;
  userRole?: string;
  onUnauthorized?: (route: RouteConfig) => void;
  onRedirect?: (path: string) => void;
  loadingComponent?: ReactNode;
  unauthorizedComponent?: ReactNode;
}

const NavigationGuard: React.FC<NavigationGuardProps> = ({
  children,
  route,
  userPermissions = [],
  isAuthenticated = false,
  userRole = 'guest',
  onUnauthorized,
  onRedirect,
  loadingComponent,
  unauthorizedComponent
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [shouldRedirect, setShouldRedirect] = useState(false);

  useEffect(() => {
    const checkAccess = async () => {
      setIsLoading(true);

      try {
        // Verificar se requer autenticação
        if (route.requiresAuth && !isAuthenticated) {
          setIsAuthorized(false);
          setShouldRedirect(true);
          onUnauthorized?.(route);
          return;
        }

        // Verificar permissões específicas
        if (route.permissions && route.permissions.length > 0) {
          const hasPermission = route.permissions.every(permission =>
            userPermissions.some(userPerm =>
              userPerm.resource === permission.resource &&
              userPerm.action === permission.action
            )
          );

          if (!hasPermission) {
            setIsAuthorized(false);
            setShouldRedirect(true);
            onUnauthorized?.(route);
            return;
          }
        }

        // Verificar role específico (se necessário)
        if (route.requiresAuth && userRole === 'guest') {
          setIsAuthorized(false);
          setShouldRedirect(true);
          onUnauthorized?.(route);
          return;
        }

        // Acesso autorizado
        setIsAuthorized(true);
        setShouldRedirect(false);
      } catch (error) {
        console.error('NavigationGuard error:', error);
        setIsAuthorized(false);
        setShouldRedirect(true);
      } finally {
        setIsLoading(false);
      }
    };

    checkAccess();
  }, [route, userPermissions, isAuthenticated, userRole, onUnauthorized]);

  // Redirecionar se necessário
  useEffect(() => {
    if (shouldRedirect && route.redirectTo) {
      if (onRedirect) {
        onRedirect(route.redirectTo);
      } else {
        window.location.href = route.redirectTo;
      }
    }
  }, [shouldRedirect, route.redirectTo, onRedirect]);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        {loadingComponent || (
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Verificando permissões...</p>
          </div>
        )}
      </div>
    );
  }

  // Acesso negado
  if (!isAuthorized) {
    if (unauthorizedComponent) {
      return <>{unauthorizedComponent}</>;
    }

    if (route.fallback) {
      return <>{route.fallback}</>;
    }

    // Componente padrão de acesso negado
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
          {/* Ícone de acesso negado */}
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <Lock className="w-8 h-8 text-red-600" />
          </div>

          {/* Título */}
          <h1 className="text-xl font-semibold text-gray-900 mb-2">
            Acesso Negado
          </h1>

          {/* Descrição */}
          <p className="text-gray-600 mb-6">
            Você não tem permissão para acessar esta página. 
            Entre em contato com o administrador se acredita que isso é um erro.
          </p>

          {/* Alert com detalhes */}
          <Alert variant="warning" className="mb-6">
            <AlertDescription>
              <strong>Rota:</strong> {route.path}
              {route.permissions && (
                <div className="mt-2">
                  <strong>Permissões necessárias:</strong>
                  <ul className="mt-1 text-sm">
                    {route.permissions.map((perm, idx) => (
                      <li key={idx}>
                        {perm.resource} - {perm.action}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </AlertDescription>
          </Alert>

          {/* Ações */}
          <div className="space-y-3">
            <Button
              onClick={() => window.history.back()}
              variant="outline"
              className="w-full"
            >
              <AlertTriangle className="w-4 h-4 mr-2" />
              Voltar
            </Button>

            <Button
              onClick={() => window.location.href = '/'}
              className="w-full"
            >
              <UserCheck className="w-4 h-4 mr-2" />
              Ir para Início
            </Button>
          </div>

          {/* Informações de contato */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              Se precisar de acesso, entre em contato com o administrador do sistema.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Acesso autorizado - renderizar children
  return <>{children}</>;
};

export { NavigationGuard };
export type { NavigationGuardProps, RouteConfig, Permission };
