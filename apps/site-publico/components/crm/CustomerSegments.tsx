'use client';

/**
 * Componente: Segmentação de Clientes (CRM)
 * Lista segmentos, visualização de distribuição, criar/editar segmentos
 */

import { useState, useEffect } from 'react';
import { 
  Users, Plus, Edit, Trash2, Save, X, 
  Loader2, RefreshCw, BarChart3, PieChart
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';

interface Segment {
  id: number;
  name: string;
  description?: string;
  criteria: any;
  is_active: boolean;
  is_auto_update: boolean;
  customer_count: number;
  last_calculated_at?: string;
  created_at: string;
  updated_at: string;
}

interface CustomerSegmentsProps {
  className?: string;
}

export function CustomerSegments({ className }: CustomerSegmentsProps) {
  const [segments, setSegments] = useState<Segment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    criteria: {
      min_bookings: undefined as number | undefined,
      min_total_spent: undefined as number | undefined,
      loyalty_tier: [] as string[],
      tags: [] as string[],
    },
    is_active: true,
    is_auto_update: true,
  });

  useEffect(() => {
    fetchSegments();
  }, []);

  const fetchSegments = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/crm/segments');

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao carregar segmentos');
      }

      const result = await response.json();
      setSegments(result.data || []);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar segmentos');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url = editingId
        ? `/api/crm/segments/${editingId}`
        : '/api/crm/segments';

      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao salvar segmento');
      }

      setShowForm(false);
      setEditingId(null);
      setFormData({
        name: '',
        description: '',
        criteria: {
          min_bookings: undefined,
          min_total_spent: undefined,
          loyalty_tier: [],
          tags: [],
        },
        is_active: true,
        is_auto_update: true,
      });
      fetchSegments();
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar segmento');
    }
  };

  const handleEdit = (segment: Segment) => {
    setEditingId(segment.id);
    setFormData({
      name: segment.name,
      description: segment.description || '',
      criteria: typeof segment.criteria === 'string' 
        ? JSON.parse(segment.criteria) 
        : segment.criteria,
      is_active: segment.is_active,
      is_auto_update: segment.is_auto_update,
    });
    setShowForm(true);
  };

  const handleDelete = async (segmentId: number) => {
    if (!confirm('Tem certeza que deseja deletar este segmento?')) {
      return;
    }

    try {
      const response = await fetch(`/api/crm/segments/${segmentId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao deletar segmento');
      }

      fetchSegments();
    } catch (err: any) {
      setError(err.message || 'Erro ao deletar segmento');
    }
  };

  const handleRecalculate = async (segmentId: number) => {
    try {
      const response = await fetch(`/api/crm/segments/${segmentId}/calculate`, {
        method: 'POST',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao recalcular segmento');
      }

      fetchSegments();
    } catch (err: any) {
      setError(err.message || 'Erro ao recalcular segmento');
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Nunca';
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Calcular distribuição total
  const totalCustomers = segments.reduce((sum, seg) => sum + seg.customer_count, 0);
  const maxSegmentSize = Math.max(...segments.map(s => s.customer_count), 1);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="space-y-6">
        {/* Visualização de Distribuição */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Distribuição de Segmentos
            </CardTitle>
          </CardHeader>
          <CardContent>
            {segments.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Nenhum segmento criado ainda
              </div>
            ) : (
              <div className="space-y-4">
                {segments.map((segment) => {
                  const percentage = totalCustomers > 0
                    ? (segment.customer_count / totalCustomers) * 100
                    : 0;
                  const barWidth = totalCustomers > 0
                    ? (segment.customer_count / maxSegmentSize) * 100
                    : 0;

                  return (
                    <div key={segment.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{segment.name}</span>
                          <Badge variant={segment.is_active ? 'default' : 'secondary'}>
                            {segment.is_active ? 'Ativo' : 'Inativo'}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-600">
                          {segment.customer_count} clientes ({percentage.toFixed(1)}%)
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-blue-600 h-3 rounded-full transition-all"
                          style={{ width: `${barWidth}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">Total de Clientes</span>
                    <span className="text-gray-600">{totalCustomers}</span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Lista de Segmentos */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl flex items-center gap-2">
                <Users className="h-5 w-5" />
                Segmentos de Clientes
              </CardTitle>
              <Button size="sm" onClick={() => setShowForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Novo Segmento
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Formulário */}
            {showForm && (
              <Card className="mb-6 border-blue-200 bg-blue-50">
                <CardContent className="pt-6">
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Nome do Segmento *</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) =>
                            setFormData({ ...formData, name: e.target.value })
                          }
                          required
                          placeholder="ex.: Clientes VIP"
                        />
                      </div>
                      <div>
                        <Label htmlFor="description">Descrição</Label>
                        <Input
                          id="description"
                          value={formData.description}
                          onChange={(e) =>
                            setFormData({ ...formData, description: e.target.value })
                          }
                          placeholder="Descrição do segmento"
                        />
                      </div>
                    </div>

                    <div>
                      <Label>Critérios de Segmentação</Label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                        <div>
                          <Label htmlFor="min_bookings" className="text-sm">
                            Mínimo de Reservas
                          </Label>
                          <Input
                            id="min_bookings"
                            type="number"
                            value={formData.criteria.min_bookings || ''}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                criteria: {
                                  ...formData.criteria,
                                  min_bookings: e.target.value
                                    ? parseInt(e.target.value)
                                    : undefined,
                                },
                              })
                            }
                            min="0"
                          />
                        </div>
                        <div>
                          <Label htmlFor="min_total_spent" className="text-sm">
                            Valor Mínimo Gasto (R$)
                          </Label>
                          <Input
                            id="min_total_spent"
                            type="number"
                            step="0.01"
                            value={formData.criteria.min_total_spent || ''}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                criteria: {
                                  ...formData.criteria,
                                  min_total_spent: e.target.value
                                    ? parseFloat(e.target.value)
                                    : undefined,
                                },
                              })
                            }
                            min="0"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-2">
                        <Switch
                          id="is_active"
                          checked={formData.is_active}
                          onCheckedChange={(checked) =>
                            setFormData({ ...formData, is_active: checked })
                          }
                        />
                        <Label htmlFor="is_active">Ativo</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          id="is_auto_update"
                          checked={formData.is_auto_update}
                          onCheckedChange={(checked) =>
                            setFormData({ ...formData, is_auto_update: checked })
                          }
                        />
                        <Label htmlFor="is_auto_update">Atualização Automática</Label>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setShowForm(false);
                          setEditingId(null);
                          setFormData({
                            name: '',
                            description: '',
                            criteria: {
                              min_bookings: undefined,
                              min_total_spent: undefined,
                              loyalty_tier: [],
                              tags: [],
                            },
                            is_active: true,
                            is_auto_update: true,
                          });
                        }}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Cancelar
                      </Button>
                      <Button type="submit">
                        <Save className="h-4 w-4 mr-2" />
                        Salvar
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* Tabela de Segmentos */}
            {segments.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                Nenhum segmento encontrado
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Clientes</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Última Atualização</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {segments.map((segment) => (
                      <TableRow key={segment.id}>
                        <TableCell className="font-medium">
                          {segment.name}
                        </TableCell>
                        <TableCell>
                          {segment.description || (
                            <span className="text-gray-400">Sem descrição</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-gray-500" />
                            <span className="font-medium">{segment.customer_count}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <Badge variant={segment.is_active ? 'default' : 'secondary'}>
                              {segment.is_active ? 'Ativo' : 'Inativo'}
                            </Badge>
                            {segment.is_auto_update && (
                              <Badge variant="outline" className="text-xs">
                                Auto-update
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-gray-600">
                            {formatDate(segment.last_calculated_at)}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRecalculate(segment.id)}
                              title="Recalcular clientes"
                            >
                              <RefreshCw className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(segment)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(segment.id)}
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

