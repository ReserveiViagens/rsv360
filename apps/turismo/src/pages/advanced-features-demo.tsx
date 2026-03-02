import React, { useState } from 'react';
import { Layout } from '../components/layout';
import { Card, Button, Badge, Alert } from '../components/ui';
import { usePWA } from '../hooks/usePWA';
import { 
  Keyboard, 
  Download, 
  Smartphone, 
  Wifi, 
  WifiOff, 
  Bell, 
  Share2, 
  RefreshCw,
  CheckCircle,
  Info,
  Zap,
  Shield,
  Eye,
  MousePointer,
  Command
} from 'lucide-react';

export default function AdvancedFeaturesDemo() {
  const { 
    isInstallable, 
    isInstalled, 
    isOnline, 
    updateAvailable, 
    installApp, 
    updateApp,
    shareContent,
    requestNotificationPermission,
    showNotification
  } = usePWA();

  const [notificationPermission, setNotificationPermission] = useState<string>('default');

  const handleInstall = async () => {
    const success = await installApp();
    if (success) {
      alert('App instalado com sucesso!');
    }
  };

  const handleShare = async () => {
    const success = await shareContent({
      title: 'Reservei Viagens',
      text: 'Sistema completo de gestão de viagens',
      url: window.location.origin
    });
    
    if (!success) {
      // Fallback para copiar URL
      navigator.clipboard.writeText(window.location.origin);
      alert('URL copiada para a área de transferência!');
    }
  };

  const handleRequestNotification = async () => {
    const granted = await requestNotificationPermission();
    setNotificationPermission(granted ? 'granted' : 'denied');
    
    if (granted) {
      showNotification('Notificações ativadas!', {
        body: 'Você receberá notificações importantes do sistema.'
      });
    }
  };

  const keyboardShortcuts = [
    { keys: ['Ctrl', 'H'], description: 'Ir para Home' },
    { keys: ['Ctrl', 'D'], description: 'Ir para Dashboard' },
    { keys: ['Ctrl', 'T'], description: 'Ir para Viagens' },
    { keys: ['Ctrl', 'C'], description: 'Ir para Clientes' },
    { keys: ['Ctrl', 'P'], description: 'Ir para Pagamentos' },
    { keys: ['Ctrl', 'M'], description: 'Ir para Marketing' },
    { keys: ['Ctrl', 'R'], description: 'Ir para Relatórios' },
    { keys: ['Ctrl', 'S'], description: 'Ir para Configurações' },
    { keys: ['Ctrl', 'B'], description: 'Alternar Sidebar' },
    { keys: ['Ctrl', 'K'], description: 'Buscar' },
    { keys: ['/'], description: 'Focar na Busca' },
    { keys: ['Alt', 'T'], description: 'Alternar Tema' },
    { keys: ['Alt', '1'], description: 'Tema Azul' },
    { keys: ['Alt', '2'], description: 'Tema Verde' },
    { keys: ['Alt', '3'], description: 'Tema Roxo' },
    { keys: ['Alt', '4'], description: 'Tema Laranja' },
    { keys: ['Ctrl', 'N'], description: 'Nova Reserva' },
    { keys: ['?'], description: 'Mostrar Ajuda' },
    { keys: ['Esc'], description: 'Fechar Modal' }
  ];

  const pwaFeatures = [
    {
      icon: Download,
      title: 'Instalação PWA',
      description: 'Instale o app no seu dispositivo',
      status: isInstallable ? 'available' : isInstalled ? 'installed' : 'unavailable',
      action: isInstallable ? handleInstall : null
    },
    {
      icon: Wifi,
      title: 'Funcionamento Offline',
      description: 'Acesse dados salvos sem internet',
      status: 'available',
      action: null
    },
    {
      icon: Bell,
      title: 'Notificações Push',
      description: 'Receba notificações importantes',
      status: notificationPermission === 'granted' ? 'enabled' : 'available',
      action: notificationPermission !== 'granted' ? handleRequestNotification : null
    },
    {
      icon: Share2,
      title: 'Compartilhamento Nativo',
      description: 'Compartilhe facilmente',
      status: 'available',
      action: handleShare
    },
    {
      icon: RefreshCw,
      title: 'Atualizações Automáticas',
      description: 'Sempre a versão mais recente',
      status: updateAvailable ? 'available' : 'enabled',
      action: updateAvailable ? updateApp : null
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
      case 'enabled':
      case 'installed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'unavailable':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'available':
        return 'Disponível';
      case 'enabled':
        return 'Ativado';
      case 'installed':
        return 'Instalado';
      case 'unavailable':
        return 'Indisponível';
      default:
        return 'Desconhecido';
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              🚀 Funcionalidades Avançadas
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Recursos modernos para uma experiência premium
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Badge className={isOnline ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'}>
              {isOnline ? (
                <>
                  <Wifi className="h-3 w-3 mr-1" />
                  Online
                </>
              ) : (
                <>
                  <WifiOff className="h-3 w-3 mr-1" />
                  Offline
                </>
              )}
            </Badge>
            {isInstalled && (
              <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300">
                <Smartphone className="h-3 w-3 mr-1" />
                PWA Instalado
              </Badge>
            )}
          </div>
        </div>

        {/* Status Alerts */}
        {updateAvailable && (
          <Alert variant="info" title="Atualização Disponível">
            Uma nova versão do sistema está disponível. Clique em "Atualizar" para obter as últimas funcionalidades.
          </Alert>
        )}

        {!isOnline && (
          <Alert variant="warning" title="Modo Offline">
            Você está offline. Algumas funcionalidades podem estar limitadas, mas dados salvos localmente estão disponíveis.
          </Alert>
        )}

        {/* PWA Features */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <Smartphone className="h-5 w-5 mr-2 text-blue-600" />
            Funcionalidades PWA
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pwaFeatures.map((feature, index) => (
              <div
                key={index}
                className="flex items-start space-x-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
              >
                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/20">
                  <feature.icon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-medium text-gray-900 dark:text-white">
                      {feature.title}
                    </p>
                    <Badge className={getStatusColor(feature.status)}>
                      {getStatusText(feature.status)}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                    {feature.description}
                  </p>
                  {feature.action && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={feature.action}
                      className="text-xs"
                    >
                      {feature.status === 'available' ? 'Ativar' : 'Executar'}
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Keyboard Shortcuts */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <Keyboard className="h-5 w-5 mr-2 text-green-600" />
            Atalhos de Teclado
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {keyboardShortcuts.map((shortcut, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
              >
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {shortcut.description}
                </span>
                <div className="flex items-center space-x-1">
                  {shortcut.keys.map((key, keyIndex) => (
                    <React.Fragment key={keyIndex}>
                      <kbd className="px-2 py-1 text-xs font-mono bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-gray-700 dark:text-gray-300">
                        {key}
                      </kbd>
                      {keyIndex < shortcut.keys.length - 1 && (
                        <span className="text-gray-400 text-xs">+</span>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Accessibility Features */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <Eye className="h-5 w-5 mr-2 text-purple-600" />
            Recursos de Acessibilidade
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                icon: Keyboard,
                title: 'Navegação por Teclado',
                description: 'Navegue completamente usando apenas o teclado',
                status: 'enabled'
              },
              {
                icon: MousePointer,
                title: 'Focus Management',
                description: 'Indicadores visuais claros para elementos focados',
                status: 'enabled'
              },
              {
                icon: Shield,
                title: 'ARIA Labels',
                description: 'Rótulos descritivos para leitores de tela',
                status: 'enabled'
              },
              {
                icon: Zap,
                title: 'Alto Contraste',
                description: 'Suporte a temas de alto contraste',
                status: 'enabled'
              }
            ].map((feature, index) => (
              <div
                key={index}
                className="flex items-start space-x-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
              >
                <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/20">
                  <feature.icon className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-medium text-gray-900 dark:text-white">
                      {feature.title}
                    </p>
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">
                      Ativado
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Performance Metrics */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <Zap className="h-5 w-5 mr-2 text-orange-600" />
            Métricas de Performance
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { label: 'First Contentful Paint', value: '< 1.5s', status: 'good' },
              { label: 'Largest Contentful Paint', value: '< 2.5s', status: 'good' },
              { label: 'Cumulative Layout Shift', value: '< 0.1', status: 'good' },
              { label: 'Time to Interactive', value: '< 3s', status: 'good' }
            ].map((metric, index) => (
              <div
                key={index}
                className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
              >
                <div className="flex items-center justify-center mb-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {metric.value}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {metric.label}
                </p>
              </div>
            ))}
          </div>
        </Card>

        {/* Usage Tips */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <Info className="h-5 w-5 mr-2 text-blue-600" />
            Dicas de Uso
          </h2>
          <div className="space-y-3">
            {[
              'Pressione "?" para ver todos os atalhos de teclado disponíveis',
              'Use Ctrl+K para buscar rapidamente em qualquer página',
              'Instale o PWA para acesso offline e notificações',
              'Use Alt+1/2/3/4 para alternar rapidamente entre temas de cores',
              'Pressione Esc para fechar modais e dropdowns',
              'Use Tab para navegar entre elementos interativos'
            ].map((tip, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {tip}
                </p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </Layout>
  );
}
