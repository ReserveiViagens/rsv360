'use client';

/**
 * Componente: Lista de Transações de Fidelidade
 * Exibe histórico de transações com filtros e detalhes
 */

import { useState, useEffect } from 'react';
import { 
  TrendingUp, Gift, Clock, RefreshCw,
  Loader2, Filter, Calendar, Search
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface LoyaltyTransaction {
  id: number;
  user_id: number;
  loyalty_points_id: number;
  transaction_type: 'earned' | 'redeemed' | 'expired' | 'adjusted' | 'bonus' | 'refund';
  points: number;
  points_before: number;
  points_after: number;
  reference_type?: string;
  reference_id?: number;
  description?: string;
  expires_at?: string;
  created_at: string;
}

interface LoyaltyTransactionsProps {
  userId?: number;
  className?: string;
  limit?: number;
}

export function LoyaltyTransactions({ 
  userId, 
  className,
  limit = 20 
}: LoyaltyTransactionsProps) {
  const [transactions, setTransactions] = useState<LoyaltyTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchTransactions();
  }, [userId, filterType]);

  const fetchTransactions = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      params.append('type', 'transactions');
      params.append('limit', limit.toString());
      
      if (filterType !== 'all') {
        // Filtro será aplicado no frontend por enquanto
      }

      const response = await fetch(`/api/loyalty/history?${params.toString()}`);

      if (!response.ok) {
        throw new Error('Erro ao carregar transações');
      }

      const result = await response.json();
      let transactionsData = result.data?.transactions || [];

      // Aplicar filtro de tipo
      if (filterType !== 'all') {
        transactionsData = transactionsData.filter(
          (t: LoyaltyTransaction) => t.transaction_type === filterType
        );
      }

      // Aplicar busca
      if (searchTerm) {
        transactionsData = transactionsData.filter((t: LoyaltyTransaction) =>
          t.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          t.reference_type?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      setTransactions(transactionsData);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar transações');
    } finally {
      setLoading(false);
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'earned':
      case 'bonus':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'redeemed':
        return <Gift className="h-4 w-4 text-blue-600" />;
      case 'expired':
        return <Clock className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTransactionBadge = (type: string) => {
    const badges: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      earned: { label: 'Ganho', variant: 'default' },
      bonus: { label: 'Bônus', variant: 'default' },
      redeemed: { label: 'Resgatado', variant: 'secondary' },
      expired: { label: 'Expirado', variant: 'destructive' },
      adjusted: { label: 'Ajuste', variant: 'outline' },
      refund: { label: 'Reembolso', variant: 'outline' },
    };
    return badges[type] || { label: type, variant: 'outline' };
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatPoints = (points: number) => {
    return points > 0 ? `+${points.toLocaleString('pt-BR')}` : points.toLocaleString('pt-BR');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Histórico de Transações</CardTitle>
            <Button variant="outline" size="sm" onClick={fetchTransactions}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Atualizar
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filtros */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar por descrição..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                <SelectItem value="earned">Ganhos</SelectItem>
                <SelectItem value="bonus">Bônus</SelectItem>
                <SelectItem value="redeemed">Resgates</SelectItem>
                <SelectItem value="expired">Expirados</SelectItem>
                <SelectItem value="adjusted">Ajustes</SelectItem>
                <SelectItem value="refund">Reembolsos</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tabela de Transações */}
          {transactions.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Pontos</TableHead>
                    <TableHead>Saldo</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Data</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((transaction) => {
                    const badge = getTransactionBadge(transaction.transaction_type);
                    const isPositive = transaction.points > 0;

                    return (
                      <TableRow key={transaction.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getTransactionIcon(transaction.transaction_type)}
                            <Badge variant={badge.variant}>
                              {badge.label}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className={`font-medium ${
                            isPositive ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {formatPoints(transaction.points)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-gray-600">
                            {transaction.points_after.toLocaleString('pt-BR')} pontos
                          </div>
                        </TableCell>
                        <TableCell className="max-w-xs">
                          <div className="text-sm text-gray-600 truncate">
                            {transaction.description || transaction.reference_type || '-'}
                          </div>
                          {transaction.reference_type && transaction.reference_id && (
                            <div className="text-xs text-gray-400 mt-1">
                              {transaction.reference_type} #{transaction.reference_id}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Calendar className="h-4 w-4" />
                            {formatDate(transaction.created_at)}
                          </div>
                          {transaction.expires_at && (
                            <div className="text-xs text-gray-400 mt-1">
                              Expira: {new Date(transaction.expires_at).toLocaleDateString('pt-BR')}
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              Nenhuma transação encontrada
            </div>
          )}

          {/* Estatísticas */}
          {transactions.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {transactions
                    .filter(t => t.points > 0)
                    .reduce((sum, t) => sum + t.points, 0)
                    .toLocaleString('pt-BR')}
                </div>
                <div className="text-xs text-gray-500">Total Ganho</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {Math.abs(transactions
                    .filter(t => t.points < 0)
                    .reduce((sum, t) => sum + t.points, 0))
                    .toLocaleString('pt-BR')}
                </div>
                <div className="text-xs text-gray-500">Total Resgatado</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-800">
                  {transactions.filter(t => t.transaction_type === 'earned').length}
                </div>
                <div className="text-xs text-gray-500">Ganhos</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-800">
                  {transactions.filter(t => t.transaction_type === 'redeemed').length}
                </div>
                <div className="text-xs text-gray-500">Resgates</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
