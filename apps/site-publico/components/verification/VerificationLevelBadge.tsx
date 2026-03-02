/**
 * Componente de Badge de Nível de Verificação
 * Exibe nível e badges visuais
 */

'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import type { VerificationLevel, PropertyVerificationStatus } from '@/lib/verification-levels-service';
import { getBadgeById } from '@/lib/verification-levels-service';

interface VerificationLevelBadgeProps {
  status: PropertyVerificationStatus;
  showProgress?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const levelConfig: Record<VerificationLevel, { label: string; color: string; icon: string }> = {
  basic: {
    label: 'Básico',
    color: 'bg-gray-500',
    icon: '🏠',
  },
  verified: {
    label: 'Verificado',
    color: 'bg-green-500',
    icon: '✅',
  },
  premium: {
    label: 'Premium',
    color: 'bg-yellow-500',
    icon: '⭐',
  },
  superhost: {
    label: 'Superhost',
    color: 'bg-purple-500',
    icon: '👑',
  },
};

export function VerificationLevelBadge({ status, showProgress = true, size = 'md' }: VerificationLevelBadgeProps) {
  const config = levelConfig[status.level];
  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1.5',
    lg: 'text-base px-4 py-2',
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Badge className={`${config.color} ${sizeClasses[size]}`}>
          <span className="mr-1">{config.icon}</span>
          {config.label}
        </Badge>
        {status.score > 0 && (
          <span className="text-sm text-muted-foreground">
            Score: {status.score}/100
          </span>
        )}
      </div>

      {showProgress && status.nextLevel && (
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Progresso para {levelConfig[status.nextLevel].label}</span>
            <span className="font-medium">{status.progressToNextLevel}%</span>
          </div>
          <Progress value={status.progressToNextLevel} className="h-2" />
        </div>
      )}
    </div>
  );
}

/**
 * Componente de Lista de Badges
 */
export function VerificationBadgesList({ status }: { status: PropertyVerificationStatus }) {
  return (
    <div className="flex flex-wrap gap-2">
      {status.badges.map(badgeId => {
        const badge = getBadgeById(badgeId);
        if (!badge) return null;

        return (
          <TooltipProvider key={badgeId}>
            <Tooltip>
              <TooltipTrigger>
                <Badge variant="outline" className="cursor-help">
                  <span className="mr-1">{badge.icon}</span>
                  {badge.name}
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p>{badge.description}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      })}
    </div>
  );
}

/**
 * Componente Completo de Status de Verificação
 */
export function VerificationStatusCard({ propertyId }: { propertyId: number }) {
  const [status, setStatus] = React.useState<PropertyVerificationStatus | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    loadStatus();
  }, [propertyId]);

  const loadStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/verification/status?property_id=${propertyId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setStatus(data.data);
      }
    } catch (error) {
      console.error('Erro ao carregar status:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-sm text-muted-foreground">Carregando...</div>;
  }

  if (!status) {
    return <div className="text-sm text-muted-foreground">Status não disponível</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Status de Verificação</CardTitle>
        <CardDescription>
          Nível e badges da propriedade
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <VerificationLevelBadge status={status} showProgress={true} size="lg" />
        
        {status.badges.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-2">Badges</h4>
            <VerificationBadgesList status={status} />
          </div>
        )}

        {status.nextLevel && (
          <div className="pt-4 border-t">
            <h4 className="text-sm font-medium mb-2">Próximo Nível: {levelConfig[status.nextLevel].label}</h4>
            <div className="text-xs text-muted-foreground space-y-1">
              {Object.entries(status.requirements.next).map(([key, value]) => (
                <div key={key}>
                  {key}: {typeof value === 'number' ? value : JSON.stringify(value)}
                </div>
              ))}
            </div>
          </div>
        )}

        {status.verifiedAt && (
          <div className="text-xs text-muted-foreground pt-2 border-t">
            Verificado em: {new Date(status.verifiedAt).toLocaleDateString('pt-BR')}
            {status.verifiedBy === 'ai' && ' (AI)'}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Adicionar import do React
import React from 'react';

