import React, { useState, useEffect } from 'react';
import { MessageCircle, Plus, Edit, Trash2, Eye, Send, Users, Clock, CheckCircle, AlertCircle, XCircle, Phone, Video, FileText, Smile } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Modal } from '../ui/Modal';
import { Badge } from '../ui/Badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/Tabs';
import { useUIStore } from '../../stores/useUIStore';

interface ChatConversation {
  id: string;
  customerId: string;
  customerName: string;
  customerAvatar?: string;
  agentId?: string;
  agentName?: string;
  status: 'active' | 'waiting' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: 'reservation' | 'support' | 'sales' | 'general';
  lastMessage: string;
  lastMessageTime: Date;
  unreadCount: number;
  createdAt: Date;
  resolvedAt?: Date;
}

interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderType: 'customer' | 'agent' | 'system';
  message: string;
  messageType: 'text' | 'image' | 'file' | 'location';
  timestamp: Date;
  isRead: boolean;
  attachments?: string[];
}

interface ChatAgent {
  id: string;
  name: string;
  avatar?: string;
  status: 'online' | 'busy' | 'away' | 'offline';
  department: 'sales' | 'support' | 'reservations';
  activeConversations: number;
  totalResolved: number;
  rating: number;
}

interface ChatSystemProps {
  onConversationCreated?: (conversation: ChatConversation) => void;
  onMessageSent?: (message: ChatMessage) => void;
  onAgentAssigned?: (conversationId: string, agentId: string) => void;
}

