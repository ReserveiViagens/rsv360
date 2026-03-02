'use client';

import React, { useState } from 'react';
import { 
  LoginForm, 
  RegisterForm, 
  ProtectedRoute, 
  useProtectedRoute, 
  PermissionGate, 
  MultiPermissionGate, 
  UserPermissionsInfo,
  UserProfile,
  useAuth,
  usePermissions
} from '@/components/auth';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { 
  Shield, 
  User, 
  Lock, 
  Key, 
  Eye, 
  EyeOff,
  LogOut,
  Settings,
  UserCheck,
  AlertTriangle
} from 'lucide-react';

export default function AuthTestPage() {
  const [currentTab, setCurrentTab] = useState('login');
  const [showProtectedContent, setShowProtectedContent] = useState(false);
  const [showRoleContent, setShowRoleContent] = useState(false);
  const [showPermissionContent, setShowPermissionContent] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            🧪 Teste dos Componentes de Autenticação
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Página para testar todos os componentes de autenticação implementados
          </p>
        </div>

        {/* Tabs principais */}
        <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="register">Registro</TabsTrigger>
            <TabsTrigger value="protected">Proteção</TabsTrigger>
            <TabsTrigger value="profile">Perfil</TabsTrigger>
          </TabsList>

          {/* Tab: Login */}
          <TabsContent value="login" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="w-5 h-5" />
                  Teste do LoginForm
                </CardTitle>
                <CardDescription>
                  Teste o formulário de login com validação e captcha
                </CardDescription>
              </CardHeader>
              <CardContent>
                <LoginForm
                  onLogin={async (data) => {
                    console.log('Login attempt:', data);
                    alert(`Tentativa de login com: ${data.email}`);
                  }}
                  onForgotPassword={() => {
                    alert('Funcionalidade de recuperação de senha');
                  }}
                  onRegister={() => setCurrentTab('register')}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Registro */}
          <TabsContent value="register" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Teste do RegisterForm
                </CardTitle>
                <CardDescription>
                  Teste o formulário de registro com validação e força de senha
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RegisterForm
                  onRegister={async (data) => {
                    console.log('Register attempt:', data);
                    alert(`Tentativa de registro com: ${data.email}`);
                  }}
                  onLogin={() => setCurrentTab('login')}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Proteção de Rotas */}
          <TabsContent value="protected" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Teste de Proteção de Rotas
                </CardTitle>
                <CardDescription>
                  Teste os componentes de proteção e controle de acesso
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Teste de ProtectedRoute */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">ProtectedRoute Component</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button
                      onClick={() => setShowProtectedContent(!showProtectedContent)}
                      variant="outline"
                    >
                      {showProtectedContent ? 'Ocultar' : 'Mostrar'} Conteúdo Protegido
                    </Button>
                  </div>

                  {showProtectedContent && (
                    <ProtectedRoute>
                      <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                        <div className="flex items-center gap-2 text-green-800 dark:text-green-200">
                          <Shield className="w-5 h-5" />
                          <span className="font-medium">✅ Conteúdo Protegido Acessível</span>
                        </div>
                        <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                          Este conteúdo só é visível porque você está autenticado.
                        </p>
                      </div>
                    </ProtectedRoute>
                  )}
                </div>

                {/* Teste de Role-Based Access */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Role-Based Access Control</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Button
                      onClick={() => setShowRoleContent(!showRoleContent)}
                      variant="outline"
                    >
                      {showRoleContent ? 'Ocultar' : 'Mostrar'} Conteúdo por Role
                    </Button>
                  </div>

                  {showRoleContent && (
                    <div className="space-y-4">
                      {/* Conteúdo para Admin */}
                      <PermissionGate permission="users:manage_roles">
                        <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                          <div className="flex items-center gap-2 text-purple-800 dark:text-purple-200">
                            <Key className="w-5 h-5" />
                            <span className="font-medium">👑 Conteúdo Exclusivo para Admin</span>
                          </div>
                          <p className="text-sm text-purple-700 dark:text-purple-300 mt-1">
                            Você tem permissão para gerenciar roles de usuários.
                          </p>
                        </div>
                      </PermissionGate>

                      {/* Conteúdo para Manager */}
                      <PermissionGate permission="bookings:approve">
                        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                          <div className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
                            <UserCheck className="w-5 h-5" />
                            <span className="font-medium">👔 Conteúdo para Manager</span>
                          </div>
                          <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                            Você tem permissão para aprovar reservas.
                          </p>
                        </div>
                      </PermissionGate>

                      {/* Conteúdo para User */}
                      <PermissionGate permission="bookings:view">
                        <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                          <div className="flex items-center gap-2 text-green-800 dark:text-green-200">
                            <Eye className="w-5 h-5" />
                            <span className="font-medium">👁️ Conteúdo para User</span>
                          </div>
                          <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                            Você tem permissão para visualizar reservas.
                          </p>
                        </div>
                      </PermissionGate>
                    </div>
                  )}
                </div>

                {/* Teste de Múltiplas Permissões */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Múltiplas Permissões</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button
                      onClick={() => setShowPermissionContent(!showPermissionContent)}
                      variant="outline"
                    >
                      {showPermissionContent ? 'Ocultar' : 'Mostrar'} Conteúdo por Múltiplas Permissões
                    </Button>
                  </div>

                  {showPermissionContent && (
                    <div className="space-y-4">
                      {/* Requer todas as permissões */}
                      <MultiPermissionGate 
                        permissions={['dashboard:view', 'reports:view']} 
                        requireAll={true}
                      >
                        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                          <div className="flex items-center gap-2 text-yellow-800 dark:text-yellow-200">
                            <AlertTriangle className="w-5 h-5" />
                            <span className="font-medium">⚠️ Conteúdo que Requer TODAS as Permissões</span>
                          </div>
                          <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                            Você precisa ter dashboard:view E reports:view para ver este conteúdo.
                          </p>
                        </div>
                      </MultiPermissionGate>

                      {/* Requer pelo menos uma permissão */}
                      <MultiPermissionGate 
                        permissions={['finance:view', 'marketing:view']} 
                        requireAll={false}
                      >
                        <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-200 dark:border-indigo-800">
                          <div className="flex items-center gap-2 text-indigo-800 dark:text-indigo-200">
                            <Settings className="w-5 h-5" />
                            <span className="font-medium">🔧 Conteúdo que Requer PELO MENOS UMA Permissão</span>
                          </div>
                          <p className="text-sm text-indigo-700 dark:text-indigo-300 mt-1">
                            Você precisa ter finance:view OU marketing:view para ver este conteúdo.
                          </p>
                        </div>
                      </MultiPermissionGate>
                    </div>
                  )}
                </div>

                {/* Informações de Permissões */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Informações de Permissões</h3>
                  <UserPermissionsInfo />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Perfil do Usuário */}
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Teste do UserProfile
                </CardTitle>
                <CardDescription>
                  Teste o componente de gestão de perfil do usuário
                </CardDescription>
              </CardHeader>
              <CardContent>
                <UserProfile />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Status da Autenticação */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Status da Autenticação
            </CardTitle>
            <CardDescription>
              Informações sobre o estado atual da autenticação
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AuthStatus />
          </CardContent>
        </Card>

        {/* Instruções de Teste */}
        <Card>
          <CardHeader>
            <CardTitle>📋 Instruções de Teste</CardTitle>
            <CardDescription>
              Como testar os componentes de autenticação
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2">🔐 Login</h4>
                <ul className="text-sm space-y-1 text-gray-600 dark:text-gray-400">
                  <li>• Use: admin@rsv.com / Admin123!</li>
                  <li>• Ou: user@rsv.com / User123!</li>
                  <li>• Teste validação de campos</li>
                  <li>• Teste captcha</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">📝 Registro</h4>
                <ul className="text-sm space-y-1 text-gray-600 dark:text-gray-400">
                  <li>• Preencha todos os campos</li>
                  <li>• Teste força da senha</li>
                  <li>• Teste validação de email</li>
                  <li>• Teste aceitação de termos</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">🛡️ Proteção</h4>
                <ul className="text-sm space-y-1 text-gray-600 dark:text-gray-400">
                  <li>• Teste acesso sem login</li>
                  <li>• Teste diferentes roles</li>
                  <li>• Teste múltiplas permissões</li>
                  <li>• Verifique fallbacks</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">👤 Perfil</h4>
                <ul className="text-sm space-y-1 text-gray-600 dark:text-gray-400">
                  <li>• Edite informações pessoais</li>
                  <li>• Teste upload de avatar</li>
                  <li>• Teste mudança de senha</li>
                  <li>• Verifique validações</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Componente para mostrar status da autenticação
function AuthStatus() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { hasPermission, getUserPermissions, getUserRole } = usePermissions();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600 dark:text-gray-400">Carregando...</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
        <div className="flex items-center gap-2 text-red-800 dark:text-red-200">
          <Lock className="w-5 h-5" />
          <span className="font-medium">❌ Não Autenticado</span>
        </div>
        <p className="text-sm text-red-700 dark:text-red-300 mt-1">
          Faça login para acessar todas as funcionalidades.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
        <div className="flex items-center gap-2 text-green-800 dark:text-green-200">
          <User className="w-5 h-5" />
          <span className="font-medium">✅ Autenticado</span>
        </div>
        <div className="mt-2 space-y-1 text-sm text-green-700 dark:text-green-300">
          <p><strong>Nome:</strong> {user?.firstName} {user?.lastName}</p>
          <p><strong>Email:</strong> {user?.email}</p>
          <p><strong>Role:</strong> {getUserRole()}</p>
          <p><strong>Permissões:</strong> {getUserPermissions().length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {hasPermission('dashboard:view') ? '✅' : '❌'}
            </div>
            <div className="text-sm font-medium text-blue-800 dark:text-blue-200">Dashboard</div>
          </div>
        </div>

        <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {hasPermission('users:manage_roles') ? '✅' : '❌'}
            </div>
            <div className="text-sm font-medium text-purple-800 dark:text-purple-200">Admin</div>
          </div>
        </div>

        <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {hasPermission('bookings:view') ? '✅' : '❌'}
            </div>
            <div className="text-sm font-medium text-green-800 dark:text-green-200">Reservas</div>
          </div>
        </div>
      </div>
    </div>
  );
}
