'use client';

/**
 * Componente: Minhas Recompensas Resgatadas
 * Exibe recompensas resgatadas, status e códigos/cupons
 */

import { useState, useEffect } from 'react';
import { 
  Gift, CheckCircle, Clock, XCircle,
  Loader2, RefreshCw, Copy, Calendar
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface LoyaltyRedemption {
  id: number;
  user_id: number;
  reward_id: number;
  reward_name?: string;
  points_used: number;
  reward_value?: number;
  status: 'pending' | 'approved' | 'rejected' | 'used' | 'expired';
  applied_at?: string;
  expires_at?: string;
  created_at: string;
  code?: string;
  coupon_code?: string;
}

interface MyRewardsProps {
  userId?: number;
  className?: string;
}

export function MyRewards({ userId, className }: MyRewardsProps) {
  const [redemptions, setRedemptions] = useState<LoyaltyRedemption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    fetchRedemptions();
  }, [userId, statusFilter]);

  const fetchRedemptions = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      params.append('type', 'redemptions');
      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }

      const response = await fetch(`/api/loyalty/history?${params.toString()}`);

      if (!response.ok) {
        throw new Error('Erro ao carregar recompensas');
      }

      const result = await response.json();
      setRedemptions(result.data?.redemptions || []);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar recompensas');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
      case 'used':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'rejected':
      case 'expired':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      pending: { label: 'Pendente', variant: 'secondary' },
      approved: { label: 'Aprovado', variant: 'default' },
      rejected: { label: 'Rejeitado', variant: 'destructive' },
      used: { label: 'Usado', variant: 'default' },
      expired: { label: 'Expirado', variant: 'destructive' },
    };
    return badges[status] || { label: status, variant: 'outline' };
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // TODO: Adicionar toast de confirmação
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
            <CardTitle className="text-lg flex items-center gap-2">
              <Gift className="h-5 w-5" />
              Minhas Recompensas
            </CardTitle>
            <div className="flex items-center gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="approved">Aprovado</SelectItem>
                  <SelectItem value="used">Usado</SelectItem>
                  <SelectItem value="expired">Expirado</SelectItem>
                  <SelectItem value="rejected">Rejeitado</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" onClick={fetchRedemptions}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Atualizar
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {redemptions.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Recompensa</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Pontos</TableHead>
                    <TableHead>Código</TableHead>
                    <TableHead>Validade</TableHead>
                    <TableHead>Data</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {redemptions.map((redemption) => {
                    const statusBadge = getStatusBadge(redemption.status);
                    const code = redemption.code || redemption.coupon_code;

                    return (
                      <TableRow key={redemption.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {redemption.reward_name || `Recompensa #${redemption.reward_id}`}
                            </div>
                            {redemption.reward_value && (
                              <div className="text-sm text-gray-500">
                                Valor: R$ {redemption.reward_value.toFixed(2)}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(redemption.status)}
                            <Badge variant={statusBadge.variant}>
                              {statusBadge.label}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="font-medium">
                            {redemption.points_used.toLocaleString('pt-BR')}
                          </span>
                        </TableCell>
                        <TableCell>
                          {code ? (
                            <div className="flex items-center gap-2">
                              <code className="px-2 py-1 bg-gray-100 rounded text-sm font-mono">
                                {code}
                              </code>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyToClipboard(code)}
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                            </div>
                          ) : (
                            <span className="text-gray-400 text-sm">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {redemption.expires_at ? (
                            <div className="flex items-center gap-2 text-sm">
                              <Calendar className="h-4 w-4 text-gray-400" />
                              {new Date(redemption.expires_at).toLocaleDateString('pt-BR')}
                            </div>
                          ) : (
                            <span className="text-gray-400 text-sm">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-gray-500">
                            {formatDate(redemption.created_at)}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              Nenhuma recompensa resgatada encontrada
            </div>
          )}

          {/* Estatísticas */}
          {redemptions.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-800">
                  {redemptions.length}
                </div>
                <div className="text-xs text-gray-500">Total</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {redemptions.filter(r => r.status === 'approved' || r.status === 'used').length}
                </div>
                <div className="text-xs text-gray-500">Aprovadas</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {redemptions.filter(r => r.status === 'pending').length}
                </div>
                <div className="text-xs text-gray-500">Pendentes</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-800">
                  {redemptions.reduce((sum, r) => sum + r.points_used, 0).toLocaleString('pt-BR')}
                </div>
                <div className="text-xs text-gray-500">Pontos Usados</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

