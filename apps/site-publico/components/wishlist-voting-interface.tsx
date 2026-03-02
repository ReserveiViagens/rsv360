'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ThumbsUp, ThumbsDown, HelpCircle, MessageSquare, TrendingUp, Wifi, WifiOff } from 'lucide-react';
import { useToast } from '@/components/providers/toast-wrapper';
import { realtimeVotingService, type VoteStats } from '@/lib/realtime-voting-service';

interface VoteResult {
  itemId: number;
  totalVotes: number;
  votesUp: number;
  votesDown: number;
  votesMaybe: number;
  score: number;
  ranking: number;
  consensus: 'strong_yes' | 'yes' | 'maybe' | 'no' | 'strong_no';
  comments: Array<{
    id: number;
    userName?: string;
    comment: string;
    vote: 'up' | 'down' | 'maybe';
    createdAt: string;
  }>;
}

interface WishlistVotingInterfaceProps {
  wishlistId: number;
  itemId: number;
  userId?: number;
  userEmail?: string;
}

export function WishlistVotingInterface({
  wishlistId,
  itemId,
  userId,
  userEmail,
}: WishlistVotingInterfaceProps) {
  const { toast } = useToast();
  const [voteResult, setVoteResult] = useState<VoteResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);
  const [comment, setComment] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    loadVoteResult();
    connectRealtime();

    return () => {
      // Cleanup: desconectar WebSocket
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
      realtimeVotingService.disconnect();
    };
  }, [itemId, wishlistId]);

  const connectRealtime = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.warn('Token não encontrado, votação em tempo real desabilitada');
        return;
      }

      // Conectar ao WebSocket
      await realtimeVotingService.connect(wishlistId, token);
      setIsConnected(true);

      // Subscrever a atualizações do item
      unsubscribeRef.current = realtimeVotingService.subscribe(itemId, (stats: VoteStats) => {
        // Atualizar resultado quando receber atualização
        setVoteResult(prev => {
          if (!prev) return null;
          return {
            ...prev,
            votesUp: stats.votesUp,
            votesDown: stats.votesDown,
            votesMaybe: stats.votesMaybe,
            totalVotes: stats.totalVotes,
            score: stats.score,
            consensus: stats.consensus,
          };
        });
      });

      // Carregar stats iniciais
      const stats = await realtimeVotingService.getVoteStats(itemId);
      setVoteResult(prev => {
        if (!prev) return null;
        return {
          ...prev,
          votesUp: stats.votesUp,
          votesDown: stats.votesDown,
          votesMaybe: stats.votesMaybe,
          totalVotes: stats.totalVotes,
          score: stats.score,
          consensus: stats.consensus,
        };
      });
    } catch (error) {
      console.error('Erro ao conectar WebSocket:', error);
      setIsConnected(false);
    }
  };

  const loadVoteResult = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/wishlists/${wishlistId}/vote?itemId=${itemId}&type=result`);
      const data = await response.json();
      if (data.success) {
        setVoteResult(data.data);
      }
    } catch (error) {
      console.error('Erro ao carregar votação:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (vote: 'up' | 'down' | 'maybe') => {
    if (!userId) {
      toast({
        title: 'Erro',
        description: 'Usuário não identificado',
        variant: 'destructive',
      });
      return;
    }

    try {
      setVoting(true);

      // Usar serviço de votação em tempo real
      const stats = await realtimeVotingService.vote(
        wishlistId,
        itemId,
        userId,
        vote,
        comment || undefined
      );

      // Atualizar resultado local
      setVoteResult(prev => {
        if (!prev) return null;
        return {
          ...prev,
          votesUp: stats.votesUp,
          votesDown: stats.votesDown,
          votesMaybe: stats.votesMaybe,
          totalVotes: stats.totalVotes,
          score: stats.score,
          consensus: stats.consensus,
        };
      });

      setComment('');
      toast({
        title: 'Voto registrado',
        description: 'Seu voto foi registrado e sincronizado em tempo real',
      });
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao votar',
        variant: 'destructive',
      });
    } finally {
      setVoting(false);
    }
  };

  if (loading) {
    return <div>Carregando...</div>;
  }

  if (!voteResult) {
    return <div>Erro ao carregar votação</div>;
  }

  const consensusLabels = {
    strong_yes: 'Fortemente aprovado',
    yes: 'Aprovado',
    maybe: 'Indeciso',
    no: 'Rejeitado',
    strong_no: 'Fortemente rejeitado',
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Votação - Ranking #{voteResult.ranking}
          </CardTitle>
          {isConnected ? (
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              <Wifi className="w-3 h-3 mr-1" />
              Tempo Real
            </Badge>
          ) : (
            <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
              <WifiOff className="w-3 h-3 mr-1" />
              Offline
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Estatísticas */}
        <div className="grid grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{voteResult.votesUp}</div>
            <div className="text-sm text-gray-500">Aprovações</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{voteResult.votesDown}</div>
            <div className="text-sm text-gray-500">Rejeições</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">{voteResult.votesMaybe}</div>
            <div className="text-sm text-gray-500">Indecisos</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{voteResult.totalVotes}</div>
            <div className="text-sm text-gray-500">Total</div>
          </div>
        </div>

        {/* Consenso */}
        <div className="p-3 bg-blue-50 rounded-lg">
          <div className="font-semibold">Consenso:</div>
          <div className="text-lg">{consensusLabels[voteResult.consensus]}</div>
        </div>

        {/* Botões de voto */}
        <div className="flex gap-2">
          <Button
            onClick={() => handleVote('up')}
            disabled={voting}
            variant="outline"
            className="flex-1"
          >
            <ThumbsUp className="w-4 h-4 mr-2" />
            Aprovar
          </Button>
          <Button
            onClick={() => handleVote('maybe')}
            disabled={voting}
            variant="outline"
            className="flex-1"
          >
            <HelpCircle className="w-4 h-4 mr-2" />
            Indeciso
          </Button>
          <Button
            onClick={() => handleVote('down')}
            disabled={voting}
            variant="outline"
            className="flex-1"
          >
            <ThumbsDown className="w-4 h-4 mr-2" />
            Rejeitar
          </Button>
        </div>

        {/* Comentário */}
        <div>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Adicione um comentário (opcional)"
            className="w-full p-2 border rounded"
            rows={2}
          />
        </div>

        {/* Comentários */}
        {voteResult.comments.length > 0 && (
          <div>
            <div className="font-semibold mb-2 flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Comentários ({voteResult.comments.length})
            </div>
            <div className="space-y-2">
              {voteResult.comments.map((comment) => (
                <div key={comment.id} className="p-2 bg-gray-50 rounded">
                  <div className="font-semibold text-sm">{comment.userName || 'Anônimo'}</div>
                  <div className="text-sm">{comment.comment}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {new Date(comment.createdAt).toLocaleDateString('pt-BR')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

