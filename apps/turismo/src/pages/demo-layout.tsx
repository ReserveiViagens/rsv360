import React from 'react';
import { Layout } from '../components/layout';
import { Card, Button, Badge, Progress, Alert } from '../components/ui';
import { useTheme } from '../hooks/useTheme';
import { 
  Home, 
  Users, 
  Calendar, 
  MapPin, 
  CreditCard, 
  Target, 
  FileText, 
  Bell, 
  ShieldCheck, 
  BookOpen, 
  Cloud, 
  Smartphone, 
  Settings,
  Plus,
  TrendingUp,
  DollarSign,
  UserPlus,
  Plane,
  CheckCircle,
  AlertTriangle,
  Info,
  Zap,
  Star,
  Heart,
  Award
} from 'lucide-react';

export default function DemoLayout() {
  const { theme, colorScheme, colors } = useTheme();

  const stats = [
    {
      title: 'Total de Reservas',
      value: '1,234',
      change: '+12%',
      changeType: 'positive',
      icon: Calendar,
      color: 'blue'
    },
    {
      title: 'Receita Mensal',
      value: 'R$ 45,678',
      change: '+8%',
      changeType: 'positive',
      icon: DollarSign,
      color: 'green'
    },
    {
      title: 'Clientes Ativos',
      value: '567',
      change: '+5%',
      changeType: 'positive',
      icon: Users,
      color: 'purple'
    },
    {
      title: 'Viagens em Andamento',
      value: '89',
      change: '-2%',
      changeType: 'negative',
      icon: Plane,
      color: 'orange'
    }
  ];

  const recentActivities = [
    {
      id: 1,
      type: 'reservation',
      title: 'Nova reserva confirmada',
      description: 'João Silva reservou pacote para Caldas Novas',
      time: '2 min atrás',
      status: 'success',
      icon: CheckCircle
    },
    {
      id: 2,
      type: 'payment',
      title: 'Pagamento recebido',
      description: 'R$ 1,500 recebido de Maria Santos',
      time: '15 min atrás',
      status: 'success',
      icon: CheckCircle
    },
    {
      id: 3,
      type: 'customer',
      title: 'Novo cliente cadastrado',
      description: 'Pedro Oliveira foi adicionado ao sistema',
      time: '1 hora atrás',
      status: 'info',
      icon: Info
    },
    {
      id: 4,
      type: 'travel',
      title: 'Viagem iniciada',
      description: 'Grupo de 15 pessoas partiu para Caldas Novas',
      time: '2 horas atrás',
      status: 'success',
      icon: CheckCircle
    },
    {
      id: 5,
      type: 'warning',
      title: 'Pagamento pendente',
      description: '3 reservas aguardando confirmação',
      time: '3 horas atrás',
      status: 'warning',
      icon: AlertTriangle
    }
  ];

  const quickActions = [
    {
      title: 'Nova Reserva',
      description: 'Criar nova reserva de viagem',
      icon: Plus,
      color: 'blue',
      href: '/travel'
    },
    {
      title: 'Adicionar Cliente',
      description: 'Cadastrar novo cliente',
      icon: UserPlus,
      color: 'green',
      href: '/customers'
    },
    {
      title: 'Relatório Mensal',
      description: 'Gerar relatório de vendas',
      icon: TrendingUp,
      color: 'purple',
      href: '/reports'
    },
    {
      title: 'Configurações',
      description: 'Ajustar configurações do sistema',
      icon: Settings,
      color: 'gray',
      href: '/settings'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'info':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'info':
        return <Info className="h-4 w-4 text-blue-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              🚀 Dashboard Reservei Viagens
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Sistema completo de gestão de viagens e reservas
            </p>
            <div className="flex items-center space-x-4 mt-3">
              <Badge variant="default" className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300">
                Tema: {theme}
              </Badge>
              <Badge variant="default" className="bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300">
                Cores: {colorScheme}
              </Badge>
            </div>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            Nova Reserva
          </Button>
        </div>

        {/* Alerts Demo */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Alert variant="success" title="Sistema Online">
            Todas as funcionalidades estão operacionais
          </Alert>
          <Alert variant="info" title="Nova Funcionalidade">
            Layout responsivo com temas personalizados disponível
          </Alert>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <Card key={index} className="p-6 hover:shadow-lg transition-shadow duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stat.value}
                  </p>
                </div>
                <div className={`p-3 rounded-full bg-${stat.color}-100 dark:bg-${stat.color}-900/20`}>
                  <stat.icon className={`h-6 w-6 text-${stat.color}-600 dark:text-${stat.color}-400`} />
                </div>
              </div>
              <div className="mt-4 flex items-center">
                <Badge 
                  variant={stat.changeType === 'positive' ? 'default' : 'destructive'}
                  className="text-xs"
                >
                  {stat.change}
                </Badge>
                <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                  vs mês anterior
                </span>
              </div>
            </Card>
          ))}
        </div>

        {/* Progress Demo */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Progresso do Sistema
          </h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600 dark:text-gray-400">Implementação de Funcionalidades</span>
                <span className="text-gray-900 dark:text-white font-medium">85%</span>
              </div>
              <Progress value={85} variant="success" animated />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600 dark:text-gray-400">Testes de Qualidade</span>
                <span className="text-gray-900 dark:text-white font-medium">72%</span>
              </div>
              <Progress value={72} variant="info" animated />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600 dark:text-gray-400">Documentação</span>
                <span className="text-gray-900 dark:text-white font-medium">60%</span>
              </div>
              <Progress value={60} variant="warning" animated />
            </div>
          </div>
        </Card>

        {/* Quick Actions */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Ações Rápidas
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <Button
                key={index}
                variant="outline"
                className="h-auto p-4 flex-col items-start space-y-2 hover:bg-gray-50 dark:hover:bg-gray-800 hover:scale-105 transition-all duration-200"
              >
                <div className={`p-2 rounded-lg bg-${action.color}-100 dark:bg-${action.color}-900/20`}>
                  <action.icon className={`h-5 w-5 text-${action.color}-600 dark:text-${action.color}-400`} />
                </div>
                <div className="text-left">
                  <p className="font-medium text-gray-900 dark:text-white">
                    {action.title}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {action.description}
                  </p>
                </div>
              </Button>
            ))}
          </div>
        </Card>

        {/* Recent Activities */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Atividades Recentes
          </h2>
          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200"
              >
                {getStatusIcon(activity.status)}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {activity.title}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {activity.description}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    {activity.time}
                  </p>
                </div>
                <Badge className={getStatusColor(activity.status)}>
                  {activity.status}
                </Badge>
              </div>
            ))}
          </div>
        </Card>

        {/* System Status */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Status do Sistema
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3 p-3 rounded-lg bg-green-50 dark:bg-green-900/20">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-green-800 dark:text-green-300">
                Sistema Online
              </span>
            </div>
            <div className="flex items-center space-x-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20">
              <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-blue-800 dark:text-blue-300">
                Banco de Dados OK
              </span>
            </div>
            <div className="flex items-center space-x-3 p-3 rounded-lg bg-green-50 dark:bg-green-900/20">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-green-800 dark:text-green-300">
                API Funcionando
              </span>
            </div>
          </div>
        </Card>

        {/* Features Demo */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            🎨 Funcionalidades Implementadas
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: Zap, title: 'Layout Responsivo', description: 'Adapta-se a qualquer dispositivo' },
              { icon: Palette, title: 'Temas Personalizados', description: '4 esquemas de cores disponíveis' },
              { icon: Star, title: 'Animações Fluidas', description: 'Transições suaves e elegantes' },
              { icon: Heart, title: 'Persistência de Estado', description: 'Lembra suas preferências' },
              { icon: Award, title: 'Acessibilidade', description: 'Totalmente acessível' },
              { icon: ShieldCheck, title: 'Segurança', description: 'Autenticação robusta' }
            ].map((feature, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/20">
                  <feature.icon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {feature.title}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </Layout>
  );
}
