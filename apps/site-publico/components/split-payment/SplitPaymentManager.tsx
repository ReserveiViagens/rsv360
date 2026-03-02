/**
 * ✅ COMPONENTE: SPLIT PAYMENT MANAGER
 * Componente para gerenciar divisão de pagamentos
 */

'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, DollarSign, Users, CheckCircle2, XCircle, Clock } from '@/lib/lucide-icons';
import { getUser, getToken } from '@/lib/auth';
import { toast } from 'sonner';

interface SplitPayment {
  id: number;
  booking_id: number;
  total_amount: number;
  split_type: 'equal' | 'percentage' | 'custom';
  status: 'pending' | 'partial' | 'completed' | 'cancelled';
  participants: SplitParticipant[];
  created_at: string;
}

interface SplitParticipant {
  id: number;
  email: string;
  name?: string;
  amount: number;
  percentage?: number;
  status: 'pending' | 'invited' | 'paid' | 'cancelled';
}

export function SplitPaymentManager({ bookingId }: { bookingId?: number }) {
  const [splitPayment, setSplitPayment] = useState<SplitPayment | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [formData, setFormData] = useState({
    total_amount: '',
    split_type: 'equal' as 'equal' | 'percentage' | 'custom',
    participants: [] as Array<{ email: string; name?: string; amount?: string; percentage?: string }>,
  });

  const user = getUser();
  const token = getToken();

  useEffect(() => {
    if (bookingId) {
      loadSplitPayment();
    }
  }, [bookingId]);

  const loadSplitPayment = async () => {
    if (!bookingId) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/split-payments?booking_id=${bookingId}`, {
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          setSplitPayment(null);
          return;
        }
        throw new Error('Erro ao carregar split payment');
      }

      const result = await response.json();
      if (result.success) {
        setSplitPayment(result.data);
      }
    } catch (error: any) {
      toast.error(error.message || 'Erro ao carregar split payment');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!bookingId) {
      toast.error('ID da reserva é obrigatório');
      return;
    }

    if (!formData.total_amount || parseFloat(formData.total_amount) <= 0) {
      toast.error('Valor total deve ser maior que zero');
      return;
    }

    if (formData.participants.length === 0) {
      toast.error('Adicione pelo menos um participante');
      return;
    }

    try {
      const participants = formData.participants.map((p) => ({
        email: p.email,
        name: p.name,
        ...(formData.split_type === 'equal' ? {} : 
            formData.split_type === 'percentage' ? { percentage: parseFloat(p.percentage || '0') } :
            { amount: parseFloat(p.amount || '0') }),
      }));

      const response = await fetch('/api/split-payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({
          booking_id: bookingId,
          total_amount: parseFloat(formData.total_amount),
          split_type: formData.split_type,
          participants,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao criar split payment');
      }

      if (result.success) {
        toast.success('Split payment criado com sucesso!');
        setIsCreateOpen(false);
        setFormData({
          total_amount: '',
          split_type: 'equal',
          participants: [],
        });
        loadSplitPayment();
      }
    } catch (error: any) {
      toast.error(error.message || 'Erro ao criar split payment');
    }
  };

  const addParticipant = () => {
    setFormData({
      ...formData,
      participants: [...formData.participants, { email: '', name: '' }],
    });
  };

  const removeParticipant = (index: number) => {
    setFormData({
      ...formData,
      participants: formData.participants.filter((_, i) => i !== index),
    });
  };

  const updateParticipant = (index: number, field: string, value: string) => {
    const updated = [...formData.participants];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, participants: updated });
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: any }> = {
      pending: { variant: 'outline', icon: Clock },
      invited: { variant: 'secondary', icon: Clock },
      paid: { variant: 'default', icon: CheckCircle2 },
      cancelled: { variant: 'destructive', icon: XCircle },
    };

    const config = variants[status] || variants.pending;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-muted-foreground">Carregando...</div>
      </div>
    );
  }

  if (!splitPayment && !isCreateOpen) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center p-12">
          <DollarSign className="w-12 h-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Nenhum split payment criado</h3>
          <p className="text-muted-foreground text-center mb-4">
            Divida o pagamento desta reserva entre os participantes
          </p>
          <Button onClick={() => setIsCreateOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Criar Split Payment
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {!splitPayment && (
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Criar Split Payment
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Criar Split Payment</DialogTitle>
              <DialogDescription>
                Divida o pagamento desta reserva entre os participantes
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Valor Total *</label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.total_amount}
                  onChange={(e) => setFormData({ ...formData, total_amount: e.target.value })}
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Tipo de Divisão *</label>
                <Select
                  value={formData.split_type}
                  onValueChange={(value: any) => setFormData({ ...formData, split_type: value, participants: [] })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="equal">Igual (Dividir igualmente)</SelectItem>
                    <SelectItem value="percentage">Por Percentual</SelectItem>
                    <SelectItem value="custom">Valores Customizados</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium">Participantes *</label>
                  <Button type="button" variant="outline" size="sm" onClick={addParticipant}>
                    <Plus className="w-4 h-4 mr-1" />
                    Adicionar
                  </Button>
                </div>
                <div className="space-y-2">
                  {formData.participants.map((participant, index) => (
                    <div key={index} className="flex gap-2 items-end">
                      <div className="flex-1">
                        <Input
                          placeholder="Email"
                          value={participant.email}
                          onChange={(e) => updateParticipant(index, 'email', e.target.value)}
                        />
                      </div>
                      <div className="flex-1">
                        <Input
                          placeholder="Nome (opcional)"
                          value={participant.name || ''}
                          onChange={(e) => updateParticipant(index, 'name', e.target.value)}
                        />
                      </div>
                      {formData.split_type === 'percentage' && (
                        <div className="w-24">
                          <Input
                            type="number"
                            placeholder="%"
                            value={participant.percentage || ''}
                            onChange={(e) => updateParticipant(index, 'percentage', e.target.value)}
                          />
                        </div>
                      )}
                      {formData.split_type === 'custom' && (
                        <div className="w-32">
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="Valor"
                            value={participant.amount || ''}
                            onChange={(e) => updateParticipant(index, 'amount', e.target.value)}
                          />
                        </div>
                      )}
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeParticipant(index)}
                      >
                        <XCircle className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
              <Button onClick={handleCreate} className="w-full">
                Criar Split Payment
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {splitPayment && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Split Payment #{splitPayment.id}</CardTitle>
                <CardDescription>
                  Reserva #{splitPayment.booking_id} • {splitPayment.total_amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </CardDescription>
              </div>
              {getStatusBadge(splitPayment.status)}
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Participante</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {splitPayment.participants.map((participant) => (
                  <TableRow key={participant.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{participant.name || participant.email}</div>
                        {participant.name && (
                          <div className="text-sm text-muted-foreground">{participant.email}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {participant.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      {participant.percentage && (
                        <span className="text-sm text-muted-foreground ml-2">
                          ({participant.percentage}%)
                        </span>
                      )}
                    </TableCell>
                    <TableCell>{getStatusBadge(participant.status)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

