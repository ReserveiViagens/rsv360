import React, { useState, useEffect } from 'react';
import { Mail, Plus, Edit, Trash2, Eye, Send, Users, Clock, CheckCircle, AlertCircle, XCircle, BarChart3, Filter } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Modal } from '../ui/Modal';
import { Badge } from '../ui/Badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/Tabs';
import { useUIStore } from '../../stores/useUIStore';

interface EmailCampaign {
  id: string;
  name: string;
  subject: string;
  template: string;
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'paused';
  recipients: number;
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  bounced: number;
  unsubscribed: number;
  scheduledAt?: Date;
  sentAt?: Date;
  createdAt: Date;
}

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  htmlContent: string;
  category: 'marketing' | 'transactional' | 'newsletter';
  isDefault: boolean;
}

interface ContactList {
  id: string;
  name: string;
  description: string;
  contactCount: number;
  createdAt: Date;
  lastUpdated: Date;
}

interface EmailMarketingProps {
  onCampaignCreated?: (campaign: EmailCampaign) => void;
  onTemplateCreated?: (template: EmailTemplate) => void;
  onListCreated?: (list: ContactList) => void;
}

const EmailMarketing: React.FC<EmailMarketingProps> = ({
  onCampaignCreated,
  onTemplateCreated,
  onListCreated
}) => {
  const [campaigns, setCampaigns] = useState<EmailCampaign[]>([]);
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [contactLists, setContactLists] = useState<ContactList[]>([]);
  const [showCampaignModal, setShowCampaignModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showListModal, setShowListModal] = useState(false);
  const [activeTab, setActiveTab] = useState('campaigns');
  const { showNotification } = useUIStore();

  // Mock data
  useEffect(() => {
    const mockCampaigns: EmailCampaign[] = [
      {
        id: '1',
        name: 'Promoção de Verão',
        subject: 'Descontos especiais para suas férias!',
        template: 'Promoção Padrão',
        status: 'sent',
        recipients: 2500,
        sent: 2500,
        delivered: 2400,
        opened: 1200,
        clicked: 300,
        bounced: 50,
        unsubscribed: 25,
        sentAt: new Date(Date.now() - 86400000),
        createdAt: new Date(Date.now() - 172800000)
      },
      {
        id: '2',
        name: 'Newsletter Mensal',
        subject: 'As melhores ofertas de viagem',
        template: 'Newsletter',
        status: 'scheduled',
        recipients: 3000,
        sent: 0,
        delivered: 0,
        opened: 0,
        clicked: 0,
        bounced: 0,
        unsubscribed: 0,
        scheduledAt: new Date(Date.now() + 86400000),
        createdAt: new Date()
      }
    ];

    const mockTemplates: EmailTemplate[] = [
      {
        id: '1',
        name: 'Promoção Padrão',
        subject: 'Oferta Especial para Você',
        htmlContent: '<h1>Oferta Especial</h1><p>Conteúdo do email...</p>',
        category: 'marketing',
        isDefault: true
      },
      {
        id: '2',
        name: 'Newsletter',
        subject: 'Newsletter da Reservei Viagens',
        htmlContent: '<h1>Newsletter</h1><p>Conteúdo da newsletter...</p>',
        category: 'newsletter',
        isDefault: true
      }
    ];

    const mockLists: ContactList[] = [
      {
        id: '1',
        name: 'Clientes Ativos',
        description: 'Clientes que fizeram reservas nos últimos 12 meses',
        contactCount: 1500,
        createdAt: new Date(Date.now() - 2592000000),
        lastUpdated: new Date()
      },
      {
        id: '2',
        name: 'Newsletter',
        description: 'Inscritos na newsletter',
        contactCount: 3000,
        createdAt: new Date(Date.now() - 5184000000),
        lastUpdated: new Date()
      }
    ];

    setCampaigns(mockCampaigns);
    setTemplates(mockTemplates);
    setContactLists(mockLists);
  }, []);

  const handleCreateCampaign = (campaign: Omit<EmailCampaign, 'id' | 'status' | 'recipients' | 'sent' | 'delivered' | 'opened' | 'clicked' | 'bounced' | 'unsubscribed' | 'createdAt'>) => {
    const newCampaign: EmailCampaign = {
      ...campaign,
      id: Date.now().toString(),
      status: 'draft',
      recipients: 0,
      sent: 0,
      delivered: 0,
      opened: 0,
      clicked: 0,
      bounced: 0,
      unsubscribed: 0,
      createdAt: new Date()
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
    
    // Simular envio
    setTimeout(() => {
      setCampaigns(prev => prev.map(c => 
        c.id === id ? { ...c, status: 'sent', sentAt: new Date() } : c
      ));
      showNotification('Campanha enviada com sucesso!', 'success');
    }, 2000);
  };

  const handleCreateTemplate = (template: Omit<EmailTemplate, 'id'>) => {
    const newTemplate: EmailTemplate = {
      ...template,
      id: Date.now().toString()
    };

    setTemplates(prev => [newTemplate, ...prev]);
    setShowTemplateModal(false);
    showNotification('Template criado com sucesso!', 'success');
    onTemplateCreated?.(newTemplate);
  };

  const handleCreateList = (list: Omit<ContactList, 'id' | 'contactCount' | 'createdAt' | 'lastUpdated'>) => {
    const newList: ContactList = {
      ...list,
      id: Date.now().toString(),
      contactCount: 0,
      createdAt: new Date(),
      lastUpdated: new Date()
    };

    setContactLists(prev => [newList, ...prev]);
    setShowListModal(false);
    showNotification('Lista de contatos criada com sucesso!', 'success');
    onListCreated?.(newList);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'gray';
      case 'scheduled': return 'blue';
      case 'sending': return 'yellow';
      case 'sent': return 'green';
      case 'paused': return 'orange';
      default: return 'gray';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft': return <Clock className="w-4 h-4" />;
      case 'scheduled': return <Clock className="w-4 h-4" />;
      case 'sending': return <Send className="w-4 h-4" />;
      case 'sent': return <CheckCircle className="w-4 h-4" />;
      case 'paused': return <AlertCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const calculateOpenRate = (opened: number, delivered: number) => {
    if (delivered === 0) return 0;
    return ((opened / delivered) * 100).toFixed(1);
  };

  const calculateClickRate = (clicked: number, opened: number) => {
    if (opened === 0) return 0;
    return ((clicked / opened) * 100).toFixed(1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Email Marketing</h2>
          <p className="text-gray-600">Gerencie campanhas, templates e listas de contatos</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowListModal(true)} variant="outline">
            <Plus className="w-4 h-4 mr-2" />
            Nova Lista
          </Button>
          <Button onClick={() => setShowTemplateModal(true)} variant="outline">
            <Plus className="w-4 h-4 mr-2" />
            Novo Template
          </Button>
          <Button onClick={() => setShowCampaignModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Nova Campanha
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Card>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="campaigns">Campanhas</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="lists">Listas de Contatos</TabsTrigger>
          </TabsList>

          {/* Campanhas */}
          <TabsContent value="campaigns" className="p-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Campanhas de Email</h3>
              <div className="space-y-3">
                {campaigns.map(campaign => (
                  <Card key={campaign.id} className="p-4">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className="font-medium text-lg">{campaign.name}</h4>
                        <p className="text-sm text-gray-600">{campaign.subject}</p>
                        <div className="flex items-center gap-4 mt-2">
                          <Badge variant={getStatusColor(campaign.status) as any}>
                            {getStatusIcon(campaign.status)}
                            <span className="ml-1">{campaign.status}</span>
                          </Badge>
                          <span className="text-sm text-gray-500">
                            Template: {campaign.template}
                          </span>
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
                        <span className="text-gray-500">Taxa de Abertura:</span>
                        <span className="ml-2 font-medium">
                          {calculateOpenRate(campaign.opened, campaign.delivered)}%
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Taxa de Clique:</span>
                        <span className="ml-2 font-medium">
                          {calculateClickRate(campaign.clicked, campaign.opened)}%
                        </span>
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
              <h3 className="text-lg font-semibold">Templates de Email</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {templates.map(template => (
                  <Card key={template.id} className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-medium">{template.name}</h4>
                        <p className="text-sm text-gray-600">{template.subject}</p>
                      </div>
                      {template.isDefault && (
                        <Badge variant="secondary">Padrão</Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-700 mb-3">
                      {template.htmlContent.substring(0, 100)}...
                    </p>
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

          {/* Listas de Contatos */}
          <TabsContent value="lists" className="p-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Listas de Contatos</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {contactLists.map(list => (
                  <Card key={list.id} className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-medium">{list.name}</h4>
                        <p className="text-sm text-gray-600">{list.description}</p>
                      </div>
                      <Badge variant="outline">{list.contactCount} contatos</Badge>
                    </div>
                    <div className="text-sm text-gray-500 mb-3">
                      Criada em: {list.createdAt.toLocaleDateString()}
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

      {/* Modal Nova Campanha */}
      <Modal
        isOpen={showCampaignModal}
        onClose={() => setShowCampaignModal(false)}
        title="Nova Campanha de Email"
      >
        <div className="space-y-4">
          <Input placeholder="Nome da campanha" />
          <Input placeholder="Assunto do email" />
          <Select>
            <option value="">Selecionar template</option>
            {templates.map(template => (
              <option key={template.id} value={template.name}>
                {template.name}
              </option>
            ))}
          </Select>
          <Select>
            <option value="">Selecionar lista de contatos</option>
            {contactLists.map(list => (
              <option key={list.id} value={list.name}>
                {list.name} ({list.contactCount} contatos)
              </option>
            ))}
          </Select>
          <Input type="datetime-local" placeholder="Agendar envio (opcional)" />
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setShowCampaignModal(false)}>
              Cancelar
            </Button>
            <Button onClick={() => {
              handleCreateCampaign({
                name: 'Nova Campanha',
                subject: 'Assunto do Email',
                template: 'Promoção Padrão',
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
        title="Novo Template de Email"
      >
        <div className="space-y-4">
          <Input placeholder="Nome do template" />
          <Input placeholder="Assunto padrão" />
          <Select>
            <option value="">Selecionar categoria</option>
            <option value="marketing">Marketing</option>
            <option value="transactional">Transacional</option>
            <option value="newsletter">Newsletter</option>
          </Select>
          <textarea 
            className="w-full p-3 border border-gray-300 rounded-md resize-none"
            rows={6}
            placeholder="Conteúdo HTML do template"
          />
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setShowTemplateModal(false)}>
              Cancelar
            </Button>
            <Button onClick={() => {
              handleCreateTemplate({
                name: 'Novo Template',
                subject: 'Assunto Padrão',
                htmlContent: '<h1>Conteúdo do Template</h1>',
                category: 'marketing',
                isDefault: false
              });
            }}>
              Criar Template
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal Nova Lista */}
      <Modal
        isOpen={showListModal}
        onClose={() => setShowListModal(false)}
        title="Nova Lista de Contatos"
      >
        <div className="space-y-4">
          <Input placeholder="Nome da lista" />
          <textarea 
            className="w-full p-3 border border-gray-300 rounded-md resize-none"
            rows={3}
            placeholder="Descrição da lista"
          />
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setShowListModal(false)}>
              Cancelar
            </Button>
            <Button onClick={() => {
              handleCreateList({
                name: 'Nova Lista',
                description: 'Descrição da lista de contatos'
              });
            }}>
              Criar Lista
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export { EmailMarketing };
export type { EmailCampaign, EmailTemplate, ContactList };
