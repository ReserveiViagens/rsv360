/**
 * ✅ ITEM 15: COMPONENTE DE RESULTADOS DE VOTAÇÃO
 * Visualização melhorada dos resultados de votação
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ThumbsUp, ThumbsDown, HelpCircle, TrendingUp, BarChart3 } from 'lucide-react';

interface VotingResults {
  total_items: number;
  total_votes: number;
  items_by_votes: Array<{
    item_id: number;
    item_title?: string;
    votes_up: number;
    votes_down: number;
    votes_maybe: number;
    total_votes: number;
    score: number;
  }>;
}

interface VotingResultsProps {
  wishlistId: number;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export function VotingResults({ wishlistId, autoRefresh = true, refreshInterval = 5000 }: VotingResultsProps) {
  const [results, setResults] = useState<VotingResults | null>(null);
  const [loading, setLoading] = useState(true);

  const loadResults = async () => {
    try {
      // Buscar todos os items da wishlist e calcular resultados
      const itemsResponse = await fetch(`/api/wishlists/${wishlistId}/items`);
      const itemsResult = await itemsResponse.json();

      if (itemsResult.success && itemsResult.data) {
        const items = itemsResult.data;
        const totalVotes = items.reduce((sum: number, item: any) => 
          sum + item.votes_up + item.votes_down + item.votes_maybe, 0
        );

        const itemsByVotes = items
          .map((item: any) => ({
            item_id: item.item_id,
            item_title: `Item #${item.item_id}`,
            votes_up: item.votes_up || 0,
            votes_down: item.votes_down || 0,
            votes_maybe: item.votes_maybe || 0,
            total_votes: (item.votes_up || 0) + (item.votes_down || 0) + (item.votes_maybe || 0),
            score: (item.votes_up || 0) - (item.votes_down || 0),
          }))
          .sort((a: any, b: any) => b.score - a.score);

        setResults({
          total_items: items.length,
          total_votes: totalVotes,
          items_by_votes: itemsByVotes,
        });
      }
    } catch (error) {
      console.error('Erro ao carregar resultados:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResults();

    if (autoRefresh) {
      const interval = setInterval(loadResults, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [wishlistId, autoRefresh, refreshInterval]);

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <div className="animate-pulse">Carregando resultados...</div>
        </CardContent>
      </Card>
    );
  }

  if (!results || results.total_items === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <BarChart3 className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Nenhum item para exibir resultados</p>
        </CardContent>
      </Card>
    );
  }

  const maxScore = Math.max(...results.items_by_votes.map((item) => item.score), 1);
  const maxVotes = Math.max(...results.items_by_votes.map((item) => item.total_votes), 1);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Resultados da Votação
          </CardTitle>
          <CardDescription>
            {results.total_items} itens • {results.total_votes} votos totais
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {results.items_by_votes.map((item, index) => {
              const approvalRate = item.total_votes > 0 
                ? ((item.votes_up / item.total_votes) * 100).toFixed(1)
                : 0;
              
              const scorePercentage = maxScore > 0 ? (item.score / maxScore) * 100 : 0;

              return (
                <div key={item.item_id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold">{item.item_title}</span>
                        {index === 0 && item.score > 0 && (
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                            🏆 Mais votado
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <TrendingUp className="h-3 w-3" />
                          Score: {item.score > 0 ? '+' : ''}{item.score}
                        </span>
                        <span>Taxa de aprovação: {approvalRate}%</span>
                      </div>
                    </div>
                  </div>

                  {/* Barra de score */}
                  <div className="mb-3">
                    <div className="flex justify-between text-xs text-muted-foreground mb-1">
                      <span>Score</span>
                      <span>{item.score}</span>
                    </div>
                    <Progress 
                      value={scorePercentage} 
                      className="h-2"
                    />
                  </div>

                  {/* Detalhes dos votos */}
                  <div className="grid grid-cols-3 gap-2">
                    <div className="flex items-center gap-2 p-2 bg-green-50 rounded">
                      <ThumbsUp className="h-4 w-4 text-green-600" />
                      <div>
                        <div className="text-sm font-semibold text-green-700">{item.votes_up}</div>
                        <div className="text-xs text-green-600">Aprovações</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-red-50 rounded">
                      <ThumbsDown className="h-4 w-4 text-red-600" />
                      <div>
                        <div className="text-sm font-semibold text-red-700">{item.votes_down}</div>
                        <div className="text-xs text-red-600">Rejeições</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-yellow-50 rounded">
                      <HelpCircle className="h-4 w-4 text-yellow-600" />
                      <div>
                        <div className="text-sm font-semibold text-yellow-700">{item.votes_maybe}</div>
                        <div className="text-xs text-yellow-600">Talvez</div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

