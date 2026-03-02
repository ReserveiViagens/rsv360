/**
 * ✅ ITEM 21: PÁGINA DE LISTA DE GROUP CHATS
 * Lista todos os grupos de chat do usuário
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/components/providers/toast-wrapper';
import { useAuth } from '@/components/auth-provider';
import { MessageSquare, Plus, Users, Bell, BellOff } from 'lucide-react';

interface GroupChat {
  id: number;
  name: string;
  description?: string;
  chat_type: string;
  member_count?: number;
  unread_count?: number;
  last_message_at?: string;
}

export default function GroupChatsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user, authenticatedFetch } = useAuth();
  const [groups, setGroups] = useState<GroupChat[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    chat_type: 'custom',
    booking_id: '',
    is_private: false,
  });

  useEffect(() => {
    if (user) {
      loadGroupChats();
    }
  }, [user]);

  const loadGroupChats = async () => {
    try {
      setLoading(true);
      const response = await authenticatedFetch('/api/group-chats');
      const result = await response.json();

      if (result.success) {
        setGroups(result.data || []);
      } else {
        toast({
          title: 'Erro',
          description: result.error || 'Erro ao carregar grupos',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao carregar grupos',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGroup = async () => {
    if (!formData.name.trim()) {
      toast({
        title: 'Erro',
        description: 'Nome do grupo é obrigatório',
        variant: 'destructive',
      });
      return;
    }

    if (!user) {
      toast({
        title: 'Erro',
        description: 'Você precisa estar logado para criar um grupo',
        variant: 'destructive',
      });
      return;
    }

    try {
      const response = await authenticatedFetch('/api/group-chats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description || undefined,
          chat_type: formData.chat_type,
          booking_id: formData.booking_id ? parseInt(formData.booking_id) : undefined,
          is_private: formData.is_private,
          created_by: user.id,
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: 'Sucesso',
          description: 'Grupo criado com sucesso!',
        });
        setCreateDialogOpen(false);
        setFormData({
          name: '',
          description: '',
          chat_type: 'custom',
          booking_id: '',
          is_private: false,
        });
        router.push(`/group-chat/${result.data.id}`);
      } else {
        toast({
          title: 'Erro',
          description: result.error || 'Erro ao criar grupo',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao criar grupo',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Carregando grupos...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Grupos de Chat</h1>
          <p className="text-muted-foreground mt-2">
            Converse com seu grupo sobre viagens e reservas
          </p>
        </div>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Novo Grupo
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Novo Grupo</DialogTitle>
              <DialogDescription>
                Crie um grupo de chat para conversar com seus amigos
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Nome *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Viagem para o Nordeste"
                />
              </div>
              <div>
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descreva o grupo..."
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="chat_type">Tipo</Label>
                <select
                  id="chat_type"
                  value={formData.chat_type}
                  onChange={(e) => setFormData({ ...formData, chat_type: e.target.value })}
                  className="w-full rounded-md border border-input bg-background px-3 py-2"
                >
                  <option value="custom">Personalizado</option>
                  <option value="booking">Reserva</option>
                  <option value="wishlist">Wishlist</option>
                  <option value="trip">Viagem</option>
                </select>
              </div>
              {formData.chat_type === 'booking' && (
                <div>
                  <Label htmlFor="booking_id">ID da Reserva</Label>
                  <Input
                    id="booking_id"
                    type="number"
                    value={formData.booking_id}
                    onChange={(e) => setFormData({ ...formData, booking_id: e.target.value })}
                    placeholder="123"
                  />
                </div>
              )}
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_private"
                  checked={formData.is_private}
                  onChange={(e) => setFormData({ ...formData, is_private: e.target.checked })}
                  className="rounded"
                />
                <Label htmlFor="is_private" className="cursor-pointer">
                  Grupo privado (apenas membros podem ver)
                </Label>
              </div>
              <Button onClick={handleCreateGroup} className="w-full">
                Criar Grupo
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {groups.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum grupo ainda</h3>
            <p className="text-muted-foreground mb-4">
              Crie seu primeiro grupo de chat para começar a conversar
            </p>
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Criar Grupo
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {groups.map((group) => (
            <Card
              key={group.id}
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => router.push(`/group-chat/${group.id}`)}
            >
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{group.name}</span>
                  {group.unread_count && group.unread_count > 0 && (
                    <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
                      {group.unread_count}
                    </span>
                  )}
                </CardTitle>
                <CardDescription>{group.description || 'Sem descrição'}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {group.member_count || 0} membros
                  </span>
                  {group.last_message_at && (
                    <span className="text-xs">
                      {new Date(group.last_message_at).toLocaleDateString('pt-BR')}
                    </span>
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

