'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useAuth } from './AuthProvider';
import { Shield, Lock, User, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';

// 🎯 TIPOS DE PERMISSÕES
export type Permission = 
  // Dashboard e Visualização
  | 'dashboard:view'
  | 'dashboard:analytics'
  | 'dashboard:reports'
  
  // Gestão de Usuários
  | 'users:view'
  | 'users:create'
  | 'users:edit'
  | 'users:delete'
  | 'users:manage_roles'
  
  // Gestão de Clientes
  | 'customers:view'
  | 'customers:create'
  | 'customers:edit'
  | 'customers:delete'
  | 'customers:export'
  
  // Gestão de Reservas
  | 'bookings:view'
  | 'bookings:create'
  | 'bookings:edit'
  | 'bookings:delete'
  | 'bookings:approve'
  | 'bookings:cancel'
  
  // Sistema Financeiro
  | 'finance:view'
  | 'finance:transactions'
  | 'finance:refunds'
  | 'finance:reports'
  | 'finance:settings'
  
  // Marketing e Comunicação
  | 'marketing:view'
  | 'marketing:campaigns'
  | 'marketing:emails'
  | 'marketing:sms'
  | 'marketing:analytics'
  
  // Relatórios e Analytics
  | 'reports:view'
  | 'reports:create'
  | 'reports:export'
  | 'reports:schedule'
  
  // Configurações do Sistema
  | 'settings:view'
  | 'settings:general'
  | 'settings:security'
  | 'settings:integrations'
  | 'settings:backup'
  
  // Deploy e DevOps
  | 'deploy:view'
  | 'deploy:staging'
  | 'deploy:production'
  | 'deploy:monitoring'
  | 'deploy:rollback';

// 🎯 TIPOS DE ROLES
export type UserRole = 'admin' | 'manager' | 'user';

// 🎯 CONFIGURAÇÃO DE PERMISSÕES POR ROLE
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  admin: [
    // Admin tem acesso total a tudo
    'dashboard:view', 'dashboard:analytics', 'dashboard:reports',
    'users:view', 'users:create', 'users:edit', 'users:delete', 'users:manage_roles',
    'customers:view', 'customers:create', 'customers:edit', 'customers:delete', 'customers:export',
    'bookings:view', 'bookings:create', 'bookings:edit', 'bookings:delete', 'bookings:approve', 'bookings:cancel',
    'finance:view', 'finance:transactions', 'finance:refunds', 'finance:reports', 'finance:settings',
    'marketing:view', 'marketing:campaigns', 'marketing:emails', 'marketing:sms', 'marketing:analytics',
    'reports:view', 'reports:create', 'reports:export', 'reports:schedule',
    'settings:view', 'settings:general', 'settings:security', 'settings:integrations', 'settings:backup',
    'deploy:view', 'deploy:staging', 'deploy:production', 'deploy:monitoring', 'deploy:rollback',
  ],
  
  manager: [
    // Manager tem acesso a gestão operacional
    'dashboard:view', 'dashboard:analytics', 'dashboard:reports',
    'users:view',
    'customers:view', 'customers:create', 'customers:edit', 'customers:export',
    'bookings:view', 'bookings:create', 'bookings:edit', 'bookings:approve', 'bookings:cancel',
    'finance:view', 'finance:transactions', 'finance:refunds', 'finance:reports',
    'marketing:view', 'marketing:campaigns', 'marketing:emails', 'marketing:sms', 'marketing:analytics',
    'reports:view', 'reports:create', 'reports:export', 'reports:schedule',
    'settings:view', 'settings:general',
    'deploy:view', 'deploy:staging', 'deploy:monitoring',
  ],
  
  user: [
    // User tem acesso básico
    'dashboard:view',
    'customers:view', 'customers:create', 'customers:edit',
    'bookings:view', 'bookings:create', 'bookings:edit',
    'finance:view',
    'marketing:view',
    'reports:view',
    'settings:view',
  ],
};

// 🎯 CONTEXTO DE PERMISSÕES
interface PermissionsContextType {
  hasPermission: (permission: Permission) => boolean;
  hasAnyPermission: (permissions: Permission[]) => boolean;
  hasAllPermissions: (permissions: Permission[]) => boolean;
  getUserPermissions: () => Permission[];
  getUserRole: () => UserRole | null;
}

const PermissionsContext = createContext<PermissionsContextType | undefined>(undefined);

