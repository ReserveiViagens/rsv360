import React, { useState, useEffect } from 'react';
import {
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Home,
  Building,
  Users,
  DollarSign,
  ShoppingCart,
  MapPin,
  Camera,
  Video,
  FileText,
  Settings,
  BarChart3,
  Bell,
  Star,
  Gift,
  CreditCard,
  Globe,
  Shield,
  Zap,
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  Flag,
  Layers,
  Database,
  Server,
  Cloud,
  TrendingUp,
  Calendar,
  Mail,
  Phone,
  Search,
  Filter,
  Download,
  Upload,
  Plus,
  Edit,
  Eye,
  Trash2,
  MoreHorizontal,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  User,
  Hotel,
  Plane,
  Car,
  Award,
  Target,
  Monitor,
  Smartphone,
  Tablet
} from 'lucide-react';

// ===================================================================
// COMPONENTE DE MENU LATERAL RESPONSIVO PARA RSV 360
// ===================================================================

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  selectedCategory: string;
  onCategorySelect: (category: string) => void;
  categories: any[];
}

const RSVSidebar: React.FC<SidebarProps> = ({
  isOpen,
  onToggle,
  selectedCategory,
  onCategorySelect,
  categories
}) => {
  const [isMobile, setIsMobile] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  // ===================================================================
  // DETECÇÃO DE DISPOSITIVO MÓVEL
  // ===================================================================

  useEffect(() => {
    const checkDevice = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setShowMobileMenu(false);
      }
    };

    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  // ===================================================================
  // FUNÇÕES DE UTILIDADE
  // ===================================================================

  const handleCategorySelect = (categoryId: string) => {
    onCategorySelect(categoryId);
    if (isMobile) {
      setShowMobileMenu(false);
    }
  };

  const handleToggle = () => {
    onToggle();
    if (isMobile) {
      setShowMobileMenu(!showMobileMenu);
    }
  };

  // ===================================================================
  // RENDERIZAÇÃO DO MENU
  // ===================================================================

  const renderSidebar = () => (
    <div className={`${isOpen ? 'w-80' : 'w-16'} transition-all duration-300 bg-white shadow-lg flex flex-col h-full`}>
      {/* Header do Menu */}
      <div className="flex items-center justify-between p-4 border-b">
        {isOpen && (
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Server className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">RSV 360</h1>
              <p className="text-xs text-gray-500">Ecosystem</p>
            </div>
          </div>
        )}
        <button
          onClick={handleToggle}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors group"
          title={isOpen ? 'Recolher menu' : 'Expandir menu'}
        >
          {isOpen ? (
            <ChevronLeft className="w-5 h-5 text-gray-600 group-hover:text-gray-800" />
          ) : (
            <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-gray-800" />
          )}
        </button>
      </div>

      {/* Indicador de Status do Sistema */}
      {isOpen && (
        <div className="p-4 border-b">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-600">Sistema Online</span>
          </div>
          <div className="text-xs text-gray-500 mt-1">
            32 microsserviços ativos
          </div>
        </div>
      )}

      {/* Navegação por Categorias */}
      <div className="flex-1 overflow-y-auto">
        <nav className="p-4 space-y-2">
          {categories.map((category) => {
            const Icon = category.icon;
            const isSelected = selectedCategory === category.id;
            
            return (
              <button
                key={category.id}
                onClick={() => handleCategorySelect(category.id)}
                className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 ${
                  isSelected
                    ? 'bg-gradient-to-r from-blue-50 to-purple-50 text-blue-600 border border-blue-200 shadow-sm'
                    : 'hover:bg-gray-50 text-gray-700 hover:shadow-sm'
                }`}
                title={!isOpen ? category.name : undefined}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${category.color} shadow-sm`}>
                  <Icon className="w-4 h-4 text-white" />
                </div>
                {isOpen && (
                  <div className="flex-1 text-left">
                    <div className="font-medium">{category.name}</div>
                    <div className="text-xs text-gray-500">
                      {category.services.length} serviços
                    </div>
                  </div>
                )}
                {isSelected && isOpen && (
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer do Menu */}
      {isOpen && (
        <div className="p-4 border-t">
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-6 h-6 bg-gray-100 rounded flex items-center justify-center">
              <Monitor className="w-3 h-3 text-gray-600" />
            </div>
            <span className="text-xs text-gray-500">Dashboard</span>
          </div>
          <div className="text-xs text-gray-400 text-center">
            RSV 360 Ecosystem v1.0
          </div>
        </div>
      )}
    </div>
  );

  // ===================================================================
  // RENDERIZAÇÃO CONDICIONAL
  // ===================================================================

  if (isMobile) {
    return (
      <>
        {/* Botão de Menu Mobile */}
        <button
          onClick={handleToggle}
          className="fixed top-4 left-4 z-50 p-3 bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow md:hidden"
          title="Abrir menu"
        >
          <Menu className="w-6 h-6 text-gray-700" />
        </button>

        {/* Overlay Mobile */}
        {showMobileMenu && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
            onClick={() => setShowMobileMenu(false)}
          />
        )}

        {/* Menu Mobile */}
        <div className={`fixed top-0 left-0 h-full z-50 transform transition-transform duration-300 md:hidden ${
          showMobileMenu ? 'translate-x-0' : '-translate-x-full'
        }`}>
          {renderSidebar()}
        </div>

        {/* Menu Desktop */}
        <div className="hidden md:block">
          {renderSidebar()}
        </div>
      </>
    );
  }

  return renderSidebar();
};

export default RSVSidebar;
