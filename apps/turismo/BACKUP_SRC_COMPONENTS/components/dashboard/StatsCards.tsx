import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '../ui';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Calendar, 
  DollarSign, 
  MapPin,
  Clock,
  Star
} from 'lucide-react';

// 🎯 TIPOS PARA AS MÉTRICAS
export interface StatCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    type: 'increase' | 'decrease';
    period: string;
  };
  icon: React.ReactNode;
  color: 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'danger';
  format?: 'currency' | 'percentage' | 'number' | 'time';
  loading?: boolean;
}

// 🎨 COMPONENTE STAT CARD INDIVIDUAL
export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  icon,
  color,
  format = 'number',
  loading = false
}) => {
  // 🎨 CORES POR VARIANTE
  const colorClasses = {
    primary: 'bg-primary-50 text-primary-600 border-primary-200',
    secondary: 'bg-secondary-50 text-secondary-600 border-secondary-200',
    accent: 'bg-accent-50 text-accent-600 border-accent-200',
    success: 'bg-success-50 text-success-600 border-success-200',
    warning: 'bg-warning-50 text-warning-600 border-warning-200',
    danger: 'bg-danger-50 text-danger-600 border-danger-200',
  };

  // 🔢 FORMATAÇÃO DOS VALORES
  const formatValue = (val: string | number) => {
    if (loading) return '...';
    
    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL'
        }).format(Number(val));
      
      case 'percentage':
        return `${val}%`;
      
      case 'time':
        return `${val}h`;
      
      default:
        return new Intl.NumberFormat('pt-BR').format(Number(val));
    }
  };

  // 📈 RENDERIZAÇÃO DA MUDANÇA
  const renderChange = () => {
    if (!change) return null;

    const isIncrease = change.type === 'increase';
    const changeColor = isIncrease ? 'text-success-600' : 'text-danger-600';
    const changeIcon = isIncrease ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />;

    return (
      <div className={`flex items-center text-sm ${changeColor}`}>
        {changeIcon}
        <span className="ml-1 font-medium">
          {isIncrease ? '+' : ''}{change.value}%
        </span>
        <span className="ml-1 text-neutral-500">
          vs {change.period}
        </span>
      </div>
    );
  };

  // 🎭 ANIMAÇÕES
  const cardVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    hover: { y: -4, transition: { duration: 0.2 } }
  };

  return (
    <motion.div
      variants={cardVariants}
      initial="initial"
      animate="animate"
      whileHover="hover"
      transition={{ duration: 0.3 }}
    >
      <Card className="p-6 hover:shadow-lg transition-all duration-300">
        <div className="flex items-center justify-between">
          {/* Ícone e Cor */}
          <div className={`p-3 rounded-lg border ${colorClasses[color]}`}>
            {icon}
          </div>
          
          {/* Indicador de Mudança */}
          {change && (
            <div className="text-right">
              {renderChange()}
            </div>
          )}
        </div>

        {/* Conteúdo Principal */}
        <div className="mt-4">
          <h3 className="text-sm font-medium text-neutral-600 mb-1">
            {title}
          </h3>
          <p className="text-2xl font-bold text-neutral-900">
            {formatValue(value)}
          </p>
        </div>
      </Card>
    </motion.div>
  );
};

// 🎯 COMPONENTE PRINCIPAL STATSCARDS
export interface StatsCardsProps {
  data: {
    totalBookings: number;
    monthlyRevenue: number;
    activeCustomers: number;
    popularDestination: string;
    averageRating: number;
    pendingReservations: number;
    completedTrips: number;
    totalDestinations: number;
  };
  loading?: boolean;
}

export const StatsCards: React.FC<StatsCardsProps> = ({ data, loading = false }) => {
  // 🎨 CONFIGURAÇÃO DAS MÉTRICAS
  const stats = [
    {
      title: 'Total de Reservas',
      value: data.totalBookings,
      change: { value: 12, type: 'increase' as const, period: 'mês passado' },
      icon: <Calendar className="w-6 h-6" />,
      color: 'primary' as const,
      format: 'number' as const
    },
    {
      title: 'Receita Mensal',
      value: data.monthlyRevenue,
      change: { value: 8.5, type: 'increase' as const, period: 'mês passado' },
      icon: <DollarSign className="w-6 h-6" />,
      color: 'success' as const,
      format: 'currency' as const
    },
    {
      title: 'Clientes Ativos',
      value: data.activeCustomers,
      change: { value: 3.2, type: 'decrease' as const, period: 'mês passado' },
      icon: <Users className="w-6 h-6" />,
      color: 'secondary' as const,
      format: 'number' as const
    },
    {
      title: 'Destino Popular',
      value: data.popularDestination,
      icon: <MapPin className="w-6 h-6" />,
      color: 'accent' as const,
      format: 'number' as const
    },
    {
      title: 'Avaliação Média',
      value: data.averageRating,
      change: { value: 0.3, type: 'increase' as const, period: 'mês passado' },
      icon: <Star className="w-6 h-6" />,
      color: 'warning' as const,
      format: 'number' as const
    },
    {
      title: 'Reservas Pendentes',
      value: data.pendingReservations,
      change: { value: 15, type: 'decrease' as const, period: 'mês passado' },
      icon: <Clock className="w-6 h-6" />,
      color: 'danger' as const,
      format: 'number' as const
    },
    {
      title: 'Viagens Concluídas',
      value: data.completedTrips,
      change: { value: 22, type: 'increase' as const, period: 'mês passado' },
      icon: <TrendingUp className="w-6 h-6" />,
      color: 'success' as const,
      format: 'number' as const
    },
    {
      title: 'Total de Destinos',
      value: data.totalDestinations,
      change: { value: 5, type: 'increase' as const, period: 'mês passado' },
      icon: <MapPin className="w-6 h-6" />,
      color: 'primary' as const,
      format: 'number' as const
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <StatCard
          key={index}
          {...stat}
          loading={loading}
        />
      ))}
    </div>
  );
};

// 🎯 COMPONENTES ESPECIALIZADOS PARA CASOS DE USO ESPECÍFICOS
export const RevenueStats: React.FC<{ revenue: number; change: number }> = ({ revenue, change }) => (
  <StatCard
    title="Receita Total"
    value={revenue}
    change={{ value: change, type: change >= 0 ? 'increase' : 'decrease', period: 'mês passado' }}
    icon={<DollarSign className="w-6 h-6" />}
    color="success"
    format="currency"
  />
);

export const BookingStats: React.FC<{ bookings: number; change: number }> = ({ bookings, change }) => (
  <StatCard
    title="Reservas Ativas"
    value={bookings}
    change={{ value: change, type: change >= 0 ? 'increase' : 'decrease', period: 'mês passado' }}
    icon={<Calendar className="w-6 h-6" />}
    color="primary"
    format="number"
  />
);

export const CustomerStats: React.FC<{ customers: number; change: number }> = ({ customers, change }) => (
  <StatCard
    title="Novos Clientes"
    value={customers}
    change={{ value: change, type: change >= 0 ? 'increase' : 'decrease', period: 'mês passado' }}
    icon={<Users className="w-6 h-6" />}
    color="secondary"
    format="number"
  />
);

export default StatsCards;
