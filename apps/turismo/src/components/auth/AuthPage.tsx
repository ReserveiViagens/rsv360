import React, { useState } from 'react';
import { useAuth } from './AuthProvider';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';
import { PasswordReset } from './PasswordReset';
import { TwoFactorAuth } from './TwoFactorAuth';
import { Shield, User, Lock, Key, ArrowLeft } from 'lucide-react';

export type AuthStep = 'login' | 'register' | 'forgot-password' | '2fa';

export const AuthPage: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<AuthStep>('login');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login, register } = useAuth();

  const handleLogin = async (data: any) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await login(data.email, data.password, data.rememberMe);
      // Redirecionar para dashboard após login bem-sucedido
      window.location.href = '/dashboard';
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Erro ao fazer login');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (data: any) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await register(data);
      setError(null);
      // Mostrar mensagem de sucesso e voltar para login
      setCurrentStep('login');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Erro ao registrar usuário');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    setCurrentStep('forgot-password');
    setError(null);
  };

  const handleBackToLogin = () => {
    setCurrentStep('login');
    setError(null);
  };

  const handleGoToRegister = () => {
    setCurrentStep('register');
    setError(null);
  };

  const handleGoTo2FA = () => {
    setCurrentStep('2fa');
    setError(null);
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 'login':
        return 'Entrar no Sistema';
      case 'register':
        return 'Criar Conta';
      case 'forgot-password':
        return 'Recuperar Senha';
      case '2fa':
        return 'Autenticação de Dois Fatores';
      default:
        return 'Autenticação';
    }
  };

  const getStepDescription = () => {
    switch (currentStep) {
      case 'login':
        return 'Acesse sua conta para continuar';
      case 'register':
        return 'Registre-se para acessar o sistema';
      case 'forgot-password':
        return 'Recupere o acesso à sua conta';
      case '2fa':
        return 'Configure segurança adicional';
      default:
        return '';
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 'login':
        return (
          <LoginForm
            onLogin={handleLogin}
            onForgotPassword={handleForgotPassword}
            onRegister={handleGoToRegister}
            isLoading={isLoading}
            error={error}
          />
        );
      case 'register':
        return (
          <RegisterForm
            onRegister={handleRegister}
            onLogin={handleBackToLogin}
            isLoading={isLoading}
            error={error}
          />
        );
      case 'forgot-password':
        return (
          <PasswordReset
            onBackToLogin={handleBackToLogin}
          />
        );
      case '2fa':
        return (
          <TwoFactorAuth
            onBack={handleBackToLogin}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div className="text-left">
              <h1 className="text-2xl font-bold text-gray-900">Reservei Viagens</h1>
              <p className="text-sm text-gray-600">Sistema RSV</p>
            </div>
          </div>
          
          <h2 className="text-xl font-semibold text-gray-900">{getStepTitle()}</h2>
          <p className="text-gray-600 mt-1">{getStepDescription()}</p>
        </div>

        {/* Conteúdo do passo atual */}
        {renderStepContent()}

        {/* Navegação entre passos */}
        {currentStep !== 'login' && (
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={handleBackToLogin}
              className="inline-flex items-center text-sm text-gray-600 hover:text-gray-500 hover:underline"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Voltar para o Login
            </button>
          </div>
        )}

        {/* Informações de segurança */}
        <div className="mt-8 p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-start space-x-3">
            <Shield className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-gray-700">
              <p className="font-medium">Sistema Seguro</p>
              <p className="text-gray-600">
                Suas credenciais são protegidas com criptografia de ponta e nunca são compartilhadas.
                Para suporte, entre em contato com nossa equipe técnica.
              </p>
            </div>
          </div>
        </div>

        {/* Links úteis */}
        <div className="mt-6 text-center">
          <div className="flex items-center justify-center space-x-6 text-xs text-gray-500">
            <a href="#" className="hover:text-gray-700 hover:underline">Termos de Uso</a>
            <span>•</span>
            <a href="#" className="hover:text-gray-700 hover:underline">Política de Privacidade</a>
            <span>•</span>
            <a href="#" className="hover:text-gray-700 hover:underline">Suporte</a>
          </div>
        </div>

        {/* Indicador de versão */}
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-400">
            Sistema RSV v1.0.0 • © 2024 Reservei Viagens
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
