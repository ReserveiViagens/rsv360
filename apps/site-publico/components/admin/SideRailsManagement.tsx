'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Plus, Edit, Trash2, Save, RefreshCw, PanelLeft, PanelRight } from '@/lib/lucide-icons';
import type { HomeSideRailsData, SideRailItem, SideRailSection } from '@/lib/home-side-rails';

const API_URL = '/api/admin/website/side-rails';

function getAuthToken(): string {
  const cookies = document.cookie.split(';');
  const tokenCookie = cookies.find((c) => c.trim().startsWith('admin_token='));
  if (tokenCookie) {
    const token = tokenCookie.split('=')[1];
    if (token) return `Bearer ${token}`;
  }
  const fromStorage = localStorage.getItem('admin_token');
  return fromStorage ? `Bearer ${fromStorage}` : 'Bearer admin-token-123';
}

const emptyItem = (): SideRailItem => ({
  id: '',
  title: '',
  subtitle: '',
  href: '/',
  badge: '',
  image: undefined,
});

function generateId(): string {
  return `item-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export default function SideRailsManagement() {
  const [data, setData] = useState<HomeSideRailsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<'left' | 'right'>('left');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [formItem, setFormItem] = useState<SideRailItem>(emptyItem());

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(API_URL, { headers: { Authorization: getAuthToken() } });
      if (!res.ok) throw new Error('Erro ao carregar laterais');
      const result = await res.json();
      if (result.success && result.data) {
        setData(result.data);
      } else {
        setError('Resposta inválida');
      }
    } catch (err: unknown) {
      setError((err as Error).message || 'Erro ao carregar');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleSave = async () => {
    if (!data) return;
    try {
      setSaving(true);
      setError(null);
      setSuccess(false);
      const res = await fetch(API_URL, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: getAuthToken(),
        },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Erro HTTP ${res.status}`);
      }
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: unknown) {
      setError((err as Error).message || 'Erro ao salvar');
    } finally {
      setSaving(false);
    }
  };

  const section = data ? data[activeSubTab] : null;
  const isLeft = activeSubTab === 'left';

  const openAddDialog = () => {
    setEditingIndex(null);
    setFormItem({ ...emptyItem(), id: generateId() });
    setDialogOpen(true);
  };

  const openEditDialog = (index: number) => {
    if (!section) return;
    setEditingIndex(index);
    setFormItem({ ...section.items[index] });
    setDialogOpen(true);
  };

  const handleDeleteItem = (index: number) => {
    if (!data || !section || !confirm('Excluir este card?')) return;
    const items = section.items.filter((_, i) => i !== index);
    setData({
      ...data,
      [activeSubTab]: { ...section, items },
    });
    setDialogOpen(false);
  };

  const handleSubmitItem = () => {
    if (!data || !section) return;
    if (!formItem.title.trim() || !formItem.href.trim()) {
      alert('Título e link são obrigatórios');
      return;
    }
    if (!formItem.id.trim()) formItem.id = generateId();
    const items = [...section.items];
    if (editingIndex !== null) {
      items[editingIndex] = { ...formItem };
    } else {
      items.push({ ...formItem });
    }
    setData({
      ...data,
      [activeSubTab]: { ...section, items },
    });
    setDialogOpen(false);
  };

  const updateSection = (updates: Partial<SideRailSection>) => {
    if (!data || !section) return;
    setData({
      ...data,
      [activeSubTab]: { ...section, ...updates },
    });
  };

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!data) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="pt-6">
          <p className="text-red-700">{error || 'Não foi possível carregar as laterais.'}</p>
          <Button onClick={load} variant="outline" className="mt-4">
            Tentar novamente
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="p-3 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm">
          Laterais salvas com sucesso.
        </div>
      )}

      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-600">
          Edite os títulos, descrições e cards das laterais da home (visíveis em desktop).
        </p>
        <Button onClick={handleSave} disabled={saving} className="flex items-center gap-2">
          <Save className="w-4 h-4" />
          {saving ? 'Salvando...' : 'Salvar alterações'}
        </Button>
      </div>

      <Tabs value={activeSubTab} onValueChange={(v) => setActiveSubTab(v as 'left' | 'right')}>
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="left" className="flex items-center gap-2">
            <PanelLeft className="w-4 h-4" />
            Lateral Esquerda
          </TabsTrigger>
          <TabsTrigger value="right" className="flex items-center gap-2">
            <PanelRight className="w-4 h-4" />
            Lateral Direita
          </TabsTrigger>
        </TabsList>

        <TabsContent value="left" className="mt-6">
          <SectionForm
            section={data.left}
            theme="blue"
            onUpdate={updateSection}
            onAddCard={openAddDialog}
            onEditCard={openEditDialog}
            onDeleteCard={handleDeleteItem}
          />
        </TabsContent>

        <TabsContent value="right" className="mt-6">
          <SectionForm
            section={data.right}
            theme="orange"
            onUpdate={updateSection}
            onAddCard={openAddDialog}
            onEditCard={openEditDialog}
            onDeleteCard={handleDeleteItem}
          />
        </TabsContent>
      </Tabs>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingIndex !== null ? 'Editar card' : 'Adicionar card'}</DialogTitle>
            <DialogDescription>Preencha os campos. Título e link são obrigatórios.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <Label htmlFor="item-id">ID (único)</Label>
              <Input
                id="item-id"
                value={formItem.id}
                onChange={(e) => setFormItem((p) => ({ ...p, id: e.target.value }))}
                placeholder="ex.: hotéis"
              />
            </div>
            <div>
              <Label htmlFor="item-title">Título *</Label>
              <Input
                id="item-title"
                value={formItem.title}
                onChange={(e) => setFormItem((p) => ({ ...p, title: e.target.value }))}
                placeholder="ex.: Reservas de hotéis"
              />
            </div>
            <div>
              <Label htmlFor="item-subtitle">Subtítulo</Label>
              <Input
                id="item-subtitle"
                value={formItem.subtitle}
                onChange={(e) => setFormItem((p) => ({ ...p, subtitle: e.target.value }))}
                placeholder="ex.: Hospedagem com melhor custo-benefício"
              />
            </div>
            <div>
              <Label htmlFor="item-href">Link (href) *</Label>
              <Input
                id="item-href"
                value={formItem.href}
                onChange={(e) => setFormItem((p) => ({ ...p, href: e.target.value }))}
                placeholder="ex.: /hoteis"
              />
            </div>
            <div>
              <Label htmlFor="item-badge">Badge</Label>
              <Input
                id="item-badge"
                value={formItem.badge || ''}
                onChange={(e) => setFormItem((p) => ({ ...p, badge: e.target.value || undefined }))}
                placeholder="ex.: Hotelaria"
              />
            </div>
            <div>
              <Label htmlFor="item-image">URL da imagem (opcional)</Label>
              <Input
                id="item-image"
                value={formItem.image || ''}
                onChange={(e) => setFormItem((p) => ({ ...p, image: e.target.value || undefined }))}
                placeholder="https://..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSubmitItem}>Salvar card</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface SectionFormProps {
  section: SideRailSection;
  theme: 'blue' | 'orange';
  onUpdate: (updates: Partial<SideRailSection>) => void;
  onAddCard: () => void;
  onEditCard: (index: number) => void;
  onDeleteCard: (index: number) => void;
}

