import React, { useState, useEffect, useRef } from 'react';
import { 
    Send, 
    Search, 
    MoreVertical, 
    Phone, 
    Video, 
    Image, 
    Paperclip, 
    Smile, 
    Mic, 
    User, 
    Bot, 
    Clock, 
    Check, 
    CheckCheck,
    Archive,
    Trash,
    Blocks,
    Star,
    Edit,
    Reply,
    Forward,
    Copy,
    Download,
    Filter,
    Plus,
    Settings,
    MessageSquare,
    Users,
    Hash,
    AtSign,
    Calendar,
    MapPin,
    DollarSign,
    TrendingUp,
    AlertCircle,
    Info,
    HelpCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ProtectedRoute from '../components/ProtectedRoute';
import { useRouter } from 'next/router';

interface Message {
    id: string;
    content: string;
    sender: 'user' | 'bot' | 'agent';
    timestamp: Date;
    type: 'text' | 'image' | 'file' | 'location' | 'payment';
    status: 'sent' | 'delivered' | 'read';
    attachments?: {
        type: 'image' | 'file' | 'location';
        url?: string;
        name?: string;
        size?: number;
    }[];
    metadata?: {
        location?: { lat: number; lng: number; address: string };
        payment?: { amount: number; currency: string; status: string };
        booking?: { id: string; type: string; status: string };
    };
}

interface Conversation {
    id: string;
    title: string;
    participants: string[];
    lastMessage: string;
    lastMessageTime: Date;
    unreadCount: number;
    status: 'active' | 'archived' | 'blocked';
    type: 'customer' | 'agent' | 'bot' | 'group';
    avatar?: string;
    tags?: string[];
    priority: 'low' | 'medium' | 'high' | 'urgent';
    category: 'support' | 'sales' | 'booking' | 'payment' | 'general';
}

interface ChatStats {
    totalConversations: number;
    activeConversations: number;
    averageResponseTime: number;
    satisfactionRate: number;
    messagesToday: number;
    resolvedToday: number;
}

export default function Chat() {
    const { user } = useAuth();
    const router = useRouter();
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [showNewConversation, setShowNewConversation] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [chatStats, setChatStats] = useState<ChatStats>({
        totalConversations: 0,
        activeConversations: 0,
        averageResponseTime: 0,
        satisfactionRate: 0,
        messagesToday: 0,
        resolvedToday: 0
    });
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Mock data para conversas
    const mockConversations: Conversation[] = [
        {
            id: '1',
            title: 'João Silva - Reserva Hotel',
            participants: ['João Silva', 'Agente Maria'],
            lastMessage: 'Perfeito! Sua reserva foi confirmada para o dia 15/12.',
            lastMessageTime: new Date(Date.now() - 1000 * 60 * 30), // 30 min atrás
            unreadCount: 2,
            status: 'active',
            type: 'customer',
            priority: 'high',
            category: 'booking',
            tags: ['hotel', 'reserva', 'urgente']
        },
        {
            id: '2',
            title: 'Maria Santos - Pagamento',
            participants: ['Maria Santos', 'Agente Carlos'],
            lastMessage: 'O pagamento foi processado com sucesso.',
            lastMessageTime: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2h atrás
            unreadCount: 0,
            status: 'active',
            type: 'customer',
            priority: 'medium',
            category: 'payment',
            tags: ['pagamento', 'confirmado']
        },
        {
            id: '3',
            title: 'Pedro Costa - Suporte Técnico',
            participants: ['Pedro Costa', 'Bot Assistente'],
            lastMessage: 'Como posso ajudá-lo com sua viagem?',
            lastMessageTime: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5h atrás
            unreadCount: 1,
            status: 'active',
            type: 'bot',
            priority: 'low',
            category: 'support',
            tags: ['suporte', 'bot']
        },
        {
            id: '4',
            title: 'Ana Oliveira - Vendas',
            participants: ['Ana Oliveira', 'Agente João'],
            lastMessage: 'Gostaria de saber mais sobre os pacotes de viagem.',
            lastMessageTime: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 dia atrás
            unreadCount: 0,
            status: 'active',
            type: 'customer',
            priority: 'medium',
            category: 'sales',
            tags: ['vendas', 'pacotes']
        },
        {
            id: '5',
            title: 'Carlos Ferreira - Reclamação',
            participants: ['Carlos Ferreira', 'Agente Supervisor'],
            lastMessage: 'Vou verificar imediatamente sua reclamação.',
            lastMessageTime: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 dias atrás
            unreadCount: 0,
            status: 'archived',
            type: 'customer',
            priority: 'urgent',
            category: 'support',
            tags: ['reclamação', 'urgente']
        }
    ];

    // Mock data para mensagens
    const mockMessages: Message[] = [
        {
            id: '1',
            content: 'Olá! Gostaria de fazer uma reserva para o hotel em São Paulo.',
            sender: 'user',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
            type: 'text',
            status: 'read'
        },
        {
            id: '2',
            content: 'Olá João! Claro, posso ajudá-lo com a reserva. Para qual data você gostaria?',
            sender: 'agent',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2 + 1000 * 60 * 5),
            type: 'text',
            status: 'read'
        },
        {
            id: '3',
            content: 'Para o dia 15 de dezembro, por favor.',
            sender: 'user',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2 + 1000 * 60 * 10),
            type: 'text',
            status: 'read'
        },
        {
            id: '4',
            content: 'Perfeito! Vou verificar a disponibilidade para você.',
            sender: 'agent',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2 + 1000 * 60 * 15),
            type: 'text',
            status: 'read'
        },
        {
            id: '5',
            content: 'Excelente! Temos disponibilidade. O valor da diária é R$ 350,00. Posso confirmar a reserva?',
            sender: 'agent',
            timestamp: new Date(Date.now() - 1000 * 60 * 30),
            type: 'text',
            status: 'delivered'
        },
        {
            id: '6',
            content: 'Perfeito! Sua reserva foi confirmada para o dia 15/12.',
            sender: 'agent',
            timestamp: new Date(Date.now() - 1000 * 60 * 25),
            type: 'text',
            status: 'sent'
        }
    ];

    useEffect(() => {
        // Simular carregamento de dados
        setTimeout(() => {
            setConversations(mockConversations);
            setChatStats({
                totalConversations: mockConversations.length,
                activeConversations: mockConversations.filter(c => c.status === 'active').length,
                averageResponseTime: 2.5,
                satisfactionRate: 4.8,
                messagesToday: 156,
                resolvedToday: 23
            });
        }, 1000);
    }, []);

    useEffect(() => {
        if (selectedConversation) {
            setMessages(mockMessages);
            scrollToBottom();
        }
    }, [selectedConversation]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleSendMessage = () => {
        if (newMessage.trim() && selectedConversation) {
            const message: Message = {
                id: Date.now().toString(),
                content: newMessage,
                sender: 'user',
                timestamp: new Date(),
                type: 'text',
                status: 'sent'
            };
            
            setMessages(prev => [...prev, message]);
            setNewMessage('');
            
            // Simular resposta do agente
            setTimeout(() => {
                const response: Message = {
                    id: (Date.now() + 1).toString(),
                    content: 'Mensagem recebida! Em breve um agente entrará em contato.',
                    sender: 'agent',
                    timestamp: new Date(),
                    type: 'text',
                    status: 'sent'
                };
                setMessages(prev => [...prev, response]);
                scrollToBottom();
            }, 2000);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('pt-BR', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    };

    const formatDate = (date: Date) => {
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        
        if (days === 0) {
            return 'Hoje';
        } else if (days === 1) {
            return 'Ontem';
        } else if (days < 7) {
            return `${days} dias atrás`;
        } else {
            return date.toLocaleDateString('pt-BR');
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'urgent': return 'bg-red-100 text-red-800';
            case 'high': return 'bg-orange-100 text-orange-800';
            case 'medium': return 'bg-yellow-100 text-yellow-800';
            case 'low': return 'bg-green-100 text-green-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getCategoryColor = (category: string) => {
        switch (category) {
            case 'support': return 'bg-blue-100 text-blue-800';
            case 'sales': return 'bg-green-100 text-green-800';
            case 'booking': return 'bg-purple-100 text-purple-800';
            case 'payment': return 'bg-orange-100 text-orange-800';
            case 'general': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const filteredConversations = conversations.filter(conversation => {
        const matchesSearch = conversation.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            conversation.lastMessage.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || conversation.category === selectedCategory;
        const matchesStatus = selectedStatus === 'all' || conversation.status === selectedStatus;
        
        return matchesSearch && matchesCategory && matchesStatus;
    });

    return (
        <ProtectedRoute>
            <div className="flex h-screen bg-gray-50">
                {/* Sidebar - Lista de Conversas */}
                <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
                    {/* Header */}
                    <div className="p-4 border-b border-gray-200">
                        <div className="flex items-center justify-between mb-4">
                            <h1 className="text-xl font-bold text-gray-900">💬 Chat</h1>
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => setShowNewConversation(true)}
                                    className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
                                    title="Nova Conversa"
                                >
                                    <Plus className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => setShowSettings(true)}
                                    className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
                                    title="Configurações"
                                >
                                    <Settings className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                        
                        {/* Busca */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Buscar conversas..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    {/* Filtros */}
                    <div className="p-4 border-b border-gray-200">
                        <div className="grid grid-cols-2 gap-2">
                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="all">Todas as categorias</option>
                                <option value="support">Suporte</option>
                                <option value="sales">Vendas</option>
                                <option value="booking">Reservas</option>
                                <option value="payment">Pagamentos</option>
                                <option value="general">Geral</option>
                            </select>
                            
                            <select
                                value={selectedStatus}
                                onChange={(e) => setSelectedStatus(e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="all">Todos os status</option>
                                <option value="active">Ativo</option>
                                <option value="archived">Arquivado</option>
                                <option value="blocked">Bloqueado</option>
                            </select>
                        </div>
                    </div>

                    {/* Estatísticas */}
                    <div className="p-4 border-b border-gray-200">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="text-center">
                                <div className="text-lg font-bold text-blue-600">{chatStats.activeConversations}</div>
                                <div className="text-gray-600">Ativas</div>
                            </div>
                            <div className="text-center">
                                <div className="text-lg font-bold text-green-600">{chatStats.messagesToday}</div>
                                <div className="text-gray-600">Mensagens</div>
                            </div>
                        </div>
                    </div>

                    {/* Lista de Conversas */}
                    <div className="flex-1 overflow-y-auto">
                        {filteredConversations.map((conversation) => (
                            <div
                                key={conversation.id}
                                onClick={() => setSelectedConversation(conversation)}
                                className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                                    selectedConversation?.id === conversation.id ? 'bg-blue-50 border-blue-200' : ''
                                }`}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center space-x-2 mb-1">
                                            <h3 className="font-medium text-gray-900 truncate">
                                                {conversation.title}
                                            </h3>
                                            {conversation.unreadCount > 0 && (
                                                <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                                                    {conversation.unreadCount}
                                                </span>
                                            )}
                                        </div>
                                        
                                        <p className="text-sm text-gray-600 truncate mb-2">
                                            {conversation.lastMessage}
                                        </p>
                                        
                                        <div className="flex items-center space-x-2">
                                            <span className="text-xs text-gray-500">
                                                {formatDate(conversation.lastMessageTime)}
                                            </span>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(conversation.priority)}`}>
                                                {conversation.priority}
                                            </span>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(conversation.category)}`}>
                                                {conversation.category}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Área Principal - Chat */}
                <div className="flex-1 flex flex-col">
                    {selectedConversation ? (
                        <>
                            {/* Header da Conversa */}
                            <div className="bg-white border-b border-gray-200 p-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium">
                                            {selectedConversation.title.charAt(0)}
                                        </div>
                                        <div>
                                            <h2 className="font-semibold text-gray-900">
                                                {selectedConversation.title}
                                            </h2>
                                            <p className="text-sm text-gray-600">
                                                {selectedConversation.participants.join(', ')}
                                            </p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center space-x-2">
                                        <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
                                            <Phone className="w-5 h-5" />
                                        </button>
                                        <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
                                            <Video className="w-5 h-5" />
                                        </button>
                                        <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
                                            <MoreVertical className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Mensagens */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                {messages.map((message) => (
                                    <div
                                        key={message.id}
                                        className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                                            message.sender === 'user'
                                                ? 'bg-blue-500 text-white'
                                                : message.sender === 'agent'
                                                ? 'bg-gray-200 text-gray-900'
                                                : 'bg-green-100 text-gray-900'
                                        }`}>
                                            <div className="flex items-start space-x-2">
                                                {message.sender !== 'user' && (
                                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                                                        message.sender === 'agent' ? 'bg-blue-500 text-white' : 'bg-green-500 text-white'
                                                    }`}>
                                                        {message.sender === 'agent' ? 'A' : 'B'}
                                                    </div>
                                                )}
                                                <div className="flex-1">
                                                    <p className="text-sm">{message.content}</p>
                                                    <div className="flex items-center justify-between mt-1">
                                                        <span className="text-xs opacity-75">
                                                            {formatTime(message.timestamp)}
                                                        </span>
                                                        {message.sender === 'user' && (
                                                            <div className="flex items-center space-x-1">
                                                                {message.status === 'sent' && <Check className="w-3 h-3" />}
                                                                {message.status === 'delivered' && <CheckCheck className="w-3 h-3" />}
                                                                {message.status === 'read' && <CheckCheck className="w-3 h-3 text-blue-500" />}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                
                                {isTyping && (
                                    <div className="flex justify-start">
                                        <div className="bg-gray-200 text-gray-900 px-4 py-2 rounded-lg">
                                            <div className="flex items-center space-x-1">
                                                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                                                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Input de Mensagem */}
                            <div className="bg-white border-t border-gray-200 p-4">
                                <div className="flex items-center space-x-2">
                                    <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
                                        <Paperclip className="w-5 h-5" />
                                    </button>
                                    <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
                                        <Image className="w-5 h-5" />
                                    </button>
                                    <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
                                        <Smile className="w-5 h-5" />
                                    </button>
                                    
                                    <div className="flex-1">
                                        <textarea
                                            value={newMessage}
                                            onChange={(e) => setNewMessage(e.target.value)}
                                            onKeyPress={handleKeyPress}
                                            placeholder="Digite sua mensagem..."
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                            rows={1}
                                        />
                                    </div>
                                    
                                    <button
                                        onClick={handleSendMessage}
                                        disabled={!newMessage.trim()}
                                        className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <Send className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </>
                    ) : (
                        /* Tela Inicial */
                        <div className="flex-1 flex items-center justify-center">
                            <div className="text-center">
                                <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                                    Selecione uma conversa
                                </h2>
                                <p className="text-gray-600">
                                    Escolha uma conversa da lista para começar a conversar
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </ProtectedRoute>
    );
} 