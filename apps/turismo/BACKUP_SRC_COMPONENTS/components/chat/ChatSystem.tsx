'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Card, Button, Input, Badge, Tabs, Avatar, ScrollArea } from '@/components/ui';
import { Send, Plus, Users, Settings, Search, MoreVertical, Phone, Video, FileText, Image, Smile } from 'lucide-react';
import { toast } from 'sonner';

interface ChatMessage {
  id: string;
  content: string;
  sender: {
    id: string;
    name: string;
    avatar: string;
    role: string;
  };
  timestamp: Date;
  type: 'text' | 'file' | 'image' | 'system';
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
}

interface ChatRoom {
  id: string;
  name: string;
  type: 'direct' | 'group' | 'channel';
  participants: Array<{
    id: string;
    name: string;
    avatar: string;
    role: string;
    status: 'online' | 'offline' | 'away' | 'busy';
  }>;
  lastMessage?: ChatMessage;
  unreadCount: number;
  isActive: boolean;
}

interface ChatSystemProps {
  currentUserId: string;
}

export default function ChatSystem({ currentUserId }: ChatSystemProps) {
  const [rooms, setRooms] = useState<ChatRoom[]>([
    {
      id: '1',
      name: 'Equipe Geral',
      type: 'channel',
      participants: [
        { id: '1', name: 'João Silva', avatar: '/avatars/joao.jpg', role: 'Admin', status: 'online' },
        { id: '2', name: 'Maria Santos', avatar: '/avatars/maria.jpg', role: 'Manager', status: 'online' },
        { id: '3', name: 'Pedro Costa', avatar: '/avatars/pedro.jpg', role: 'Operator', status: 'away' },
      ],
      unreadCount: 3,
      isActive: true,
    },
    {
      id: '2',
      name: 'Suporte Técnico',
      type: 'group',
      participants: [
        { id: '1', name: 'João Silva', avatar: '/avatars/joao.jpg', role: 'Admin', status: 'online' },
        { id: '4', name: 'Ana Tech', avatar: '/avatars/ana.jpg', role: 'Support', status: 'online' },
      ],
      unreadCount: 0,
      isActive: false,
    },
  ]);

  const [activeRoom, setActiveRoom] = useState<ChatRoom | null>(rooms[0]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showParticipants, setShowParticipants] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Simular mensagens iniciais
  useEffect(() => {
    if (activeRoom) {
      const mockMessages: ChatMessage[] = [
        {
          id: '1',
          content: 'Bom dia equipe! Como estão os preparativos para o evento?',
          sender: { id: '1', name: 'João Silva', avatar: '/avatars/joao.jpg', role: 'Admin' },
          timestamp: new Date(Date.now() - 3600000),
          type: 'text',
        },
        {
          id: '2',
          content: 'Tudo certo por aqui! Reservas confirmadas e clientes notificados.',
          sender: { id: '2', name: 'Maria Santos', avatar: '/avatars/maria.jpg', role: 'Manager' },
          timestamp: new Date(Date.now() - 1800000),
          type: 'text',
        },
        {
          id: '3',
          content: 'Relatório de vendas enviado para análise.',
          sender: { id: '3', name: 'Pedro Costa', avatar: '/avatars/pedro.jpg', role: 'Operator' },
          timestamp: new Date(Date.now() - 900000),
          type: 'text',
        },
      ];
      setMessages(mockMessages);
    }
  }, [activeRoom]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !activeRoom) return;

    const message: ChatMessage = {
      id: Date.now().toString(),
      content: newMessage,
      sender: {
        id: currentUserId,
        name: 'Você',
        avatar: '/avatars/current.jpg',
        role: 'User',
      },
      timestamp: new Date(),
      type: 'text',
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');

    // Simular resposta automática
    setTimeout(() => {
      const autoReply: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: 'Mensagem recebida! Responderemos em breve.',
        sender: {
          id: 'system',
          name: 'Sistema',
          avatar: '/avatars/system.jpg',
          role: 'System',
        },
        timestamp: new Date(),
        type: 'system',
      };
      setMessages(prev => [...prev, autoReply]);
    }, 1000);

    toast.success('Mensagem enviada!');
  };

  const handleRoomSelect = (room: ChatRoom) => {
    setActiveRoom(room);
    setRooms(prev => prev.map(r => ({ ...r, isActive: r.id === room.id })));
  };

  const filteredRooms = rooms.filter(room =>
    room.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const message: ChatMessage = {
        id: Date.now().toString(),
        content: `Arquivo enviado: ${file.name}`,
        sender: {
          id: currentUserId,
          name: 'Você',
          avatar: '/avatars/current.jpg',
          role: 'User',
        },
        timestamp: new Date(),
        type: 'file',
        fileName: file.name,
        fileSize: file.size,
        fileUrl: URL.createObjectURL(file),
      };
      setMessages(prev => [...prev, message]);
      toast.success('Arquivo enviado!');
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar com salas */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Chat Interno</h2>
          <p className="text-sm text-gray-500">Comunicação em tempo real</p>
        </div>

        {/* Busca */}
        <div className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar salas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Lista de salas */}
        <ScrollArea className="flex-1">
          <div className="p-2">
            {filteredRooms.map((room) => (
              <div
                key={room.id}
                onClick={() => handleRoomSelect(room)}
                className={`p-3 rounded-lg cursor-pointer transition-colors ${
                  room.isActive
                    ? 'bg-blue-50 border border-blue-200'
                    : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <Avatar className="h-10 w-10">
                        <img src={room.participants[0]?.avatar} alt={room.name} />
                      </Avatar>
                      {room.type === 'direct' && room.participants[0]?.status === 'online' && (
                        <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-green-500 rounded-full border-2 border-white" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{room.name}</h3>
                      <p className="text-sm text-gray-500">
                        {room.type === 'direct' ? 'Chat privado' : `${room.participants.length} participantes`}
                      </p>
                    </div>
                  </div>
                  {room.unreadCount > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      {room.unreadCount}
                    </Badge>
                  )}
                </div>
                {room.lastMessage && (
                  <p className="text-sm text-gray-500 mt-1 truncate">
                    {room.lastMessage.content}
                  </p>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Botão nova sala */}
        <div className="p-4 border-t border-gray-200">
          <Button className="w-full" onClick={() => toast.info('Funcionalidade em desenvolvimento')}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Sala
          </Button>
        </div>
      </div>

      {/* Área principal do chat */}
      <div className="flex-1 flex flex-col">
        {activeRoom ? (
          <>
            {/* Header da sala */}
            <div className="bg-white border-b border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-10 w-10">
                    <img src={activeRoom.participants[0]?.avatar} alt={activeRoom.name} />
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-gray-900">{activeRoom.name}</h3>
                    <p className="text-sm text-gray-500">
                      {activeRoom.type === 'direct' ? 'Chat privado' : `${activeRoom.participants.length} participantes`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm" onClick={() => setShowParticipants(!showParticipants)}>
                    <Users className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Phone className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Video className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Área de mensagens */}
            <div className="flex-1 flex">
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender.id === currentUserId ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-xs lg:max-w-md ${message.sender.id === currentUserId ? 'order-2' : 'order-1'}`}>
                        {message.sender.id !== currentUserId && (
                          <div className="flex items-center space-x-2 mb-1">
                            <Avatar className="h-6 w-6">
                              <img src={message.sender.avatar} alt={message.sender.name} />
                            </Avatar>
                            <span className="text-sm font-medium text-gray-700">{message.sender.name}</span>
                            <span className="text-xs text-gray-500">
                              {message.timestamp.toLocaleTimeString()}
                            </span>
                          </div>
                        )}
                        <div
                          className={`rounded-lg p-3 ${
                            message.sender.id === currentUserId
                              ? 'bg-blue-600 text-white'
                              : message.type === 'system'
                              ? 'bg-gray-100 text-gray-700'
                              : 'bg-white border border-gray-200 text-gray-900'
                          }`}
                        >
                          {message.type === 'file' ? (
                            <div className="flex items-center space-x-2">
                              <FileText className="h-4 w-4" />
                              <span>{message.fileName}</span>
                              <span className="text-xs opacity-75">
                                ({(message.fileSize! / 1024).toFixed(1)} KB)
                              </span>
                            </div>
                          ) : (
                            <p>{message.content}</p>
                          )}
                        </div>
                        {message.sender.id === currentUserId && (
                          <div className="text-right mt-1">
                            <span className="text-xs text-gray-500">
                              {message.timestamp.toLocaleTimeString()}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Sidebar de participantes */}
              {showParticipants && (
                <div className="w-64 bg-gray-50 border-l border-gray-200 p-4">
                  <h4 className="font-medium text-gray-900 mb-4">Participantes</h4>
                  <div className="space-y-3">
                    {activeRoom.participants.map((participant) => (
                      <div key={participant.id} className="flex items-center space-x-3">
                        <div className="relative">
                          <Avatar className="h-8 w-8">
                            <img src={participant.avatar} alt={participant.name} />
                          </Avatar>
                          <div
                            className={`absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-white ${
                              participant.status === 'online'
                                ? 'bg-green-500'
                                : participant.status === 'away'
                                ? 'bg-yellow-500'
                                : participant.status === 'busy'
                                ? 'bg-red-500'
                                : 'bg-gray-400'
                            }`}
                          />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{participant.name}</p>
                          <p className="text-xs text-gray-500">{participant.role}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Input de mensagem */}
            <div className="bg-white border-t border-gray-200 p-4">
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm" onClick={() => document.getElementById('file-upload')?.click()}>
                  <FileText className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Image className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Smile className="h-4 w-4" />
                </Button>
                <input
                  id="file-upload"
                  type="file"
                  className="hidden"
                  onChange={handleFileUpload}
                  accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                  aria-label="Upload de arquivo"
                />
                <Input
                  placeholder="Digite sua mensagem..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="flex-1"
                />
                <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Selecione uma sala</h3>
              <p className="text-gray-500">Escolha uma sala para começar a conversar</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
