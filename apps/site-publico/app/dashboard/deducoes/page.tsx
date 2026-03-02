'use client';

import { useState, useEffect } from 'react';
import { Plus, Sparkles, Check, X, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/providers/toast-wrapper';
import { getToken } from '@/lib/auth';
import { ErrorBoundary } from '@/components/ui/error-boundary';

interface Deduction {
  id: number;
  description: string;
  amount: number;
  category?: string;
  ai_confidence?: number;
  approved_by_user: boolean;
}

function DeducoesPageContent() {
  const [deductions, setDeductions] = useState<Deduction[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [classifying, setClassifying] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ description: '', amount: '', category: '' });
  const [suggestedCategory, setSuggestedCategory] = useState<{
    category: string;
    confidence: number;
    suggested_category_pt?: string;
  } | null>(null);
  const toast = useToast();

  const loadDeductions = async () => {
    setLoading(true);
    try {
      const token = getToken();
      const res = await fetch('/api/tax/deductions', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const json = await res.json();
      if (json.success) setDeductions(json.data);
      else throw new Error(json.error);
    } catch (e: unknown) {
      toast.error((e as Error).message || 'Erro ao carregar');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDeductions();
  }, []);

  const handleClassify = async () => {
    if (!form.description.trim()) return;
    setClassifying(true);
    setSuggestedCategory(null);
    try {
      const token = getToken();
      const res = await fetch('/api/tax/classify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          description: form.description,
          amount: form.amount ? parseFloat(form.amount) : undefined,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setSuggestedCategory(json.data);
        setForm((p) => ({ ...p, category: json.data.category }));
      } else throw new Error(json.error);
    } catch (e: unknown) {
      toast.error((e as Error).message || 'Erro ao classificar');
    } finally {
      setClassifying(false);
    }
  };

  const handleSubmit = async () => {
    if (!form.description || !form.amount) {
      toast.warning('Preencha descrição e valor');
      return;
    }
    setSaving(true);
    try {
      const token = getToken();
      const res = await fetch('/api/tax/deductions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          description: form.description,
          amount: parseFloat(form.amount),
          category: form.category || suggestedCategory?.category,
          ai_confidence: suggestedCategory?.confidence,
          approved_by_user: true,
        }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success('Dedução cadastrada');
        setShowForm(false);
        setForm({ description: '', amount: '', category: '' });
        setSuggestedCategory(null);
        loadDeductions();
      } else throw new Error(json.error);
    } catch (e: unknown) {
      toast.error((e as Error).message || 'Erro ao salvar');
    } finally {
      setSaving(false);
    }
  };

  const handleApprove = async (id: number, approved: boolean) => {
    try {
      const token = getToken();
      const res = await fetch('/api/tax/deductions', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ id, approved_by_user: approved }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success(approved ? 'Aprovado' : 'Desaprovado');
        loadDeductions();
      } else throw new Error(json.error);
    } catch (e: unknown) {
      toast.error((e as Error).message || 'Erro');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Deduções Tributárias</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            Cadastre despesas dedutíveis. Use a IA para classificar ou ajuste manualmente.
          </p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Nova dedução</CardTitle>
            <CardDescription>
              Descreva a despesa e use a sugestão IA para categorizar. Aprove ou corrija antes de salvar.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {showForm ? (
              <div className="space-y-4">
                <div>
                  <Label>Descrição</Label>
                  <Input
                    value={form.description}
                    onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                    placeholder="Ex: Anúncio Facebook R$ 500"
                  />
                </div>
                <div>
                  <Label>Valor (R$)</Label>
                  <Input
                    type="number"
                    value={form.amount}
                    onChange={(e) => setForm((p) => ({ ...p, amount: e.target.value }))}
                    placeholder="500"
                  />
                </div>
                <Button
                  variant="outline"
                  onClick={handleClassify}
                  disabled={classifying || !form.description}
                >
                  {classifying ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Sparkles className="w-4 h-4 mr-2" />
                  )}
                  Classificar com IA
                </Button>
                {suggestedCategory && (
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm">
                      Sugestão: <strong>{suggestedCategory.suggested_category_pt || suggestedCategory.category}</strong>{' '}
                      (confiança {(suggestedCategory.confidence * 100).toFixed(0)}%)
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Ajuste a categoria manualmente se necessário antes de salvar.
                    </p>
                  </div>
                )}
                <div>
                  <Label>Categoria (manual ou IA)</Label>
                  <Input
                    value={form.category}
                    onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
                    placeholder="marketing, taxas_plataforma, etc."
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleSubmit} disabled={saving}>
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Salvar'}
                  </Button>
                  <Button variant="outline" onClick={() => setShowForm(false)}>
                    Cancelar
                  </Button>
                </div>
              </div>
            ) : (
              <Button onClick={() => setShowForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Nova dedução
              </Button>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Deduções cadastradas</CardTitle>
          </CardHeader>
          <CardContent>
            {deductions.length === 0 ? (
              <p className="text-muted-foreground text-sm">Nenhuma dedução cadastrada.</p>
            ) : (
              <ul className="space-y-3 overflow-x-auto">
                {deductions.map((d) => (
                  <li
                    key={d.id}
                    className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 p-3 border rounded-lg min-w-0"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-medium">{d.description}</p>
                      <p className="text-sm text-muted-foreground">
                        R$ {d.amount.toLocaleString('pt-BR')} • {d.category || 'Sem categoria'}{' '}
                        {d.approved_by_user ? '(Aprovado)' : '(Pendente)'}
                      </p>
                    </div>
                    {!d.approved_by_user && (
                      <div className="flex gap-2 shrink-0">
                        <Button
                          size="sm"
                          onClick={() => handleApprove(d.id, true)}
                          className="min-h-[44px] min-w-[44px] p-0 touch-manipulation"
                          title="Aprovar"
                        >
                          <Check className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleApprove(d.id, false)}
                          className="min-h-[44px] min-w-[44px] p-0 touch-manipulation"
                          title="Rejeitar"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function DeducoesPage() {
  return (
    <ErrorBoundary>
      <DeducoesPageContent />
    </ErrorBoundary>
  );
}
