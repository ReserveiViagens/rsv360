import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Menu, 
  X, 
  ChevronDown, 
  ChevronRight,
  BarChart3,
  Calendar,
  Users,
  CreditCard,
  Megaphone,
  Settings,
  FileText,
  Plus,
  UserPlus
} from 'lucide-react';
import { Button, Input } from '../ui';
import { ROUTES, RouteUtils, ExtendedRouteConfig } from './RouteConfig';
import { Permission } from './NavigationGuard';

export interface NavigationMenuProps {
  userPermissions?: Permission[];
  isAuthenticated?: boolean;
  userRole?: string;
  currentPath?: string;
  onNavigate?: (path: string) => void;
  className?: string;
  showSearch?: boolean;
  showCategories?: boolean;
  collapsed?: boolean;
  onToggleCollapsed?: () => void;
}

const NavigationMenu: React.FC<NavigationMenuProps> = ({
  userPermissions = [],
  isAuthenticated = false,
  userRole = 'guest',
  currentPath = '/',
  onNavigate,
  className,
  showSearch = true,
  showCategories = true,
  collapsed = false,
  onToggleCollapsed
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Filtrar rotas baseado nas permissões do usuário
  const filteredRoutes = useMemo(() => {
    return ROUTES.filter(route => {
      // Se não requer autenticação, mostrar
      if (!route.requiresAuth) return true;
      
      // Se requer autenticação mas usuário não está logado, não mostrar
      if (route.requiresAuth && !isAuthenticated) return false;
      
      // Se tem permissões específicas, verificar
      if (route.permissions && route.permissions.length > 0) {
        return RouteUtils.hasPermission(route, userPermissions);
      }
      
      return true;
    });
  }, [userPermissions, isAuthenticated]);

  // Agrupar rotas por categoria
  const routesByCategory = useMemo(() => {
    const categories: Record<string, ExtendedRouteConfig[]> = {};
    
    filteredRoutes.forEach(route => {
      const category = route.metadata.category || 'other';
      if (!categories[category]) {
        categories[category] = [];
      }
      categories[category].push(route);
    });
    
    return categories;
  }, [filteredRoutes]);

  // Filtrar rotas baseado na busca
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return filteredRoutes;
    
    const query = searchQuery.toLowerCase();
    return filteredRoutes.filter(route => 
      route.metadata.title.toLowerCase().includes(query) ||
      route.metadata.description?.toLowerCase().includes(query) ||
      route.metadata.tags?.some(tag => tag.toLowerCase().includes(query))
    );
  }, [filteredRoutes, searchQuery]);

  // Obter ícone para uma rota
  const getRouteIcon = (iconName?: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      BarChart3: <BarChart3 className="w-4 h-4" />,
      Calendar: <Calendar className="w-4 h-4" />,
      Users: <Users className="w-4 h-4" />,
      CreditCard: <CreditCard className="w-4 h-4" />,
      Megaphone: <Megaphone className="w-4 h-4" />,
      Settings: <Settings className="w-4 h-4" />,
      FileText: <FileText className="w-4 h-4" />,
      Plus: <Plus className="w-4 h-4" />,
      UserPlus: <UserPlus className="w-4 h-4" />
    };
    
    return iconMap[iconName || ''] || <FileText className="w-4 h-4" />;
  };

  // Toggle categoria expandida
  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  // Navegar para rota
  const handleNavigate = (path: string) => {
    if (onNavigate) {
      onNavigate(path);
    } else {
      window.location.href = path;
    }
    
    // Fechar menu mobile se necessário
    setIsMobileMenuOpen(false);
  };

  // Renderizar item de menu
  const renderMenuItem = (route: ExtendedRouteConfig, level: number = 0) => {
    const isActive = currentPath === route.path;
    const hasChildren = route.children && route.children.length > 0;
    const isExpanded = expandedCategories.includes(route.metadata.category || '');
    
    return (
      <div key={route.path} className={`${level > 0 ? 'ml-4' : ''}`}>
        <button
          onClick={() => {
            if (hasChildren) {
              toggleCategory(route.metadata.category || '');
            } else {
              handleNavigate(route.path);
            }
          }}
          className={`
            w-full flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium transition-colors
            ${isActive 
              ? 'bg-primary-100 text-primary-700 border border-primary-200' 
              : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
            }
            ${level > 0 ? 'text-sm' : 'text-base'}
          `}
        >
          <div className="flex items-center space-x-3">
            <span className="flex-shrink-0 text-gray-500">
              {getRouteIcon(route.metadata.icon)}
            </span>
            <span className="truncate">{route.metadata.title}</span>
          </div>
          
          {hasChildren && (
            <span className="flex-shrink-0 text-gray-400">
              {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </span>
          )}
        </button>
        
        {/* Subitens */}
        {hasChildren && isExpanded && (
          <div className="mt-1 space-y-1">
            {route.children?.map(child => renderMenuItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  // Renderizar menu por categorias
  const renderMenuByCategories = () => (
    <div className="space-y-4">
      {Object.entries(routesByCategory).map(([category, routes]) => {
        const isExpanded = expandedCategories.includes(category);
        const categoryRoutes = routes.sort((a, b) => (a.metadata.order || 0) - (b.metadata.order || 0));
        
        return (
          <div key={category} className="space-y-2">
            <button
              onClick={() => toggleCategory(category)}
              className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
            >
              <span className="capitalize">{category}</span>
              <span className="flex-shrink-0 text-gray-400">
                {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </span>
            </button>
            
            {isExpanded && (
              <div className="space-y-1">
                {categoryRoutes.map(route => renderMenuItem(route))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );

  // Renderizar menu simples (sem categorias)
  const renderSimpleMenu = () => (
    <div className="space-y-1">
      {searchResults.map(route => renderMenuItem(route))}
    </div>
  );

  return (
    <div className={`bg-white border-r border-gray-200 ${collapsed ? 'w-16' : 'w-64'} transition-all duration-300 ${className || ''}`}>
      {/* Header do menu */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          {!collapsed && (
            <h2 className="text-lg font-semibold text-gray-900">Navegação</h2>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleCollapsed}
            className="p-1"
            aria-label={collapsed ? 'Expandir menu' : 'Recolher menu'}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </Button>
          
          {/* Botão mobile */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-1"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </Button>
        </div>
        
        {/* Barra de busca */}
        {showSearch && !collapsed && (
          <div className="mt-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Buscar..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                aria-label="Buscar no menu"
              />
            </div>
          </div>
        )}
      </div>

      {/* Conteúdo do menu */}
      <div className="flex-1 overflow-y-auto p-4">
        {showCategories ? renderMenuByCategories() : renderSimpleMenu()}
        
        {searchResults.length === 0 && searchQuery && (
          <div className="text-center py-8 text-gray-500">
            <p>Nenhum resultado encontrado para "{searchQuery}"</p>
          </div>
        )}
      </div>

      {/* Menu mobile overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setIsMobileMenuOpen(false)} />
          <div className="fixed left-0 top-0 h-full w-64 bg-white shadow-lg">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Menu</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div className="p-4">
              {showCategories ? renderMenuByCategories() : renderSimpleMenu()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export { NavigationMenu };
export type { NavigationMenuProps };
