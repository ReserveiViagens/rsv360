/**
 * ✅ TAREFA MEDIUM-5: Componente melhorado de votação em tempo real
 * UI aprimorada com confirmação, animações e feedback visual
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { ThumbsUp, ThumbsDown, HelpCircle, CheckCircle2, Loader2, Wifi, WifiOff, AlertCircle, TrendingUp } from '@/lib/lucide-icons';
import { realtimeVotingService, type VoteStats } from '@/lib/realtime-voting-service';
import { toast } from 'sonner';

interface EnhancedVotingPanelProps {
  wishlistId: number;
  itemId: number;
  userId?: number;
  userEmail?: string;
  propertyName?: string;
}

export function EnhancedVotingPanel({
  wishlistId,
  itemId,
  userId,
  userEmail,
  propertyName,
}: EnhancedVotingPanelProps) {
  const [stats, setStats] = useState<VoteStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);
  const [userVote, setUserVote] = useState<'up' | 'down' | 'maybe' | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [voteConfirmation, setVoteConfirmation] = useState<{ type: string; timestamp: Date } | null>(null);
  const unsubscribeRef = useRef<(() => void) | null>(null);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    loadStats();
    connectRealtime();

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
      realtimeVotingService.disconnect();
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [itemId, wishlistId]);

  const connectRealtime = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.warn('Token não encontrado, votação em tempo real desabilitada');
        return;
      }

      await realtimeVotingService.connect(wishlistId, token);
      setIsConnected(true);

      // Subscrever a atualizações
      unsubscribeRef.current = realtimeVotingService.subscribe(itemId, (newStats: VoteStats) => {
        setStats(newStats);
        setLastUpdate(new Date());
        
        // Animação suave de atualização
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
        animationRef.current = requestAnimationFrame(() => {
          // Trigger re-render com animação
        });
      });

      // Carregar stats iniciais
      const initialStats = await realtimeVotingService.getVoteStats(itemId);
      setStats(initialStats);
      loadUserVote();
    } catch (error) {
      console.error('Erro ao conectar WebSocket:', error);
      setIsConnected(false);
    }
  };

  const loadStats = async () => {
    try {
      setLoading(true);
      const stats = await realtimeVotingService.getVoteStats(itemId);
      setStats(stats);
      loadUserVote();
    } catch (error) {
      console.error('Erro ao carregar stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserVote = async () => {
    if (!userId) return;
    
    try {
      const response = await fetch(`/api/wishlists/items/${itemId}/votes?user_id=${userId}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data?.userVote) {
          setUserVote(data.data.userVote);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar voto do usuário:', error);
    }
  };

  const handleVote = async (vote: 'up' | 'down' | 'maybe') => {
    if (!userId) {
      toast.error('Usuário não identificado');
      return;
    }

    try {
      setVoting(true);
      setVoteConfirmation(null);

      // Votar com confirmação
      const newStats = await realtimeVotingService.vote(
        wishlistId,
        itemId,
        userId,
        vote,
        undefined,
        true // requireConfirmation
      );

      setStats(newStats);
      setUserVote(vote);
      setVoteConfirmation({ type: vote, timestamp: new Date() });
      
      toast.success('Voto registrado e confirmado!', {
        icon: <CheckCircle2 className="w-4 h-4" />,
      });

      // Remover confirmação após 3 segundos
      setTimeout(() => {
        setVoteConfirmation(null);
      }, 3000);
    } catch (error: any) {
      toast.error(error.message || 'Erro ao votar');
    } finally {
      setVoting(false);
    }
  };

  const handleRemoveVote = async () => {
    if (!userId) return;

    try {
      setVoting(true);
      await realtimeVotingService.removeVote(wishlistId, itemId, userId);
      setUserVote(null);
      await loadStats();
      toast.success('Voto removido');
    } catch (error: any) {
      toast.error(error.message || 'Erro ao remover voto');
    } finally {
      setVoting(false);
    }
  };

  if (loading || !stats) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  const totalVotes = stats.totalVotes;
  const upPercentage = totalVotes > 0 ? (stats.votesUp / totalVotes) * 100 : 0;
  const downPercentage = totalVotes > 0 ? (stats.votesDown / totalVotes) * 100 : 0;
  const maybePercentage = totalVotes > 0 ? (stats.votesMaybe / totalVotes) * 100 : 0;

  const consensusLabels = {
    strong_yes: { label: 'Fortemente Aprovado', color: 'bg-green-500', textColor: 'text-green-700' },
    yes: { label: 'Aprovado', color: 'bg-green-400', textColor: 'text-green-600' },
    maybe: { label: 'Indeciso', color: 'bg-yellow-400', textColor: 'text-yellow-700' },
    no: { label: 'Rejeitado', color: 'bg-red-400', textColor: 'text-red-600' },
    strong_no: { label: 'Fortemente Rejeitado', color: 'bg-red-500', textColor: 'text-red-700' },
  };

  const consensus = consensusLabels[stats.consensus];

  return (
    <Card className="relative">
      {voteConfirmation && (
        <div className="absolute top-2 right-2 z-10 animate-in fade-in slide-in-from-top-2">
          <Badge className="bg-green-500 text-white">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Voto confirmado!
          </Badge>
        </div>
      )}

      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Votação em Tempo Real
          </CardTitle>
          <div className="flex items-center gap-2">
            {isConnected ? (
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                <Wifi className="w-3 h-3 mr-1" />
                Conectado
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                <WifiOff className="w-3 h-3 mr-1" />
                Offline
              </Badge>
            )}
            {lastUpdate && (
              <span className="text-xs text-muted-foreground">
                Atualizado {lastUpdate.toLocaleTimeString('pt-BR')}
              </span>
            )}
          </div>
        </div>
        {propertyName && (
          <CardDescription>{propertyName}</CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Estatísticas */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{stats.votesUp}</div>
            <div className="text-sm text-muted-foreground">Aprovações</div>
            <div className="text-xs text-green-600 mt-1">{upPercentage.toFixed(0)}%</div>
          </div>
          <div className="text-center p-3 bg-yellow-50 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">{stats.votesMaybe}</div>
            <div className="text-sm text-muted-foreground">Indecisos</div>
            <div className="text-xs text-yellow-600 mt-1">{maybePercentage.toFixed(0)}%</div>
          </div>
          <div className="text-center p-3 bg-red-50 rounded-lg">
            <div className="text-2xl font-bold text-red-600">{stats.votesDown}</div>
            <div className="text-sm text-muted-foreground">Rejeições</div>
            <div className="text-xs text-red-600 mt-1">{downPercentage.toFixed(0)}%</div>
          </div>
        </div>

        {/* Barra de progresso */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Distribuição de Votos</span>
            <span className="text-muted-foreground">{totalVotes} votos</span>
          </div>
          <div className="h-4 bg-gray-200 rounded-full overflow-hidden flex">
            <div
              className="bg-green-500 transition-all duration-500"
              style={{ width: `${upPercentage}%` }}
            />
            <div
              className="bg-yellow-500 transition-all duration-500"
              style={{ width: `${maybePercentage}%` }}
            />
            <div
              className="bg-red-500 transition-all duration-500"
              style={{ width: `${downPercentage}%` }}
            />
          </div>
        </div>

        {/* Consenso */}
        <Alert className={`${consensus.color} border-0`}>
          <AlertCircle className={`w-4 h-4 ${consensus.textColor}`} />
          <AlertDescription className={consensus.textColor}>
            <div className="font-semibold">Consenso: {consensus.label}</div>
            <div className="text-sm">Score: {stats.score > 0 ? '+' : ''}{stats.score}</div>
          </AlertDescription>
        </Alert>

        {/* Botões de voto */}
        <div className="flex gap-2">
          <Button
            onClick={() => handleVote('up')}
            disabled={voting}
            variant={userVote === 'up' ? 'default' : 'outline'}
            className={`flex-1 ${userVote === 'up' ? 'bg-green-500 hover:bg-green-600' : ''}`}
          >
            {voting && userVote !== 'up' ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <ThumbsUp className="w-4 h-4 mr-2" />
            )}
            Aprovar
          </Button>
          <Button
            onClick={() => handleVote('maybe')}
            disabled={voting}
            variant={userVote === 'maybe' ? 'default' : 'outline'}
            className={`flex-1 ${userVote === 'maybe' ? 'bg-yellow-500 hover:bg-yellow-600' : ''}`}
          >
            {voting && userVote !== 'maybe' ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <HelpCircle className="w-4 h-4 mr-2" />
            )}
            Indeciso
          </Button>
          <Button
            onClick={() => handleVote('down')}
            disabled={voting}
            variant={userVote === 'down' ? 'default' : 'outline'}
            className={`flex-1 ${userVote === 'down' ? 'bg-red-500 hover:bg-red-600' : ''}`}
          >
            {voting && userVote !== 'down' ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <ThumbsDown className="w-4 h-4 mr-2" />
            )}
            Rejeitar
          </Button>
        </div>

        {/* Remover voto */}
        {userVote && (
          <Button
            onClick={handleRemoveVote}
            disabled={voting}
            variant="ghost"
            size="sm"
            className="w-full"
          >
            Remover meu voto
          </Button>
        )}

        {!isConnected && (
          <Alert>
            <WifiOff className="w-4 h-4" />
            <AlertDescription>
              Modo offline. Seus votos serão sincronizados quando a conexão for restabelecida.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}

