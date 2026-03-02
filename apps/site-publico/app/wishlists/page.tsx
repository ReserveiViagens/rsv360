/**
 * ✅ ITEM 13: PÁGINA PRINCIPAL DE WISHLISTS
 * Lista todas as wishlists do usuário
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
import { Plus, Heart, Users, Globe, Lock, Share2, Trash2, Edit } from 'lucide-react';

interface Wishlist {
  id: number;
  name: string;
  description?: string;
  is_public: boolean;
  share_token: string;
  member_count?: number;
  item_count?: number;
  created_at: string;
}

export default function WishlistsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const auth = useAuth();
  const [wishlists, setWishlists] = useState<Wishlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    is_public: false,
  });

  useEffect(() => {
    loadWishlists();
  }, []);

  const loadWishlists = async () => {
    try {
      setLoading(true);
      // Obter user_id do contexto de autenticação
      const response = await fetch('/api/wishlists');
      const result = await response.json();

      if (result.success) {
        setWishlists(result.data || []);
      } else {
        toast({
          title: 'Erro',
          description: result.error || 'Erro ao carregar wishlists',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao carregar wishlists',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateWishlist = async () => {
    if (!formData.name.trim()) {
      toast({
        title: 'Erro',
        description: 'Nome da wishlist é obrigatório',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Obter creator_id do contexto de autenticação
      const creatorId = auth.user?.id;

      if (!creatorId) {
        toast({
          title: 'Erro',
          description: 'Você precisa estar autenticado para criar uma wishlist',
          variant: 'destructive',
        });
        return;
      }

      const response = await fetch('/api/wishlists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description || undefined,
          is_public: formData.is_public,
          creator_id: creatorId,
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: 'Sucesso',
          description: 'Wishlist criada com sucesso!',
        });
        setCreateDialogOpen(false);
        setFormData({ name: '', description: '', is_public: false });
        loadWishlists();
      } else {
        toast({
          title: 'Erro',
          description: result.error || 'Erro ao criar wishlist',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao criar wishlist',
        variant: 'destructive',
      });
    }
  };

  const handleShare = (wishlist: Wishlist) => {
    const shareUrl = `${window.location.origin}/wishlists/${wishlist.share_token}`;
    navigator.clipboard.writeText(shareUrl);
    toast({
      title: 'Link copiado!',
      description: 'Link de compartilhamento copiado para a área de transferência',
    });
  };

  const handleDelete = async (wishlistId: number) => {
    if (!confirm('Tem certeza que deseja deletar esta wishlist?')) {
      return;
    }

    try {
      const response = await fetch(`/api/wishlists/${wishlistId}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: 'Sucesso',
          description: 'Wishlist deletada com sucesso!',
        });
        loadWishlists();
      } else {
        toast({
          title: 'Erro',
          description: result.error || 'Erro ao deletar wishlist',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao deletar wishlist',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Carregando wishlists...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Minhas Wishlists</h1>
          <p className="text-muted-foreground mt-2">
            Organize e compartilhe suas viagens em grupo
          </p>
        </div>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nova Wishlist
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Nova Wishlist</DialogTitle>
              <DialogDescription>
                Crie uma wishlist para organizar sua viagem em grupo
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
                  placeholder="Descreva sua viagem..."
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
                <Label htmlFor="is_public" className="cursor-pointer">
                  Wishlist pública (qualquer pessoa pode ver)
                </Label>
              </div>
              <Button onClick={handleCreateWishlist} className="w-full">
                Criar Wishlist
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {wishlists.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Heart className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhuma wishlist ainda</h3>
            <p className="text-muted-foreground mb-4">
              Crie sua primeira wishlist para começar a planejar sua viagem em grupo
            </p>
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Criar Wishlist
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {wishlists.map((wishlist) => (
            <Card key={wishlist.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      {wishlist.name}
                      {wishlist.is_public ? (
                        <Globe className="h-4 w-4 text-blue-500" />
                      ) : (
                        <Lock className="h-4 w-4 text-gray-500" />
                      )}
                    </CardTitle>
                    <CardDescription className="mt-2">
                      {wishlist.description || 'Sem descrição'}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <Heart className="h-4 w-4" />
                      {wishlist.item_count || 0} itens
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {wishlist.member_count || 0} membros
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => router.push(`/wishlists/${wishlist.id}`)}
                  >
                    Abrir
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleShare(wishlist)}
                  >
                    <Share2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(wishlist.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

