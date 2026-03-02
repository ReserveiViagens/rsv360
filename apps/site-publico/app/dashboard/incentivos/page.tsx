'use client';

import { useState, useEffect } from 'react';
import { Gift, ExternalLink, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/providers/toast-wrapper';
import { getToken } from '@/lib/auth';
import { ErrorBoundary } from '@/components/ui/error-boundary';

function IncentivosPageContent() {
  const [cnae, setCnae] = useState('');
  const [perseStatus, setPerseStatus] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const checkPerse = async () => {
    setLoading(true);
    setPerseStatus(null);
    try {
      const token = getToken();
      const res = await fetch(
        `/api/tax/perse${cnae ? `?cnae=${encodeURIComponent(cnae)}` : ''}`,
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      );
      const json = await res.json();
      if (json.success) setPerseStatus(json.data);
      else throw new Error(json.error);
    } catch (e: unknown) {
      toast.error((e as Error).message || 'Erro ao verificar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Incentivos Fiscais</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            Perse, Goyazes e incentivos para turismo em GO/MT
          </p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gift className="w-5 h-5" />
              Perse (até dez/2026)
            </CardTitle>
            <CardDescription>
              Programa Emergencial de Retomada. 0% em PIS/COFINS/CSLL/IRPJ para CNAEs de turismo.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>CNAE (opcional)</Label>
              <Input
                value={cnae}
                onChange={(e) => setCnae(e.target.value)}
                placeholder="Ex: 79.11-2 (agências de viagens)"
              />
            </div>
            <Button onClick={checkPerse} disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Verificar elegibilidade
            </Button>
            {perseStatus && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <p>
                  <strong>Elegível:</strong> {(perseStatus.eligible as boolean) ? 'Sim' : 'Não'}
                </p>
                <p className="text-sm text-muted-foreground mt-1">{perseStatus.message as string}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Goyazes (GO)</CardTitle>
            <CardDescription>
              Abate até 100% do ICMS devido ao patrocinar projetos culturais. R$ 40 milhões em 2026.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm mb-4">
              Inscrições via plataforma Baru 2.0. Projetos em Caldas Novas/Rio Quente têm prioridade.
            </p>
            <a
              href="https://editaiscultura.sistemas.go.gov.br/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="outline">
                <ExternalLink className="w-4 h-4 mr-2" />
                Acessar Baru 2.0
              </Button>
            </a>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Incentivos regionais</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>
              <strong>Caldas Novas / Rio Quente:</strong> Lei 23.697/2025, LC 99/2017 (meio de hospedagem).
            </p>
            <p>
              <strong>Cuiabá (MT):</strong> Voe MT, Pacote Tributário Comércio (até abr/2026).
            </p>
            <p className="text-muted-foreground">
              Consulte um contador para enquadramento específico.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function IncentivosPage() {
  return (
    <ErrorBoundary>
      <IncentivosPageContent />
    </ErrorBoundary>
  );
}
