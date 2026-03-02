'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Loader2, MessageCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/providers/toast-wrapper';
import { getToken } from '@/lib/auth';
import { ErrorBoundary } from '@/components/ui/error-boundary';

function SimuladorPageContent() {
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const toast = useToast();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    setInput('');
    setMessages((m) => [...m, { role: 'user', content: text }]);
    setLoading(true);

    try {
      const token = getToken();
      const res = await fetch('/api/tax/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          message: text,
          context: { grossRevenue: 600000, cnae: '79.11-2' },
        }),
      });
      const json = await res.json();
      if (json.success) {
        setMessages((m) => [...m, { role: 'assistant', content: json.data.response }]);
      } else throw new Error(json.error);
    } catch (e: unknown) {
      toast.error((e as Error).message || 'Erro ao processar');
      setMessages((m) => [
        ...m,
        { role: 'assistant', content: 'Desculpe, ocorreu um erro. Tente novamente.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Simulador Tributário</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            Pergunte em linguagem natural sobre Perse, Goyazes, deduções ou economia de impostos
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              Chat
            </CardTitle>
            <CardDescription>
              Ex: &quot;Quanto economizo com Perse?&quot; ou &quot;O que é o Goyazes?&quot;
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="min-h-[200px] sm:min-h-[300px] max-h-[50vh] sm:max-h-[400px] overflow-y-auto space-y-4 mb-4 p-2 border rounded-lg bg-white">
              {messages.length === 0 && (
                <p className="text-muted-foreground text-sm text-center py-8">
                  Faça uma pergunta sobre tributação, Perse, Goyazes ou deduções.
                </p>
              )}
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-lg px-3 py-2 ${
                      msg.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 rounded-lg px-3 py-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>
            <div className="flex gap-2 min-w-0">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                placeholder="Sua pergunta..."
                disabled={loading}
                className="min-w-0 flex-1"
              />
              <Button onClick={sendMessage} disabled={loading || !input.trim()}>
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function SimuladorPage() {
  return (
    <ErrorBoundary>
      <SimuladorPageContent />
    </ErrorBoundary>
  );
}
