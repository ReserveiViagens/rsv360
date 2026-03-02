import React from 'react';
import ProtectedRoute from '../src/components/ProtectedRoute';
import ModernLayout from '../src/components/layout/ModernLayout';
import { useTheme } from '../src/context/ThemeContext';
import {
  TrendingUp,
  Users,
  Calendar,
  DollarSign,
  MapPin,
  Star,
  Plus,
  BarChart3,
  Activity
} from 'lucide-react';

const ExampleModernLayout: React.FC = () => {
  const { actualTheme } = useTheme();

  const stats = [
    {
      title: 'Total de Reservas',
      value: '1,247',
      change: '+12%',
      changeType: 'positive',
      icon: Calendar,
      color: 'blue'
    },
    {
      title: 'Receita Mensal',
      value: 'R$ 185.000',
      change: '+8%',
      changeType: 'positive',
      icon: DollarSign,
      color: 'green'
    },
    {
      title: 'Clientes Ativos',
      value: '892',
      change: '+5%',
      changeType: 'positive',
      icon: Users,
      color: 'purple'
    },
    {
      title: 'Destino Popular',
      value: 'Caldas Novas',
      change: 'Mais reservado',
      changeType: 'neutral',
      icon: MapPin,
      color: 'yellow'
    }
  ];

  const quickActions = [
    {
      title: 'Nova Reserva',
      description: 'Criar nova reserva',
      icon: Plus,
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    {
      title: 'Analytics',
      description: 'Ver relatórios',
      icon: BarChart3,
      color: 'bg-green-500 hover:bg-green-600'
    },
    {
      title: 'Gestão',
      description: 'Gerenciar reservas',
      icon: Activity,
      color: 'bg-purple-500 hover:bg-purple-600'
    }
  ];

  return (
    <ProtectedRoute>
      <ModernLayout
        title="Exemplo de Layout Moderno"
        subtitle="Demonstração do novo sistema de layout com tema escuro/claro"
        showHeader={true}
        showSidebar={true}
      >
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <div
                key={index}
                className={`${actualTheme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-6 transition-colors duration-300`}
              >
                <div className="flex items-center">
                  <div className={`p-2 bg-${stat.color}-100 rounded-lg`}>
                    <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
                  </div>
                  <div className="ml-4">
                    <p className={`text-sm font-medium transition-colors duration-300 ${actualTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      {stat.title}
                    </p>
                    <p className={`text-2xl font-bold transition-colors duration-300 ${actualTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {stat.value}
                    </p>
                  </div>
                </div>
                <div className={`mt-4 flex items-center text-sm ${
                  stat.changeType === 'positive' ? 'text-green-600' :
                  stat.changeType === 'negative' ? 'text-red-600' :
                  'text-blue-600'
                }`}>
                  <TrendingUp className="w-4 h-4 mr-1" />
                  {stat.change}
                </div>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className={`${actualTheme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow transition-colors duration-300`}>
            <div className={`px-6 py-4 border-b transition-colors duration-300 ${actualTheme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
              <h2 className={`text-lg font-medium transition-colors duration-300 ${actualTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Ações Rápidas
              </h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {quickActions.map((action, index) => (
                  <button
                    key={index}
                    className={`${action.color} text-white p-4 rounded-lg hover:shadow-md transition-all duration-200 flex items-center justify-between`}
                  >
                    <div>
                      <h3 className="font-medium">{action.title}</h3>
                      <p className="text-sm opacity-90 mt-1">{action.description}</p>
                    </div>
                    <action.icon className="w-6 h-6" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Content Example */}
          <div className={`${actualTheme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-6 transition-colors duration-300`}>
            <h3 className={`text-lg font-medium mb-4 transition-colors duration-300 ${actualTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Exemplo de Conteúdo
            </h3>
            <p className={`transition-colors duration-300 ${actualTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
              Este é um exemplo de como usar o novo layout moderno com alternância de tema escuro/claro.
              O layout inclui:
            </p>
            <ul className={`mt-4 space-y-2 transition-colors duration-300 ${actualTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
              <li>• Sidebar moderno com animações suaves</li>
              <li>• Sistema de tema escuro/claro</li>
              <li>• Header responsivo com busca e notificações</li>
              <li>• Breadcrumbs automáticos</li>
              <li>• Transições suaves entre temas</li>
              <li>• Design responsivo para mobile e desktop</li>
            </ul>
          </div>
        </div>
      </ModernLayout>
    </ProtectedRoute>
  );
};

export default ExampleModernLayout;
