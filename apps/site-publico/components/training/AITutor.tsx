'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Brain,
  MessageSquare,
  Send,
  Bot,
  User,
  Lightbulb,
  BookOpen,
  Play,
  Pause,
  Volume2,
  Settings,
  Zap,
  Target,
  TrendingUp,
  Star,
  Clock,
  CheckCircle
} from 'lucide-react';

const AITutor: React.FC = () => {
  const [currentMessage, setCurrentMessage] = useState('');
  const [selectedPersonality, setSelectedPersonality] = useState('friendly');
  const [isTyping, setIsTyping] = useState(false);

  // Dados mock para demonstração
  const personalities = [
    {
      id: 'friendly',
      name: 'Amigável',
      description: 'Tutor paciente e encorajador',
      icon: '😊',
      color: 'blue'
    },
    {
      id: 'expert',
      name: 'Especialista',
      description: 'Foco em detalhes técnicos',
      icon: '🎓',
      color: 'purple'
    },
    {
      id: 'motivational',
      name: 'Motivacional',
      description: 'Encoraja e motiva o aprendizado',
      icon: '🚀',
      color: 'green'
    }
  ];

  const chatHistory = [
    {
      id: 1,
      type: 'user',
      message: 'Como criar uma nova reserva no sistema?',
      timestamp: '10:30'
    },
    {
      id: 2,
      type: 'ai',
      message: 'Ótima pergunta! Para criar uma nova reserva, siga estes passos:\n\n1. Acesse o menu "Reservas" no painel lateral\n2. Clique em "Nova Reserva"\n3. Preencha os dados do cliente\n4. Selecione o pacote de viagem\n5. Defina as datas\n6. Confirme a reserva\n\nPosso te ajudar com algum passo específico?',
      timestamp: '10:31'
    },
    {
      id: 3,
      type: 'user',
      message: 'Como adicionar um novo cliente?',
      timestamp: '10:35'
    },
    {
      id: 4,
      type: 'ai',
      message: 'Para adicionar um novo cliente:\n\n1. Vá para "Clientes" no menu\n2. Clique em "Adicionar Cliente"\n3. Preencha as informações obrigatórias (nome, email, telefone)\n4. Adicione informações adicionais se necessário\n5. Salve o cliente\n\nDica: Você também pode adicionar um cliente diretamente ao criar uma reserva!',
      timestamp: '10:36'
    }
  ];

  const quickActions = [
    {
      id: 1,
      title: 'Como criar reserva',
      description: 'Guia passo a passo',
      icon: '📝'
    },
    {
      id: 2,
      title: 'Relatórios básicos',
      description: 'Entenda os relatórios',
      icon: '📊'
    },
    {
      id: 3,
      title: 'Configurações',
      description: 'Personalize o sistema',
      icon: '⚙️'
    },
    {
      id: 4,
      title: 'Troubleshooting',
      description: 'Resolva problemas comuns',
      icon: '🔧'
    }
  ];

  const handleSendMessage = () => {
    if (currentMessage.trim()) {
      setIsTyping(true);
      // Simular resposta da IA
      setTimeout(() => {
        setIsTyping(false);
        setCurrentMessage('');
      }, 2000);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Brain className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">24/7</p>
                <p className="text-sm text-gray-600">Disponível</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <MessageSquare className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold">98%</p>
                <p className="text-sm text-gray-600">Satisfação</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Zap className="w-8 h-8 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">2.3s</p>
                <p className="text-sm text-gray-600">Tempo Resposta</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Star className="w-8 h-8 text-yellow-600" />
              <div>
                <p className="text-2xl font-bold">4.9</p>
                <p className="text-sm text-gray-600">Avaliação</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chat Interface */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Bot className="w-6 h-6 text-blue-600" />
                  <div>
                    <CardTitle>AI Tutor - Sistema RSV</CardTitle>
                    <CardDescription>
                      Seu assistente pessoal de aprendizado
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Online</span>
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Chat Messages */}
              <div className="h-96 overflow-y-auto space-y-4 mb-4 p-4 bg-gray-50 rounded-lg">
                {chatHistory.map((message) => (
                  <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      message.type === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white border shadow-sm'
                    }`}>
                      <div className="flex items-start space-x-2">
                        {message.type === 'ai' && (
                          <Bot className="w-4 h-4 mt-1 text-blue-600 flex-shrink-0" />
                        )}
                        <div className="flex-1">
                          <p className="text-sm whitespace-pre-line">{message.message}</p>
                          <p className={`text-xs mt-1 ${
                            message.type === 'user' ? 'text-blue-100' : 'text-gray-500'
                          }`}>
                            {message.timestamp}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-white border shadow-sm px-4 py-2 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Bot className="w-4 h-4 text-blue-600" />
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Message Input */}
              <div className="flex space-x-2">
                <Input
                  value={currentMessage}
                  onChange={(e) => setCurrentMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Digite sua pergunta sobre o sistema RSV..."
                  className="flex-1"
                />
                <Button onClick={handleSendMessage} disabled={!currentMessage.trim() || isTyping}>
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Personality Selector */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="w-5 h-5 text-gray-600" />
                <span>Personalidade do Tutor</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {personalities.map((personality) => (
                  <div
                    key={personality.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedPersonality === personality.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedPersonality(personality.id)}
                  >
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{personality.icon}</span>
                      <div>
                        <p className="font-medium text-sm">{personality.name}</p>
                        <p className="text-xs text-gray-600">{personality.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Lightbulb className="w-5 h-5 text-yellow-600" />
                <span>Ações Rápidas</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {quickActions.map((action) => (
                  <Button
                    key={action.id}
                    variant="outline"
                    className="w-full justify-start h-auto p-3"
                    onClick={() => setCurrentMessage(action.title)}
                  >
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{action.icon}</span>
                      <div className="text-left">
                        <p className="font-medium text-sm">{action.title}</p>
                        <p className="text-xs text-gray-600">{action.description}</p>
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                <span>Suas Estatísticas</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Perguntas Hoje</span>
                  <span className="font-semibold">12</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Sessões Esta Semana</span>
                  <span className="font-semibold">5</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Tempo Médio</span>
                  <span className="font-semibold">8 min</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Problemas Resolvidos</span>
                  <span className="font-semibold">24</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AITutor;
