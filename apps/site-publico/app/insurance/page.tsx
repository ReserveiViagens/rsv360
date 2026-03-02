"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth-provider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/providers/toast-wrapper';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Badge } from '@/components/ui/badge';
import { Shield, FileText, AlertCircle, CheckCircle, X } from 'lucide-react';

interface InsurancePolicy {
  id: number;
  booking_id: number;
  user_id: number;
  policy_number: string;
  coverage_type: string;
  coverage_amount: number;
  premium: number;
  status: 'active' | 'expired' | 'cancelled';
  start_date: string;
  end_date: string;
  created_at: string;
}

interface InsuranceClaim {
  id: number;
  policy_id: number;
  claim_type: string;
  description: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected' | 'processing';
  submitted_at: string;
  reviewed_at?: string;
}

export default function InsurancePage() {
  const { user, authenticatedFetch } = useAuth();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [bookingId, setBookingId] = useState<string>('');
  const [policies, setPolicies] = useState<InsurancePolicy[]>([]);
  const [claims, setClaims] = useState<InsuranceClaim[]>([]);
  const [showPolicyForm, setShowPolicyForm] = useState(false);
  const [showClaimForm, setShowClaimForm] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState<number | null>(null);
  const [claimType, setClaimType] = useState<string>('');
  const [claimDescription, setClaimDescription] = useState<string>('');
  const [claimAmount, setClaimAmount] = useState<string>('');

  const loadPolicies = async () => {
    try {
      setLoading(true);
      const response = await authenticatedFetch('/api/insurance/policies');
      const result = await response.json();

      if (result.success) {
        setPolicies(result.data || []);
      } else {
        toast.error(result.error || 'Erro ao carregar apólices');
      }
    } catch (error: any) {
      console.error('Erro ao carregar apólices:', error);
      toast.error(error.message || 'Erro ao carregar apólices');
    } finally {
      setLoading(false);
    }
  };

  const loadClaims = async () => {
    try {
      setLoading(true);
      const response = await authenticatedFetch('/api/insurance/claims');
      const result = await response.json();

      if (result.success) {
        setClaims(result.data || []);
      } else {
        toast.error(result.error || 'Erro ao carregar sinistros');
      }
    } catch (error: any) {
      console.error('Erro ao carregar sinistros:', error);
      toast.error(error.message || 'Erro ao carregar sinistros');
    } finally {
      setLoading(false);
    }
  };

  const createPolicy = async () => {
    if (!bookingId) {
      toast.error('ID da reserva é obrigatório');
      return;
    }

    try {
      setSubmitting(true);
      const response = await authenticatedFetch('/api/insurance/create-policy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          booking_id: parseInt(bookingId),
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Apólice criada com sucesso');
        setShowPolicyForm(false);
        setBookingId('');
        loadPolicies();
      } else {
        toast.error(result.error || 'Erro ao criar apólice');
      }
    } catch (error: any) {
      toast.error(error.message || 'Erro ao criar apólice');
    } finally {
      setSubmitting(false);
    }
  };

  const fileClaim = async () => {
    if (!selectedPolicy || !claimType || !claimDescription || !claimAmount) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    try {
      setSubmitting(true);
      const response = await authenticatedFetch('/api/insurance/file-claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          policy_id: selectedPolicy,
          claim_type: claimType,
          description: claimDescription,
          amount: parseFloat(claimAmount),
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Sinistro registrado com sucesso');
        setShowClaimForm(false);
        setSelectedPolicy(null);
        setClaimType('');
        setClaimDescription('');
        setClaimAmount('');
        loadClaims();
      } else {
        toast.error(result.error || 'Erro ao registrar sinistro');
      }
    } catch (error: any) {
      toast.error(error.message || 'Erro ao registrar sinistro');
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadPolicies();
      loadClaims();
    }
  }, [user]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <Badge variant="default" className="bg-green-600">
            <CheckCircle className="h-3 w-3 mr-1" />
            Ativo
          </Badge>
        );
      case 'expired':
        return (
          <Badge variant="secondary">
            <AlertCircle className="h-3 w-3 mr-1" />
            Expirado
          </Badge>
        );
      case 'cancelled':
        return (
          <Badge variant="destructive">
            <X className="h-3 w-3 mr-1" />
            Cancelado
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">Seguro de Viagem</h1>
          <p className="text-muted-foreground">
            Gerencie suas apólices de seguro e registre sinistros
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowClaimForm(!showClaimForm)}>
            {showClaimForm ? 'Cancelar' : 'Registrar Sinistro'}
          </Button>
          <Button onClick={() => setShowPolicyForm(!showPolicyForm)}>
            {showPolicyForm ? 'Cancelar' : 'Nova Apólice'}
          </Button>
        </div>
      </div>

      {showPolicyForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Nova Apólice de Seguro</CardTitle>
            <CardDescription>Crie uma apólice para uma reserva</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="booking_id">ID da Reserva</Label>
              <Input
                id="booking_id"
                type="number"
                value={bookingId}
                onChange={(e) => setBookingId(e.target.value)}
                placeholder="Ex: 1"
              />
            </div>
            <Button onClick={createPolicy} disabled={submitting} className="w-full">
              {submitting ? <LoadingSpinner /> : 'Criar Apólice'}
            </Button>
          </CardContent>
        </Card>
      )}

      {showClaimForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Registrar Sinistro</CardTitle>
            <CardDescription>Registre um sinistro para uma apólice</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="policy_id">Apólice</Label>
              <Input
                id="policy_id"
                type="number"
                value={selectedPolicy || ''}
                onChange={(e) => setSelectedPolicy(parseInt(e.target.value) || null)}
                placeholder="ID da Apólice"
              />
            </div>
            <div>
              <Label htmlFor="claim_type">Tipo de Sinistro</Label>
              <Input
                id="claim_type"
                value={claimType}
                onChange={(e) => setClaimType(e.target.value)}
                placeholder="Ex: Cancelamento, Bagagem, etc."
              />
            </div>
            <div>
              <Label htmlFor="claim_description">Descrição</Label>
              <Textarea
                id="claim_description"
                value={claimDescription}
                onChange={(e) => setClaimDescription(e.target.value)}
                placeholder="Descreva o sinistro em detalhes..."
                rows={4}
              />
            </div>
            <div>
              <Label htmlFor="claim_amount">Valor (R$)</Label>
              <Input
                id="claim_amount"
                type="number"
                step="0.01"
                value={claimAmount}
                onChange={(e) => setClaimAmount(e.target.value)}
                placeholder="Ex: 500.00"
              />
            </div>
            <Button onClick={fileClaim} disabled={submitting} className="w-full">
              {submitting ? <LoadingSpinner /> : 'Registrar Sinistro'}
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Minhas Apólices
            </CardTitle>
            <CardDescription>Lista de apólices de seguro</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <LoadingSpinner />
              </div>
            ) : policies.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Nenhuma apólice encontrada
              </div>
            ) : (
              <div className="space-y-4">
                {policies.map((policy) => (
                  <div key={policy.id} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold">Apólice #{policy.policy_number}</h3>
                        <p className="text-sm text-muted-foreground">
                          Reserva #{policy.booking_id}
                        </p>
                      </div>
                      {getStatusBadge(policy.status)}
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Cobertura:</span>
                        <p className="font-semibold">R$ {policy.coverage_amount.toFixed(2)}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Prêmio:</span>
                        <p className="font-semibold">R$ {policy.premium.toFixed(2)}</p>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Válido de {new Date(policy.start_date).toLocaleDateString('pt-BR')} até{' '}
                      {new Date(policy.end_date).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Sinistros
            </CardTitle>
            <CardDescription>Histórico de sinistros registrados</CardDescription>
          </CardHeader>
          <CardContent>
            {claims.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Nenhum sinistro registrado
              </div>
            ) : (
              <div className="space-y-4">
                {claims.map((claim) => (
                  <div key={claim.id} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold">{claim.claim_type}</h3>
                        <p className="text-sm text-muted-foreground">
                          Apólice #{claim.policy_id}
                        </p>
                      </div>
                      <Badge variant="secondary">{claim.status}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{claim.description}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-semibold">R$ {claim.amount.toFixed(2)}</span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(claim.submitted_at).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

