/**
 * ✅ COMPONENTE: INSURANCE POLICY CARD
 * Card para exibir detalhes de uma apólice de seguro
 */

'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Shield, Download, FileText, Calendar, DollarSign } from '@/lib/lucide-icons';

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

interface InsurancePolicyCardProps {
  policy: InsurancePolicy;
  onViewDetails?: () => void;
  onDownload?: () => void;
  onFileClaim?: () => void;
}

export function InsurancePolicyCard({
  policy,
  onViewDetails,
  onDownload,
  onFileClaim,
}: InsurancePolicyCardProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-600">Ativo</Badge>;
      case 'expired':
        return <Badge variant="outline">Expirado</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelado</Badge>;
      case 'claimed':
        return <Badge className="bg-blue-600">Com Sinistro</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getCoverageTypeName = (type: string) => {
    switch (type) {
      case 'basic':
        return 'Básico';
      case 'standard':
        return 'Padrão';
      case 'premium':
        return 'Premium';
      case 'comprehensive':
        return 'Completo';
      default:
        return type;
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR');
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Apólice {policy.policy_number}
            </CardTitle>
            <CardDescription className="mt-2">
              {getCoverageTypeName(policy.coverage_type)} • {policy.insurance_provider}
            </CardDescription>
          </div>
          {getStatusBadge(policy.status)}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Cobertura</p>
            <p className="font-semibold">{formatCurrency(policy.coverage_amount)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Prêmio</p>
            <p className="font-semibold">{formatCurrency(policy.premium_amount)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              Início
            </p>
            <p className="font-semibold">{formatDate(policy.coverage_start_date)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              Fim
            </p>
            <p className="font-semibold">{formatDate(policy.coverage_end_date)}</p>
          </div>
        </div>

        <div>
          <p className="text-sm text-muted-foreground">Segurado</p>
          <p className="font-semibold">{policy.insured_name}</p>
        </div>

        {policy.policy_details?.kakau_document_url && (
          <div className="p-3 bg-muted rounded-lg">
            <p className="text-xs text-muted-foreground mb-2">Documentos disponíveis:</p>
            <div className="space-y-1">
              {policy.policy_details.kakau_document_url && (
                <a
                  href={policy.policy_details.kakau_document_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                >
                  <FileText className="w-3 h-3" />
                  Apólice (PDF)
                </a>
              )}
              {policy.policy_details.kakau_terms_url && (
                <a
                  href={policy.policy_details.kakau_terms_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                >
                  <FileText className="w-3 h-3" />
                  Termos e Condições
                </a>
              )}
            </div>
          </div>
        )}

        <div className="flex gap-2 pt-2 border-t">
          {onViewDetails && (
            <Button variant="outline" size="sm" onClick={onViewDetails} className="flex-1">
              Ver Detalhes
            </Button>
          )}
          {onDownload && policy.policy_details?.kakau_document_url && (
            <Button variant="outline" size="sm" onClick={onDownload}>
              <Download className="w-4 h-4" />
            </Button>
          )}
          {onFileClaim && policy.status === 'active' && (
            <Button variant="outline" size="sm" onClick={onFileClaim}>
              Registrar Sinistro
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

