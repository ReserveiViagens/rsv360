/**
 * ✅ TAREFA MEDIUM-2: Componente para gerenciar Smart Locks
 * UI para gerar, visualizar e revogar códigos de acesso
 */

'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Lock, Key, Clock, CheckCircle2, XCircle, RefreshCw, Loader2, QrCode } from '@/lib/lucide-icons';
import { toast } from 'sonner';

interface SmartLockCode {
  pin_code: string;
  expires_at: string | Date;
  lock_type?: string;
  lock_name?: string;
  booking_id?: number;
  booking_code?: string;
}

interface SmartLockManagerProps {
  bookingId?: number;
  propertyId?: number;
  checkIn?: Date | string;
  checkOut?: Date | string;
  onCodeGenerated?: (code: string) => void;
}

export function SmartLockManager({
  bookingId,
  propertyId,
  checkIn,
  checkOut,
  onCodeGenerated,
}: SmartLockManagerProps) {
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [codes, setCodes] = useState<SmartLockCode[]>([]);
  const [newCode, setNewCode] = useState<SmartLockCode | null>(null);

  useEffect(() => {
    if (bookingId || propertyId) {
      loadCodes();
    }
  }, [bookingId, propertyId]);

  const loadCodes = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (bookingId) params.append('booking_id', bookingId.toString());
      if (propertyId) params.append('property_id', propertyId.toString());

      const response = await fetch(`/api/smart-locks/codes?${params.toString()}`);
      const result = await response.json();

      if (result.success) {
        setCodes(result.data);
      }
    } catch (error: any) {
      console.error('Erro ao carregar códigos:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateCode = async () => {
    if (!propertyId || !bookingId || !checkIn || !checkOut) {
      toast.error('Dados incompletos para gerar código');
      return;
    }

    try {
      setGenerating(true);
      const response = await fetch('/api/smart-locks/generate-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          property_id: propertyId,
          booking_id: bookingId,
          check_in: typeof checkIn === 'string' ? checkIn : checkIn.toISOString(),
          check_out: typeof checkOut === 'string' ? checkOut : checkOut.toISOString(),
        }),
      });

      const result = await response.json();
      if (result.success) {
        setNewCode(result.data);
        toast.success('Código gerado com sucesso!');
        onCodeGenerated?.(result.data.pin_code);
        loadCodes();
      } else {
        throw new Error(result.error || 'Erro ao gerar código');
      }
    } catch (error: any) {
      toast.error(error.message || 'Erro ao gerar código');
    } finally {
      setGenerating(false);
    }
  };

  const revokeCode = async (bookingIdToRevoke: number) => {
    if (!propertyId) {
      toast.error('property_id é necessário para revogar código');
      return;
    }

    try {
      const response = await fetch('/api/smart-locks/revoke-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          property_id: propertyId,
          booking_id: bookingIdToRevoke,
        }),
      });

      const result = await response.json();
      if (result.success) {
        toast.success('Código revogado com sucesso!');
        loadCodes();
        if (newCode && newCode.booking_id === bookingIdToRevoke) {
          setNewCode(null);
        }
      } else {
        throw new Error(result.error || 'Erro ao revogar código');
      }
    } catch (error: any) {
      toast.error(error.message || 'Erro ao revogar código');
    }
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleString('pt-BR');
  };

  const isExpired = (expiresAt: string | Date) => {
    return new Date(expiresAt) < new Date();
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5" />
            Smart Locks - Códigos de Acesso
          </CardTitle>
          <CardDescription>
            Gerencie códigos de acesso para fechaduras inteligentes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {bookingId && propertyId && checkIn && checkOut && (
            <Button
              onClick={generateCode}
              disabled={generating}
              className="w-full"
            >
              {generating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Gerando código...
                </>
              ) : (
                <>
                  <Key className="w-4 h-4 mr-2" />
                  Gerar Novo Código
                </>
              )}
            </Button>
          )}

          {newCode && (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <AlertDescription>
                <div className="space-y-2">
                  <p className="font-semibold text-green-900">Código gerado com sucesso!</p>
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Código PIN</p>
                      <p className="text-2xl font-bold text-green-700">{newCode.pin_code}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Válido até</p>
                      <p className="text-sm font-medium">{formatDate(newCode.expires_at)}</p>
                    </div>
                  </div>
                  {newCode.lock && (
                    <div className="mt-2">
                      <Badge variant="secondary">
                        {newCode.lock.name || newCode.lock.lock_type}
                      </Badge>
                    </div>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}

          {loading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : codes.length > 0 ? (
            <div className="space-y-2">
              <h3 className="font-semibold">Códigos Ativos</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Válido até</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {codes.map((code, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Key className="w-4 h-4 text-muted-foreground" />
                          <code className="font-mono text-lg font-bold">{code.pin_code}</code>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {code.lock_type || code.lock_name || 'N/A'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm">{formatDate(code.expires_at)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {isExpired(code.expires_at) ? (
                          <Badge variant="destructive">Expirado</Badge>
                        ) : (
                          <Badge variant="success">Ativo</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {code.booking_id && !isExpired(code.expires_at) && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => revokeCode(code.booking_id!)}
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Revogar
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Lock className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum código de acesso encontrado</p>
              {bookingId && propertyId && checkIn && checkOut && (
                <p className="text-sm mt-2">Clique em "Gerar Novo Código" para criar um</p>
              )}
            </div>
          )}

          <div className="flex justify-end">
            <Button variant="outline" onClick={loadCodes} disabled={loading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

