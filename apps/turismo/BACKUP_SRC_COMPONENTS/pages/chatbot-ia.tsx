'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import {
  MessageCircle,
  Send,
  Bot,
  User,
  Mic,
  MicOff,
  Settings,
  Minimize2,
  Maximize2,
  RotateCcw,
  Clock,
  Star,
  MapPin,
  Phone,
  Download,
  Share,
  Copy,
  ThumbsUp,
  ThumbsDown,
  Brain,
  Zap,
  Heart,
  Eye,
  Volume2,
  VolumeX
} from 'lucide-react';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  intent?: string;
  confidence?: number;
  actions?: Array<{
    type: string;
    data?: any;
    message?: string;
  }>;
  suggestions?: string[];
  loading?: boolean;
}

interface ChatbotStats {
  totalConversations: number;
  avgConfidence: number;
  avgProcessingTime: number;
  recentActivity24h: number;
}

const INITIAL_BOT_MESSAGE: Message = {
  id: 'welcome',
  text: 'Olá! 👋 Sou o assistente virtual da RSV 360. Posso ajudá-lo com reservas, informações sobre hotéis, preços e muito mais! Como posso ajudar você hoje?',
  sender: 'bot',
  timestamp: new Date(),
  suggestions: [
    'Quero fazer uma reserva',
    'Ver hotéis disponíveis',
    'Preciso de ajuda',
    'Falar com atendente'
  ]
};

