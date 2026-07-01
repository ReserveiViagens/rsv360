'use client';

import { useEffect } from 'react';
import { io } from 'socket.io-client';
import { getPropostaWsUrl } from '@/hooks/usePropostas';

interface UsePropostaExpiradaSocketOptions {
  propostaId: number;
  token: string;
  onExpirada: () => void;
}

/** Escuta proposta:expirada na sala proposta:<token> (PR 13 worker). */
export function usePropostaExpiradaSocket({
  propostaId,
  token,
  onExpirada,
}: UsePropostaExpiradaSocketOptions) {
  useEffect(() => {
    const wsBase = getPropostaWsUrl();
    if (!wsBase || !propostaId || !token) return;

    const socket = io(`${wsBase}/propostas`, {
      path: '/socket.io',
      transports: ['websocket', 'polling'],
    });

    socket.emit('join', { propostaId, tokenPublico: token });

    const handleExpirada = (payload: { token?: string; type?: string }) => {
      if (payload?.token && payload.token !== token) return;
      onExpirada();
    };

    socket.on('proposta:expirada', handleExpirada);

    return () => {
      socket.off('proposta:expirada', handleExpirada);
      socket.disconnect();
    };
  }, [propostaId, token, onExpirada]);
}