const ChatSystem: React.FC<ChatSystemProps> = ({
  onConversationCreated,
  onMessageSent,
  onAgentAssigned
}) => {
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [agents, setAgents] = useState<ChatAgent[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [showAgentModal, setShowAgentModal] = useState(false);
  const [activeTab, setActiveTab] = useState('conversations');
  const { showNotification } = useUIStore();

  // Mock data
  useEffect(() => {
    const mockConversations: ChatConversation[] = [
      {
        id: '1',
        customerId: 'cust1',
        customerName: 'João Silva',
        customerAvatar: 'https://via.placeholder.com/40',
        agentId: 'agent1',
        agentName: 'Maria Santos',
        status: 'active',
        priority: 'medium',
        category: 'reservation',
        lastMessage: 'Gostaria de saber sobre pacotes para Caldas Novas',
        lastMessageTime: new Date(Date.now() - 300000),
        unreadCount: 2,
        createdAt: new Date(Date.now() - 3600000)
      },
      {
        id: '2',
        customerId: 'cust2',
        customerName: 'Ana Costa',
        customerAvatar: 'https://via.placeholder.com/40',
        status: 'waiting',
        priority: 'high',
        category: 'support',
        lastMessage: 'Preciso de ajuda com minha reserva',
        lastMessageTime: new Date(Date.now() - 600000),
        unreadCount: 1,
        createdAt: new Date(Date.now() - 1800000)
      }
    ];

    const mockMessages: ChatMessage[] = [
      {
        id: '1',
        conversationId: '1',
        senderId: 'cust1',
        senderName: 'João Silva',
        senderType: 'customer',
        message: 'Olá! Gostaria de saber sobre pacotes para Caldas Novas',
        messageType: 'text',
        timestamp: new Date(Date.now() - 3600000),
        isRead: true
      },
      {
        id: '2',
        conversationId: '1',
        senderId: 'agent1',
        senderName: 'Maria Santos',
        senderType: 'agent',
        message: 'Olá João! Temos ótimas opções para Caldas Novas. Qual período você tem em mente?',
        messageType: 'text',
        timestamp: new Date(Date.now() - 3500000),
        isRead: true
      },
      {
        id: '3',
        conversationId: '1',
        senderId: 'cust1',
        senderName: 'João Silva',
        senderType: 'customer',
        message: 'Estou pensando em janeiro, para 4 pessoas',
        messageType: 'text',
        timestamp: new Date(Date.now() - 300000),
        isRead: false
      }
    ];

    const mockAgents: ChatAgent[] = [
      {
        id: 'agent1',
        name: 'Maria Santos',
        avatar: 'https://via.placeholder.com/40',
        status: 'online',
        department: 'reservations',
        activeConversations: 3,
        totalResolved: 156,
        rating: 4.8
      },
      {
        id: 'agent2',
        name: 'Pedro Oliveira',
        avatar: 'https://via.placeholder.com/40',
        status: 'busy',
        department: 'support',
        activeConversations: 2,
        totalResolved: 89,
        rating: 4.6
      }
    ];

    setConversations(mockConversations);
    setMessages(mockMessages);
    setAgents(mockAgents);
  }, []);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedConversation) return;

    const conversation = conversations.find(c => c.id === selectedConversation);
    if (!conversation) return;

    const message: ChatMessage = {
      id: Date.now().toString(),
      conversationId: selectedConversation,
      senderId: 'agent1', // Mock agent ID
      senderName: 'Maria Santos',
      senderType: 'agent',
      message: newMessage,
      messageType: 'text',
      timestamp: new Date(),
      isRead: false
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');

    // Update conversation
    setConversations(prev => prev.map(c => 
      c.id === selectedConversation 
        ? { ...c, lastMessage: newMessage, lastMessageTime: new Date(), unreadCount: 0 }
        : c
    ));

    onMessageSent?.(message);
  };

  const handleAssignAgent = (conversationId: string, agentId: string) => {
    const agent = agents.find(a => a.id === agentId);
    if (!agent) return;

    setConversations(prev => prev.map(c => 
      c.id === conversationId 
        ? { ...c, agentId, agentName: agent.name, status: 'active' }
        : c
    ));

    showNotification(`Agente ${agent.name} atribuído à conversa`, 'success');
    onAgentAssigned?.(conversationId, agentId);
  };

  const handleCreateAgent = (agent: Omit<ChatAgent, 'id' | 'activeConversations' | 'totalResolved' | 'rating'>) => {
    const newAgent: ChatAgent = {
      ...agent,
      id: Date.now().toString(),
      activeConversations: 0,
      totalResolved: 0,
      rating: 0
    };

    setAgents(prev => [...prev, newAgent]);
    setShowAgentModal(false);
    showNotification('Agente criado com sucesso!', 'success');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'green';
      case 'waiting': return 'yellow';
      case 'resolved': return 'blue';
      case 'closed': return 'gray';
      default: return 'gray';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'gray';
      case 'medium': return 'blue';
      case 'high': return 'orange';
      case 'urgent': return 'red';
      default: return 'gray';
    }
  };

  const getAgentStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'green';
      case 'busy': return 'yellow';
      case 'away': return 'orange';
      case 'offline': return 'gray';
      default: return 'gray';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'reservation': return '📅';
      case 'support': return '🆘';
      case 'sales': return '💰';
      case 'general': return '💬';
      default: return '💬';
    }
  };

  const currentConversation = conversations.find(c => c.id === selectedConversation);
  const currentMessages = messages.filter(m => m.conversationId === selectedConversation);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Sistema de Chat</h2>
          <p className="text-gray-600">Gerencie conversas em tempo real com clientes</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowAgentModal(true)} variant="outline">
            <Plus className="w-4 h-4 mr-2" />
            Novo Agente
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lista de Conversas */}
        <div className="lg:col-span-1">
          <Card>
            <div className="p-4 border-b">
              <h3 className="font-semibold">Conversas Ativas</h3>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {conversations.map(conversation => (
                <div
                  key={conversation.id}
                  className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${
                    selectedConversation === conversation.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                  }`}
                  onClick={() => setSelectedConversation(conversation.id)}
                >
                  <div className="flex items-start gap-3">
                    <div className="relative">
                      <img
                        src={conversation.customerAvatar || 'https://via.placeholder.com/40'}
                        alt={conversation.customerName}
                        className="w-10 h-10 rounded-full"
                      />
                      <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
                        conversation.status === 'active' ? 'bg-green-500' : 'bg-gray-400'
                      }`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-medium text-sm truncate">{conversation.customerName}</h4>
                        <span className="text-xs text-gray-500">
                          {conversation.lastMessageTime.toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 truncate mb-2">{conversation.lastMessage}</p>
                      <div className="flex items-center gap-2">
                        <Badge variant={getStatusColor(conversation.status) as any} className="text-xs">
                          {conversation.status}
                        </Badge>
                        <Badge variant={getPriorityColor(conversation.priority) as any} className="text-xs">
                          {conversation.priority}
                        </Badge>
                        {conversation.unreadCount > 0 && (
                          <Badge variant="destructive" className="text-xs">
                            {conversation.unreadCount}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Chat Principal */}
        <div className="lg:col-span-2">
          <Card>
            {selectedConversation ? (
              <>
                {/* Header da Conversa */}
                <div className="p-4 border-b bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src={currentConversation?.customerAvatar || 'https://via.placeholder.com/40'}
                        alt={currentConversation?.customerName}
                        className="w-10 h-10 rounded-full"
                      />
                      <div>
                        <h3 className="font-semibold">{currentConversation?.customerName}</h3>
                        <div className="flex items-center gap-2">
                          <Badge variant={getStatusColor(currentConversation?.status || 'waiting') as any}>
                            {currentConversation?.status}
                          </Badge>
                          <Badge variant={getPriorityColor(currentConversation?.priority || 'medium') as any}>
                            {currentConversation?.priority}
                          </Badge>
                          <span className="text-sm text-gray-500">
                            {getCategoryIcon(currentConversation?.category || 'general')} {currentConversation?.category}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {!currentConversation?.agentId && (
                        <Select
                          value=""
                          onChange={(e) => e.target.value && handleAssignAgent(selectedConversation, e.target.value)}
                        >
                          <option value="">Atribuir Agente</option>
                          {agents.filter(a => a.status === 'online').map(agent => (
                            <option key={agent.id} value={agent.id}>
                              {agent.name} ({agent.department})
                            </option>
                          ))}
                        </Select>
                      )}
                      <Button size="sm" variant="outline">
                        <Phone className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Video className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Mensagens */}
                <div className="h-96 overflow-y-auto p-4 space-y-4">
                  {currentMessages.map(message => (
                    <div
                      key={message.id}
                      className={`flex ${message.senderType === 'customer' ? 'justify-start' : 'justify-end'}`}
                    >
                      <div className={`max-w-xs lg:max-w-md ${
                        message.senderType === 'customer' ? 'bg-gray-100' : 'bg-blue-500 text-white'
                      } rounded-lg p-3`}>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-medium">{message.senderName}</span>
                          <span className="text-xs opacity-75">
                            {message.timestamp.toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-sm">{message.message}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Input de Mensagem */}
                <div className="p-4 border-t">
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <FileText className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="outline">
                      <Smile className="w-4 h-4" />
                    </Button>
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Digite sua mensagem..."
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      className="flex-1"
                    />
                    <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="p-8 text-center text-gray-500">
                <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>Selecione uma conversa para começar</p>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Tabs para Agentes e Estatísticas */}
      <Card>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="conversations">Conversas</TabsTrigger>
            <TabsTrigger value="agents">Agentes</TabsTrigger>
          </TabsList>

          {/* Estatísticas de Conversas */}
          <TabsContent value="conversations" className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <h4 className="text-2xl font-bold text-blue-600">
                  {conversations.filter(c => c.status === 'active').length}
                </h4>
                <p className="text-sm text-blue-600">Ativas</p>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <h4 className="text-2xl font-bold text-yellow-600">
                  {conversations.filter(c => c.status === 'waiting').length}
                </h4>
                <p className="text-sm text-yellow-600">Aguardando</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <h4 className="text-2xl font-bold text-green-600">
                  {conversations.filter(c => c.status === 'resolved').length}
                </h4>
                <p className="text-sm text-green-600">Resolvidas</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <h4 className="text-2xl font-bold text-gray-600">
                  {conversations.filter(c => c.status === 'closed').length}
                </h4>
                <p className="text-sm text-gray-600">Fechadas</p>
              </div>
            </div>
          </TabsContent>

          {/* Lista de Agentes */}
          <TabsContent value="agents" className="p-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Agentes de Atendimento</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {agents.map(agent => (
                  <Card key={agent.id} className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="relative">
                        <img
                          src={agent.avatar || 'https://via.placeholder.com/40'}
                          alt={agent.name}
                          className="w-12 h-12 rounded-full"
                        />
                        <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
                          agent.status === 'online' ? 'bg-green-500' : 'bg-gray-400'
                        }`} />
                      </div>
                      <div>
                        <h4 className="font-medium">{agent.name}</h4>
                        <div className="flex items-center gap-2">
                          <Badge variant={getAgentStatusColor(agent.status) as any}>
                            {agent.status}
                          </Badge>
                          <Badge variant="outline">{agent.department}</Badge>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Ativas:</span>
                        <span className="ml-2 font-medium">{agent.activeConversations}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Resolvidas:</span>
                        <span className="ml-2 font-medium">{agent.totalResolved}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Avaliação:</span>
                        <span className="ml-2 font-medium">{agent.rating}/5.0</span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </Card>

      {/* Modal Novo Agente */}
      <Modal
        isOpen={showAgentModal}
        onClose={() => setShowAgentModal(false)}
        title="Novo Agente"
      >
        <div className="space-y-4">
          <Input placeholder="Nome do agente" />
          <Select>
            <option value="">Selecionar departamento</option>
            <option value="sales">Vendas</option>
            <option value="support">Suporte</option>
            <option value="reservations">Reservas</option>
          </Select>
          <Input placeholder="URL do avatar (opcional)" />
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setShowAgentModal(false)}>
              Cancelar
            </Button>
            <Button onClick={() => {
              handleCreateAgent({
                name: 'Novo Agente',
                status: 'online',
                department: 'support'
              });
            }}>
              Criar Agente
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export { ChatSystem };
export type { ChatConversation, ChatMessage, ChatAgent };
