'use client';

/**
 * Componente: Preferências do Cliente (CRM)
 * Lista e permite editar preferências do cliente
 */

import { useState, useEffect } from 'react';
import { 
  Settings, Plus, Edit, Trash2, Save, X, 
  Loader2, CheckCircle, AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
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

interface CustomerPreference {
  id: number;
  preference_key: string;
  preference_value: string;
  preference_type: 'string' | 'boolean' | 'number' | 'json';
  category?: string;
  is_active: boolean;
  source?: string;
  confidence: number;
  created_at: string;
  updated_at: string;
}

interface CustomerPreferencesProps {
  customerId: number;
  className?: string;
}

export function CustomerPreferences({ customerId, className }: CustomerPreferencesProps) {
  const [preferences, setPreferences] = useState<CustomerPreference[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    preference_key: '',
    preference_value: '',
    preference_type: 'string' as 'string' | 'boolean' | 'number' | 'json',
    category: '',
    is_active: true,
  });

  useEffect(() => {
    fetchPreferences();
  }, [customerId]);

  const fetchPreferences = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/crm/customers/${customerId}/preferences`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao carregar preferências');
      }

      const result = await response.json();
      setPreferences(result.data || []);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar preferências');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (pref: CustomerPreference) => {
    setEditingId(pref.id);
    setFormData({
      preference_key: pref.preference_key,
      preference_value: pref.preference_value,
      preference_type: pref.preference_type,
      category: pref.category || '',
      is_active: pref.is_active,
    });
  };

  const handleSave = async () => {
    try {
      if (editingId) {
        // Atualizar preferência existente
        const response = await fetch(
          `/api/crm/customers/${customerId}/preferences/${editingId}`,
          {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData),
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Erro ao atualizar preferência');
        }
      } else {
        // Criar nova preferência
        const response = await fetch(
          `/api/crm/customers/${customerId}/preferences`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData),
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Erro ao criar preferência');
        }
      }

      setEditingId(null);
      setShowAddForm(false);
      setFormData({
        preference_key: '',
        preference_value: '',
        preference_type: 'string',
        category: '',
        is_active: true,
      });
      fetchPreferences();
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar preferência');
    }
  };

  const handleDelete = async (prefId: number) => {
    if (!confirm('Tem certeza que deseja deletar esta preferência?')) {
      return;
    }

    try {
      const response = await fetch(
        `/api/crm/customers/${customerId}/preferences/${prefId}`,
        { method: 'DELETE' }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao deletar preferência');
      }

      fetchPreferences();
    } catch (err: any) {
      setError(err.message || 'Erro ao deletar preferência');
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setShowAddForm(false);
    setFormData({
      preference_key: '',
      preference_value: '',
      preference_type: 'string',
      category: '',
      is_active: true,
    });
  };

  const getCategoryColor = (category?: string) => {
    const colors: Record<string, string> = {
      accommodation: 'bg-blue-100 text-blue-800',
      services: 'bg-green-100 text-green-800',
      communication: 'bg-purple-100 text-purple-800',
      marketing: 'bg-yellow-100 text-yellow-800',
      payment: 'bg-red-100 text-red-800',
    };
    return colors[category || ''] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Preferências do Cliente
            </CardTitle>
            <Button
              size="sm"
              onClick={() => {
                setShowAddForm(true);
                setEditingId(null);
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Adicionar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Formulário de adicionar/editar */}
          {(showAddForm || editingId) && (
            <Card className="mb-6 border-blue-200 bg-blue-50">
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="preference_key">Chave</Label>
                    <Input
                      id="preference_key"
                      value={formData.preference_key}
                      onChange={(e) =>
                        setFormData({ ...formData, preference_key: e.target.value })
                      }
                      placeholder="ex.: tipo_quarto_preferido"
                    />
                  </div>
                  <div>
                    <Label htmlFor="preference_value">Valor</Label>
                    <Input
                      id="preference_value"
                      value={formData.preference_value}
                      onChange={(e) =>
                        setFormData({ ...formData, preference_value: e.target.value })
                      }
                      placeholder="ex.: suíte"
                    />
                  </div>
                  <div>
                    <Label htmlFor="preference_type">Tipo</Label>
                    <Select
                      value={formData.preference_type}
                      onValueChange={(value: any) =>
                        setFormData({ ...formData, preference_type: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="string">String</SelectItem>
                        <SelectItem value="boolean">Boolean</SelectItem>
                        <SelectItem value="number">Number</SelectItem>
                        <SelectItem value="json">JSON</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="category">Categoria</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) =>
                        setFormData({ ...formData, category: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="accommodation">Acomodação</SelectItem>
                        <SelectItem value="services">Serviços</SelectItem>
                        <SelectItem value="communication">Comunicação</SelectItem>
                        <SelectItem value="marketing">Marketing</SelectItem>
                        <SelectItem value="payment">Pagamento</SelectItem>
                        <SelectItem value="other">Outros</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex items-center justify-end gap-2 mt-4">
                  <Button variant="outline" onClick={handleCancel}>
                    <X className="h-4 w-4 mr-2" />
                    Cancelar
                  </Button>
                  <Button onClick={handleSave}>
                    <Save className="h-4 w-4 mr-2" />
                    Salvar
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tabela de preferências */}
          {preferences.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              Nenhuma preferência cadastrada
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Chave</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {preferences.map((pref) => (
                    <TableRow key={pref.id}>
                      <TableCell className="font-medium">
                        {pref.preference_key}
                      </TableCell>
                      <TableCell>
                        <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                          {pref.preference_value}
                        </code>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{pref.preference_type}</Badge>
                      </TableCell>
                      <TableCell>
                        {pref.category && (
                          <Badge className={getCategoryColor(pref.category)}>
                            {pref.category}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={pref.is_active ? 'default' : 'secondary'}
                        >
                          {pref.is_active ? 'Ativa' : 'Inativa'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(pref)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(pref.id)}
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
  );
}

