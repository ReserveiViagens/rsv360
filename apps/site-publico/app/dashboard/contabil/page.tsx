'use client';

import { useState } from 'react';
import { FileSpreadsheet, Download, Calendar, FileJson, FileText } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/providers/toast-wrapper';
import { getToken } from '@/lib/auth';
import { ErrorBoundary } from '@/components/ui/error-boundary';

function ContabilPageContent() {
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 1);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [format, setFormat] = useState<'csv' | 'xml' | 'json' | 'xlsx'>('csv');
  const [includePayments, setIncludePayments] = useState(true);
  const [includeBookings, setIncludeBookings] = useState(true);
  const [includeRefunds, setIncludeRefunds] = useState(true);
  const [includeSplitCommissions, setIncludeSplitCommissions] = useState(false);
  const [includeDeductions, setIncludeDeductions] = useState(false);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const handleExport = async () => {
    if (!startDate || !endDate) {
      toast.warning('Selecione o período de início e fim');
      return;
    }
    if (new Date(startDate) > new Date(endDate)) {
      toast.warning('Data de início deve ser anterior à data de fim');
      return;
    }
    if (!includePayments && !includeBookings && !includeRefunds && !includeSplitCommissions && !includeDeductions) {
      toast.warning('Selecione ao menos um tipo de dado para exportar');
      return;
    }

    setLoading(true);
    try {
      const token = getToken();
      const response = await fetch('/api/accounting/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          format,
          startDate,
          endDate,
          includePayments,
          includeBookings,
          includeRefunds,
          includeSplitCommissions,
          includeDeductions,
        }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || 'Erro ao exportar');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const ext = format === 'xlsx' ? 'xlsx' : format;
      a.download = `exportacao-contabil-${new Date().toISOString().split('T')[0]}.${ext}`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success('Exportação concluída com sucesso!');
    } catch (error: any) {
      toast.error(error.message || 'Erro ao exportar dados contábeis');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Exportação Contábil</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            Exporte dados financeiros para integração com sistemas contábeis
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5" />
              Configurar exportação
            </CardTitle>
            <CardDescription>
              Selecione o período e os dados que deseja exportar. O arquivo será gerado no formato escolhido.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Período */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate" className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Data inicial
                </Label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate" className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Data final
                </Label>
                <Input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full"
                />
              </div>
            </div>

            {/* Formato */}
            <div className="space-y-2">
              <Label>Formato do arquivo</Label>
              <Select value={format} onValueChange={(v: 'csv' | 'xml' | 'json' | 'xlsx') => setFormat(v)}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="csv">CSV</SelectItem>
                  <SelectItem value="xlsx">Excel (XLSX)</SelectItem>
                  <SelectItem value="json">JSON</SelectItem>
                  <SelectItem value="xml">XML</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Opções */}
            <div className="space-y-3">
              <Label>Dados a incluir</Label>
              <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    checked={includePayments}
                    onCheckedChange={(c) => setIncludePayments(!!c)}
                  />
                  <span className="text-sm">Pagamentos</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    checked={includeBookings}
                    onCheckedChange={(c) => setIncludeBookings(!!c)}
                  />
                  <span className="text-sm">Reservas</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    checked={includeRefunds}
                    onCheckedChange={(c) => setIncludeRefunds(!!c)}
                  />
                  <span className="text-sm">Reembolsos</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    checked={includeSplitCommissions}
                    onCheckedChange={(c) => setIncludeSplitCommissions(!!c)}
                  />
                  <span className="text-sm">Comissões Split</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    checked={includeDeductions}
                    onCheckedChange={(c) => setIncludeDeductions(!!c)}
                  />
                  <span className="text-sm">Deduções</span>
                </label>
              </div>
            </div>

            <Button
              onClick={handleExport}
              disabled={loading}
              className="w-full sm:w-auto"
            >
              {loading ? (
                <>Exportando...</>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Exportar
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Instruções
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>• CSV e Excel são ideais para importação em planilhas e sistemas contábeis.</p>
            <p>• JSON e XML são úteis para integrações via API.</p>
            <p>• Certifique-se de que o período selecionado contém os dados desejados.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function ContabilPage() {
  return (
    <ErrorBoundary>
      <ContabilPageContent />
    </ErrorBoundary>
  );
}
