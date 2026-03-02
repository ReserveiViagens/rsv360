/**
 * Componente de Configurações de Privacidade LGPD/GDPR
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Shield, Download, Trash2, FileText, AlertTriangle, CheckCircle } from 'lucide-react';
import { useToast } from '@/components/providers/toast-wrapper';

interface Consent {
  consent_type: string;
  granted: boolean;
  granted_at?: string;
  revoked_at?: string;
}

export function PrivacySettings() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [consents, setConsents] = useState<Consent[]>([]);
  const [exportLoading, setExportLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    loadConsents();
  }, []);

  const loadConsents = async () => {
    try {
      const response = await fetch('/api/gdpr/consent');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setConsents(data.data);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar consentimentos:', error);
    }
  };

  const handleConsentChange = async (consentType: string, granted: boolean) => {
    try {
      setLoading(true);
      const response = await fetch('/api/gdpr/consent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          consent_type: consentType,
          granted,
        }),
      });

      if (response.ok) {
        toast({
          title: 'Consentimento atualizado',
          description: granted ? 'Consentimento concedido' : 'Consentimento revogado',
        });
        await loadConsents();
      } else {
        throw new Error('Erro ao atualizar consentimento');
      }
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao atualizar consentimento',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExportData = async (format: 'json' | 'csv' | 'xml') => {
    try {
      setExportLoading(true);
      const response = await fetch('/api/gdpr/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ format }),
      });

      if (response.ok) {
        const data = await response.json();
        toast({
          title: 'Exportação solicitada',
          description: data.message || 'Você receberá uma notificação quando estiver pronta',
        });
      } else {
        throw new Error('Erro ao solicitar exportação');
      }
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao solicitar exportação',
        variant: 'destructive',
      });
    } finally {
      setExportLoading(false);
    }
  };

  const handleDeleteData = async () => {
    if (!confirm('Tem certeza que deseja deletar todos os seus dados? Esta ação é irreversível.')) {
      return;
    }

    if (!confirm('Esta ação não pode ser desfeita. Todos os seus dados serão permanentemente deletados. Deseja continuar?')) {
      return;
    }

    try {
      setDeleteLoading(true);
      const response = await fetch('/api/gdpr/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reason: 'Solicitação do usuário via interface',
        }),
      });

      if (response.ok) {
        const data = await response.json();
        toast({
          title: 'Solicitação de deleção criada',
          description: data.message || 'Seus dados serão deletados em até 30 dias',
        });
      } else {
        throw new Error('Erro ao solicitar deleção');
      }
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao solicitar deleção',
        variant: 'destructive',
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  const getConsentStatus = (consentType: string): boolean => {
    const consent = consents.find(c => c.consent_type === consentType);
    if (!consent) return false;
    return consent.granted && !consent.revoked_at;
  };

  const consentLabels: Record<string, { label: string; description: string }> = {
    marketing: {
      label: 'Marketing e Comunicações',
      description: 'Receber emails promocionais e ofertas',
    },
    analytics: {
      label: 'Analytics',
      description: 'Permitir coleta de dados para análise e melhoria do serviço',
    },
    cookies: {
      label: 'Cookies',
      description: 'Permitir uso de cookies para personalização',
    },
    third_party: {
      label: 'Compartilhamento com Terceiros',
      description: 'Permitir compartilhamento de dados com parceiros',
    },
    data_processing: {
      label: 'Processamento de Dados',
      description: 'Permitir processamento de dados pessoais para serviços',
    },
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Consentimentos
          </CardTitle>
          <CardDescription>
            Gerencie seus consentimentos de privacidade
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(consentLabels).map(([type, info]) => {
            const isGranted = getConsentStatus(type);
            return (
              <div key={type} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Label htmlFor={type} className="font-medium">
                      {info.label}
                    </Label>
                    {isGranted ? (
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Ativo
                      </Badge>
                    ) : (
                      <Badge variant="outline">Inativo</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{info.description}</p>
                </div>
                <Switch
                  id={type}
                  checked={isGranted}
                  onCheckedChange={(checked) => handleConsentChange(type, checked)}
                  disabled={loading}
                />
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="w-5 h-5" />
            Exportar Dados
          </CardTitle>
          <CardDescription>
            Solicite uma cópia de todos os seus dados pessoais (Direito à Portabilidade)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <FileText className="w-4 h-4" />
            <AlertTitle>Exportação de Dados</AlertTitle>
            <AlertDescription>
              Você pode solicitar uma cópia de todos os seus dados pessoais em diferentes formatos.
              A exportação será processada e você receberá uma notificação quando estiver pronta.
            </AlertDescription>
          </Alert>

          <div className="flex gap-2">
            <Button
              onClick={() => handleExportData('json')}
              disabled={exportLoading}
              variant="outline"
            >
              <Download className="w-4 h-4 mr-2" />
              Exportar JSON
            </Button>
            <Button
              onClick={() => handleExportData('csv')}
              disabled={exportLoading}
              variant="outline"
            >
              <Download className="w-4 h-4 mr-2" />
              Exportar CSV
            </Button>
            <Button
              onClick={() => handleExportData('xml')}
              disabled={exportLoading}
              variant="outline"
            >
              <Download className="w-4 h-4 mr-2" />
              Exportar XML
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trash2 className="w-5 h-5" />
            Deletar Dados
          </CardTitle>
          <CardDescription>
            Solicite a deleção de todos os seus dados pessoais (Direito ao Esquecimento)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert variant="destructive">
            <AlertTriangle className="w-4 h-4" />
            <AlertTitle>Atenção</AlertTitle>
            <AlertDescription>
              Esta ação é <strong>irreversível</strong>. Todos os seus dados pessoais serão
              permanentemente deletados. Alguns dados podem ser mantidos por questões legais
              (ex.: transações financeiras).
            </AlertDescription>
          </Alert>

          <Button
            onClick={handleDeleteData}
            disabled={deleteLoading}
            variant="destructive"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            {deleteLoading ? 'Processando...' : 'Solicitar Deleção de Dados'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

