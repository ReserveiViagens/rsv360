'use client';

import { useEffect, useRef, useState } from 'react';
import { Send, X, Bot } from 'lucide-react';
import { io, type Socket } from 'socket.io-client';
import {
  useEnviarChatProposta,
  usePropostaChat,
  useSolicitarHitl,
  getPropostaWsUrl,
} from '@/hooks/usePropostas';
import type { PropostaChatMessage } from '@/lib/fase1-types';
import { Button } from '@/components/ui/button';

interface ConciergeModalProps {
  open: boolean;
  onClose: () => void;
  propostaId: number;
  clientName?: string;
}

export function ConciergeModal({ open, onClose, propostaId, clientName }: ConciergeModalProps) {
  const [message, setMessage] = useState('');
  const [liveMessages, setLiveMessages] = useState<PropostaChatMessage[]>([]);
  const socketRef = useRef<Socket | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const { data: chatRes } = usePropostaChat(open ? propostaId : undefined);
  const enviarChat = useEnviarChatProposta();
  const solicitarHitl = useSolicitarHitl();

  useEffect(() => {
    if (chatRes?.data) setLiveMessages(chatRes.data);
  }, [chatRes?.data]);

  useEffect(() => {
    if (!open || !propostaId) return;
    const wsBase = getPropostaWsUrl();
    const socket = io(`${wsBase}/propostas`, { path: '/socket.io', transports: ['websocket', 'polling'] });
    socketRef.current = socket;
    socket.emit('join', { propostaId, guestName: clientName });
    socket.on('joined', (payload: { history?: PropostaChatMessage[] }) => {
      if (payload.history?.length) setLiveMessages(payload.history);
    });
    socket.on('chat:message', (msg: PropostaChatMessage) => {
      setLiveMessages((prev) => [...prev, msg]);
    });
    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [open, propostaId, clientName]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [liveMessages]);

  useEffect(() => {
    if (!open) return;
    const onEsc = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onEsc);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onEsc);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    const text = message.trim();
    setMessage('');
    try {
      await enviarChat.mutateAsync({
        id: propostaId,
        message: text,
        senderName: clientName,
        senderType: 'client',
      });
    } catch {
      setLiveMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          propostaId,
          senderType: 'client',
          senderName: clientName ?? 'Você',
          message: text,
          createdAt: new Date().toISOString(),
        },
      ]);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative flex h-[85vh] w-full max-w-lg flex-col rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl sm:h-[70vh]">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" />
            <div>
              <p className="font-semibold">Concierge CaldasAI</p>
              <p className="text-xs text-muted-foreground">Assistente inteligente Reservei</p>
            </div>
          </div>
          <button type="button" onClick={onClose} aria-label="Fechar">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {liveMessages.length === 0 && (
            <p className="rounded-lg bg-blue-50 p-3 text-sm text-blue-900">
              Olá{clientName ? `, ${clientName.split(' ')[0]}` : ''}! Sou o Concierge CaldasAI. Posso ajudar
              com restaurantes, transporte e dicas do roteiro.
            </p>
          )}
          {liveMessages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.senderType === 'client' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm ${
                  msg.senderType === 'client'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                {msg.message}
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        <div className="border-t p-3 space-y-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => solicitarHitl.mutate({ id: propostaId, clientName })}
          >
            Falar com atendente humano
          </Button>
          <form onSubmit={handleSend} className="flex gap-2">
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Digite sua mensagem..."
              className="flex-1 rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <Button type="submit" size="icon" disabled={enviarChat.isPending}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