// 🎯 PROVIDER DE PERMISSÕES
export function PermissionsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();

  const hasPermission = (permission: Permission): boolean => {
    if (!user) return false;
    const userPermissions = ROLE_PERMISSIONS[user.role] || [];
    return userPermissions.includes(permission);
  };

  const hasAnyPermission = (permissions: Permission[]): boolean => {
    return permissions.some(permission => hasPermission(permission));
  };

  const hasAllPermissions = (permissions: Permission[]): boolean => {
    return permissions.every(permission => hasPermission(permission));
  };

  const getUserPermissions = (): Permission[] => {
    if (!user) return [];
    return ROLE_PERMISSIONS[user.role] || [];
  };

  const getUserRole = (): UserRole | null => {
    return user?.role || null;
  };

  const contextValue: PermissionsContextType = {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    getUserPermissions,
    getUserRole,
  };

  return (
    <PermissionsContext.Provider value={contextValue}>
      {children}
    </PermissionsContext.Provider>
  );
}

// 🎯 HOOK PARA USAR PERMISSÕES
export function usePermissions() {
  const context = useContext(PermissionsContext);
  if (context === undefined) {
    throw new Error('usePermissions deve ser usado dentro de um PermissionsProvider');
  }
  return context;
}

// 🎯 COMPONENTE GATE DE PERMISSÃO
interface PermissionGateProps {
  children: ReactNode;
  permission: Permission;
  fallback?: ReactNode;
  showUnauthorized?: boolean;
}

export function PermissionGate({ 
  children, 
  permission, 
  fallback,
  showUnauthorized = true 
}: PermissionGateProps) {
  const { hasPermission } = usePermissions();

  if (hasPermission(permission)) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  if (showUnauthorized) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-yellow-100 dark:bg-yellow-900/20 rounded-full flex items-center justify-center mb-4">
            <Lock className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
          </div>
          <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">
            Permissão Necessária
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400">
            Você não tem permissão para acessar esta funcionalidade
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <Alert variant="warning">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Esta funcionalidade requer a permissão: <strong>{permission}</strong>
            </AlertDescription>
          </Alert>

          <div className="text-center">
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => window.history.back()}
            >
              Voltar
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
}

// 🎯 COMPONENTE GATE DE MÚLTIPLAS PERMISSÕES
interface MultiPermissionGateProps {
  children: ReactNode;
  permissions: Permission[];
  requireAll?: boolean; // true = todas as permissões, false = qualquer uma
  fallback?: ReactNode;
  showUnauthorized?: boolean;
}

export function MultiPermissionGate({ 
  children, 
  permissions, 
  requireAll = false,
  fallback,
  showUnauthorized = true 
}: MultiPermissionGateProps) {
  const { hasAllPermissions, hasAnyPermission } = usePermissions();
  
  const hasAccess = requireAll 
    ? hasAllPermissions(permissions)
    : hasAnyPermission(permissions);

  if (hasAccess) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  if (showUnauthorized) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4">
            <XCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">
            Permissões Insuficientes
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400">
            {requireAll 
              ? 'Você precisa de todas as permissões listadas'
              : 'Você precisa de pelo menos uma das permissões listadas'
            }
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <Alert variant="error">
            <Lock className="h-4 w-4" />
            <AlertDescription>
              Permissões necessárias: <strong>{permissions.join(', ')}</strong>
            </AlertDescription>
          </Alert>

          <div className="text-center">
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => window.history.back()}
            >
              Voltar
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
}

// 🎯 COMPONENTE DE INFORMAÇÕES DE PERMISSÕES DO USUÁRIO
export function UserPermissionsInfo() {
  const { getUserPermissions, getUserRole } = usePermissions();
  const { user } = useAuth();

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Informações de Permissões
          </CardTitle>
          <CardDescription>
            Usuário não autenticado
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="warning">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Faça login para ver suas permissões
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const permissions = getUserPermissions();
  const role = getUserRole();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5" />
          Suas Permissões
        </CardTitle>
        <CardDescription>
          Função: <span className="font-medium capitalize">{role}</span>
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">
              Informações da Conta
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
              <div className="flex justify-between">
                <span>Status:</span>
                <span className={`font-medium ${user.isActive ? 'text-green-600' : 'text-red-600'}`}>
                  {user.isActive ? 'Ativo' : 'Inativo'}
                </span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">
              Estatísticas de Permissões
            </h4>
            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex justify-between">
                <span>Total de permissões:</span>
                <span className="font-medium">{permissions.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Permissões ativas:</span>
                <span className="font-medium text-green-600">{permissions.length}</span>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h4 className="font-medium text-gray-900 dark:text-white mb-3">
            Permissões Disponíveis
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {permissions.map((permission) => (
              <div 
                key={permission}
                className="flex items-center gap-2 p-2 bg-green-50 dark:bg-green-900/20 rounded-lg"
              >
                <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                <span className="text-sm text-green-700 dark:text-green-300">
                  {permission}
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
