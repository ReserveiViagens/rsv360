/**
 * ✅ PÁGINA: SHARED WISHLIST
 * Página dedicada para wishlist compartilhada com votação
 * 
 * @module app/group-travel/shared-wishlist/page
 */

'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { VotingPanel } from '@/components/group-travel/VotingPanel';
import { TripInviteModal } from '@/components/group-travel/TripInviteModal';
import { Share2, Users, Heart, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { getUser, getToken } from '@/lib/auth';
import { toast } from 'sonner';

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

function SharedWishlistContent() {
  const searchParams = useSearchParams();
  const wishlistId = searchParams?.get('id') || searchParams?.get('token');
  const [wishlist, setWishlist] = useState<Wishlist | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedItemId, setSelectedItemId] = useState<number | undefined>();
  const user = getUser();
  const token = getToken();

  useEffect(() => {
    if (wishlistId) {
      loadWishlist();
    } else {
      setLoading(false);
    }
  }, [wishlistId]);

  const loadWishlist = async () => {
    if (!wishlistId) return;

    try {
      setLoading(true);
      const url = wishlistId.match(/^\d+$/)
        ? `/api/wishlists?id=${wishlistId}`
        : `/api/wishlists?token=${wishlistId}`;

      const response = await fetch(url, {
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });

      if (!response.ok) {
        throw new Error('Lista de desejos não encontrada');
      }

      const result = await response.json();
      if (result.success) {
        setWishlist(result.data);
      }
    } catch (error: any) {
      toast.error(error.message || 'Erro ao carregar lista de desejos');
    } finally {
      setLoading(false);
    }
  };

  const copyShareLink = () => {
    if (!wishlist) return;
    const link = `${window.location.origin}/group-travel/shared-wishlist?token=${wishlist.share_token}`;
    navigator.clipboard.writeText(link);
    toast.success('Link copiado para a área de transferência!');
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 space-y-6">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!wishlist) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Lista de Desejos não encontrada</CardTitle>
            <CardDescription>
              {wishlistId
                ? 'A lista de desejos que você está procurando não existe ou não está mais disponível.'
                : 'Acesse uma lista de desejos compartilhada usando o link que você recebeu, ou crie uma nova na página Viagens em Grupo.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex gap-2">
            <Button asChild>
              <Link href="/group-travel">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar para Viagens em Grupo
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/wishlists">Ver minhas Listas de Desejos</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/group-travel">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar para Viagens em Grupo
              </Link>
            </Button>
          </div>
          <h1 className="text-3xl font-bold">{wishlist.name}</h1>
          {wishlist.description && (
            <p className="text-muted-foreground">{wishlist.description}</p>
          )}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              {wishlist.member_count || 0} membros
            </div>
            <div className="flex items-center gap-1">
              <Heart className="w-4 h-4" />
              {wishlist.item_count || 0} itens
            </div>
            <Badge variant={wishlist.is_public ? 'default' : 'secondary'}>
              {wishlist.is_public ? 'Pública' : 'Privada'}
            </Badge>
          </div>
        </div>
        <div className="flex gap-2">
          <TripInviteModal
            wishlistId={wishlist.id}
            trigger={
              <Button variant="outline">
                <Users className="w-4 h-4 mr-2" />
                Convidar
              </Button>
            }
          />
          <Button variant="outline" onClick={copyShareLink}>
            <Share2 className="w-4 h-4 mr-2" />
            Compartilhar
          </Button>
        </div>
      </div>

      {/* Painel de Votação */}
      <VotingPanel
        wishlistId={wishlist.id}
        itemId={selectedItemId}
        onVoteChange={loadWishlist}
      />
    </div>
  );
}

export default function SharedWishlistPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-12 w-64 mb-4" />
        <Skeleton className="h-64 w-full" />
      </div>
    }>
      <SharedWishlistContent />
    </Suspense>
  );
}

