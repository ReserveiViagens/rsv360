/**
 * ✅ COMPONENTE: QUALITY SCORE
 * Score visual de qualidade do host
 * 
 * @module components/quality/QualityScore
 */

'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Star, TrendingUp, TrendingDown, Minus, Award } from 'lucide-react';
import { motion } from 'framer-motion';

interface QualityScoreProps {
  score: number;
  maxScore?: number;
  breakdown?: {
    cleanliness?: number;
    communication?: number;
    checkIn?: number;
    accuracy?: number;
    location?: number;
    value?: number;
  };
  trend?: 'up' | 'down' | 'stable';
  showBreakdown?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export function QualityScore({
  score,
  maxScore = 100,
  breakdown,
  trend,
  showBreakdown = true,
  size = 'md',
  showLabel = true,
}: QualityScoreProps) {
  const percentage = (score / maxScore) * 100;
  
  const getScoreColor = () => {
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 75) return 'text-blue-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadgeVariant = () => {
    if (percentage >= 90) return 'default';
    if (percentage >= 75) return 'secondary';
    if (percentage >= 60) return 'outline';
    return 'destructive';
  };

  const getScoreLabel = () => {
    if (percentage >= 90) return 'Excelente';
    if (percentage >= 75) return 'Muito Bom';
    if (percentage >= 60) return 'Bom';
    if (percentage >= 40) return 'Regular';
    return 'Precisa Melhorar';
  };

  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      default:
        return <Minus className="w-4 h-4 text-gray-500" />;
    }
  };

  const sizeClasses = {
    sm: 'text-2xl',
    md: 'text-4xl',
    lg: 'text-6xl',
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5" />
            Score de Qualidade
          </CardTitle>
          {trend && (
            <div className="flex items-center gap-1">
              {getTrendIcon()}
            </div>
          )}
        </div>
        {showLabel && (
          <CardDescription>
            Avaliação geral baseada em múltiplos critérios
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Score Principal */}
        <div className="flex flex-col items-center justify-center space-y-4">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className={`
              ${sizeClasses[size]}
              font-bold
              ${getScoreColor()}
            `}
          >
            {score.toFixed(1)}
          </motion.div>
          
          <div className="w-full space-y-2">
            <Progress value={percentage} className="h-3" />
            <div className="flex items-center justify-between text-sm">
              <Badge variant={getScoreBadgeVariant()}>
                {getScoreLabel()}
              </Badge>
              <span className="text-muted-foreground">
                {percentage.toFixed(1)}% de {maxScore}
              </span>
            </div>
          </div>
        </div>

        {/* Breakdown Detalhado */}
        {showBreakdown && breakdown && (
          <div className="space-y-3 pt-4 border-t">
            <h4 className="text-sm font-semibold">Detalhamento</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {breakdown.cleanliness !== undefined && (
                <ScoreItem
                  label="Limpeza"
                  value={breakdown.cleanliness}
                  maxValue={5}
                  icon={<Star className="w-4 h-4" />}
                />
              )}
              {breakdown.communication !== undefined && (
                <ScoreItem
                  label="Comunicação"
                  value={breakdown.communication}
                  maxValue={5}
                  icon={<Star className="w-4 h-4" />}
                />
              )}
              {breakdown.checkIn !== undefined && (
                <ScoreItem
                  label="Check-in"
                  value={breakdown.checkIn}
                  maxValue={5}
                  icon={<Star className="w-4 h-4" />}
                />
              )}
              {breakdown.accuracy !== undefined && (
                <ScoreItem
                  label="Precisão"
                  value={breakdown.accuracy}
                  maxValue={5}
                  icon={<Star className="w-4 h-4" />}
                />
              )}
              {breakdown.location !== undefined && (
                <ScoreItem
                  label="Localização"
                  value={breakdown.location}
                  maxValue={5}
                  icon={<Star className="w-4 h-4" />}
                />
              )}
              {breakdown.value !== undefined && (
                <ScoreItem
                  label="Custo-Benefício"
                  value={breakdown.value}
                  maxValue={5}
                  icon={<Star className="w-4 h-4" />}
                />
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ScoreItem({
  label,
  value,
  maxValue = 5,
  icon,
}: {
  label: string;
  value: number;
  maxValue?: number;
  icon?: React.ReactNode;
}) {
  const percentage = (value / maxValue) * 100;

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          {icon}
          <span className="font-medium">{label}</span>
        </div>
        <span className="text-muted-foreground">
          {value.toFixed(1)}/{maxValue}
        </span>
      </div>
      <Progress value={percentage} className="h-2" />
    </div>
  );
}

