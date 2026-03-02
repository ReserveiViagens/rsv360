import React from 'react';
import { 
  Plus, 
  Calendar, 
  Users, 
  MapPin, 
  FileText, 
  Settings, 
  BarChart3,
  Bell,
  Download,
  Upload
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { Button } from '../ui/Button';

export interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  variant?: 'default' | 'primary' | 'secondary' | 'accent';
  onClick: () => void;
  disabled?: boolean;
}

export interface QuickActionsProps {
  actions: QuickAction[];
  title?: string;
  className?: string;
  columns?: 2 | 3 | 4;
}

const QuickActions: React.FC<QuickActionsProps> = ({
  actions,
  title = 'Ações Rápidas',
  className,
  columns = 3,
}) => {
  const gridCols = {
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  };

  const getVariantStyles = (variant: QuickAction['variant']) => {
    switch (variant) {
      case 'primary':
        return 'bg-primary-50 border-primary-200 text-primary-700 hover:bg-primary-100';
      case 'secondary':
        return 'bg-secondary-50 border-secondary-200 text-secondary-700 hover:bg-secondary-100';
      case 'accent':
        return 'bg-accent-50 border-accent-200 text-accent-700 hover:bg-accent-100';
      default:
        return 'bg-neutral-50 border-neutral-200 text-neutral-700 hover:bg-neutral-100';
    }
  };

  const getIconStyles = (variant: QuickAction['variant']) => {
    switch (variant) {
      case 'primary':
        return 'text-primary-600 bg-primary-100';
      case 'secondary':
        return 'text-secondary-600 bg-secondary-100';
      case 'accent':
        return 'text-accent-600 bg-accent-100';
      default:
        return 'text-neutral-600 bg-neutral-100';
    }
  };

  return (
    <div className={cn('rounded-xl border border-neutral-200 bg-white p-6', className)}>
      {title && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-neutral-900">{title}</h3>
          <p className="text-sm text-neutral-500">
            Acesse rapidamente as funcionalidades mais usadas
          </p>
        </div>
      )}

      <div className={cn('grid gap-4', gridCols[columns])}>
        {actions.map((action) => (
          <button
            key={action.id}
            onClick={action.onClick}
            disabled={action.disabled}
            className={cn(
              'group relative flex flex-col items-start p-4 rounded-lg border transition-all duration-200',
              'focus:outline-none focus:ring-2 focus:ring-primary-500/20',
              'disabled:cursor-not-allowed disabled:opacity-50',
              getVariantStyles(action.variant)
            )}
          >
            {/* Icon */}
            <div className={cn(
              'flex h-10 w-10 items-center justify-center rounded-lg mb-3 transition-colors',
              getIconStyles(action.variant)
            )}>
              <action.icon className="h-5 w-5" />
            </div>

            {/* Content */}
            <div className="text-left">
              <h4 className="font-medium text-current mb-1 group-hover:underline">
                {action.title}
              </h4>
              <p className="text-sm opacity-80">
                {action.description}
              </p>
            </div>

            {/* Hover Effect */}
            <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
          </button>
        ))}
      </div>
    </div>
  );
};

// Componente de exemplo com ações padrão
export const DefaultQuickActions: React.FC<{
  onNewBooking?: () => void;
  onNewCustomer?: () => void;
  onNewTravel?: () => void;
  onReports?: () => void;
  onSettings?: () => void;
  onNotifications?: () => void;
  onExport?: () => void;
  onImport?: () => void;
  className?: string;
}> = ({
  onNewBooking,
  onNewCustomer,
  onNewTravel,
  onReports,
  onSettings,
  onNotifications,
  onExport,
  onImport,
  className,
}) => {
  const defaultActions: QuickAction[] = [
    {
      id: 'new-booking',
      title: 'Nova Reserva',
      description: 'Criar uma nova reserva para cliente',
      icon: Plus,
      variant: 'primary',
      onClick: onNewBooking || (() => {}),
    },
    {
      id: 'new-customer',
      title: 'Novo Cliente',
      description: 'Cadastrar novo cliente no sistema',
      icon: Users,
      variant: 'secondary',
      onClick: onNewCustomer || (() => {}),
    },
    {
      id: 'new-travel',
      title: 'Nova Viagem',
      description: 'Adicionar novo destino ao catálogo',
      icon: MapPin,
      variant: 'accent',
      onClick: onNewTravel || (() => {}),
    },
    {
      id: 'reports',
      title: 'Relatórios',
      description: 'Visualizar relatórios e estatísticas',
      icon: BarChart3,
      variant: 'default',
      onClick: onReports || (() => {}),
    },
    {
      id: 'notifications',
      title: 'Notificações',
      description: 'Gerenciar notificações do sistema',
      icon: Bell,
      variant: 'default',
      onClick: onNotifications || (() => {}),
    },
    {
      id: 'export',
      title: 'Exportar Dados',
      description: 'Exportar dados para Excel/CSV',
      icon: Download,
      variant: 'default',
      onClick: onExport || (() => {}),
    },
    {
      id: 'import',
      title: 'Importar Dados',
      description: 'Importar dados de arquivos externos',
      icon: Upload,
      variant: 'default',
      onClick: onImport || (() => {}),
    },
    {
      id: 'settings',
      title: 'Configurações',
      description: 'Configurar preferências do sistema',
      icon: Settings,
      variant: 'default',
      onClick: onSettings || (() => {}),
    },
  ];

  return (
    <QuickActions
      actions={defaultActions}
      title="Ações Rápidas"
      className={className}
      columns={4}
    />
  );
};

export { QuickActions };
