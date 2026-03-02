/**
 * ✅ COMPONENTE: TRIP INVITE MODAL
 * Modal para enviar convites de viagem
 * 
 * @module components/group-travel/TripInviteModal
 */

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Mail, Send, Users, Calendar, Clock, Copy, CheckCircle2 } from 'lucide-react';
import { getUser, getToken } from '@/lib/auth';
import { toast } from 'sonner';

interface TripInviteModalProps {
  bookingId?: number;
  wishlistId?: number;
  tripName?: string;
  onInviteSent?: () => void;
  trigger?: React.ReactNode;
}

export function TripInviteModal({ 
  bookingId, 
  wishlistId, 
  tripName: initialTripName,
  onInviteSent,
  trigger 
}: TripInviteModalProps) {
  const [open, setOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [formData, setFormData] = useState({
    invited_email: '',
    invited_name: '',
    invitation_type: 'trip' as 'booking' | 'wishlist' | 'trip' | 'split_payment',
    trip_name: initialTripName || '',
    message: '',
    expires_in_days: 7,
  });
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const user = getUser();
  const token = getToken();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.invited_email.trim()) {
      toast.error('Email do convidado é obrigatório');
      return;
    }

    if (formData.invitation_type === 'trip' && !formData.trip_name.trim()) {
      toast.error('Nome da viagem é obrigatório');
      return;
    }

    try {
      setSending(true);
      const response = await fetch('/api/trip-invitations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({
          ...formData,
          booking_id: bookingId,
          wishlist_id: wishlistId,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao enviar convite');
      }

      if (result.success && result.data?.token) {
        const link = `${window.location.origin}/invite/${result.data.token}`;
        setInviteLink(link);
        toast.success('Convite enviado com sucesso!');
        onInviteSent?.();
        
        // Reset form
        setFormData({
          invited_email: '',
          invited_name: '',
          invitation_type: formData.invitation_type,
          trip_name: formData.trip_name,
          message: '',
          expires_in_days: 7,
        });
      }
    } catch (error: any) {
      toast.error(error.message || 'Erro ao enviar convite');
    } finally {
      setSending(false);
    }
  };

  const copyToClipboard = async () => {
    if (!inviteLink) return;

    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      toast.success('Link copiado para a área de transferência!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Erro ao copiar link');
    }
  };

  const getInvitationTypeLabel = (type: string) => {
    switch (type) {
      case 'booking':
        return 'Reserva';
      case 'wishlist':
        return 'Lista de Desejos';
      case 'trip':
        return 'Viagem';
      case 'split_payment':
        return 'Divisão de Pagamento';
      default:
        return type;
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline">
            <Mail className="w-4 h-4 mr-2" />
            Enviar Convite
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Enviar Convite de Viagem
          </DialogTitle>
          <DialogDescription>
            Convide pessoas para participar desta viagem
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Tipo de Convite */}
          <div className="space-y-2">
            <Label>Tipo de Convite</Label>
            <Select
              value={formData.invitation_type}
              onValueChange={(value) => setFormData({ ...formData, invitation_type: value as any })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {bookingId && (
                  <SelectItem value="booking">Reserva</SelectItem>
                )}
                {wishlistId && (
                  <SelectItem value="wishlist">Lista de Desejos</SelectItem>
                )}
                <SelectItem value="trip">Viagem</SelectItem>
                {bookingId && (
                  <SelectItem value="split_payment">Divisão de Pagamento</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Nome da Viagem (se tipo trip) */}
          {formData.invitation_type === 'trip' && (
            <div className="space-y-2">
              <Label>Nome da Viagem *</Label>
              <Input
                placeholder="Ex: Viagem para Caldas Novas"
                value={formData.trip_name}
                onChange={(e) => setFormData({ ...formData, trip_name: e.target.value })}
                required
              />
            </div>
          )}

          {/* Email do Convidado */}
          <div className="space-y-2">
            <Label>Email do Convidado *</Label>
            <Input
              type="email"
              placeholder="convidado@exemplo.com"
              value={formData.invited_email}
              onChange={(e) => setFormData({ ...formData, invited_email: e.target.value })}
              required
            />
          </div>

          {/* Nome do Convidado */}
          <div className="space-y-2">
            <Label>Nome do Convidado (opcional)</Label>
            <Input
              placeholder="Nome completo"
              value={formData.invited_name}
              onChange={(e) => setFormData({ ...formData, invited_name: e.target.value })}
            />
          </div>

          {/* Mensagem Personalizada */}
          <div className="space-y-2">
            <Label>Mensagem Personalizada (opcional)</Label>
            <Textarea
              placeholder="Adicione uma mensagem personalizada ao convite..."
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              rows={3}
            />
          </div>

          {/* Expiração */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Expira em (dias)
            </Label>
            <Select
              value={formData.expires_in_days.toString()}
              onValueChange={(value) => setFormData({ ...formData, expires_in_days: parseInt(value) })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 dia</SelectItem>
                <SelectItem value="3">3 dias</SelectItem>
                <SelectItem value="7">7 dias</SelectItem>
                <SelectItem value="14">14 dias</SelectItem>
                <SelectItem value="30">30 dias</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Link de Convite (se gerado) */}
          {inviteLink && (
            <div className="space-y-2 p-3 bg-muted rounded-lg">
              <Label className="text-sm font-semibold">Link de Convite Gerado</Label>
              <div className="flex gap-2">
                <Input value={inviteLink} readOnly className="flex-1 text-sm" />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={copyToClipboard}
                >
                  {copied ? (
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Compartilhe este link com o convidado
              </p>
            </div>
          )}

          {/* Botões */}
          <div className="flex gap-2 justify-end pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setOpen(false);
                setInviteLink(null);
              }}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={sending}>
              {sending ? (
                <>
                  <Clock className="w-4 h-4 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Enviar Convite
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

