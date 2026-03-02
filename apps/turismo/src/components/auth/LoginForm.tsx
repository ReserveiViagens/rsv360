'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Checkbox } from '@/components/ui/Checkbox';
import { Alert, AlertDescription } from '@/components/ui/Alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Eye, EyeOff, RefreshCw, Mail, Lock, AlertCircle, CheckCircle } from 'lucide-react';

// Schema de validação Zod
const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  rememberMe: z.boolean().optional(),
  captcha: z.string().min(1, 'Por favor, complete o captcha'),
});

type LoginFormData = z.infer<typeof loginSchema>;

interface LoginFormProps {
  onLogin: (data: LoginFormData) => Promise<void>;
  onForgotPassword: () => void;
  onRegister: () => void;
  isLoading?: boolean;
  error?: string;
}

export function LoginForm({ 
  onLogin, 
  onForgotPassword, 
  onRegister, 
  isLoading = false, 
  error 
}: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [captchaText, setCaptchaText] = useState('');
  const [captchaInput, setCaptchaInput] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    setValue,
    watch,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange',
  });

  // Gerar novo captcha
  const generateCaptcha = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaText(result);
    setCaptchaInput('');
  };

  // Gerar captcha inicial
  React.useEffect(() => {
    generateCaptcha();
  }, []);

  const onSubmit = async (data: LoginFormData) => {
    if (captchaInput.toUpperCase() !== captchaText) {
      setValue('captcha', '');
      return;
    }
    await onLogin(data);
  };

  const rememberMe = watch('rememberMe');

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
          Bem-vindo de volta
        </CardTitle>
        <CardDescription className="text-gray-600 dark:text-gray-400">
          Faça login para acessar sua conta
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Campo de Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                className="pl-10"
                {...register('email')}
                disabled={isLoading}
              />
            </div>
            {errors.email && (
              <p className="text-sm text-red-600 dark:text-red-400">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Campo de Senha */}
          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Sua senha"
                className="pl-10 pr-10"
                {...register('password')}
                disabled={isLoading}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
            {errors.password && (
              <p className="text-sm text-red-600 dark:text-red-400">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Captcha */}
          <div className="space-y-2">
            <Label htmlFor="captcha">Verificação de Segurança</Label>
            <div className="flex items-center space-x-3">
              <div className="flex-1">
                <Input
                  id="captcha"
                  type="text"
                  placeholder="Digite o código"
                  value={captchaInput}
                  onChange={(e) => setCaptchaInput(e.target.value)}
                  className="font-mono text-center tracking-widest"
                  disabled={isLoading}
                />
              </div>
              <div className="flex items-center space-x-2">
                <div className="bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded border font-mono text-lg font-bold tracking-widest select-none">
                  {captchaText}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={generateCaptcha}
                  disabled={isLoading}
                  title="Gerar novo código"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </div>
            {errors.captcha && (
              <p className="text-sm text-red-600 dark:text-red-400">
                {errors.captcha.message}
              </p>
            )}
          </div>

          {/* Lembrar-me */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="rememberMe"
              checked={rememberMe}
              onCheckedChange={(checked) => setValue('rememberMe', checked as boolean)}
              disabled={isLoading}
            />
            <Label htmlFor="rememberMe" className="text-sm">
              Lembrar de mim por 30 dias
            </Label>
          </div>

          {/* Botão de Login */}
          <Button
            type="submit"
            className="w-full"
            disabled={!isValid || isLoading}
          >
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Entrando...</span>
              </div>
            ) : (
              <span>Entrar</span>
            )}
          </Button>
        </form>

        {/* Links de Ação */}
        <div className="mt-6 space-y-3 text-center">
          <Button
            variant="link"
            onClick={onForgotPassword}
            disabled={isLoading}
            className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            Esqueceu sua senha?
          </Button>
          
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Não tem uma conta?{' '}
            <Button
              variant="link"
              onClick={onRegister}
              disabled={isLoading}
              className="p-0 h-auto text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
            >
              Registre-se aqui
            </Button>
          </div>
        </div>

        {/* Informações de Segurança */}
        <div className="mt-6 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <div className="flex items-start space-x-2">
            <CheckCircle className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-blue-700 dark:text-blue-300">
              <p className="font-medium">Sua segurança é nossa prioridade</p>
              <p>Utilizamos criptografia de ponta a ponta para proteger seus dados</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
