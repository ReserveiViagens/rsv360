'use client';

/**
 * Componente: Interações do Cliente (CRM)
 * Lista interações e permite criar novas interações
 */

import { useState, useEffect } from 'react';
import { 
  MessageSquare, Plus, Edit, Trash2, Save, X, 
  Loader2, Phone, Mail, Calendar, Clock, Filter
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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

interface Interaction {
  id: number;
  interaction_type: string;
  channel: string;
  subject?: string;
  description?: string;
  outcome?: string;
  duration_minutes?: number;
  sentiment?: string;
  priority: string;
  interaction_date: string;
  created_at: string;
}

interface CustomerInteractionsProps {
  customerId: number;
  className?: string;
}

export function CustomerInteractions({ customerId, className }: CustomerInteractionsProps) {
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    interaction_type: 'call',
    channel: 'phone',
    subject: '',
    description: '',
    outcome: '',
    duration_minutes: undefined as number | undefined,
    sentiment: '',
    priority: 'normal',
    interaction_date: new Date().toISOString().slice(0, 16),
  });
  const [filters, setFilters] = useState({
    interaction_type: '',
    channel: '',
    priority: '',
  });

  useEffect(() => {
    fetchInteractions();
  }, [customerId]);

  const fetchInteractions = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/crm/customers/${customerId}/interactions`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao carregar interações');
      }

      const result = await response.json();
      setInteractions(result.data || []);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar interações');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url = editingId
        ? `/api/crm/interactions/${editingId}`
        : '/api/crm/interactions';

      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          customer_id: customerId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao salvar interação');
      }

      setShowForm(false);
      setEditingId(null);
      setFormData({
        interaction_type: 'call',
        channel: 'phone',
        subject: '',
        description: '',
        outcome: '',
        duration_minutes: undefined,
        sentiment: '',
        priority: 'normal',
        interaction_date: new Date().toISOString().slice(0, 16),
      });
      fetchInteractions();
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar interação');
    }
  };

  const handleEdit = (interaction: Interaction) => {
    setEditingId(interaction.id);
    setFormData({
      interaction_type: interaction.interaction_type,
      channel: interaction.channel,
      subject: interaction.subject || '',
      description: interaction.description || '',
      outcome: interaction.outcome || '',
      duration_minutes: interaction.duration_minutes || undefined,
      sentiment: interaction.sentiment || '',
      priority: interaction.priority,
      interaction_date: interaction.interaction_date
        ? new Date(interaction.interaction_date).toISOString().slice(0, 16)
        : new Date().toISOString().slice(0, 16),
    });
    setShowForm(true);
  };

  const handleDelete = async (interactionId: number) => {
    if (!confirm('Tem certeza que deseja deletar esta interação?')) {
      return;
    }

    try {
      const response = await fetch(`/api/crm/interactions/${interactionId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao deletar interação');
      }

      fetchInteractions();
    } catch (err: any) {
      setError(err.message || 'Erro ao deletar interação');
    }
  };

  const getInteractionIcon = (channel: string) => {
    if (channel === 'phone') return <Phone className="h-4 w-4" />;
    if (channel === 'email') return <Mail className="h-4 w-4" />;
    return <MessageSquare className="h-4 w-4" />;
  };

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      low: 'bg-gray-100 text-gray-800',
      normal: 'bg-blue-100 text-blue-800',
      high: 'bg-yellow-100 text-yellow-800',
      urgent: 'bg-red-100 text-red-800',
    };
    return colors[priority] || 'bg-gray-100 text-gray-800';
  };

  const getSentimentColor = (sentiment?: string) => {
    if (!sentiment) return '';
    const colors: Record<string, string> = {
      positive: 'bg-green-100 text-green-800',
      neutral: 'bg-gray-100 text-gray-800',
      negative: 'bg-red-100 text-red-800',
    };
    return colors[sentiment] || '';
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const filteredInteractions = interactions.filter((interaction) => {
    if (filters.interaction_type && interaction.interaction_type !== filters.interaction_type) {
      return false;
    }
    if (filters.channel && interaction.channel !== filters.channel) {
      return false;
    }
    if (filters.priority && interaction.priority !== filters.priority) {
      return false;
    }
    return true;
  });

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
              <MessageSquare className="h-5 w-5" />
              Interações do Cliente
            </CardTitle>
            <Button size="sm" onClick={() => setShowForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Interação
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Filtros */}
          <div className="flex items-center gap-2 mb-4">
            <Filter className="h-4 w-4 text-gray-500" />
            <Select
              value={filters.interaction_type || 'all'}
              onValueChange={(value) =>
                setFilters({ ...filters, interaction_type: value === 'all' ? undefined : value })
              }
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                <SelectItem value="call">Chamada</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="meeting">Reunião</SelectItem>
                <SelectItem value="chat">Chat</SelectItem>
                <SelectItem value="ticket">Ticket</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={filters.channel || 'all'}
              onValueChange={(value) => setFilters({ ...filters, channel: value === 'all' ? undefined : value })}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Canal" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os canais</SelectItem>
                <SelectItem value="phone">Telefone</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="whatsapp">WhatsApp</SelectItem>
                <SelectItem value="web">Web</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={filters.priority || 'all'}
              onValueChange={(value) => setFilters({ ...filters, priority: value === 'all' ? undefined : value })}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Prioridade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="low">Baixa</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="high">Alta</SelectItem>
                <SelectItem value="urgent">Urgente</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Formulário */}
          {showForm && (
            <Card className="mb-6 border-blue-200 bg-blue-50">
              <CardContent className="pt-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="interaction_type">Tipo</Label>
                      <Select
                        value={formData.interaction_type}
                        onValueChange={(value) =>
                          setFormData({ ...formData, interaction_type: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="call">Chamada</SelectItem>
                          <SelectItem value="email">Email</SelectItem>
                          <SelectItem value="meeting">Reunião</SelectItem>
                          <SelectItem value="chat">Chat</SelectItem>
                          <SelectItem value="ticket">Ticket</SelectItem>
                          <SelectItem value="booking">Reserva</SelectItem>
                          <SelectItem value="support">Suporte</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="channel">Canal</Label>
                      <Select
                        value={formData.channel}
                        onValueChange={(value) =>
                          setFormData({ ...formData, channel: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="phone">Telefone</SelectItem>
                          <SelectItem value="email">Email</SelectItem>
                          <SelectItem value="whatsapp">WhatsApp</SelectItem>
                          <SelectItem value="web">Web</SelectItem>
                          <SelectItem value="app">App</SelectItem>
                          <SelectItem value="in_person">Presencial</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="priority">Prioridade</Label>
                      <Select
                        value={formData.priority}
                        onValueChange={(value) =>
                          setFormData({ ...formData, priority: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Baixa</SelectItem>
                          <SelectItem value="normal">Normal</SelectItem>
                          <SelectItem value="high">Alta</SelectItem>
                          <SelectItem value="urgent">Urgente</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="interaction_date">Data/Hora</Label>
                      <Input
                        id="interaction_date"
                        type="datetime-local"
                        value={formData.interaction_date}
                        onChange={(e) =>
                          setFormData({ ...formData, interaction_date: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="subject">Assunto</Label>
                      <Input
                        id="subject"
                        value={formData.subject}
                        onChange={(e) =>
                          setFormData({ ...formData, subject: e.target.value })
                        }
                        placeholder="Assunto da interação"
                      />
                    </div>
                    <div>
                      <Label htmlFor="sentiment">Sentimento</Label>
                      <Select
                        value={formData.sentiment}
                        onValueChange={(value) =>
                          setFormData({ ...formData, sentiment: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="positive">Positivo</SelectItem>
                          <SelectItem value="neutral">Neutro</SelectItem>
                          <SelectItem value="negative">Negativo</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="duration_minutes">Duração (minutos)</Label>
                      <Input
                        id="duration_minutes"
                        type="number"
                        value={formData.duration_minutes || ''}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            duration_minutes: e.target.value
                              ? parseInt(e.target.value)
                              : undefined,
                          })
                        }
                        min="0"
                      />
                    </div>
                    <div>
                      <Label htmlFor="outcome">Resultado</Label>
                      <Input
                        id="outcome"
                        value={formData.outcome}
                        onChange={(e) =>
                          setFormData({ ...formData, outcome: e.target.value })
                        }
                        placeholder="Resultado da interação"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="description">Descrição</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({ ...formData, description: e.target.value })
                      }
                      placeholder="Descrição detalhada da interação"
                      rows={4}
                    />
                  </div>
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowForm(false);
                        setEditingId(null);
                        setFormData({
                          interaction_type: 'call',
                          channel: 'phone',
                          subject: '',
                          description: '',
                          outcome: '',
                          duration_minutes: undefined,
                          sentiment: '',
                          priority: 'normal',
                          interaction_date: new Date().toISOString().slice(0, 16),
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

          {/* Tabela de interações */}
          {filteredInteractions.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              Nenhuma interação encontrada
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tipo/Canal</TableHead>
                    <TableHead>Assunto</TableHead>
                    <TableHead>Prioridade</TableHead>
                    <TableHead>Sentimento</TableHead>
                    <TableHead>Data/Hora</TableHead>
                    <TableHead>Duração</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInteractions.map((interaction) => (
                    <TableRow key={interaction.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getInteractionIcon(interaction.channel)}
                          <div>
                            <div className="font-medium capitalize">
                              {interaction.interaction_type}
                            </div>
                            <div className="text-xs text-gray-500 capitalize">
                              {interaction.channel}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {interaction.subject || (
                          <span className="text-gray-400">Sem assunto</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge className={getPriorityColor(interaction.priority)}>
                          {interaction.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {interaction.sentiment && (
                          <Badge className={getSentimentColor(interaction.sentiment)}>
                            {interaction.sentiment}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {formatDateTime(interaction.interaction_date || interaction.created_at)}
                      </TableCell>
                      <TableCell>
                        {interaction.duration_minutes ? (
                          <div className="flex items-center gap-1 text-sm">
                            <Clock className="h-3 w-3" />
                            {interaction.duration_minutes} min
                          </div>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(interaction)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(interaction.id)}
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

