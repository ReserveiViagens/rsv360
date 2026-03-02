/**
 * ✅ TAREFA LOW-2: Componente de chat para busca conversacional com AI
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Bot, User, Send, Loader2, Trash2, Sparkles } from '@/lib/lucide-icons';
import { toast } from 'sonner';
import { type ChatMessage, type SearchContext } from '@/lib/ai-search-service';

interface AISearchChatProps {
  initialContext?: SearchContext;
  onSearchResult?: (query: string, results: any[]) => void;
}

export function AISearchChat({ initialContext, onSearchResult }: AISearchChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [context, setContext] = useState<SearchContext | undefined>(initialContext);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Mensagem inicial
    setMessages([
      {
        role: 'assistant',
        content: 'Olá! Sou seu assistente de busca inteligente. Como posso ajudá-lo a encontrar a hospedagem perfeita?',
        timestamp: new Date(),
      },
    ]);
  }, []);

  useEffect(() => {
    // Scroll para o final quando novas mensagens chegarem
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/ai-search/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage.content,
          context,
        }),
      });

      const data = await response.json();

      if (data.success) {
        const assistantMessage: ChatMessage = {
          role: 'assistant',
          content: data.data.response,
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, assistantMessage]);

        // Se há uma query de busca, executar busca
        if (data.data.searchQuery && onSearchResult) {
          const searchResponse = await fetch('/api/ai-search/search', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              query: data.data.searchQuery,
              context,
            }),
          });

          const searchData = await searchResponse.json();
          if (searchData.success && searchData.data.results) {
            onSearchResult(data.data.searchQuery, searchData.data.results);
          }
        }
      } else {
        toast.error(data.error || 'Erro ao processar mensagem');
      }
    } catch (error: any) {
      toast.error('Erro ao enviar mensagem');
      console.error(error);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const clearHistory = async () => {
    try {
      const response = await fetch('/api/ai-search/history', {
        method: 'DELETE',
      });

      if (response.ok) {
        setMessages([
          {
            role: 'assistant',
            content: 'Histórico limpo! Como posso ajudá-lo agora?',
            timestamp: new Date(),
          },
        ]);
        toast.success('Histórico limpo');
      }
    } catch (error) {
      console.error('Erro ao limpar histórico:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <Card className="flex flex-col h-[600px]">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-500" />
            <div>
              <CardTitle>Assistente de Busca IA</CardTitle>
              <CardDescription>
                Encontre a hospedagem perfeita através de conversas naturais
              </CardDescription>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearHistory}
            title="Limpar histórico"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-0">
        {/* Área de mensagens */}
        <ScrollArea className="flex-1 px-4">
          <div className="space-y-4 py-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex gap-3 ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {message.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.role === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-800'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  {message.timestamp && (
                    <p
                      className={`text-xs mt-1 ${
                        message.role === 'user'
                          ? 'text-blue-100'
                          : 'text-muted-foreground'
                      }`}
                    >
                      {formatTime(message.timestamp)}
                    </p>
                  )}
                </div>
                {message.role === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
            {loading && (
              <div className="flex gap-3 justify-start">
                <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3">
                  <Loader2 className="w-4 h-4 animate-spin" />
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Contexto atual */}
        {context && (
          <div className="px-4 py-2 border-t bg-gray-50 dark:bg-gray-900">
            <div className="flex items-center gap-2 flex-wrap text-xs">
              <span className="font-medium">Contexto:</span>
              {context.location && (
                <Badge variant="outline">{context.location}</Badge>
              )}
              {context.dates && (
                <Badge variant="outline">
                  {context.dates.checkIn} - {context.dates.checkOut}
                </Badge>
              )}
              {context.guests && (
                <Badge variant="outline">{context.guests} hóspedes</Badge>
              )}
              {context.budget && (
                <Badge variant="outline">
                  R$ {context.budget.min} - R$ {context.budget.max}
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="p-4 border-t">
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Digite sua mensagem..."
              disabled={loading}
              className="flex-1"
            />
            <Button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Pressione Enter para enviar
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

