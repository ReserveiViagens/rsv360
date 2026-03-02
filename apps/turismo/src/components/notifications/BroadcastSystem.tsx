import React, { useState, useEffect } from 'react';
import { Megaphone, Plus, Edit, Trash2, Eye, Send, Users, Clock, CheckCircle, AlertCircle, XCircle, BarChart3, Globe, Smartphone, Mail, MessageSquare } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Modal } from '../ui/Modal';
import { Badge } from '../ui/Badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/Tabs';
import { useUIStore } from '../../stores/useUIStore';

interface BroadcastMessage {
  id: string;
  title: string;
  message: string;
  channels: ('email' | 'sms' | 'push' | 'web')[];
  targetAudience: 'all' | 'customers' | 'newsletter' | 'specific';
  segments?: string[];
  scheduledAt?: Date;
  sentAt?: Date;
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'failed';
  recipients: number;
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  failed: number;
  createdAt: Date;
  createdBy: string;
}

interface BroadcastTemplate {
  id: string;
  name: string;
  title: string;
  message: string;
  channels: ('email' | 'sms' | 'push' | 'web')[];
  category: 'announcement' | 'promotion' | 'update' | 'alert';
  isDefault: boolean;
  variables: string[];
}

interface BroadcastSegment {
  id: string;
  name: string;
  description: string;
  criteria: {
    field: string;
    operator: 'equals' | 'contains' | 'greater_than' | 'less_than' | 'in';
    value: string | number | string[];
  }[];
  contactCount: number;
  createdAt: Date;
  lastUpdated: Date;
}

interface BroadcastSystemProps {
  onBroadcastCreated?: (broadcast: BroadcastMessage) => void;
  onTemplateCreated?: (template: BroadcastTemplate) => void;
  onSegmentCreated?: (segment: BroadcastSegment) => void;
}

