/**
 * ✅ COMPONENTE: TRIP INVITATION MANAGER
 * Componente para gerenciar convites de viagem
 */

'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Mail, Send, CheckCircle2, XCircle, Clock, Calendar } from '@/lib/lucide-icons';
import { getUser, getToken } from '@/lib/auth';
import { toast } from 'sonner';

interface TripInvitation {
  id: number;
  booking_id?: number;
  wishlist_id?: number;
  trip_name?: string;
  invited_email: string;
  invited_name?: string;
  invitation_type: 'booking' | 'wishlist' | 'trip' | 'split_payment';
  status: 'pending' | 'accepted' | 'declined' | 'expired' | 'cancelled';
  token: string;
  message?: string;
  expires_at: string;
  created_at: string;
}

export function TripInvitationManager({ bookingId, wishlistId }: { bookingId?: number; wishlistId?: number }) {
  const [invitations, setInvitations] = useState<TripInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [formData, setFormData] = useState({
    invited_email: '',
    invited_name: '',
    invitation_type: 'trip' as 'booking' | 'wishlist' | 'trip' | 'split_payment',
    trip_name: '',
    message: '',
    expires_in_days: 7,
  });

  const user = getUser();
  const token = getToken();

  useEffect(() => {
    loadInvitations();
  }, [bookingId, wishlistId]);

  const loadInvitations = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (user?.id) params.append('user_id', user.id.toString());
      if (bookingId) params.append('booking_id', bookingId.toString());
      if (wishlistId) params.append('wishlist_id', wishlistId.toString());

      const response = await fetch(`/api/trip-invitations?${params.toString()}`, {
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });

      if (!response.ok) {
        throw new Error('Erro ao carregar convites');
      }

      const result = await response.json();
      if (result.success) {
        setInvitations(result.data || []);
      }
    } catch (error: any) {
      toast.error(error.message || 'Erro ao carregar convites');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!formData.invited_email.trim()) {
      toast.error('Email do convidado é obrigatório');
      return;
    }

    if (formData.invitation_type === 'trip' && !formData.trip_name.trim()) {
      toast.error('Nome da viagem é obrigatório');
      return;
    }

    try {
      const response = await fetch('/api/trip-invitations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({
          invited_email: formData.invited_email,
          invited_name: formData.invited_name || undefined,
          invitation_type: formData.invitation_type,
          booking_id: bookingId || undefined,
          wishlist_id: wishlistId || undefined,
          trip_name: formData.trip_name || undefined,
          message: formData.message || undefined,
          expires_in_days: formData.expires_in_days,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao criar convite');
      }

      if (result.success) {
        toast.success('Convite enviado com sucesso!');
        setIsCreateOpen(false);
        setFormData({
          invited_email: '',
          invited_name: '',
          invitation_type: 'trip',
          trip_name: '',
          message: '',
          expires_in_days: 7,
        });
        loadInvitations();
      }
    } catch (error: any) {
      toast.error(error.message || 'Erro ao criar convite');
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: any }> = {
      pending: { variant: 'outline', icon: Clock },
      accepted: { variant: 'default', icon: CheckCircle2 },
      declined: { variant: 'destructive', icon: XCircle },
      expired: { variant: 'secondary', icon: Clock },
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
        <div className="text-muted-foreground">Carregando convites...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Convites de Viagem</h2>
          <p className="text-muted-foreground">
            Gerencie convites para reservas, wishlists e viagens
          </p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Send className="w-4 h-4 mr-2" />
              Enviar Convite
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Enviar Convite</DialogTitle>
              <DialogDescription>
                Convide alguém para participar desta viagem ou reserva
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Email do Convidado *</label>
                <Input
                  type="email"
                  value={formData.invited_email}
                  onChange={(e) => setFormData({ ...formData, invited_email: e.target.value })}
                  placeholder="convidado@exemplo.com"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Nome do Convidado</label>
                <Input
                  value={formData.invited_name}
                  onChange={(e) => setFormData({ ...formData, invited_name: e.target.value })}
                  placeholder="Nome completo"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Tipo de Convite *</label>
                <Select
                  value={formData.invitation_type}
                  onValueChange={(value: any) => setFormData({ ...formData, invitation_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="booking">Reserva</SelectItem>
                    <SelectItem value="wishlist">Wishlist</SelectItem>
                    <SelectItem value="trip">Viagem</SelectItem>
                    <SelectItem value="split_payment">Split Payment</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {formData.invitation_type === 'trip' && (
                <div>
                  <label className="text-sm font-medium">Nome da Viagem *</label>
                  <Input
                    value={formData.trip_name}
                    onChange={(e) => setFormData({ ...formData, trip_name: e.target.value })}
                    placeholder="Ex: Viagem para o Nordeste"
                  />
                </div>
              )}
              <div>
                <label className="text-sm font-medium">Mensagem</label>
                <Textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Mensagem personalizada para o convidado..."
                  rows={3}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Expira em (dias)</label>
                <Input
                  type="number"
                  min="1"
                  max="30"
                  value={formData.expires_in_days}
                  onChange={(e) => setFormData({ ...formData, expires_in_days: parseInt(e.target.value) || 7 })}
                />
              </div>
              <Button onClick={handleCreate} className="w-full">
                <Send className="w-4 h-4 mr-2" />
                Enviar Convite
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {invitations.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-12">
            <Mail className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum convite ainda</h3>
            <p className="text-muted-foreground text-center mb-4">
              Envie convites para compartilhar suas viagens e reservas
            </p>
            <Button onClick={() => setIsCreateOpen(true)}>
              <Send className="w-4 h-4 mr-2" />
              Enviar Primeiro Convite
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {invitations.map((invitation) => (
            <Card key={invitation.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">
                      {invitation.invited_name || invitation.invited_email}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {invitation.invited_email}
                      {invitation.trip_name && ` • ${invitation.trip_name}`}
                    </CardDescription>
                  </div>
                  {getStatusBadge(invitation.status)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(invitation.expires_at).toLocaleDateString('pt-BR')}
                    </span>
                    <Badge variant="outline">{invitation.invitation_type}</Badge>
                  </div>
                  {invitation.message && (
                    <p className="text-sm italic">"{invitation.message}"</p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

