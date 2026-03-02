'use client'

import React, { useState, useEffect } from 'react'
import ProtectedRoute from '../../src/components/ProtectedRoute'
import { Users, DollarSign, TrendingUp, Gift, Clock, CheckCircle, Filter } from 'lucide-react'
import { Button } from '../../src/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../../src/components/ui/card'
import { Input } from '../../src/components/ui/input'
import { Label } from '../../src/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../src/components/ui/select'
import { Badge } from '../../src/components/ui/badge'
import { toast } from 'react-hot-toast'
import { api } from '../../src/services/apiClient'

interface Affiliate {
  id: number;
  name: string;
  email: string;
  phone?: string;
  company_name?: string;
  referral_code: string;
  status: 'active' | 'inactive' | 'suspended';
  total_referrals: number;
  total_commission: number;
  total_paid: number;
  created_at: string;
}

interface Referral {
  id: number;
  affiliate_id: number;
  enterprise_id: number;
  status: 'active' | 'inactive' | 'cancelled';
  enterprise_name?: string;
  started_at: string;
}

interface Commission {
  id: number;
  affiliate_id: number;
  enterprise_id: number;
  base_amount: number;
  commission_amount: number;
  commission_rate: number;
  period_start: string;
  period_end: string;
  status: 'pending' | 'approved' | 'paid' | 'cancelled';
  enterprise_name?: string;
  created_at: string;
}

interface Payout {
  id: number;
  affiliate_id: number;
  total_amount: number;
  commission_ids: number[];
  payment_method: string;
  status: 'pending' | 'processing' | 'paid' | 'failed' | 'cancelled';
  created_at: string;
  paid_at?: string;
}

