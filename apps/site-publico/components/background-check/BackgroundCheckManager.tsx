/**
 * ✅ TAREFA MEDIUM-4: Componente para gerenciar Background Checks
 * UI para solicitar, visualizar e gerenciar verificações de antecedentes
 */

'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Shield, CheckCircle2, XCircle, Clock, Loader2, AlertTriangle, RefreshCw } from '@/lib/lucide-icons';
import { toast } from 'sonner';

interface BackgroundCheck {
  id: number;
  user_id: number;
  provider: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'rejected';
  check_type: string;
  cpf: string;
  full_name: string;
  score?: number;
  risk_level?: 'low' | 'medium' | 'high';
  requested_at: string;
  completed_at?: string;
  expires_at?: string;
}

interface Provider {
  name: string;
  enabled: boolean;
  check_types: string[];
  cost_per_check: number;
}

interface BackgroundCheckManagerProps {
  userId: number;
  onCheckComplete?: (check: BackgroundCheck) => void;
}

export function BackgroundCheckManager({ userId, onCheckComplete }: BackgroundCheckManagerProps) {
  const [loading, setLoading] = useState(false);
  const [requesting, setRequesting] = useState(false);
  const [checks, setChecks] = useState<BackgroundCheck[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [formData, setFormData] = useState({
    cpf: '',
    full_name: '',
    birth_date: '',
    check_type: 'basic',
    provider: 'serasa',
  });

  useEffect(() => {
    loadProviders();
    loadChecks();
  }, [userId]);

  const loadProviders = async () => {
    try {
      const response = await fetch('/api/background-check/providers');
      const result = await response.json();
      if (result.success) {
        setProviders(result.data);
        if (result.data.length > 0) {
          setFormData((prev) => ({ ...prev, provider: result.data[0].name }));
        }
      }
    } catch (error: any) {
      console.error('Erro ao carregar providers:', error);
    }
  };

  const loadChecks = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/background-check/list?user_id=${userId}`);
      const result = await response.json();
      if (result.success) {
        setChecks(result.data);
      }
    } catch (error: any) {
      console.error('Erro ao carregar checks:', error);
    } finally {
      setLoading(false);
    }
  };

  const requestCheck = async () => {
    if (!formData.cpf || !formData.full_name) {
      toast.error('CPF e nome completo são obrigatórios');
      return;
    }

    try {
      setRequesting(true);
      const response = await fetch('/api/background-check/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          ...formData,
        }),
      });

      const result = await response.json();
      if (result.success) {
        toast.success('Background check solicitado com sucesso!');
        onCheckComplete?.(result.data);
        loadChecks();
        // Limpar formulário
        setFormData({
          cpf: '',
          full_name: '',
          birth_date: '',
          check_type: 'basic',
          provider: formData.provider,
        });
      } else {
        throw new Error(result.error || 'Erro ao solicitar check');
      }
    } catch (error: any) {
      toast.error(error.message || 'Erro ao solicitar background check');
    } finally {
      setRequesting(false);
    }
  };

  const formatCPF = (cpf: string) => {
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="success">Concluído</Badge>;
      case 'processing':
        return <Badge variant="default">Processando</Badge>;
      case 'pending':
        return <Badge variant="outline">Pendente</Badge>;
      case 'failed':
        return <Badge variant="destructive">Falhou</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejeitado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getRiskBadge = (riskLevel?: string) => {
    if (!riskLevel) return null;
    switch (riskLevel) {
      case 'low':
        return <Badge className="bg-green-500">Baixo Risco</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-500">Médio Risco</Badge>;
      case 'high':
        return <Badge className="bg-red-500">Alto Risco</Badge>;
      default:
        return null;
    }
  };

  const latestCheck = checks.find((c) => c.status === 'completed');
  const hasValidCheck = latestCheck && latestCheck.expires_at && new Date(latestCheck.expires_at) > new Date();

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Background Check
          </CardTitle>
          <CardDescription>
            Verificação de antecedentes e confiabilidade
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {hasValidCheck && (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <AlertDescription>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-green-900">Background Check Válido</p>
                    <p className="text-sm text-muted-foreground">
                      Score: {latestCheck.score}/1000 • {latestCheck.risk_level && getRiskBadge(latestCheck.risk_level)}
                    </p>
                    {latestCheck.expires_at && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Válido até {new Date(latestCheck.expires_at).toLocaleDateString('pt-BR')}
                      </p>
                    )}
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="cpf">CPF *</Label>
              <Input
                id="cpf"
                value={formData.cpf}
                onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                placeholder="000.000.000-00"
                maxLength={14}
              />
            </div>
            <div>
              <Label htmlFor="full_name">Nome Completo *</Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                placeholder="João Silva"
              />
            </div>
            <div>
              <Label htmlFor="birth_date">Data de Nascimento</Label>
              <Input
                id="birth_date"
                type="date"
                value={formData.birth_date}
                onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="check_type">Tipo de Verificação</Label>
              <Select
                value={formData.check_type}
                onValueChange={(value) => setFormData({ ...formData, check_type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="basic">Básico</SelectItem>
                  <SelectItem value="criminal">Criminal</SelectItem>
                  <SelectItem value="credit">Crédito</SelectItem>
                  <SelectItem value="full">Completo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="provider">Provider</Label>
              <Select
                value={formData.provider}
                onValueChange={(value) => setFormData({ ...formData, provider: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {providers.map((provider) => (
                    <SelectItem key={provider.name} value={provider.name}>
                      {provider.name} ({provider.cost_per_check > 0 ? `R$ ${provider.cost_per_check}` : 'Grátis'})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            onClick={requestCheck}
            disabled={requesting || !formData.cpf || !formData.full_name}
            className="w-full"
          >
            {requesting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Solicitando...
              </>
            ) : (
              <>
                <Shield className="w-4 h-4 mr-2" />
                Solicitar Background Check
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {loading ? (
        <Card>
          <CardContent className="flex items-center justify-center p-8">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </CardContent>
        </Card>
      ) : checks.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Histórico de Verificações</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Provider</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Risco</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {checks.map((check) => (
                  <TableRow key={check.id}>
                    <TableCell>
                      {new Date(check.requested_at).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{check.provider}</Badge>
                    </TableCell>
                    <TableCell>{check.check_type}</TableCell>
                    <TableCell>{getStatusBadge(check.status)}</TableCell>
                    <TableCell>
                      {check.score !== null && check.score !== undefined ? (
                        <span className="font-semibold">{check.score}/1000</span>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell>{check.risk_level && getRiskBadge(check.risk_level)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : null}

      <div className="flex justify-end">
        <Button variant="outline" onClick={loadChecks} disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
      </div>
    </div>
  );
}

