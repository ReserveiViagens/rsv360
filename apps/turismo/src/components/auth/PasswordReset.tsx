import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Lock, Eye, EyeOff, ArrowLeft, CheckCircle, AlertTriangle } from 'lucide-react';
import { Button, Input, Alert, AlertDescription } from '../ui';

const requestResetSchema = z.object({
  email: z.string().email('Email inválido'),
});

const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token é obrigatório'),
  newPassword: z.string().min(8, 'Senha deve ter pelo menos 8 caracteres'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Senhas não coincidem",
  path: ["confirmPassword"],
});

type RequestResetData = z.infer<typeof requestResetSchema>;
type ResetPasswordData = z.infer<typeof resetPasswordSchema>;

export interface PasswordResetProps {
  onBackToLogin: () => void;
}

export const PasswordReset: React.FC<PasswordResetProps> = ({ onBackToLogin }) => {
  const [step, setStep] = useState<'request' | 'reset' | 'success'>('request');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const requestForm = useForm<RequestResetData>({
    resolver: zodResolver(requestResetSchema),
  });

  const resetForm = useForm<ResetPasswordData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const handleRequestReset = async (data: RequestResetData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simular chamada de API
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setEmail(data.email);
      setStep('reset');
    } catch (error) {
      setError('Erro ao enviar email de recuperação. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (data: ResetPasswordData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simular chamada de API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setStep('success');
    } catch (error) {
      setError('Erro ao redefinir senha. Verifique o token e tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendEmail = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simular reenvio
      await new Promise(resolve => setTimeout(resolve, 1000));
      setError(null);
    } catch (error) {
      setError('Erro ao reenviar email. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  if (step === 'success') {
    return (
      <div className="w-full max-w-md mx-auto space-y-6">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Senha Redefinida!</h2>
          <p className="text-gray-600 mt-2">
            Sua senha foi alterada com sucesso. Você pode fazer login com a nova senha.
          </p>
        </div>

        <Button onClick={onBackToLogin} className="w-full">
          Voltar para o Login
        </Button>

        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-start space-x-3">
            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-green-800">
              <p className="font-medium">Próximos Passos:</p>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>Faça login com sua nova senha</li>
                <li>Considere ativar autenticação de dois fatores</li>
                <li>Mantenha sua senha segura</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'reset') {
    return (
      <div className="w-full max-w-md mx-auto space-y-6">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <Lock className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Redefinir Senha</h2>
          <p className="text-gray-600 mt-2">
            Digite o código enviado para {email} e sua nova senha
          </p>
        </div>

        <form onSubmit={resetForm.handleSubmit(handleResetPassword)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Código de Verificação
            </label>
            <Input
              {...resetForm.register('token')}
              placeholder="Digite o código de 6 dígitos"
              disabled={isLoading}
            />
            {resetForm.formState.errors.token && (
              <p className="text-red-600 text-sm mt-1">
                {resetForm.formState.errors.token.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nova Senha
            </label>
            <div className="relative">
              <Input
                {...resetForm.register('newPassword')}
                type={showNewPassword ? 'text' : 'password'}
                placeholder="••••••••"
                className="pr-10"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                disabled={isLoading}
                title={showNewPassword ? "Ocultar senha" : "Mostrar senha"}
              >
                {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {resetForm.formState.errors.newPassword && (
              <p className="text-red-600 text-sm mt-1">
                {resetForm.formState.errors.newPassword.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirmar Nova Senha
            </label>
            <div className="relative">
              <Input
                {...resetForm.register('confirmPassword')}
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="••••••••"
                className="pr-10"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                disabled={isLoading}
                title={showConfirmPassword ? "Ocultar senha" : "Mostrar senha"}
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {resetForm.formState.errors.confirmPassword && (
              <p className="text-red-600 text-sm mt-1">
                {resetForm.formState.errors.confirmPassword.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={!resetForm.formState.isValid || isLoading}
          >
            {isLoading ? 'Redefinindo...' : 'Redefinir Senha'}
          </Button>
        </form>

        <div className="space-y-3">
          <button
            type="button"
            onClick={handleResendEmail}
            disabled={isLoading}
            className="w-full text-sm text-blue-600 hover:text-blue-500 hover:underline"
          >
            Não recebeu o código? Reenviar email
          </button>

          <button
            type="button"
            onClick={() => setStep('request')}
            className="w-full text-sm text-gray-600 hover:text-gray-500 hover:underline"
          >
            Voltar para solicitação
          </button>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      <div className="text-center">
        <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
          <Mail className="w-8 h-8 text-orange-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Esqueceu sua senha?</h2>
        <p className="text-gray-600 mt-2">
          Não se preocupe! Enviaremos um código de recuperação para seu email
        </p>
      </div>

      <form onSubmit={requestForm.handleSubmit(handleRequestReset)} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              {...requestForm.register('email')}
              id="email"
              type="email"
              placeholder="seu@email.com"
              className="pl-10"
              disabled={isLoading}
            />
          </div>
          {requestForm.formState.errors.email && (
            <p className="text-red-600 text-sm mt-1">
              {requestForm.formState.errors.email.message}
            </p>
          )}
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={!requestForm.formState.isValid || isLoading}
        >
          {isLoading ? 'Enviando...' : 'Enviar Código de Recuperação'}
        </Button>
      </form>

      <div className="text-center">
        <button
          type="button"
          onClick={onBackToLogin}
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-500 hover:underline"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Voltar para o Login
        </button>
      </div>

      <div className="bg-orange-50 p-4 rounded-lg">
        <div className="flex items-start space-x-3">
          <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-orange-800">
            <p className="font-medium">Como funciona:</p>
            <ol className="list-decimal list-inside mt-1 space-y-1">
              <li>Digite seu email cadastrado</li>
              <li>Receba um código de 6 dígitos</li>
              <li>Digite o código e sua nova senha</li>
              <li>Faça login com a nova senha</li>
            </ol>
          </div>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default PasswordReset;
