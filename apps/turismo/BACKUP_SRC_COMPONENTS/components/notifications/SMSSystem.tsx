import React, { useState, useEffect } from 'react';
import { MessageSquare, Plus, Edit, Trash2, Eye, Send, Users, Clock, CheckCircle, AlertCircle, XCircle, BarChart3, Phone } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Modal } from '../ui/Modal';
import { Badge } from '../ui/Badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/Tabs';
import { useUIStore } from '../../stores/useUIStore';

interface SMSMessage {
  id: string;
  phoneNumber: string;
  message: string;
  template?: string;
  status: 'pending' | 'sending' | 'sent' | 'delivered' | 'failed';
  category: 'marketing' | 'transactional' | 'reminder' | 'alert';
  scheduledAt?: Date;
  sentAt?: Date;
  deliveredAt?: Date;
  cost: number;
  attempts: number;
}

interface SMSCampaign {
  id: string;
  name: string;
  message: string;
  template?: string;
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'paused';
  recipients: number;
  sent: number;
  delivered: number;
  failed: number;
  scheduledAt?: Date;
  sentAt?: Date;
  createdAt: Date;
  cost: number;
}

interface SMSTemplate {
  id: string;
  name: string;
  message: string;
  category: 'marketing' | 'transactional' | 'reminder' | 'alert';
  isDefault: boolean;
  variables: string[];
}

interface SMSSystemProps {
  onMessageSent?: (message: SMSMessage) => void;
  onCampaignCreated?: (campaign: SMSCampaign) => void;
  onTemplateCreated?: (template: SMSTemplate) => void;
}