function SectionForm({ section, theme, onUpdate, onAddCard, onEditCard, onDeleteCard }: SectionFormProps) {
  const isBlue = theme === 'blue';
  const borderCls = isBlue ? 'border-blue-200' : 'border-orange-200';
  const bgCls = isBlue ? 'from-blue-50 to-white' : 'from-orange-50 to-white';
  const textCls = isBlue ? 'text-blue-700' : 'text-orange-700';
  const btnCls = isBlue ? 'bg-blue-600 hover:bg-blue-700' : 'bg-orange-600 hover:bg-orange-700';

  return (
    <div className="space-y-6">
      <Card className={`border ${borderCls} bg-gradient-to-br ${bgCls}`}>
        <CardHeader>
          <CardTitle className="text-base">Cabeçalho da seção</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Título da seção</Label>
            <Input
              value={section.title}
              onChange={(e) => onUpdate({ title: e.target.value })}
              placeholder="ex.: Descubra experiências"
            />
          </div>
          <div>
            <Label>Descrição</Label>
            <Textarea
              value={section.description}
              onChange={(e) => onUpdate({ description: e.target.value })}
              placeholder="ex.: Produtos para temporada e lazer"
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Cards</CardTitle>
          <Button size="sm" onClick={onAddCard} className={btnCls}>
            <Plus className="w-4 h-4 mr-2" />
            Adicionar card
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {section.items.map((item, index) => (
              <div
                key={item.id}
                className={`flex items-center justify-between p-4 rounded-xl border ${borderCls} bg-white`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium truncate">{item.title}</span>
                    {item.badge && (
                      <Badge variant="secondary" className="text-xs">
                        {item.badge}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 truncate mt-0.5">{item.subtitle}</p>
                  <p className="text-xs text-gray-500 truncate">{item.href}</p>
                </div>
                <div className="flex gap-2 shrink-0 ml-4">
                  <Button variant="outline" size="sm" onClick={() => onEditCard(index)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => onDeleteCard(index)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
            {section.items.length === 0 && (
              <p className="text-sm text-gray-500 py-4 text-center">
                Nenhum card. Clique em &quot;Adicionar card&quot; para criar.
              </p>
            )}
          </div>

          <div className="mt-6 p-4 rounded-lg bg-gray-50 border border-gray-200">
            <p className="text-xs font-medium text-gray-600 mb-2">Preview (estilo {theme})</p>
            <div className={`inline-block p-3 rounded-xl border ${borderCls} bg-gradient-to-br ${bgCls} max-w-xs`}>
              <p className={`text-xs font-semibold uppercase ${textCls}`}>{section.title}</p>
              <p className="text-xs text-gray-600 mt-1">{section.description}</p>
              <div className="mt-3 space-y-2">
                {section.items.slice(0, 3).map((i) => (
                  <div key={i.id} className="p-2 rounded-lg border border-gray-200 bg-white text-xs">
                    <span className="font-medium">{i.title}</span>
                    {i.badge && <Badge className="ml-2 text-[10px]">{i.badge}</Badge>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