const BroadcastSystem: React.FC<BroadcastSystemProps> = ({
  onBroadcastCreated,
  onTemplateCreated,
  onSegmentCreated
}) => {
  const [broadcasts, setBroadcasts] = useState<BroadcastMessage[]>([]);
  const [templates, setTemplates] = useState<BroadcastTemplate[]>([]);
  const [segments, setSegments] = useState<BroadcastSegment[]>([]);
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showSegmentModal, setShowSegmentModal] = useState(false);
  const [activeTab, setActiveTab] = useState('broadcasts');
  const { showNotification } = useUIStore();

  // Mock data
  useEffect(() => {
    const mockBroadcasts: BroadcastMessage[] = [
      {
        id: '1',
        title: 'Promoção de Verão',
        message: 'Descontos especiais em todas as viagens para o verão!',
        channels: ['email', 'sms', 'push'],
        targetAudience: 'customers',
        scheduledAt: new Date(Date.now() + 86400000),
        status: 'scheduled',
        recipients: 5000,
        sent: 0,
        delivered: 0,
        opened: 0,
        clicked: 0,
        failed: 0,
        createdAt: new Date(),
        createdBy: 'Maria Santos'
      },
      {
        id: '2',
        title: 'Manutenção do Sistema',
        message: 'O sistema estará em manutenção hoje às 22h',
        channels: ['email', 'push'],
        targetAudience: 'all',
        sentAt: new Date(Date.now() - 3600000),
        status: 'sent',
        recipients: 10000,
        sent: 10000,
        delivered: 9800,
        opened: 4500,
        clicked: 1200,
        failed: 200,
        createdAt: new Date(Date.now() - 7200000),
        createdBy: 'Admin'
      }
    ];

    const mockTemplates: BroadcastTemplate[] = [
      {
        id: '1',
        name: 'Anúncio Padrão',
        title: 'Anúncio Importante',
        message: 'Temos uma {tipo} para você: {mensagem}',
        channels: ['email', 'sms', 'push'],
        category: 'announcement',
        isDefault: true,
        variables: ['tipo', 'mensagem']
      },
      {
        id: '2',
        name: 'Promoção',
        title: 'Oferta Especial',
        message: 'Promoção exclusiva: {desconto}% de desconto em {destino}!',
        channels: ['email', 'sms'],
        category: 'promotion',
        isDefault: true,
        variables: ['desconto', 'destino']
      }
    ];

    const mockSegments: BroadcastSegment[] = [
      {
        id: '1',
        name: 'Clientes VIP',
        description: 'Clientes com mais de 5 viagens',
        criteria: [
          { field: 'total_trips', operator: 'greater_than', value: 5 }
        ],
        contactCount: 250,
        createdAt: new Date(Date.now() - 2592000000),
        lastUpdated: new Date()
      },
      {
        id: '2',
        name: 'Newsletter Ativos',
        description: 'Inscritos que abriram emails nos últimos 30 dias',
        criteria: [
          { field: 'last_email_open', operator: 'greater_than', value: '30_days_ago' }
        ],
        contactCount: 1500,
        createdAt: new Date(Date.now() - 5184000000),
        lastUpdated: new Date()
      }
    ];

    setBroadcasts(mockBroadcasts);
    setTemplates(mockTemplates);
    setSegments(mockSegments);
  }, []);

  const handleCreateBroadcast = (broadcast: Omit<BroadcastMessage, 'id' | 'status' | 'recipients' | 'sent' | 'delivered' | 'opened' | 'clicked' | 'failed' | 'createdAt' | 'createdBy'>) => {
    const newBroadcast: BroadcastMessage = {
      ...broadcast,
      id: Date.now().toString(),
      status: 'draft',
      recipients: 0,
      sent: 0,
      delivered: 0,
      opened: 0,
      clicked: 0,
      failed: 0,
      createdAt: new Date(),
      createdBy: 'Usuário Atual'
    };

    setBroadcasts(prev => [newBroadcast, ...prev]);
    setShowBroadcastModal(false);
    showNotification('Broadcast criado com sucesso!', 'success');
    onBroadcastCreated?.(newBroadcast);
  };

  const handleSendBroadcast = (id: string) => {
    setBroadcasts(prev => prev.map(b => 
      b.id === id ? { ...b, status: 'sending' } : b
    ));
    
    // Simular envio
    setTimeout(() => {
      setBroadcasts(prev => prev.map(b => 
        b.id === id ? { ...b, status: 'sent', sentAt: new Date() } : b
      ));
      showNotification('Broadcast enviado com sucesso!', 'success');
    }, 3000);
  };

  const handleCreateTemplate = (template: Omit<BroadcastTemplate, 'id'>) => {
    const newTemplate: BroadcastTemplate = {
      ...template,
      id: Date.now().toString()
    };

    setTemplates(prev => [newTemplate, ...prev]);
    setShowTemplateModal(false);
    showNotification('Template criado com sucesso!', 'success');
    onTemplateCreated?.(newTemplate);
  };

  const handleCreateSegment = (segment: Omit<BroadcastSegment, 'id' | 'contactCount' | 'createdAt' | 'lastUpdated'>) => {
    const newSegment: BroadcastSegment = {
      ...segment,
      id: Date.now().toString(),
      contactCount: 0,
      createdAt: new Date(),
      lastUpdated: new Date()
    };

    setSegments(prev => [newSegment, ...prev]);
    setShowSegmentModal(false);
    showNotification('Segmento criado com sucesso!', 'success');
    onSegmentCreated?.(newSegment);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'gray';
      case 'scheduled': return 'blue';
      case 'sending': return 'yellow';
      case 'sent': return 'green';
      case 'failed': return 'red';
      default: return 'gray';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft': return <Clock className="w-4 h-4" />;
      case 'scheduled': return <Clock className="w-4 h-4" />;
      case 'sending': return <Send className="w-4 h-4" />;
      case 'sent': return <CheckCircle className="w-4 h-4" />;
      case 'failed': return <XCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'email': return <Mail className="w-4 h-4" />;
      case 'sms': return <Smartphone className="w-4 h-4" />;
      case 'push': return <Globe className="w-4 h-4" />;
      case 'web': return <MessageSquare className="w-4 h-4" />;
      default: return <MessageSquare className="w-4 h-4" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'announcement': return '📢';
      case 'promotion': return '🎯';
      case 'update': return '🔄';
      case 'alert': return '🚨';
      default: return '📢';
    }
  };

  const calculateDeliveryRate = (delivered: number, sent: number) => {
    if (sent === 0) return 0;
    return ((delivered / sent) * 100).toFixed(1);
  };

  const calculateOpenRate = (opened: number, delivered: number) => {
    if (delivered === 0) return 0;
    return ((opened / delivered) * 100).toFixed(1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Sistema de Broadcast</h2>
          <p className="text-gray-600">Gerencie mensagens em massa para múltiplos canais</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowSegmentModal(true)} variant="outline">
            <Plus className="w-4 h-4 mr-2" />
            Novo Segmento
          </Button>
          <Button onClick={() => setShowTemplateModal(true)} variant="outline">
            <Plus className="w-4 h-4 mr-2" />
            Novo Template
          </Button>
          <Button onClick={() => setShowBroadcastModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Novo Broadcast
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Card>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="broadcasts">Broadcasts</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="segments">Segmentos</TabsTrigger>
          </TabsList>

          {/* Broadcasts */}
          <TabsContent value="broadcasts" className="p-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Mensagens Broadcast</h3>
              <div className="space-y-3">
                {broadcasts.map(broadcast => (
                  <Card key={broadcast.id} className="p-4">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className="font-medium text-lg">{broadcast.title}</h4>
                        <p className="text-sm text-gray-600 mb-2">{broadcast.message}</p>
                        <div className="flex items-center gap-4 mb-2">
                          <Badge variant={getStatusColor(broadcast.status) as any}>
                            {getStatusIcon(broadcast.status)}
                            <span className="ml-1">{broadcast.status}</span>
                          </Badge>
                          <span className="text-sm text-gray-500">
                            Público: {broadcast.targetAudience}
                          </span>
                          <span className="text-sm text-gray-500">
                            Criado por: {broadcast.createdBy}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {broadcast.channels.map(channel => (
                            <Badge key={channel} variant="outline" className="text-xs">
                              {getChannelIcon(channel)}
                              <span className="ml-1">{channel}</span>
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {broadcast.status === 'draft' && (
                          <Button size="sm" onClick={() => handleSendBroadcast(broadcast.id)}>
                            Enviar
                          </Button>
                        )}
                        {broadcast.status === 'scheduled' && (
                          <Button size="sm" variant="outline">
                            <Edit className="w-4 h-4" />
                          </Button>
                        )}
                        <Button size="sm" variant="outline">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <BarChart3 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    
                    {/* Métricas */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm border-t pt-3">
                      <div>
                        <span className="text-gray-500">Destinatários:</span>
                        <span className="ml-2 font-medium">{broadcast.recipients}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Taxa de Entrega:</span>
                        <span className="ml-2 font-medium">
                          {calculateDeliveryRate(broadcast.delivered, broadcast.sent)}%
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Taxa de Abertura:</span>
                        <span className="ml-2 font-medium">
                          {calculateOpenRate(broadcast.opened, broadcast.delivered)}%
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Falhas:</span>
                        <span className="ml-2 font-medium">{broadcast.failed}</span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Templates */}
          <TabsContent value="templates" className="p-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Templates de Broadcast</h3>
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
                    <div className="mb-3">
                      <span className="text-xs text-gray-500">Variáveis:</span>
                      <div className="flex gap-1 mt-1">
                        {template.variables.map(variable => (
                          <Badge key={variable} variant="outline" className="text-xs">
                            {`{${variable}}`}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{template.category}</Badge>
                        <span className="text-xs text-gray-500">
                          {getCategoryIcon(template.category)} {template.category}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Eye className="w-4 h-4" />
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

          {/* Segmentos */}
          <TabsContent value="segments" className="p-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Segmentos de Audiência</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {segments.map(segment => (
                  <Card key={segment.id} className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-medium">{segment.name}</h4>
                        <p className="text-sm text-gray-600">{segment.description}</p>
                      </div>
                      <Badge variant="outline">{segment.contactCount} contatos</Badge>
                    </div>
                    <div className="mb-3">
                      <span className="text-xs text-gray-500">Critérios:</span>
                      <div className="space-y-1 mt-1">
                        {segment.criteria.map((criterion, index) => (
                          <div key={index} className="text-xs text-gray-700">
                            {criterion.field} {criterion.operator} {Array.isArray(criterion.value) ? criterion.value.join(', ') : criterion.value}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="text-sm text-gray-500 mb-3">
                      Criado em: {segment.createdAt.toLocaleDateString()}
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Users className="w-4 h-4 mr-2" />
                        Gerenciar Contatos
                      </Button>
                      <Button size="sm" variant="outline">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <BarChart3 className="w-4 h-4" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </Card>

      {/* Modal Novo Broadcast */}
      <Modal
        isOpen={showBroadcastModal}
        onClose={() => setShowBroadcastModal(false)}
        title="Novo Broadcast"
      >
        <div className="space-y-4">
          <Input placeholder="Título do broadcast" />
          <textarea 
            className="w-full p-3 border border-gray-300 rounded-md resize-none"
            rows={4}
            placeholder="Mensagem do broadcast"
          />
          <div className="grid grid-cols-2 gap-4">
            <Select>
              <option value="">Selecionar público-alvo</option>
              <option value="all">Todos os usuários</option>
              <option value="customers">Clientes</option>
              <option value="newsletter">Newsletter</option>
              <option value="specific">Específico</option>
            </Select>
            <Input type="datetime-local" placeholder="Agendar envio (opcional)" />
          </div>
          <div>
            <span className="text-sm text-gray-600 mb-2 block">Canais de envio:</span>
            <div className="grid grid-cols-2 gap-2">
              <label className="flex items-center gap-2">
                <input type="checkbox" defaultChecked />
                <span className="text-sm">Email</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" />
                <span className="text-sm">SMS</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" />
                <span className="text-sm">Push</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" />
                <span className="text-sm">Web</span>
              </label>
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setShowBroadcastModal(false)}>
              Cancelar
            </Button>
            <Button onClick={() => {
              handleCreateBroadcast({
                title: 'Novo Broadcast',
                message: 'Mensagem do broadcast',
                channels: ['email'],
                targetAudience: 'all'
              });
            }}>
              Criar Broadcast
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal Novo Template */}
      <Modal
        isOpen={showTemplateModal}
        onClose={() => setShowTemplateModal(false)}
        title="Novo Template"
      >
        <div className="space-y-4">
          <Input placeholder="Nome do template" />
          <Input placeholder="Título padrão" />
          <Select>
            <option value="">Selecionar categoria</option>
            <option value="announcement">Anúncio</option>
            <option value="promotion">Promoção</option>
            <option value="update">Atualização</option>
            <option value="alert">Alerta</option>
          </Select>
          <textarea 
            className="w-full p-3 border border-gray-300 rounded-md resize-none"
            rows={4}
            placeholder="Mensagem do template (use {variavel} para variáveis)"
          />
          <div className="text-sm text-gray-600">
            <p>Variáveis disponíveis: {tipo}, {mensagem}, {desconto}, {destino}</p>
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setShowTemplateModal(false)}>
              Cancelar
            </Button>
            <Button onClick={() => {
              handleCreateTemplate({
                name: 'Novo Template',
                title: 'Título Padrão',
                message: 'Mensagem do template com {variavel}',
                channels: ['email'],
                category: 'announcement',
                isDefault: false,
                variables: ['variavel']
              });
            }}>
              Criar Template
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal Novo Segmento */}
      <Modal
        isOpen={showSegmentModal}
        onClose={() => setShowSegmentModal(false)}
        title="Novo Segmento"
      >
        <div className="space-y-4">
          <Input placeholder="Nome do segmento" />
          <textarea 
            className="w-full p-3 border border-gray-300 rounded-md resize-none"
            rows={3}
            placeholder="Descrição do segmento"
          />
          <div className="text-sm text-gray-600">
            <p>Exemplo de critérios: total_trips {'>'} 5, last_email_open {'>'} 30_days_ago</p>
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setShowSegmentModal(false)}>
              Cancelar
            </Button>
            <Button onClick={() => {
              handleCreateSegment({
                name: 'Novo Segmento',
                description: 'Descrição do segmento',
                criteria: [
                  { field: 'total_trips', operator: 'greater_than', value: 0 }
                ]
              });
            }}>
              Criar Segmento
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export { BroadcastSystem };
export type { BroadcastMessage, BroadcastTemplate, BroadcastSegment };
