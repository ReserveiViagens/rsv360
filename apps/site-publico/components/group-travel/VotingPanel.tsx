/**
 * ✅ COMPONENTE: VOTING PANEL
 * Painel dedicado para votação em itens de wishlist
 * 
 * @module components/group-travel/VotingPanel
 */

'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ThumbsUp, ThumbsDown, HelpCircle, Users, TrendingUp, TrendingDown } from 'lucide-react';
import { getUser, getToken } from '@/lib/auth';
import { toast } from 'sonner';

interface Vote {
  id: number;
  user_id?: number;
  email?: string;
  vote: 'up' | 'down' | 'maybe';
  created_at: string;
}

interface WishlistItem {
  id: number;
  wishlist_id: number;
  property_id?: number;
  item_name: string;
  item_description?: string;
  item_url?: string;
  votes_up: number;
  votes_down: number;
  votes_maybe: number;
  total_votes: number;
  user_vote?: 'up' | 'down' | 'maybe' | null;
}

interface VotingPanelProps {
  wishlistId: number;
  itemId?: number;
  onVoteChange?: () => void;
}

export function VotingPanel({ wishlistId, itemId, onVoteChange }: VotingPanelProps) {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState<number | null>(null);
  const user = getUser();
  const token = getToken();

  useEffect(() => {
    loadItems();
  }, [wishlistId, itemId]);

  const loadItems = async () => {
    try {
      setLoading(true);
      const url = itemId 
        ? `/api/wishlists/${wishlistId}/items/${itemId}`
        : `/api/wishlists/${wishlistId}/items`;
      
      const response = await fetch(url, {
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });

      if (!response.ok) {
        throw new Error('Erro ao carregar itens');
      }

      const result = await response.json();
      if (result.success) {
        const itemsData = itemId ? [result.data] : (result.data || []);
        setItems(itemsData);
      }
    } catch (error: any) {
      toast.error(error.message || 'Erro ao carregar itens');
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (itemId: number, vote: 'up' | 'down' | 'maybe') => {
    if (voting === itemId) return;

    try {
      setVoting(itemId);
      const response = await fetch(`/api/wishlists/${wishlistId}/items/${itemId}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({ vote }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao votar');
      }

      toast.success('Voto registrado com sucesso!');
      await loadItems();
      onVoteChange?.();
    } catch (error: any) {
      toast.error(error.message || 'Erro ao votar');
    } finally {
      setVoting(null);
    }
  };

  const getVotePercentage = (votes: number, total: number) => {
    if (total === 0) return 0;
    return Math.round((votes / total) * 100);
  };

  const getVoteColor = (vote: 'up' | 'down' | 'maybe') => {
    switch (vote) {
      case 'up':
        return 'bg-green-500';
      case 'down':
        return 'bg-red-500';
      case 'maybe':
        return 'bg-yellow-500';
    }
  };

  const getVoteIcon = (vote: 'up' | 'down' | 'maybe') => {
    switch (vote) {
      case 'up':
        return <ThumbsUp className="w-4 h-4" />;
      case 'down':
        return <ThumbsDown className="w-4 h-4" />;
      case 'maybe':
        return <HelpCircle className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Painel de Votação</CardTitle>
          <CardDescription>Carregando...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (items.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Painel de Votação</CardTitle>
          <CardDescription>Nenhum item encontrado nesta wishlist</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Painel de Votação
          </CardTitle>
          <CardDescription>
            Vote nos itens da wishlist e veja os resultados em tempo real
          </CardDescription>
        </CardHeader>
      </Card>

      {items.map((item) => {
        const totalVotes = item.total_votes || (item.votes_up + item.votes_down + item.votes_maybe);
        const upPercent = getVotePercentage(item.votes_up, totalVotes);
        const downPercent = getVotePercentage(item.votes_down, totalVotes);
        const maybePercent = getVotePercentage(item.votes_maybe, totalVotes);

        return (
          <Card key={item.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{item.item_name}</CardTitle>
                  {item.item_description && (
                    <CardDescription className="mt-1">{item.item_description}</CardDescription>
                  )}
                </div>
                <Badge variant="outline" className="ml-4">
                  {totalVotes} {totalVotes === 1 ? 'voto' : 'votos'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Botões de Votação */}
              <div className="flex gap-2">
                <Button
                  variant={item.user_vote === 'up' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleVote(item.id, 'up')}
                  disabled={voting === item.id}
                  className="flex-1"
                >
                  <ThumbsUp className="w-4 h-4 mr-2" />
                  Gostei ({item.votes_up})
                </Button>
                <Button
                  variant={item.user_vote === 'maybe' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleVote(item.id, 'maybe')}
                  disabled={voting === item.id}
                  className="flex-1"
                >
                  <HelpCircle className="w-4 h-4 mr-2" />
                  Talvez ({item.votes_maybe})
                </Button>
                <Button
                  variant={item.user_vote === 'down' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleVote(item.id, 'down')}
                  disabled={voting === item.id}
                  className="flex-1"
                >
                  <ThumbsDown className="w-4 h-4 mr-2" />
                  Não Gostei ({item.votes_down})
                </Button>
              </div>

              {/* Barras de Progresso */}
              {totalVotes > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <ThumbsUp className="w-4 h-4 text-green-500" />
                    <Progress value={upPercent} className="flex-1" />
                    <span className="text-sm text-muted-foreground min-w-[3rem] text-right">
                      {upPercent}%
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-yellow-500" />
                    <Progress value={maybePercent} className="flex-1" />
                    <span className="text-sm text-muted-foreground min-w-[3rem] text-right">
                      {maybePercent}%
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ThumbsDown className="w-4 h-4 text-red-500" />
                    <Progress value={downPercent} className="flex-1" />
                    <span className="text-sm text-muted-foreground min-w-[3rem] text-right">
                      {downPercent}%
                    </span>
                  </div>
                </div>
              )}

              {/* Indicador de Tendência */}
              {totalVotes > 0 && (
                <div className="flex items-center gap-2 pt-2 border-t">
                  {item.votes_up > item.votes_down ? (
                    <div className="flex items-center gap-1 text-green-600">
                      <TrendingUp className="w-4 h-4" />
                      <span className="text-sm font-medium">Aprovado pela maioria</span>
                    </div>
                  ) : item.votes_down > item.votes_up ? (
                    <div className="flex items-center gap-1 text-red-600">
                      <TrendingDown className="w-4 h-4" />
                      <span className="text-sm font-medium">Rejeitado pela maioria</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-yellow-600">
                      <HelpCircle className="w-4 h-4" />
                      <span className="text-sm font-medium">Empatado</span>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

