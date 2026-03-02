import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus, Activity, Users, FileText, Clock } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    value: number;
    label: string;
    isPositive?: boolean;
  };
  icon?: React.ReactNode;
  status?: 'success' | 'warning' | 'error' | 'info';
  className?: string;
}

const statusColors = {
  success: 'text-green-600 bg-green-50 border-green-200',
  warning: 'text-yellow-600 bg-yellow-50 border-yellow-200',
  error: 'text-red-600 bg-red-50 border-red-200',
  info: 'text-blue-600 bg-blue-50 border-blue-200'
};

const statusIcons = {
  success: <TrendingUp className="h-4 w-4" />,
  warning: <Minus className="h-4 w-4" />,
  error: <TrendingDown className="h-4 w-4" />,
  info: <Activity className="h-4 w-4" />
};

const defaultIcons = {
  users: <Users className="h-5 w-5" />,
  content: <FileText className="h-5 w-5" />,
  performance: <Activity className="h-5 w-5" />,
  time: <Clock className="h-5 w-5" />
};

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  trend,
  icon,
  status = 'info',
  className = ''
}) => {
  const getIcon = () => {
    if (icon) return icon;

    // Auto-detect icon based on title
    const titleLower = title.toLowerCase();
    if (titleLower.includes('usuário') || titleLower.includes('user')) return defaultIcons.users;
    if (titleLower.includes('conteúdo') || titleLower.includes('content')) return defaultIcons.content;
    if (titleLower.includes('performance') || titleLower.includes('saúde')) return defaultIcons.performance;
    if (titleLower.includes('tempo') || titleLower.includes('uptime')) return defaultIcons.time;

    return defaultIcons.performance;
  };

  const getTrendIcon = () => {
    if (!trend) return null;

    if (trend.isPositive === true) return <TrendingUp className="h-3 w-3" />;
    if (trend.isPositive === false) return <TrendingDown className="h-3 w-3" />;
    return <Minus className="h-3 w-3" />;
  };

  const getTrendColor = () => {
    if (!trend) return '';

    if (trend.isPositive === true) return 'text-green-600';
    if (trend.isPositive === false) return 'text-red-600';
    return 'text-gray-600';
  };

  return (
    <Card className={`transition-all duration-200 hover:shadow-md ${className}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">
          {title}
        </CardTitle>
        <div className={`p-2 rounded-full ${statusColors[status]}`}>
          {getIcon()}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          <div className="text-2xl font-bold text-gray-900">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </div>

          {subtitle && (
            <p className="text-xs text-gray-500">
              {subtitle}
            </p>
          )}

          {trend && (
            <div className={`flex items-center space-x-1 text-xs ${getTrendColor()}`}>
              {getTrendIcon()}
              <span>
                {trend.value > 0 ? '+' : ''}{trend.value}%
              </span>
              <span className="text-gray-500">
                {trend.label}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// Componente especializado para métricas de saúde
export const HealthMetricCard: React.FC<{
  score: number;
  status: string;
  message: string;
  uptime: number;
}> = ({ score, status, message, uptime }) => {
  const getStatusColor = () => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'warning';
    return 'error';
  };

  const getStatusIcon = () => {
    if (score >= 80) return <TrendingUp className="h-5 w-5" />;
    if (score >= 60) return <Minus className="h-5 w-5" />;
    return <TrendingDown className="h-5 w-5" />;
  };

  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  return (
    <Card className="transition-all duration-200 hover:shadow-md">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">
          Saúde do Sistema
        </CardTitle>
        <div className={`p-2 rounded-full ${statusColors[getStatusColor()]}`}>
          {getStatusIcon()}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <div className="text-2xl font-bold text-gray-900">
              {score}/100
            </div>
            <Badge variant={getStatusColor() === 'success' ? 'default' : 'secondary'}>
              {status}
            </Badge>
          </div>

          <p className="text-xs text-gray-500">
            {message}
          </p>

          <div className="flex items-center space-x-1 text-xs text-gray-600">
            <Clock className="h-3 w-3" />
            <span>Uptime: {formatUptime(uptime)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
