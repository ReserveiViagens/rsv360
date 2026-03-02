import React, { useState, useEffect } from 'react';
import { Bell, BellOff, Settings, Plus, Edit, Trash2, Eye, Send, Users, Clock, CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Modal } from '../ui/Modal';
import { Badge } from '../ui/Badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/Tabs';
import { useUIStore } from '../../stores/useUIStore';

interface PushNotification {
  id: string;
  title: string;
  message: string;
  icon?: string;
  image?: string;
  actionUrl?: string;
  category: 'marketing' | 'transactional' | 'reminder' | 'alert';
  targetAudience: 'all' | 'specific' | 'segmented';
  scheduledAt?: Date;
  sentAt?: Date;
  status: 'draft' | 'scheduled' | 'sent' | 'failed';
  recipients: number;
  opened: number;
  clicked: number;
}

interface NotificationTemplate {
  id: string;
  name: string;
  title: string;
  message: string;
  icon?: string;
  category: string;
  isDefault: boolean;
}

interface PushNotificationSystemProps {
  onNotificationSent?: (notification: PushNotification) => void;
  onTemplateCreated?: (template: NotificationTemplate) => void;
}

const PushNotificationSystem: React.FC<PushNotificationSystemProps> = ({
  onNotificationSent,
  onTemplateCreated
}) => {
  const [notifications, setNotifications] = useState<PushNotification[]>([]);
  const [templates, setTemplates] = useState<NotificationTemplate[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<PushNotification | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<NotificationTemplate | null>(null);
  const [activeTab, setActiveTab] = useState('compose');
  const { showNotification } = useUIStore();

  // Mock data
  useEffect(() => {
    const mockNotifications: PushNotification[] = [
      {
        id: '1',
        title: 'Promoção Especial',
        message: 'Desconto de 20% em todas as viagens!',
        category: 'marketing',
        targetAudience: 'all',
        scheduledAt: new Date(Date.now() + 3600000),
        status: 'scheduled',
        recipients: 1250,
        opened: 890,
        clicked: 234
      },
      {
        id: '2',
        title: 'Confirmação de Reserva',
        message: 'Sua viagem para Paris foi confirmada!',
        category: 'transactional',
        targetAudience: 'specific',
        sentAt: new Date(),
        status: 'sent',
        recipients: 1,
        opened: 1,
        clicked: 0
      }
    ];

    const mockTemplates: NotificationTemplate[] = [
      {
        id: '1',
        name: 'Promoção Padrão',
        title: 'Promoção Especial',
        message: 'Desconto exclusivo para você!',
        category: 'marketing',
        isDefault: true
      },
      {
        id: '2',
        name: 'Confirmação de Viagem',
        title: 'Viagem Confirmada',
        message: 'Sua viagem foi confirmada com sucesso!',
        category: 'transactional',
        isDefault: true
      }
    ];

    setNotifications(mockNotifications);
    setTemplates(mockTemplates);
  }, []);

  const handleCreateNotification = (notification: Omit<PushNotification, 'id' | 'status' | 'recipients' | 'opened' | 'clicked'>) => {
    const newNotification: PushNotification = {
      ...notification,
      id: Date.now().toString(),
      status: 'draft',
      recipients: 0,
      opened: 0,
      clicked: 0
    };

    setNotifications(prev => [newNotification, ...prev]);
    setShowCreateModal(false);
    showNotification('Notificação criada com sucesso!', 'success');
    onNotificationSent?.(newNotification);
  };

  const handleSendNotification = (id: string) => {
    setNotifications(prev => prev.map(n => 
      n.id === id ? { ...n, status: 'sent', sentAt: new Date() } : n
    ));
    showNotification('Notificação enviada com sucesso!', 'success');
  };

  const handleCreateTemplate = (template: Omit<NotificationTemplate, 'id'>) => {
    const newTemplate: NotificationTemplate = {
      ...template,
      id: Date.now().toString()
    };

    setTemplates(prev => [newTemplate, ...prev]);
    setShowTemplateModal(false);
    showNotification('Template criado com sucesso!', 'success');
    onTemplateCreated?.(newTemplate);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'gray';
      case 'scheduled': return 'blue';
      case 'sent': return 'green';
      case 'failed': return 'red';
      default: return 'gray';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'marketing': return '🎯';
      case 'transactional': return '📧';
      case 'reminder': return '⏰';
      case 'alert': return '🚨';
      default: return '📱';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Sistema de Notificações Push</h2>
          <p className="text-gray-600">Gerencie notificações push e templates</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowTemplateModal(true)} variant="outline">
            <Plus className="w-4 h-4 mr-2" />
            Novo Template
          </Button>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Nova Notificação
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Card>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="compose">Compor</TabsTrigger>
            <TabsTrigger value="scheduled">Agendadas</TabsTrigger>
            <TabsTrigger value="sent">Enviadas</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
          </TabsList>

          {/* Compor Notificação */}
          <TabsContent value="compose" className="p-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Compor Nova Notificação</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input placeholder="Título da notificação" />
                <Select>
                  <option value="">Selecionar categoria</option>
                  <option value="marketing">Marketing</option>
                  <option value="transactional">Transacional</option>
                  <option value="reminder">Lembrete</option>
                  <option value="alert">Alerta</option>
                </Select>
                <Input placeholder="URL da imagem (opcional)" />
                <Input placeholder="URL de ação (opcional)" />
                <div className="md:col-span-2">
                  <textarea 
                    className="w-full p-3 border border-gray-300 rounded-md resize-none"
                    rows={3}
                    placeholder="Mensagem da notificação"
                  />
                </div>
                <Select>
                  <option value="">Público-alvo</option>
                  <option value="all">Todos os usuários</option>
                  <option value="specific">Usuários específicos</option>
                  <option value="segmented">Segmentado</option>
                </Select>
                <Input type="datetime-local" />
              </div>
              <div className="flex gap-2">
                <Button>Salvar Rascunho</Button>
                <Button variant="outline">Agendar</Button>
                <Button>Enviar Agora</Button>
              </div>
            </div>
          </TabsContent>

          {/* Notificações Agendadas */}
          <TabsContent value="scheduled" className="p-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Notificações Agendadas</h3>
              <div className="space-y-3">
                {notifications.filter(n => n.status === 'scheduled').map(notification => (
                  <div key={notification.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{getCategoryIcon(notification.category)}</span>
                      <div>
                        <h4 className="font-medium">{notification.title}</h4>
                        <p className="text-sm text-gray-600">{notification.message}</p>
                        <div className="flex items-center gap-4 mt-1">
                          <Badge variant={getStatusColor(notification.status) as any}>
                            {notification.status}
                          </Badge>
                          <span className="text-sm text-gray-500">
                            Agendada para: {notification.scheduledAt?.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => handleSendNotification(notification.id)}>
                        Enviar Agora
                      </Button>
                      <Button size="sm" variant="outline">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline" variant="destructive">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Notificações Enviadas */}
          <TabsContent value="sent" className="p-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Notificações Enviadas</h3>
              <div className="space-y-3">
                {notifications.filter(n => n.status === 'sent').map(notification => (
                  <div key={notification.id} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-2xl">{getCategoryIcon(notification.category)}</span>
                      <div>
                        <h4 className="font-medium">{notification.title}</h4>
                        <p className="text-sm text-gray-600">{notification.message}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Enviados:</span>
                        <span className="ml-2 font-medium">{notification.recipients}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Abertos:</span>
                        <span className="ml-2 font-medium">{notification.opened}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Clicados:</span>
                        <span className="ml-2 font-medium">{notification.clicked}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Templates */}
          <TabsContent value="templates" className="p-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Templates de Notificação</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {templates.map(template => (
                  <Card key={template.id} className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-medium">{template.name}</h4>
                        <p className="text-sm text-gray-600">{template.title}</p>
                      </div>
                      {template.isDefault && (
                        <Badge variant="secondary">Padrão</Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-700 mb-3">{template.message}</p>
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">{template.category}</Badge>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Edit className="w-4 h-4" />
                        </Button>
                        {!template.isDefault && (
                          <Button size="sm" variant="outline" variant="destructive">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </Card>

      {/* Modal Criar Notificação */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Nova Notificação Push"
      >
        <div className="space-y-4">
          <Input placeholder="Título da notificação" />
          <textarea 
            className="w-full p-3 border border-gray-300 rounded-md resize-none"
            rows={3}
            placeholder="Mensagem da notificação"
          />
          <Select>
            <option value="">Selecionar categoria</option>
            <option value="marketing">Marketing</option>
            <option value="transactional">Transacional</option>
            <option value="reminder">Lembrete</option>
            <option value="alert">Alerta</option>
          </Select>
          <Select>
            <option value="">Público-alvo</option>
            <option value="all">Todos os usuários</option>
            <option value="specific">Usuários específicos</option>
            <option value="segmented">Segmentado</option>
          </Select>
          <Input type="datetime-local" />
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setShowCreateModal(false)}>
              Cancelar
            </Button>
            <Button onClick={() => {
              handleCreateNotification({
                title: 'Nova Notificação',
                message: 'Mensagem da notificação',
                category: 'marketing',
                targetAudience: 'all'
              });
            }}>
              Criar Notificação
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal Criar Template */}
      <Modal
        isOpen={showTemplateModal}
        onClose={() => setShowTemplateModal(false)}
        title="Novo Template"
      >
        <div className="space-y-4">
          <Input placeholder="Nome do template" />
          <Input placeholder="Título padrão" />
          <textarea 
            className="w-full p-3 border border-gray-300 rounded-md resize-none"
            rows={3}
            placeholder="Mensagem padrão"
          />
          <Select>
            <option value="">Selecionar categoria</option>
            <option value="marketing">Marketing</option>
            <option value="transactional">Transacional</option>
            <option value="reminder">Lembrete</option>
            <option value="alert">Alerta</option>
          </Select>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setShowTemplateModal(false)}>
              Cancelar
            </Button>
            <Button onClick={() => {
              handleCreateTemplate({
                name: 'Novo Template',
                title: 'Título Padrão',
                message: 'Mensagem padrão',
                category: 'marketing',
                isDefault: false
              });
            }}>
              Criar Template
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export { PushNotificationSystem };
export type { PushNotification, NotificationTemplate };
