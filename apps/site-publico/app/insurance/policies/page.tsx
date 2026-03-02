/**
 * ✅ PÁGINA: GERENCIAR APÓLICES DE SEGURO
 * Lista e gerencia apólices do usuário
 */

'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { InsurancePolicyCard } from '@/components/insurance/InsurancePolicyCard';
import { Shield, Plus, Filter } from '@/lib/lucide-icons';
import { getUser, getToken } from '@/lib/auth';
import { toast } from 'sonner';

interface InsurancePolicy {
  id: number;
  policy_number: string;
  insurance_provider: string;
  coverage_type: string;
  coverage_amount: number;
  premium_amount: number;
  coverage_start_date: string;
  coverage_end_date: string;
  status: string;
  insured_name: string;
  policy_details?: any;
  booking_id?: number;
}

export default function InsurancePoliciesPage() {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [policies, setPolicies] = useState<InsurancePolicy[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [activeTab, setActiveTab] = useState('all');

  const user = getUser();
  const token = getToken();

  useEffect(() => {
    loadPolicies();
  }, [filterStatus]);

  const loadPolicies = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      if (filterStatus !== 'all') {
        queryParams.append('status', filterStatus);
      }

      const response = await fetch(`/api/insurance/policies?${queryParams.toString()}`, {
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao carregar apólices');
      }

      if (result.success) {
        setPolicies(result.data || []);
      }
    } catch (error: any) {
      toast.error(error.message || 'Erro ao carregar apólices');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (policy: InsurancePolicy) => {
    // Navegar para página de detalhes
    window.location.href = `/insurance/policies/${policy.id}`;
  };

  const handleDownload = (policy: InsurancePolicy) => {
    if (policy.policy_details?.kakau_document_url) {
      window.open(policy.policy_details.kakau_document_url, '_blank');
    } else {
      toast.error('Documento não disponível');
    }
  };

  const handleFileClaim = (policy: InsurancePolicy) => {
    // Navegar para página de registro de sinistro
    window.location.href = `/insurance/claims/new?policy_id=${policy.id}`;
  };

  const filteredPolicies = activeTab === 'all'
    ? policies
    : policies.filter((p) => p.status === activeTab);

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Shield className="w-8 h-8" />
            Minhas Apólices
          </h1>
          <p className="text-muted-foreground mt-2">
            Gerencie suas apólices de seguro de viagem
          </p>
        </div>
        <Button onClick={() => window.location.href = '/insurance/new'}>
          <Plus className="w-4 h-4 mr-2" />
          Nova Apólice
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="all">Todas</TabsTrigger>
            <TabsTrigger value="active">Ativas</TabsTrigger>
            <TabsTrigger value="expired">Expiradas</TabsTrigger>
            <TabsTrigger value="cancelled">Canceladas</TabsTrigger>
          </TabsList>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-48">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Filtrar por status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os status</SelectItem>
              <SelectItem value="active">Ativas</SelectItem>
              <SelectItem value="expired">Expiradas</SelectItem>
              <SelectItem value="cancelled">Canceladas</SelectItem>
              <SelectItem value="claimed">Com Sinistro</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <TabsContent value={activeTab} className="space-y-4">
          {loading ? (
            <Card>
              <CardContent className="flex items-center justify-center p-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Carregando apólices...</p>
                </div>
              </CardContent>
            </Card>
          ) : filteredPolicies.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPolicies.map((policy) => (
                <InsurancePolicyCard
                  key={policy.id}
                  policy={policy}
                  onViewDetails={() => handleViewDetails(policy)}
                  onDownload={() => handleDownload(policy)}
                  onFileClaim={() => handleFileClaim(policy)}
                />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-12">
                <Shield className="w-12 h-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhuma apólice encontrada</h3>
                <p className="text-muted-foreground text-center mb-4">
                  {activeTab === 'all'
                    ? 'Você ainda não possui apólices de seguro'
                    : `Nenhuma apólice com status "${activeTab}"`}
                </p>
                <Button onClick={() => window.location.href = '/insurance/new'}>
                  <Plus className="w-4 h-4 mr-2" />
                  Criar Primeira Apólice
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

