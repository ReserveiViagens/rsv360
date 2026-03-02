/**
 * ✅ COMPONENTE: WISHLIST MANAGER
 * Componente principal para gerenciar wishlists compartilhadas
 */

'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, Share2, Users, Heart, Trash2, Edit2 } from '@/lib/lucide-icons';
import { getUser, getToken } from '@/lib/auth';
import { toast } from 'sonner';

interface Wishlist {
  id: number;
  name: string;
  description?: string;
  is_public: boolean;
  creator_id?: number;
  share_token?: string;
  created_at: string;
  items_count?: number;
  members_count?: number;
}

interface WishlistItem {
  id: number;
  property_id: number;
  property_name?: string;
  notes?: string;
  priority: 'low' | 'medium' | 'high';
  votes_count?: number;
}

export function WishlistManager() {
  const [wishlists, setWishlists] = useState<Wishlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    is_public: false,
  });

  const user = getUser();
  const token = getToken();

  useEffect(() => {
    loadWishlists();
  }, []);

  const loadWishlists = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/wishlists', {
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });

      if (!response.ok) {
        throw new Error('Erro ao carregar wishlists');
      }

      const result = await response.json();
      if (result.success) {
        setWishlists(result.data || []);
      }
    } catch (error: any) {
      toast.error(error.message || 'Erro ao carregar wishlists');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!formData.name.trim()) {
      toast.error('Nome é obrigatório');
      return;
    }

    try {
      const response = await fetch('/api/wishlists', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao criar wishlist');
      }

      if (result.success) {
        toast.success('Wishlist criada com sucesso!');
        setIsCreateOpen(false);
        setFormData({ name: '', description: '', is_public: false });
        loadWishlists();
      }
    } catch (error: any) {
      toast.error(error.message || 'Erro ao criar wishlist');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja deletar esta wishlist?')) {
      return;
    }

    try {
      const response = await fetch(`/api/wishlists/${id}`, {
        method: 'DELETE',
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao deletar wishlist');
      }

      if (result.success) {
        toast.success('Wishlist deletada com sucesso!');
        loadWishlists();
      }
    } catch (error: any) {
      toast.error(error.message || 'Erro ao deletar wishlist');
    }
  };

  const copyShareLink = (wishlist: Wishlist) => {
    const shareToken = wishlist.share_token || wishlist.id.toString();
    const shareUrl = `${window.location.origin}/wishlists/${shareToken}`;
    
    navigator.clipboard.writeText(shareUrl);
    toast.success('Link copiado para a área de transferência!');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-muted-foreground">Carregando wishlists...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Minhas Wishlists</h2>
          <p className="text-muted-foreground">
            Gerencie suas listas de desejos compartilhadas
          </p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nova Wishlist
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Nova Wishlist</DialogTitle>
              <DialogDescription>
                Crie uma lista de desejos para compartilhar com amigos e família
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Nome *</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Viagem para o Nordeste"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Descrição</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descreva sua wishlist..."
                  rows={3}
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_public"
                  checked={formData.is_public}
                  onChange={(e) => setFormData({ ...formData, is_public: e.target.checked })}
                  className="rounded"
                />
                <label htmlFor="is_public" className="text-sm">
                  Tornar pública
                </label>
              </div>
              <Button onClick={handleCreate} className="w-full">
                Criar Wishlist
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {wishlists.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-12">
            <Heart className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhuma wishlist ainda</h3>
            <p className="text-muted-foreground text-center mb-4">
              Crie sua primeira wishlist para começar a planejar suas viagens
            </p>
            <Button onClick={() => setIsCreateOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Criar Wishlist
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {wishlists.map((wishlist) => (
            <Card key={wishlist.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{wishlist.name}</CardTitle>
                    <CardDescription className="mt-1">
                      {wishlist.description || 'Sem descrição'}
                    </CardDescription>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => copyShareLink(wishlist)}
                      title="Compartilhar"
                    >
                      <Share2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(wishlist.id)}
                      title="Deletar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {wishlist.members_count || 0}
                    </span>
                    <span className="flex items-center gap-1">
                      <Heart className="w-4 h-4" />
                      {wishlist.items_count || 0}
                    </span>
                  </div>
                  {wishlist.is_public && (
                    <Badge variant="secondary">Pública</Badge>
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