export default function ChatbotIA() {
  const [messages, setMessages] = useState<Message[]>([INITIAL_BOT_MESSAGE]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [stats, setStats] = useState<ChatbotStats | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  // Auto scroll para a última mensagem
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Inicializar reconhecimento de voz
  useEffect(() => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const recognition = new (window as any).webkitSpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'pt-BR';

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputText(transcript);
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  // Enviar mensagem
  const sendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    // Simular resposta do chatbot
    try {
      const response = await simulateChatbotResponse(inputText, conversationId);

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response.response,
        sender: 'bot',
        timestamp: new Date(),
        intent: response.intent,
        confidence: response.confidence,
        actions: response.actions,
        suggestions: response.suggestions
      };

      setMessages(prev => [...prev, botMessage]);

      if (response.conversationId && !conversationId) {
        setConversationId(response.conversationId);
      }

      // Text-to-speech se não estiver mutado
      if (!isMuted && response.response) {
        speakText(response.response);
      }

    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Desculpe, houve um problema. Posso transferir você para um atendente humano.',
        sender: 'bot',
        timestamp: new Date(),
        suggestions: ['Falar com atendente', 'Tentar novamente']
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Simular resposta do chatbot (mock)
  const simulateChatbotResponse = async (message: string, convId: string | null) => {
    // Simular delay de processamento
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

    const normalizedMessage = message.toLowerCase();

    // Lógica simples de detecção de intenção
    if (normalizedMessage.includes('reserva') || normalizedMessage.includes('reservar')) {
      return {
        response: 'Ótimo! Posso ajudá-lo a fazer uma reserva. 🏨 Para qual destino você gostaria de viajar e quais as datas?',
        intent: 'booking_inquiry',
        confidence: 0.9,
        actions: [
          { type: 'show_booking_form', message: 'Formulário de reserva' }
        ],
        suggestions: ['Rio de Janeiro', 'São Paulo', 'Salvador', 'Ver todos os destinos'],
        conversationId: convId || `conv_${Date.now()}`
      };
    }

    if (normalizedMessage.includes('preço') || normalizedMessage.includes('valor')) {
      return {
        response: 'Nossos preços variam conforme destino e datas! 💰 Temos opções de R$ 150 a R$ 2.500 por noite. Quer que eu busque preços específicos?',
        intent: 'price_inquiry',
        confidence: 0.85,
        actions: [],
        suggestions: ['Destinos econômicos', 'Ofertas especiais', 'Comparar preços'],
        conversationId: convId || `conv_${Date.now()}`
      };
    }

    if (normalizedMessage.includes('ajuda') || normalizedMessage.includes('suporte')) {
      return {
        response: 'Claro! Estou aqui para ajudar. 🆘 Posso resolver dúvidas sobre reservas, hotéis, pagamentos. Se precisar de algo mais específico, posso conectar você com nossa equipe.',
        intent: 'support_request',
        confidence: 0.8,
        actions: [
          { type: 'escalate_support', message: 'Falar com atendente humano' }
        ],
        suggestions: ['FAQ', 'Falar com atendente', 'Cancelar reserva', 'Alterar reserva'],
        conversationId: convId || `conv_${Date.now()}`
      };
    }

    if (normalizedMessage.includes('hotel') || normalizedMessage.includes('hotéis')) {
      return {
        response: 'Temos uma seleção incrível de hotéis! 🌟 Desde pousadas charmosas até resorts de luxo. Que tipo de acomodação você prefere?',
        intent: 'hotel_inquiry',
        confidence: 0.9,
        actions: [
          {
            type: 'show_hotels',
            data: [
              { name: 'Resort Paradise', location: 'Cancún', rating: 4.8 },
              { name: 'Hotel Boutique', location: 'Porto de Galinhas', rating: 4.6 },
              { name: 'Pousada Natureza', location: 'Chapada Diamantina', rating: 4.4 }
            ]
          }
        ],
        suggestions: ['Resorts de luxo', 'Hotéis econômicos', 'Pousadas', 'Ver todos'],
        conversationId: convId || `conv_${Date.now()}`
      };
    }

    // Resposta padrão
    return {
      response: 'Interessante! Posso ajudar com reservas, informações sobre hotéis, preços e destinos. 🌎 O que você gostaria de saber especificamente?',
      intent: 'general_inquiry',
      confidence: 0.6,
      actions: [],
      suggestions: ['Fazer reserva', 'Ver hotéis', 'Consultar preços', 'Falar com atendente'],
      conversationId: convId || `conv_${Date.now()}`
    };
  };

  // Text-to-speech
  const speakText = (text: string) => {
    if ('speechSynthesis' in window && !isMuted) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'pt-BR';
      utterance.rate = 0.9;
      utterance.pitch = 1;
      speechSynthesis.speak(utterance);
    }
  };

  // Iniciar reconhecimento de voz
  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  // Parar reconhecimento de voz
  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  // Usar sugestão
  const useSuggestion = (suggestion: string) => {
    setInputText(suggestion);
    inputRef.current?.focus();
  };

  // Reiniciar conversa
  const resetConversation = () => {
    setMessages([INITIAL_BOT_MESSAGE]);
    setConversationId(null);
    setInputText('');
  };

  // Dar feedback
  const giveFeedback = (messageId: string, type: 'positive' | 'negative') => {
    console.log(`Feedback ${type} para mensagem ${messageId}`);
    // Em produção, enviaria para API
  };

  // Copiar conversa
  const copyConversation = () => {
    const conversationText = messages
      .map(msg => `${msg.sender === 'user' ? 'Você' : 'Assistente'}: ${msg.text}`)
      .join('\n');

    navigator.clipboard.writeText(conversationText);
  };

  // Compartilhar conversa
  const shareConversation = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Conversa com Assistente RSV 360',
        text: messages[messages.length - 1]?.text || 'Conversa com assistente virtual'
      });
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
              <Bot className="h-8 w-8 mr-3 text-blue-600" />
              🤖 Chatbot com IA
            </h1>
            <p className="text-gray-600">
              Assistente virtual inteligente para reservas e atendimento
            </p>
          </div>

          <div className="flex gap-2 mt-4 lg:mt-0">
            <Button
              onClick={resetConversation}
              variant="outline"
              size="sm"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Nova Conversa
            </Button>

            <Button
              onClick={copyConversation}
              variant="outline"
              size="sm"
            >
              <Copy className="h-4 w-4 mr-2" />
              Copiar
            </Button>

            <Button
              onClick={shareConversation}
              variant="outline"
              size="sm"
            >
              <Share className="h-4 w-4 mr-2" />
              Compartilhar
            </Button>
          </div>
        </div>

        {/* Status do IA */}
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Brain className="h-6 w-6 text-blue-600" />
                <div>
                  <p className="font-medium text-blue-900">IA Conversacional Ativa</p>
                  <p className="text-sm text-blue-700">
                    Processamento de linguagem natural • Reconhecimento de voz • Síntese de fala
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge className="bg-green-100 text-green-800">
                  <Zap className="h-3 w-3 mr-1" />
                  Online
                </Badge>
                {conversationId && (
                  <Badge variant="outline" className="text-xs">
                    ID: {conversationId.slice(-8)}
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Chat Interface */}
        <Card className="h-[600px] flex flex-col">
          <CardHeader className="flex-shrink-0 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Bot className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">Assistente RSV 360</CardTitle>
                  <CardDescription className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    Online • Respondendo em tempo real
                  </CardDescription>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsMuted(!isMuted)}
                >
                  {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsMinimized(!isMinimized)}
                >
                  {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </CardHeader>

          {!isMinimized && (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[80%] ${message.sender === 'user' ? 'order-2' : 'order-1'}`}>
                      {/* Avatar */}
                      <div className={`flex items-start space-x-3 ${message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                          message.sender === 'user'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {message.sender === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                        </div>

                        {/* Message Content */}
                        <div className="space-y-2">
                          <div className={`rounded-lg p-3 ${
                            message.sender === 'user'
                              ? 'bg-blue-600 text-white'
                              : 'bg-white border shadow-sm'
                          }`}>
                            <p className="text-sm">{message.text}</p>

                            {/* Message Meta */}
                            <div className={`flex items-center justify-between mt-2 text-xs ${
                              message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'
                            }`}>
                              <span className="flex items-center">
                                <Clock className="h-3 w-3 mr-1" />
                                {formatTime(message.timestamp)}
                              </span>

                              {message.intent && message.confidence && (
                                <span className={`${message.sender === 'user' ? 'text-blue-100' : getConfidenceColor(message.confidence)}`}>
                                  {message.intent} ({Math.round(message.confidence * 100)}%)
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Actions */}
                          {message.actions && message.actions.length > 0 && (
                            <div className="space-y-2">
                              {message.actions.map((action, index) => (
                                <div key={index} className="bg-gray-50 border rounded-lg p-3">
                                  {action.type === 'show_hotels' && action.data && (
                                    <div className="space-y-2">
                                      <p className="font-medium text-sm">Hotéis encontrados:</p>
                                      {action.data.map((hotel: any, hotelIndex: number) => (
                                        <div key={hotelIndex} className="flex items-center justify-between p-2 bg-white rounded border">
                                          <div>
                                            <p className="font-medium">{hotel.name}</p>
                                            <div className="flex items-center text-sm text-gray-600">
                                              <MapPin className="h-3 w-3 mr-1" />
                                              {hotel.location}
                                              <Star className="h-3 w-3 ml-2 mr-1 text-yellow-500" />
                                              {hotel.rating}
                                            </div>
                                          </div>
                                          <Button size="sm">
                                            <Eye className="h-3 w-3 mr-1" />
                                            Ver
                                          </Button>
                                        </div>
                                      ))}
                                    </div>
                                  )}

                                  {action.type === 'escalate_support' && (
                                    <div className="flex items-center justify-between">
                                      <p className="text-sm">{action.message}</p>
                                      <Button size="sm">
                                        <Phone className="h-3 w-3 mr-1" />
                                        Conectar
                                      </Button>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Suggestions */}
                          {message.suggestions && message.suggestions.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {message.suggestions.map((suggestion, index) => (
                                <Button
                                  key={index}
                                  variant="outline"
                                  size="sm"
                                  onClick={() => useSuggestion(suggestion)}
                                  className="text-xs"
                                >
                                  {suggestion}
                                </Button>
                              ))}
                            </div>
                          )}

                          {/* Feedback (apenas para mensagens do bot) */}
                          {message.sender === 'bot' && message.id !== 'welcome' && (
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => giveFeedback(message.id, 'positive')}
                                className="text-xs"
                              >
                                <ThumbsUp className="h-3 w-3 mr-1" />
                                Útil
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => giveFeedback(message.id, 'negative')}
                                className="text-xs"
                              >
                                <ThumbsDown className="h-3 w-3 mr-1" />
                                Não útil
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Loading indicator */}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                        <Bot className="h-4 w-4 text-gray-600" />
                      </div>
                      <div className="bg-white border rounded-lg p-3">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="flex-shrink-0 border-t p-4">
                <div className="flex items-center space-x-2">
                  <div className="flex-1 relative">
                    <Input
                      ref={inputRef}
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                      placeholder="Digite sua mensagem..."
                      disabled={isLoading}
                      className="pr-12"
                    />

                    {/* Voice button */}
                    {recognitionRef.current && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-1/2 transform -translate-y-1/2"
                        onClick={isListening ? stopListening : startListening}
                        disabled={isLoading}
                      >
                        {isListening ? (
                          <MicOff className="h-4 w-4 text-red-500" />
                        ) : (
                          <Mic className="h-4 w-4" />
                        )}
                      </Button>
                    )}
                  </div>

                  <Button
                    onClick={sendMessage}
                    disabled={!inputText.trim() || isLoading}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>

                {isListening && (
                  <p className="text-xs text-blue-600 mt-2 flex items-center">
                    <Mic className="h-3 w-3 mr-1 animate-pulse" />
                    Ouvindo... Fale agora!
                  </p>
                )}
              </div>
            </>
          )}
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Conversas Hoje</p>
                  <p className="text-2xl font-bold">1.2K</p>
                </div>
                <MessageCircle className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Precisão da IA</p>
                  <p className="text-2xl font-bold">94%</p>
                </div>
                <Brain className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Tempo Resposta</p>
                  <p className="text-2xl font-bold">1.2s</p>
                </div>
                <Zap className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Satisfação</p>
                  <p className="text-2xl font-bold">98%</p>
                </div>
                <Heart className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