const SMSSystem: React.FC<SMSSystemProps> = ({
  onMessageSent,
  onCampaignCreated,
  onTemplateCreated
}) => {
  const [messages, setMessages] = useState<SMSMessage[]>([]);
  const [campaigns, setCampaigns] = useState<SMSCampaign[]>([]);
  const [templates, setTemplates] = useState<SMSTemplate[]>([]);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [showCampaignModal, setShowCampaignModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [activeTab, setActiveTab] = useState('messages');
  const { showNotification } = useUIStore();

  // Mock data
  useEffect(() => {
    const mockMessages: SMSMessage[] = [
      {
        id: '1',
        phoneNumber: '+55 64 99319-7555',
        message: 'Sua reserva para Caldas Novas foi confirmada!',
        template: 'Confirmação de Reserva',
        status: 'delivered',
        category: 'transactional',
        sentAt: new Date(Date.now() - 3600000),
        deliveredAt: new Date(Date.now() - 3500000),
        cost: 0.15,
        attempts: 1
      },
      {
        id: '2',
        phoneNumber: '+55 64 99306-8752',
        message: 'Promoção especial: 20% de desconto em viagens!',
        template: 'Promoção',
        status: 'sent',
        category: 'marketing',
        sentAt: new Date(Date.now() - 7200000),
        cost: 0.15,
        attempts: 1
      }
    ];

    const mockCampaigns: SMSCampaign[] = [
      {
        id: '1',
        name: 'Promoção de Verão',
        message: 'Descontos especiais para suas férias!',
        template: 'Promoção Padrão',
        status: 'sent',
        recipients: 500,
        sent: 500,
        delivered: 480,
        failed: 20,
        sentAt: new Date(Date.now() - 86400000),
        createdAt: new Date(Date.now() - 172800000),
        cost: 75.00
      },
      {
        id: '2',
        name: 'Lembretes de Viagem',
        message: 'Lembrete: sua viagem está chegando!',
        template: 'Lembrete',
        status: 'scheduled',
        recipients: 200,
        sent: 0,
        delivered: 0,
        failed: 0,
        scheduledAt: new Date(Date.now() + 86400000),
        createdAt: new Date(),
        cost: 30.00
      }
    ];

    const mockTemplates: SMSTemplate[] = [
      {
        id: '1',
        name: 'Confirmação de Reserva',
        message: 'Sua reserva para {destino} foi confirmada! Data: {data}',
        category: 'transactional',
        isDefault: true,
        variables: ['destino', 'data']
      },
      {
        id: '2',
        name: 'Promoção',
        message: 'Promoção especial: {desconto}% de desconto em {destino}!',
        category: 'marketing',
        isDefault: true,
        variables: ['desconto', 'destino']
      }
    ];

    setMessages(mockMessages);
    setCampaigns(mockCampaigns);
    setTemplates(mockTemplates);
  }, []);

  const handleSendMessage = (message: Omit<SMSMessage, 'id' | 'status' | 'sentAt' | 'deliveredAt' | 'cost' | 'attempts'>) => {
    const newMessage: SMSMessage = {
      ...message,
      id: Date.now().toString(),
      status: 'pending',
      cost: 0.15,
      attempts: 0
    };

    setMessages(prev => [newMessage, ...prev]);
    setShowMessageModal(false);
    
    // Simular envio
    setTimeout(() => {
      setMessages(prev => prev.map(m => 
        m.id === newMessage.id ? { ...m, status: 'sent', sentAt: new Date() } : m
      ));
      
      setTimeout(() => {
        setMessages(prev => prev.map(m => 
          m.id === newMessage.id ? { ...m, status: 'delivered', deliveredAt: new Date() } : m
        ));
      }, 1000);
    }, 1000);

    showNotification('SMS enviado com sucesso!', 'success');
    onMessageSent?.(newMessage);
  };

  const handleCreateCampaign = (campaign: Omit<SMSCampaign, 'id' | 'status' | 'recipients' | 'sent' | 'delivered' | 'failed' | 'createdAt' | 'cost'>) => {
    const newCampaign: SMSCampaign = {
      ...campaign,
      id: Date.now().toString(),
      status: 'draft',
      recipients: 0,
      sent: 0,
      delivered: 0,
      failed: 0,
      createdAt: new Date(),
      cost: 0
    };

    setCampaigns(prev => [newCampaign, ...prev]);
    setShowCampaignModal(false);
    showNotification('Campanha criada com sucesso!', 'success');
    onCampaignCreated?.(newCampaign);
  };

  const handleSendCampaign = (id: string) => {
    setCampaigns(prev => prev.map(c => 
      c.id === id ? { ...c, status: 'sending' } : c
    ));
    
    // Simular envio da campanha
    setTimeout(() => {
      setCampaigns(prev => prev.map(c => 
        c.id === id ? { ...c, status: 'sent', sentAt: new Date() } : c
      ));
      showNotification('Campanha enviada com sucesso!', 'success');
    }, 3000);
  };

  const handleCreateTemplate = (template: Omit<SMSTemplate, 'id'>) => {
    const newTemplate: SMSTemplate = {
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
      case 'pending': return 'gray';
      case 'sending': return 'yellow';
      case 'sent': return 'blue';
      case 'delivered': return 'green';
      case 'failed': return 'red';
      default: return 'gray';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'sending': return <Send className="w-4 h-4" />;
      case 'sent': return <CheckCircle className="w-4 h-4" />;
      case 'delivered': return <CheckCircle className="w-4 h-4" />;
      case 'failed': return <XCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
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

  const formatPhoneNumber = (phone: string) => {
    // Formatar número de telefone brasileiro
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 11) {
      return `(${cleaned.slice(0,2)}) ${cleaned.slice(2,7)}-${cleaned.slice(7)}`;
    }
    return phone;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Sistema de SMS</h2>
          <p className="text-gray-600">Gerencie mensagens SMS, campanhas e templates</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowTemplateModal(true)} variant="outline">
            <Plus className="w-4 h-4 mr-2" />
            Novo Template
          </Button>
          <Button onClick={() => setShowCampaignModal(true)} variant="outline">
            <Plus className="w-4 h-4 mr-2" />
            Nova Campanha
          </Button>
          <Button onClick={() => setShowMessageModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Novo SMS
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Card>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="messages">Mensagens</TabsTrigger>
            <TabsTrigger value="campaigns">Campanhas</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
          </TabsList>

          {/* Mensagens */}
          <TabsContent value="messages" className="p-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Mensagens SMS</h3>
              <div className="space-y-3">
                {messages.map(message => (
                  <Card key={message.id} className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{getCategoryIcon(message.category)}</span>
                        <div>
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-gray-500" />
                            <span className="font-medium">{formatPhoneNumber(message.phoneNumber)}</span>
                          </div>
                          <p className="text-sm text-gray-700 mt-1">{message.message}</p>
                          {message.template && (
                            <span className="text-xs text-gray-500">Template: {message.template}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={getStatusColor(message.status) as any}>
                          {getStatusIcon(message.status)}
                          <span className="ml-1">{message.status}</span>
                        </Badge>
                        <span className="text-sm text-gray-500">
                          R$ {message.cost.toFixed(2)}
                        </span>
                      </div>
                    </div>
                    
                    {/* Detalhes de entrega */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm border-t pt-3">
                      <div>
                        <span className="text-gray-500">Status:</span>
                        <span className="ml-2 font-medium">{message.status}</span>
                      </div>
                      {message.sentAt && (
                        <div>
                          <span className="text-gray-500">Enviado:</span>
                          <span className="ml-2 font-medium">
                            {message.sentAt.toLocaleTimeString()}
                          </span>
                        </div>
                      )}
                      {message.deliveredAt && (
                        <div>
                          <span className="text-gray-500">Entregue:</span>
                          <span className="ml-2 font-medium">
                            {message.deliveredAt.toLocaleTimeString()}
                          </span>
                        </div>
                      )}
                      <div>
                        <span className="text-gray-500">Tentativas:</span>
                        <span className="ml-2 font-medium">{message.attempts}</span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Campanhas */}
          <TabsContent value="campaigns" className="p-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Campanhas SMS</h3>
              <div className="space-y-3">
                {campaigns.map(campaign => (
                  <Card key={campaign.id} className="p-4">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className="font-medium text-lg">{campaign.name}</h4>
                        <p className="text-sm text-gray-600">{campaign.message}</p>
                        <div className="flex items-center gap-4 mt-2">
                          <Badge variant={getStatusColor(campaign.status) as any}>
                            {getStatusIcon(campaign.status)}
                            <span className="ml-1">{campaign.status}</span>
                          </Badge>
                          {campaign.template && (
                            <span className="text-sm text-gray-500">
                              Template: {campaign.template}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {campaign.status === 'draft' && (
                          <Button size="sm" onClick={() => handleSendCampaign(campaign.id)}>
                            Enviar
                          </Button>
                        )}
                        {campaign.status === 'scheduled' && (
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
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Destinatários:</span>
                        <span className="ml-2 font-medium">{campaign.recipients}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Enviados:</span>
                        <span className="ml-2 font-medium">{campaign.sent}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Entregues:</span>
                        <span className="ml-2 font-medium">{campaign.delivered}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Custo Total:</span>
                        <span className="ml-2 font-medium">R$ {campaign.cost.toFixed(2)}</span>
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
              <h3 className="text-lg font-semibold">Templates SMS</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {templates.map(template => (
                  <Card key={template.id} className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-medium">{template.name}</h4>
                        <p className="text-sm text-gray-600">{template.message}</p>
                      </div>
                      {template.isDefault && (
                        <Badge variant="secondary">Padrão</Badge>
                      )}
                    </div>
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
                      <Badge variant="outline">{template.category}</Badge>
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
        </Tabs>
      </Card>

      {/* Modal Novo SMS */}
      <Modal
        isOpen={showMessageModal}
        onClose={() => setShowMessageModal(false)}
        title="Novo SMS"
      >
        <div className="space-y-4">
          <Input placeholder="Número de telefone" />
          <Select>
            <option value="">Selecionar template (opcional)</option>
            {templates.map(template => (
              <option key={template.id} value={template.name}>
                {template.name}
              </option>
            ))}
          </Select>
          <Select>
            <option value="">Selecionar categoria</option>
            <option value="marketing">Marketing</option>
            <option value="transactional">Transacional</option>
            <option value="reminder">Lembrete</option>
            <option value="alert">Alerta</option>
          </Select>
          <textarea 
            className="w-full p-3 border border-gray-300 rounded-md resize-none"
            rows={3}
            placeholder="Mensagem SMS"
          />
          <Input type="datetime-local" placeholder="Agendar envio (opcional)" />
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setShowMessageModal(false)}>
              Cancelar
            </Button>
            <Button onClick={() => {
              handleSendMessage({
                phoneNumber: '+55 64 99999-9999',
                message: 'Nova mensagem SMS',
                category: 'marketing'
              });
            }}>
              Enviar SMS
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal Nova Campanha */}
      <Modal
        isOpen={showCampaignModal}
        onClose={() => setShowCampaignModal(false)}
        title="Nova Campanha SMS"
      >
        <div className="space-y-4">
          <Input placeholder="Nome da campanha" />
          <Select>
            <option value="">Selecionar template (opcional)</option>
            {templates.map(template => (
              <option key={template.id} value={template.name}>
                {template.name}
              </option>
            ))}
          </Select>
          <Select>
            <option value="">Selecionar categoria</option>
            <option value="marketing">Marketing</option>
            <option value="transactional">Transacional</option>
            <option value="reminder">Lembrete</option>
            <option value="alert">Alerta</option>
          </Select>
          <textarea 
            className="w-full p-3 border border-gray-300 rounded-md resize-none"
            rows={3}
            placeholder="Mensagem da campanha"
          />
          <Input type="datetime-local" placeholder="Agendar envio (opcional)" />
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setShowCampaignModal(false)}>
              Cancelar
            </Button>
            <Button onClick={() => {
              handleCreateCampaign({
                name: 'Nova Campanha',
                message: 'Mensagem da campanha SMS',
                scheduledAt: undefined
              });
            }}>
              Criar Campanha
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal Novo Template */}
      <Modal
        isOpen={showTemplateModal}
        onClose={() => setShowTemplateModal(false)}
        title="Novo Template SMS"
      >
        <div className="space-y-4">
          <Input placeholder="Nome do template" />
          <Select>
            <option value="">Selecionar categoria</option>
            <option value="marketing">Marketing</option>
            <option value="transactional">Transacional</option>
            <option value="reminder">Lembrete</option>
            <option value="alert">Alerta</option>
          </Select>
          <textarea 
            className="w-full p-3 border border-gray-300 rounded-md resize-none"
            rows={4}
            placeholder="Mensagem do template (use {variavel} para variáveis)"
          />
          <div className="text-sm text-gray-600">
            <p>Variáveis disponíveis: {destino}, {data}, {nome}, {desconto}</p>
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setShowTemplateModal(false)}>
              Cancelar
            </Button>
            <Button onClick={() => {
              handleCreateTemplate({
                name: 'Novo Template',
                message: 'Mensagem do template com {variavel}',
                category: 'marketing',
                isDefault: false,
                variables: ['variavel']
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

export { SMSSystem };
export type { SMSMessage, SMSCampaign, SMSTemplate };
