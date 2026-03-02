'use client';

/**
 * Componente: Perfil de Cliente (CRM)
 * Exibe informações básicas, estatísticas e tier atual do cliente
 */

import { useState, useEffect } from 'react';
import { 
  User, Mail, Phone, Calendar, DollarSign, 
  ShoppingBag, TrendingUp, AlertTriangle,
  Edit, Loader2, Award, Tag
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';

interface CustomerProfileData {
  id: number;
  user_id?: number;
  customer_id?: number;
  user_name?: string;
  user_email?: string;
  user_phone?: string;
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
  loyalty_tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
  total_spent: number;
  total_bookings: number;
  last_booking_at?: string;
  first_booking_at?: string;
  average_booking_value: number;
  lifetime_value: number;
  churn_risk_score: number;
  engagement_score: number;
  tags?: string[];
  notes?: string;
  preferences?: any;
  metadata?: any;
  created_at: string;
  updated_at: string;
}

interface CustomerProfileProps {
  customerId: number;
  onEdit?: (customerId: number) => void;
  className?: string;
}

export function CustomerProfile({ 
  customerId, 
  onEdit,
  className 
}: CustomerProfileProps) {
  const [customer, setCustomer] = useState<CustomerProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCustomer();
  }, [customerId]);

  const fetchCustomer = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/crm/customers/${customerId}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao carregar perfil');
      }

      const result = await response.json();
      setCustomer(result.data);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar perfil do cliente');
    } finally {
      setLoading(false);
    }
  };

  const getTierColor = (tier: string) => {
    const colors: Record<string, string> = {
      bronze: 'bg-amber-100 text-amber-800 border-amber-300',
      silver: 'bg-gray-100 text-gray-800 border-gray-300',
      gold: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      platinum: 'bg-blue-100 text-blue-800 border-blue-300',
      diamond: 'bg-purple-100 text-purple-800 border-purple-300',
    };
    return colors[tier] || 'bg-gray-100 text-gray-800';
  };

  const getTierIcon = (tier: string) => {
    return <Award className="h-4 w-4" />;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Nunca';
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
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
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!customer) {
    return (
      <Alert>
        <AlertDescription>Cliente não encontrado</AlertDescription>
      </Alert>
    );
  }

  const displayName = customer.user_name || customer.customer_name || `Cliente #${customer.id}`;
  const displayEmail = customer.user_email || customer.customer_email || '-';
  const displayPhone = customer.user_phone || customer.customer_phone || '-';

  return (
    <div className={className}>
      <Tabs defaultValue="overview" className="space-y-6">
        {/* Header do Perfil */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                  <User className="h-8 w-8 text-gray-600" />
                </div>
                <div>
                  <CardTitle className="text-2xl">{displayName}</CardTitle>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Mail className="h-4 w-4" />
                      <span>{displayEmail}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Phone className="h-4 w-4" />
                      <span>{displayPhone}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={getTierColor(customer.loyalty_tier)}>
                  {getTierIcon(customer.loyalty_tier)}
                  <span className="ml-1 capitalize">{customer.loyalty_tier}</span>
                </Badge>
                {onEdit && (
                  <Button variant="outline" size="sm" onClick={() => onEdit(customer.id)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Editar
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
        </Card>

        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="statistics">Estatísticas</TabsTrigger>
          <TabsTrigger value="details">Detalhes</TabsTrigger>
        </TabsList>

        {/* Tab: Visão Geral */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Gasto */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Total Gasto
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(customer.total_spent)}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Lifetime Value: {formatCurrency(customer.lifetime_value)}
                </div>
              </CardContent>
            </Card>

            {/* Total de Reservas */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Total de Reservas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{customer.total_bookings}</div>
                <div className="text-xs text-gray-500 mt-1">
                  Ticket médio: {formatCurrency(customer.average_booking_value)}
                </div>
              </CardContent>
            </Card>

            {/* Engajamento */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Engajamento
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{customer.engagement_score}%</div>
                <Progress value={customer.engagement_score} className="mt-2" />
              </CardContent>
            </Card>

            {/* Risco de Churn */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Risco de Churn
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${
                  customer.churn_risk_score > 70
                    ? 'text-red-600'
                    : customer.churn_risk_score > 40
                    ? 'text-yellow-600'
                    : 'text-green-600'
                }`}>
                  {customer.churn_risk_score}%
                </div>
                <Progress 
                  value={customer.churn_risk_score} 
                  className="mt-2"
                />
              </CardContent>
            </Card>
          </div>

          {/* Informações de Reservas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Datas de Reserva
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Primeira Reserva:</span>
                  <span className="text-sm font-medium">
                    {formatDate(customer.first_booking_at)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Última Reserva:</span>
                  <span className="text-sm font-medium">
                    {formatDate(customer.last_booking_at)}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Tags */}
            {customer.tags && customer.tags.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Tag className="h-4 w-4" />
                    Tags
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {customer.tags.map((tag, index) => (
                      <Badge key={index} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Tab: Estatísticas */}
        <TabsContent value="statistics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Métricas Financeiras</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Gasto</span>
                  <span className="text-lg font-bold">
                    {formatCurrency(customer.total_spent)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Lifetime Value</span>
                  <span className="text-lg font-bold">
                    {formatCurrency(customer.lifetime_value)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Ticket Médio</span>
                  <span className="text-lg font-bold">
                    {formatCurrency(customer.average_booking_value)}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Métricas de Engajamento</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">Score de Engajamento</span>
                    <span className="text-sm font-bold">{customer.engagement_score}%</span>
                  </div>
                  <Progress value={customer.engagement_score} />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">Risco de Churn</span>
                    <span className={`text-sm font-bold ${
                      customer.churn_risk_score > 70
                        ? 'text-red-600'
                        : customer.churn_risk_score > 40
                        ? 'text-yellow-600'
                        : 'text-green-600'
                    }`}>
                      {customer.churn_risk_score}%
                    </span>
                  </div>
                  <Progress value={customer.churn_risk_score} />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab: Detalhes */}
        <TabsContent value="details" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Informações Adicionais</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-gray-600">ID do Perfil</span>
                  <p className="text-sm font-medium">{customer.id}</p>
                </div>
                {customer.user_id && (
                  <div>
                    <span className="text-sm text-gray-600">ID do Usuário</span>
                    <p className="text-sm font-medium">{customer.user_id}</p>
                  </div>
                )}
                {customer.customer_id && (
                  <div>
                    <span className="text-sm text-gray-600">ID do Cliente</span>
                    <p className="text-sm font-medium">{customer.customer_id}</p>
                  </div>
                )}
                <div>
                  <span className="text-sm text-gray-600">Tier de Fidelidade</span>
                  <p className="text-sm font-medium capitalize">{customer.loyalty_tier}</p>
                </div>
              </div>

              {customer.notes && (
                <div>
                  <span className="text-sm text-gray-600">Notas</span>
                  <p className="text-sm mt-1 p-3 bg-gray-50 rounded-md">
                    {customer.notes}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-gray-600">Criado em</span>
                  <p className="text-sm font-medium">
                    {formatDate(customer.created_at)}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Atualizado em</span>
                  <p className="text-sm font-medium">
                    {formatDate(customer.updated_at)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

