import React from 'react';
import { 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  Info, 
  X 
} from 'lucide-react';
import { cn } from '../../utils/cn';

export interface AlertProps {
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  title?: string;
  children: React.ReactNode;
  onClose?: () => void;
  showCloseButton?: boolean;
  className?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}

const Alert: React.FC<AlertProps> = ({
  variant = 'default',
  title,
  children,
  onClose,
  showCloseButton = false,
  className,
  icon,
  action
}) => {
  // Configurações por variante
  const variantConfig = {
    default: {
      container: 'bg-gray-50 border-gray-200 text-gray-800',
      icon: 'text-gray-500',
      title: 'text-gray-900',
      content: 'text-gray-700'
    },
    success: {
      container: 'bg-success-50 border-success-200 text-success-800',
      icon: 'text-success-500',
      title: 'text-success-900',
      content: 'text-success-700'
    },
    warning: {
      container: 'bg-warning-50 border-warning-200 text-warning-800',
      icon: 'text-warning-500',
      title: 'text-warning-900',
      content: 'text-warning-700'
    },
    error: {
      container: 'bg-error-50 border-error-200 text-error-800',
      icon: 'text-error-500',
      title: 'text-error-900',
      content: 'text-error-700'
    },
    info: {
      container: 'bg-info-50 border-info-200 text-info-800',
      icon: 'text-info-500',
      title: 'text-info-900',
      content: 'text-info-700'
    }
  };

  // Ícones padrão por variante
  const defaultIcons = {
    default: <Info className="w-5 h-5" />,
    success: <CheckCircle className="w-5 h-5" />,
    warning: <AlertTriangle className="w-5 h-5" />,
    error: <XCircle className="w-5 h-5" />,
    info: <Info className="w-5 h-5" />
  };

  const config = variantConfig[variant];
  const defaultIcon = defaultIcons[variant];

  return (
    <div
      className={cn(
        'relative p-4 border rounded-lg',
        config.container,
        className
      )}
      role="alert"
    >
      <div className="flex items-start gap-3">
        {/* Ícone */}
        <div className={cn('flex-shrink-0 mt-0.5', config.icon)}>
          {icon || defaultIcon}
        </div>

        {/* Conteúdo */}
        <div className="flex-1 min-w-0">
          {title && (
            <h4 className={cn('text-sm font-medium mb-1', config.title)}>
              {title}
            </h4>
          )}
          <div className={cn('text-sm', config.content)}>
            {children}
          </div>
        </div>

        {/* Ação */}
        {action && (
          <div className="flex-shrink-0">
            {action}
          </div>
        )}

        {/* Botão de fechar */}
        {showCloseButton && onClose && (
          <button
            onClick={onClose}
            className={cn(
              'flex-shrink-0 p-1 rounded-md hover:bg-black/5 transition-colors',
              config.icon
            )}
            aria-label="Fechar alerta"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

export { Alert };
export type { AlertProps };
