import React from 'react';
import { ChevronRight, Home, MapPin } from 'lucide-react';
import { cn } from '../../utils/cn';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ReactNode;
  isActive?: boolean;
}

export interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  separator?: React.ReactNode;
  className?: string;
  showHome?: boolean;
  maxItems?: number;
  onNavigate?: (href: string) => void;
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({
  items,
  separator = <ChevronRight className="w-4 h-4 text-gray-400" />,
  className,
  showHome = true,
  maxItems = 5,
  onNavigate
}) => {
  // Adicionar home se solicitado
  const allItems = showHome 
    ? [{ label: 'Início', href: '/', icon: <Home className="w-4 h-4" /> }, ...items]
    : items;

  // Limitar número de itens se necessário
  const displayItems = allItems.length > maxItems 
    ? [...allItems.slice(0, 1), { label: '...', href: undefined }, ...allItems.slice(-maxItems + 2)]
    : allItems;

  const handleClick = (href: string | undefined, e: React.MouseEvent) => {
    if (!href) return;
    
    e.preventDefault();
    
    if (onNavigate) {
      onNavigate(href);
    } else {
      // Navegação padrão
      window.location.href = href;
    }
  };

  return (
    <nav 
      className={cn(
        'flex items-center space-x-2 text-sm',
        className
      )}
      aria-label="Breadcrumb"
    >
      {displayItems.map((item, index) => (
        <React.Fragment key={index}>
          {/* Item do breadcrumb */}
          <div className="flex items-center">
            {item.href ? (
              <button
                onClick={(e) => handleClick(item.href, e)}
                className={cn(
                  'flex items-center space-x-1 px-2 py-1 rounded-md transition-colors',
                  'hover:bg-gray-100 hover:text-gray-900',
                  'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
                  item.isActive 
                    ? 'text-primary-600 font-medium bg-primary-50' 
                    : 'text-gray-600'
                )}
                aria-current={item.isActive ? 'page' : undefined}
              >
                {item.icon && (
                  <span className="flex-shrink-0">{item.icon}</span>
                )}
                <span className="truncate max-w-[120px] sm:max-w-[200px]">
                  {item.label}
                </span>
              </button>
            ) : (
              <span 
                className={cn(
                  'flex items-center space-x-1 px-2 py-1',
                  item.label === '...' 
                    ? 'text-gray-400' 
                    : 'text-gray-500 font-medium'
                )}
              >
                {item.icon && (
                  <span className="flex-shrink-0">{item.icon}</span>
                )}
                <span className="truncate max-w-[120px] sm:max-w-[200px]">
                  {item.label}
                </span>
              </span>
            )}
          </div>

          {/* Separador (não mostrar no último item) */}
          {index < displayItems.length - 1 && (
            <span className="flex-shrink-0 text-gray-400">
              {separator}
            </span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

export { Breadcrumbs };
export type { BreadcrumbsProps, BreadcrumbItem };