export default function AffiliatesPage() {
  const [affiliate, setAffiliate] = useState<Affiliate | null>(null)
  const [referrals, setReferrals] = useState<Referral[]>([])
  const [commissions, setCommissions] = useState<Commission[]>([])
  const [payouts, setPayouts] = useState<Payout[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    period: 'last_30_days',
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      // TODO: Buscar ID do afiliado logado (por enquanto usar ID 1 como exemplo)
      const affiliateId = 1

      const [affiliateRes, referralsRes, commissionsRes, payoutsRes] = await Promise.all([
        api.get<Affiliate>(`/api/v1/affiliates/${affiliateId}`),
        api.get<Referral[]>(`/api/v1/affiliates/${affiliateId}/referrals`).catch(() => []),
        api.get<Commission[]>(`/api/v1/affiliates/${affiliateId}/commissions`),
        api.get<Payout[]>(`/api/v1/affiliates/${affiliateId}/payouts`).catch(() => []),
      ])

      setAffiliate(affiliateRes)
      setReferrals(Array.isArray(referralsRes) ? referralsRes : [])
      setCommissions(Array.isArray(commissionsRes) ? commissionsRes : [])
      setPayouts(Array.isArray(payoutsRes) ? payoutsRes : [])
    } catch (error) {
      console.error('Failed to load affiliate data:', error)
      toast.error('Erro ao carregar dados de afiliado.')
    } finally {
      setLoading(false)
    }
  }

  // Calcular estatísticas
  const totalEarned = commissions.reduce((sum, c) => sum + (c.status === 'paid' ? c.commission_amount : 0), 0)
  const pendingAmount = commissions.reduce((sum, c) => sum + (c.status === 'pending' ? c.commission_amount : 0), 0)
  const activeReferrals = referrals.filter(r => r.status === 'active').length

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="container mx-auto p-6 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary inline-block"></div>
          <p className="mt-4 text-gray-600">Carregando dados de afiliado...</p>
        </div>
      </ProtectedRoute>
    )
  }

  if (!affiliate) {
    return (
      <ProtectedRoute>
        <div className="container mx-auto p-6">
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">Afiliado não encontrado.</p>
            </CardContent>
          </Card>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="container mx-auto p-6 space-y-8">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Users className="w-8 h-8 text-purple-600" />
          Dashboard de Afiliado
        </h1>
        <p className="text-muted-foreground">
          Gerencie suas referências, comissões e pagamentos.
        </p>

        {/* Informações do Afiliado */}
        <Card>
          <CardHeader>
            <CardTitle>Informações do Afiliado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Nome</Label>
                <p className="font-semibold">{affiliate.name}</p>
              </div>
              <div>
                <Label>Email</Label>
                <p className="font-semibold">{affiliate.email}</p>
              </div>
              <div>
                <Label>Código de Referência</Label>
                <div className="flex items-center gap-2">
                  <code className="bg-gray-100 px-2 py-1 rounded font-mono">{affiliate.referral_code}</code>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(affiliate.referral_code)
                      toast.success('Código copiado!')
                    }}
                  >
                    Copiar
                  </Button>
                </div>
              </div>
              <div>
                <Label>Status</Label>
                <Badge variant={affiliate.status === 'active' ? 'default' : 'secondary'}>
                  {affiliate.status}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Referências Ativas</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeReferrals}</div>
              <p className="text-xs text-muted-foreground">de {affiliate.total_referrals} total</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Ganho</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R$ {totalEarned.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
              <p className="text-xs text-muted-foreground">Comissões pagas</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pendente</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R$ {pendingAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
              <p className="text-xs text-muted-foreground">A receber</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Taxa de Comissão</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">20%</div>
              <p className="text-xs text-muted-foreground">Recorrente</p>
            </CardContent>
          </Card>
        </div>

        {/* Referências */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gift className="w-5 h-5" />
              Hotéis Referenciados ({referrals.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {referrals.length === 0 ? (
              <p className="text-muted-foreground">Nenhuma referência encontrada.</p>
            ) : (
              <div className="space-y-4">
                {referrals.map((referral) => (
                  <div key={referral.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-semibold">{referral.enterprise_name || `Hotel #${referral.enterprise_id}`}</h3>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant={referral.status === 'active' ? 'default' : 'secondary'}>
                            {referral.status}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            Desde: {new Date(referral.started_at).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Comissões */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Comissões ({commissions.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {commissions.length === 0 ? (
              <p className="text-muted-foreground">Nenhuma comissão encontrada.</p>
            ) : (
              <div className="space-y-4">
                {commissions.map((commission) => (
                  <div key={commission.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-semibold">{commission.enterprise_name || `Comissão #${commission.id}`}</h3>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant={commission.status === 'paid' ? 'default' : commission.status === 'pending' ? 'secondary' : 'outline'}>
                            {commission.status}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 text-sm">
                          <div>
                            <span className="font-medium">Valor Base:</span> R$ {commission.base_amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </div>
                          <div>
                            <span className="font-medium">Comissão (20%):</span> R$ {commission.commission_amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </div>
                          <div>
                            <span className="font-medium">Período:</span> {new Date(commission.period_start).toLocaleDateString('pt-BR')} - {new Date(commission.period_end).toLocaleDateString('pt-BR')}
                          </div>
                          <div>
                            <span className="font-medium">Data:</span> {new Date(commission.created_at).toLocaleDateString('pt-BR')}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pagamentos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              Histórico de Pagamentos ({payouts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {payouts.length === 0 ? (
              <p className="text-muted-foreground">Nenhum pagamento encontrado.</p>
            ) : (
              <div className="space-y-4">
                {payouts.map((payout) => (
                  <div key={payout.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-semibold">Pagamento #{payout.id}</h3>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant={payout.status === 'paid' ? 'default' : 'secondary'}>
                            {payout.status}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            Método: {payout.payment_method}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4 text-sm">
                          <div>
                            <span className="font-medium">Valor Total:</span> R$ {payout.total_amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </div>
                          <div>
                            <span className="font-medium">Comissões:</span> {payout.commission_ids.length}
                          </div>
                          <div>
                            <span className="font-medium">
                              {payout.paid_at ? 'Pago em:' : 'Criado em:'}
                            </span> {new Date(payout.paid_at || payout.created_at).toLocaleDateString('pt-BR')}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  )
}
