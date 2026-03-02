'use client';

import { useState, useEffect } from 'react';
import {
  Percent,
  Users,
  Settings,
  Plus,
  Sparkles,
  Edit2,
  Save,
  Loader2,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/providers/toast-wrapper';
import { getToken } from '@/lib/auth';
import { ErrorBoundary } from '@/components/ui/error-boundary';

interface Receiver {
  id: number;
  type: string;
  name?: string;
  document?: string;
  default_split_pct: number;
  status: string;
}

interface Rule {
  id: number;
  service_type: string;
  platform_pct: number;
  partner_pct: number;
}

interface Suggestion {
  platform_pct: number;
  partner_pct: number;
  confidence: number;
  source: string;
  anomaly_detected?: boolean;
  message?: string;
}

function SplitConfigPageContent() {
  const [receivers, setReceivers] = useState<Receiver[]>([]);
  const [rules, setRules] = useState<Rule[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [suggesting, setSuggesting] = useState<number | null>(null);
  const [editingRule, setEditingRule] = useState<number | null>(null);
  const [ruleOverrides, setRuleOverrides] = useState<Record<number, { platform: number; partner: number }>>({});
  const [newReceiver, setNewReceiver] = useState({ type: 'owner', name: '', document: '', default_split_pct: 80 });
  const [showNewReceiver, setShowNewReceiver] = useState(false);
  const toast = useToast();

  const loadData = async () => {
    setLoading(true);
    try {
      const token = getToken();
      const res = await fetch('/api/split-marketplace/config', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const json = await res.json();
      if (json.success) {
        setReceivers(json.data.receivers || []);
        setRules(json.data.rules || []);
      } else throw new Error(json.error);
    } catch (e: unknown) {
      toast.error((e as Error).message || 'Erro ao carregar');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveRule = async (ruleId: number) => {
    const ov = ruleOverrides[ruleId];
    if (!ov) return;
    setSaving(true);
    try {
      const token = getToken();
      const res = await fetch('/api/split-marketplace/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          action: 'update_rule',
          id: ruleId,
          platform_pct: ov.platform,
          partner_pct: ov.partner,
        }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success('Regra atualizada');
        setEditingRule(null);
        loadData();
      } else throw new Error(json.error);
    } catch (e: unknown) {
      toast.error((e as Error).message || 'Erro ao salvar');
    } finally {
      setSaving(false);
    }
  };

  const handleSuggest = async (receiverId?: number, serviceType = 'rent') => {
    setSuggesting(receiverId ?? -1);
    try {
      const token = getToken();
      const res = await fetch('/api/split-marketplace/suggest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ receiver_id: receiverId, service_type: serviceType, use_ai: true }),
      });
      const json = await res.json();
      if (json.success) {
        const s: Suggestion = json.data;
        toast.success(
          s.anomaly_detected
            ? `Sugestão: ${s.platform_pct}% plataforma (revisar - difere do padrão)`
            : `Sugestão: ${s.platform_pct}% plataforma (confiança ${(s.confidence * 100).toFixed(0)}%)`
        );
      } else throw new Error(json.error);
    } catch (e: unknown) {
      toast.error((e as Error).message || 'Erro na sugestão');
    } finally {
      setSuggesting(null);
    }
  };

  const handleCreateReceiver = async () => {
    if (!newReceiver.type) {
      toast.warning('Selecione o tipo');
      return;
    }
    setSaving(true);
    try {
      const token = getToken();
      const res = await fetch('/api/split-marketplace/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          action: 'create_receiver',
          ...newReceiver,
        }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success('Recebedor criado');
        setShowNewReceiver(false);
        setNewReceiver({ type: 'owner', name: '', document: '', default_split_pct: 80 });
        loadData();
      } else throw new Error(json.error);
    } catch (e: unknown) {
      toast.error((e as Error).message || 'Erro ao criar');
    } finally {
      setSaving(false);
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
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Configuração Split Marketplace</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            Configure recebedores e percentuais de comissão. Use sugestão IA ou ajuste manualmente.
          </p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Percent className="w-5 h-5" />
              Regras por tipo de serviço
            </CardTitle>
            <CardDescription>
              Percentual padrão plataforma/parceiro. Substituição manual disponível.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {rules.map((r) => (
              <div
                key={r.id}
                className="flex flex-wrap items-center gap-4 p-3 bg-gray-50 rounded-lg min-w-0 overflow-x-auto"
              >
                <span className="font-medium capitalize w-24">{r.service_type}</span>
                {editingRule === r.id ? (
                  <>
                    <Input
                      type="number"
                      className="w-20"
                      value={ruleOverrides[r.id]?.platform ?? r.platform_pct}
                      onChange={(e) =>
                        setRuleOverrides((prev) => ({
                          ...prev,
                          [r.id]: {
                            platform: parseFloat(e.target.value) || 0,
                            partner: 100 - (parseFloat(e.target.value) || 0),
                          },
                        }))
                      }
                    />
                    <span className="text-muted-foreground">% plataforma</span>
                    <Button size="sm" onClick={() => handleSaveRule(r.id)} disabled={saving}>
                      <Save className="w-4 h-4 mr-1" />
                      Salvar
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setEditingRule(null)}>
                      Cancelar
                    </Button>
                  </>
                ) : (
                  <>
                    <span className="text-sm">
                      {r.platform_pct}% plataforma / {r.partner_pct}% parceiro
                    </span>
                    <Button size="sm" variant="outline" onClick={() => setEditingRule(r.id)}>
                      <Edit2 className="w-4 h-4 mr-1" />
                      Editar
                    </Button>
                  </>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Recebedores
            </CardTitle>
            <CardDescription>
              Proprietários, imobiliárias e parques. Configure % individual ou use sugestão IA.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {receivers.length === 0 && !showNewReceiver && (
              <p className="text-muted-foreground text-sm mb-4">Nenhum recebedor cadastrado.</p>
            )}
            <ul className="space-y-3 mb-4 overflow-x-auto">
              {receivers.map((rec) => (
                <li
                  key={rec.id}
                  className="flex flex-wrap items-center justify-between gap-2 p-3 border rounded-lg min-w-0"
                >
                  <div className="min-w-0 flex-1">
                    <span className="font-medium">{rec.name || `Recebedor #${rec.id}`}</span>
                    <span className="text-muted-foreground text-sm ml-2 capitalize">({rec.type})</span>
                    <span className="text-sm ml-2">- {rec.default_split_pct}% parceiro</span>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleSuggest(rec.id, 'rent')}
                    disabled={suggesting !== null}
                  >
                    {suggesting === rec.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-1" />
                        Sugestão IA
                      </>
                    )}
                  </Button>
                </li>
              ))}
            </ul>
            {showNewReceiver ? (
              <div className="space-y-3 p-4 border rounded-lg bg-gray-50">
                <Label>Tipo</Label>
                <Select
                  value={newReceiver.type}
                  onValueChange={(v) => setNewReceiver((p) => ({ ...p, type: v }))}
                >
                  <SelectTrigger className="w-full sm:w-40 min-w-0">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="owner">Proprietário</SelectItem>
                    <SelectItem value="agency">Imobiliária</SelectItem>
                    <SelectItem value="park">Parque</SelectItem>
                  </SelectContent>
                </Select>
                <div>
                  <Label>Nome</Label>
                  <Input
                    value={newReceiver.name}
                    onChange={(e) => setNewReceiver((p) => ({ ...p, name: e.target.value }))}
                    placeholder="Nome ou razão social"
                  />
                </div>
                <div>
                  <Label>CPF/CNPJ</Label>
                  <Input
                    value={newReceiver.document}
                    onChange={(e) => setNewReceiver((p) => ({ ...p, document: e.target.value }))}
                    placeholder="Apenas números"
                  />
                </div>
                <div>
                  <Label>% Parceiro (padrão)</Label>
                  <Input
                    type="number"
                    value={newReceiver.default_split_pct}
                    onChange={(e) =>
                      setNewReceiver((p) => ({ ...p, default_split_pct: parseFloat(e.target.value) || 80 }))
                    }
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleCreateReceiver} disabled={saving}>
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Criar'}
                  </Button>
                  <Button variant="outline" onClick={() => setShowNewReceiver(false)}>
                    Cancelar
                  </Button>
                </div>
              </div>
            ) : (
              <Button variant="outline" onClick={() => setShowNewReceiver(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Novo recebedor
              </Button>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              Sugestão IA (geral)
            </CardTitle>
            <CardDescription>
              Obtenha sugestão de comissão baseada em histórico. Sem parceiro específico usa padrão.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="outline"
              onClick={() => handleSuggest(undefined, 'rent')}
              disabled={suggesting !== null}
            >
              {suggesting === -1 ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Sparkles className="w-4 h-4 mr-2" />
              )}
              Sugerir para aluguel
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function SplitConfigPage() {
  return (
    <ErrorBoundary>
      <SplitConfigPageContent />
    </ErrorBoundary>
  );
}
