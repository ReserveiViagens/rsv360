import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Shield, QrCode, Smartphone, Key, Download, RefreshCw, CheckCircle, AlertTriangle } from 'lucide-react';
import { Button, Input, Alert, AlertDescription } from '../ui';

const enable2FASchema = z.object({
  code: z.string().length(6, 'Código deve ter 6 dígitos'),
});

const verify2FASchema = z.object({
  code: z.string().length(6, 'Código deve ter 6 dígitos'),
});

type Enable2FAData = z.infer<typeof enable2FASchema>;
type Verify2FAData = z.infer<typeof verify2FASchema>;

export interface TwoFactorAuthProps {
  onBack: () => void;
}

export const TwoFactorAuth: React.FC<TwoFactorAuthProps> = ({ onBack }) => {
  const [step, setStep] = useState<'setup' | 'verify' | 'enabled' | 'disabled'>('setup');
  const [qrCode, setQrCode] = useState<string>('');
  const [secretKey, setSecretKey] = useState<string>('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);

  const enableForm = useForm<Enable2FAData>({
    resolver: zodResolver(enable2FASchema),
  });

  const verifyForm = useForm<Verify2FAData>({
    resolver: zodResolver(verify2FASchema),
  });

  // Gerar QR code e chave secreta
  useEffect(() => {
    if (step === 'setup') {
      generate2FASetup();
    }
  }, [step]);

  const generate2FASetup = () => {
    // Em produção, chamar API para gerar chave secreta
    const mockSecret = 'JBSWY3DPEHPK3PXP';
    const mockQRCode = `otpauth://totp/ReserveiViagens:admin@reserveiviagens.com.br?secret=${mockSecret}&issuer=ReserveiViagens`;
    
    setSecretKey(mockSecret);
    setQrCode(mockQRCode);
    
    // Gerar códigos de backup
    const codes = Array.from({ length: 10 }, () => 
      Math.random().toString(36).substring(2, 8).toUpperCase()
    );
    setBackupCodes(codes);
  };

  const handleEnable2FA = async (data: Enable2FAData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simular verificação
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (data.code === '123456') { // Mock code
        setStep('enabled');
        setIs2FAEnabled(true);
      } else {
        setError('Código inválido. Verifique o código no seu app de autenticação.');
      }
    } catch (error) {
      setError('Erro ao ativar 2FA. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify2FA = async (data: Verify2FAData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simular verificação
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (data.code === '123456') { // Mock code
        setStep('enabled');
        setIs2FAEnabled(true);
      } else {
        setError('Código inválido. Verifique o código no seu app de autenticação.');
      }
    } catch (error) {
      setError('Erro ao verificar código. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisable2FA = async () => {
    setIsLoading(true);
    
    try {
      // Simular desativação
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setIs2FAEnabled(false);
      setStep('setup');
    } catch (error) {
      setError('Erro ao desativar 2FA. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const downloadBackupCodes = () => {
    const content = `Códigos de Backup - Reservei Viagens\n\n${backupCodes.join('\n')}\n\nGuarde estes códigos em local seguro.`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'backup-codes.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (step === 'enabled') {
    return (
      <div className="w-full max-w-md mx-auto space-y-6">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">2FA Ativado!</h2>
          <p className="text-gray-600 mt-2">
            Sua conta agora está protegida com autenticação de dois fatores
          </p>
        </div>

        <div className="space-y-4">
          <Button onClick={() => setStep('setup')} className="w-full">
            <Shield className="w-4 h-4 mr-2" />
            Gerenciar 2FA
          </Button>
          
          <Button variant="outline" onClick={onBack} className="w-full">
            Voltar
          </Button>
        </div>

        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-start space-x-3">
            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-green-800">
              <p className="font-medium">Próximos logins:</p>
              <p className="text-green-700">
                Você precisará fornecer um código de 6 dígitos do seu app de autenticação além da senha.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      <div className="text-center">
        <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
          <Shield className="w-8 h-8 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Autenticação de Dois Fatores</h2>
        <p className="text-gray-600 mt-2">
          Adicione uma camada extra de segurança à sua conta
        </p>
      </div>

      {step === 'setup' && (
        <div className="space-y-6">
          {/* QR Code */}
          <div className="bg-white p-6 rounded-lg border border-gray-200 text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Passo 1: Escaneie o QR Code</h3>
            <div className="bg-gray-100 p-4 rounded-lg inline-block mb-4">
              <div className="w-48 h-48 bg-white flex items-center justify-center">
                <QrCode className="w-32 h-32 text-gray-400" />
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Use um app como Google Authenticator, Authy ou Microsoft Authenticator
            </p>
            
            {/* Chave secreta */}
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-xs text-gray-600 mb-1">Chave Secreta (se não conseguir escanear):</p>
              <div className="flex items-center justify-center space-x-2">
                <code className="text-sm font-mono bg-white px-2 py-1 rounded border">
                  {secretKey}
                </code>
                <button
                  type="button"
                  onClick={() => navigator.clipboard.writeText(secretKey)}
                  className="text-blue-600 hover:text-blue-500"
                  title="Copiar chave"
                >
                  <Key className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Códigos de backup */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Passo 2: Códigos de Backup</h3>
            <p className="text-sm text-gray-600 mb-4">
              Guarde estes códigos em local seguro. Use-os se perder acesso ao seu app de autenticação.
            </p>
            
            <div className="grid grid-cols-2 gap-2 mb-4">
              {backupCodes.map((code, index) => (
                <div key={index} className="bg-gray-50 p-2 rounded text-center font-mono text-sm">
                  {code}
                </div>
              ))}
            </div>
            
            <Button variant="outline" onClick={downloadBackupCodes} className="w-full">
              <Download className="w-4 h-4 mr-2" />
              Baixar Códigos de Backup
            </Button>
          </div>

          {/* Verificação */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Passo 3: Verificar Configuração</h3>
            <p className="text-sm text-gray-600 mb-4">
              Digite o código de 6 dígitos do seu app para confirmar a configuração
            </p>
            
            <form onSubmit={enableForm.handleSubmit(handleEnable2FA)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Código de Verificação
                </label>
                <Input
                  {...enableForm.register('code')}
                  placeholder="000000"
                  maxLength={6}
                  disabled={isLoading}
                />
                {enableForm.formState.errors.code && (
                  <p className="text-red-600 text-sm mt-1">
                    {enableForm.formState.errors.code.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={!enableForm.formState.isValid || isLoading}
              >
                {isLoading ? 'Verificando...' : 'Ativar 2FA'}
              </Button>
            </form>
          </div>
        </div>
      )}

      {step === 'verify' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Verificar Código 2FA</h3>
            <p className="text-sm text-gray-600 mb-4">
              Digite o código de 6 dígitos do seu app de autenticação
            </p>
            
            <form onSubmit={verifyForm.handleSubmit(handleVerify2FA)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Código de Verificação
                </label>
                <Input
                  {...verifyForm.register('code')}
                  placeholder="000000"
                  maxLength={6}
                  disabled={isLoading}
                />
                {verifyForm.formState.errors.code && (
                  <p className="text-red-600 text-sm mt-1">
                    {verifyForm.formState.errors.code.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={!verifyForm.formState.isValid || isLoading}
              >
                {isLoading ? 'Verificando...' : 'Verificar Código'}
              </Button>
            </form>
          </div>
        </div>
      )}

      {/* Controles */}
      <div className="space-y-3">
        {is2FAEnabled && (
          <Button variant="outline" onClick={handleDisable2FA} disabled={isLoading} className="w-full">
            <Shield className="w-4 h-4 mr-2" />
            Desativar 2FA
          </Button>
        )}
        
        <Button variant="outline" onClick={onBack} className="w-full">
          Voltar
        </Button>
      </div>

      {/* Informações */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <div className="flex items-start space-x-3">
          <AlertTriangle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-800">
            <p className="font-medium">Por que usar 2FA?</p>
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li>Proteção adicional mesmo se sua senha for comprometida</li>
              <li>Recomendado para contas administrativas</li>
              <li>Padrão de segurança da indústria</li>
            </ul>
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

export default TwoFactorAuth;
