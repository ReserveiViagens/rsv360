import React, { useState } from 'react';
import { Smartphone, Touch, Wifi, Bell, Settings, ArrowLeft, ArrowRight, ArrowUp, ArrowDown, ZoomIn, ZoomOut, Clock, Database } from 'lucide-react';
import { MobileLayout } from '../components/mobile/MobileLayout';
import { TouchInteractions } from '../components/mobile/TouchInteractions';
import { OfflineSupport } from '../components/mobile/OfflineSupport';
import { PushNotifications } from '../components/mobile/PushNotifications';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/Tabs';
import { useUIStore } from '../stores/useUIStore';

const MobilePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [touchEvents, setTouchEvents] = useState<string[]>([]);
  const { showNotification } = useUIStore();

  const handleTouchEvent = (event: string) => {
    setTouchEvents(prev => [event, ...prev.slice(0, 9)]);
  };

  const handleSwipeLeft = () => handleTouchEvent('Swipe para Esquerda');
  const handleSwipeRight = () => handleTouchEvent('Swipe para Direita');
  const handleSwipeUp = () => handleTouchEvent('Swipe para Cima');
  const handleSwipeDown = () => handleTouchEvent('Swipe para Baixo');
  const handlePinchIn = () => handleTouchEvent('Pinch In (Zoom Out)');
  const handlePinchOut = () => handleTouchEvent('Pinch Out (Zoom In)');
  const handleLongPress = () => handleTouchEvent('Long Press');
  const handleDoubleTap = () => handleTouchEvent('Double Tap');

  const clearTouchEvents = () => setTouchEvents([]);

  return (
    <MobileLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Mobile App</h1>
            <p className="text-gray-600">Sistema otimizado para dispositivos móveis</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="success" className="flex items-center gap-1">
              <Smartphone className="w-4 h-4" />
              Mobile Ready
            </Badge>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Touch Events</p>
                <p className="text-2xl font-bold text-gray-900">{touchEvents.length}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Touch className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Status Offline</p>
                <p className="text-2xl font-bold text-gray-900">Ativo</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <Wifi className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Notificações</p>
                <p className="text-2xl font-bold text-gray-900">Configurado</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <Bell className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Cache</p>
                <p className="text-2xl font-bold text-gray-900">24h</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-full">
                <Database className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 h-14">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <Smartphone className="w-4 h-4" />
                Visão Geral
              </TabsTrigger>
              <TabsTrigger value="touch" className="flex items-center gap-2">
                <Touch className="w-4 h-4" />
                Touch & Gestos
              </TabsTrigger>
              <TabsTrigger value="offline" className="flex items-center gap-2">
                <Wifi className="w-4 h-4" />
                Modo Offline
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex items-center gap-2">
                <Bell className="w-4 h-4" />
                Push Notifications
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="p-6">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Funcionalidades Mobile</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Touch className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">Touch Interactions</h4>
                          <p className="text-sm text-gray-600">Gestos e interações touch avançadas</p>
                        </div>
                      </div>
                    </Card>

                    <Card className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <Wifi className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">Offline Support</h4>
                          <p className="text-sm text-gray-600">Funcionalidade offline com cache</p>
                        </div>
                      </div>
                    </Card>

                    <Card className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-100 rounded-lg">
                          <Bell className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">Push Notifications</h4>
                          <p className="text-sm text-gray-600">Notificações push nativas</p>
                        </div>
                      </div>
                    </Card>

                    <Card className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-orange-100 rounded-lg">
                          <Settings className="w-5 h-5 text-orange-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">Responsive Layout</h4>
                          <p className="text-sm text-gray-600">Layout otimizado para mobile</p>
                        </div>
                      </div>
                    </Card>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Instruções de Uso</h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm text-gray-700">
                    <p>• <strong>Touch & Gestos:</strong> Teste os diferentes gestos touch disponíveis</p>
                    <p>• <strong>Modo Offline:</strong> Simule perda de conexão para testar funcionalidade offline</p>
                    <p>• <strong>Push Notifications:</strong> Configure notificações push para seu dispositivo</p>
                    <p>• <strong>Responsive:</strong> Redimensione a janela para ver a adaptação mobile</p>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="touch" className="p-6">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Teste de Gestos Touch</h3>
                  <p className="text-gray-600 mb-4">Use os gestos abaixo para testar as interações touch:</p>
                  
                  <TouchInteractions
                    onSwipeLeft={handleSwipeLeft}
                    onSwipeRight={handleSwipeRight}
                    onSwipeUp={handleSwipeUp}
                    onSwipeDown={handleSwipeDown}
                    onPinchIn={handlePinchIn}
                    onPinchOut={handlePinchOut}
                    onLongPress={handleLongPress}
                    onDoubleTap={handleDoubleTap}
                  >
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <Card className="p-6 text-center hover:bg-gray-50 transition-colors cursor-pointer">
                        <ArrowLeft className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                        <p className="text-sm font-medium">Swipe Esquerda</p>
                      </Card>
                      
                      <Card className="p-6 text-center hover:bg-gray-50 transition-colors cursor-pointer">
                        <ArrowRight className="w-8 h-8 text-green-600 mx-auto mb-2" />
                        <p className="text-sm font-medium">Swipe Direita</p>
                      </Card>
                      
                      <Card className="p-6 text-center hover:bg-gray-50 transition-colors cursor-pointer">
                        <ArrowUp className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                        <p className="text-sm font-medium">Swipe Cima</p>
                      </Card>
                      
                      <Card className="p-6 text-center hover:bg-gray-50 transition-colors cursor-pointer">
                        <ArrowDown className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                        <p className="text-sm font-medium">Swipe Baixo</p>
                      </Card>
                      
                      <Card className="p-6 text-center hover:bg-gray-50 transition-colors cursor-pointer">
                        <ZoomIn className="w-8 h-8 text-red-600 mx-auto mb-2" />
                        <p className="text-sm font-medium">Pinch In</p>
                      </Card>
                      
                      <Card className="p-6 text-center hover:bg-gray-50 transition-colors cursor-pointer">
                        <ZoomOut className="w-8 h-8 text-indigo-600 mx-auto mb-2" />
                        <p className="text-sm font-medium">Pinch Out</p>
                      </Card>
                      
                      <Card className="p-6 text-center hover:bg-gray-50 transition-colors cursor-pointer">
                        <Clock className="w-8 h-8 text-pink-600 mx-auto mb-2" />
                        <p className="text-sm font-medium">Long Press</p>
                      </Card>
                      
                      <Card className="p-6 text-center hover:bg-gray-50 transition-colors cursor-pointer">
                        <Touch className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                        <p className="text-sm font-medium">Double Tap</p>
                      </Card>
                    </div>
                  </TouchInteractions>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-semibold text-gray-900">Eventos Touch Detectados</h4>
                    <Button onClick={clearTouchEvents} variant="outline" size="sm">
                      Limpar
                    </Button>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4 min-h-[200px]">
                    {touchEvents.length === 0 ? (
                      <div className="text-center text-gray-500 py-8">
                        <Touch className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                        <p>Nenhum evento touch detectado ainda</p>
                        <p className="text-sm">Use os gestos acima para testar</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {touchEvents.map((event, index) => (
                          <div key={index} className="flex items-center gap-2 p-2 bg-white rounded border">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <span className="text-sm text-gray-700">{event}</span>
                            <span className="text-xs text-gray-500 ml-auto">
                              {new Date().toLocaleTimeString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="offline" className="p-6">
              <OfflineSupport enableOfflineMode={true}>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Funcionalidade Offline</h3>
                    <p className="text-gray-600 mb-4">
                      O sistema suporta funcionalidade offline com cache de dados e sincronização automática.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="p-6">
                      <h4 className="font-medium text-gray-900 mb-4">Como Funciona</h4>
                      <div className="space-y-3 text-sm text-gray-600">
                        <div className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                          <p>Dados são armazenados em cache local</p>
                        </div>
                        <div className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                          <p>Ações offline são salvas para sincronização</p>
                        </div>
                        <div className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                          <p>Sincronização automática quando online</p>
                        </div>
                        <div className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                          <p>Cache expira automaticamente</p>
                        </div>
                      </div>
                    </Card>

                    <Card className="p-6">
                      <h4 className="font-medium text-gray-900 mb-4">Teste Offline</h4>
                      <div className="space-y-3">
                        <Button 
                          onClick={() => showNotification('Simulando modo offline...', 'info')}
                          className="w-full"
                        >
                          Simular Perda de Conexão
                        </Button>
                        <Button 
                          onClick={() => showNotification('Simulando restauração de conexão...', 'info')}
                          variant="outline"
                          className="w-full"
                        >
                          Simular Restauração de Conexão
                        </Button>
                      </div>
                    </Card>
                  </div>
                </div>
              </OfflineSupport>
            </TabsContent>

            <TabsContent value="notifications" className="p-6">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Notificações Push</h3>
                  <p className="text-gray-600 mb-4">
                    Configure notificações push para receber atualizações em tempo real no seu dispositivo móvel.
                  </p>
                </div>

                <PushNotifications enableNotifications={true} />

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-2">Informações Importantes</h4>
                  <div className="text-sm text-blue-800 space-y-1">
                    <p>• As notificações push requerem HTTPS para funcionar</p>
                    <p>• Funciona melhor em dispositivos móveis</p>
                    <p>• Você pode personalizar as configurações</p>
                    <p>• Suporte a múltiplos tipos de notificação</p>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </MobileLayout>
  );
};

export { MobilePage };
