'use client';

import { useState, useEffect } from 'react';
import { Calculator, AlertTriangle, TrendingDown, FileText } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/providers/toast-wrapper';
import { getToken } from '@/lib/auth';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import Link from 'next/link';

function TributacaoPageContent() {
  const [grossRevenue, setGrossRevenue] = useState('');
  const [simulation, setSimulation] = useState<Record<string, unknown> | null>(null);
  const [thresholds, setThresholds] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const runSimulation = async () => {
    const rev = parseFloat(grossRevenue);
    if (!rev || rev <= 0) {
      toast.warning('Informe um faturamento válido');
      return;
    }
    setLoading(true);
    try {
      const token = getToken();
      const res = await fetch('/api/tax/simulation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ gross_revenue: rev, regime: 'simples', service_type: 'services' }),
      });
      const json = await res.json();
      if (json.success) {
        setSimulation(json.data.simulation);
        setThresholds(json.data.thresholds);
      } else throw new Error(json.error);
    } catch (e: unknown) {
      toast.error((e as Error).message || 'Erro ao simular');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Tributação Otimizada</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            Simule impostos, deduções e acompanhe alertas para 2027 (IBS/CBS)
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 mb-6">
          <Link href="/dashboard/deducoes">
            <Card className="hover:bg-gray-50 cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Deduções
                </CardTitle>
                <CardDescription>Cadastre despesas dedutíveis com classificação IA</CardDescription>
              </CardHeader>
            </Card>
          </Link>
          <Link href="/dashboard/incentivos">
            <Card className="hover:bg-gray-50 cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingDown className="w-5 h-5" />
                  Incentivos
                </CardTitle>
                <CardDescription>Perse, Goyazes e incentivos GO/MT</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="w-5 h-5" />
              Simulador
            </CardTitle>
            <CardDescription>
              Informe o faturamento bruto para simular impostos no Simples Nacional
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Faturamento bruto (R$)</Label>
              <Input
                type="number"
                placeholder="Ex: 600000"
                value={grossRevenue}
                onChange={(e) => setGrossRevenue(e.target.value)}
                className="mt-1 w-full max-w-xs"
              />
            </div>
            <Button onClick={runSimulation} disabled={loading}>
              {loading ? 'Simulando...' : 'Simular'}
            </Button>
            {simulation && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg space-y-2">
                <p>
                  <strong>Base tributável:</strong> R${' '}
                  {(simulation.taxable_base as number).toLocaleString('pt-BR', {
                    minimumFractionDigits: 2,
                  })}
                </p>
                <p>
                  <strong>Imposto ({simulation.rate_pct}%):</strong> R${' '}
                  {(simulation.tax_amount as number).toLocaleString('pt-BR', {
                    minimumFractionDigits: 2,
                  })}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {thresholds && (thresholds.message as string) && (
          <Card className="border-amber-200 bg-amber-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-amber-800">
                <AlertTriangle className="w-5 h-5" />
                Alerta IBS/CBS 2027
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-amber-800">{thresholds.message as string}</p>
            </CardContent>
          </Card>
        )}

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Simulador conversacional</CardTitle>
            <CardDescription>
              Pergunte em linguagem natural sobre Perse, Goyazes ou economia de impostos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/simulador">
              <Button variant="outline">Abrir chat tributário</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function TributacaoPage() {
  return (
    <ErrorBoundary>
      <TributacaoPageContent />
    </ErrorBoundary>
  );
}
