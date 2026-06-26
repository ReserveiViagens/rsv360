import type { Server, Socket } from 'socket.io';
import { propostasService } from '../services/propostas.service';
import { parceiroRoomName } from './proposta-broadcast';

const { verifyAccessToken } = require('../../../../backend/src/api/v1/auth/jwt-verify');

function getJwtSecret(): string {
  return process.env.JWT_SECRET || 'REDACTED_JWT_SECRET';
}

function verifySocketToken(token?: string) {
  if (!token) return null;
  const payload = verifyAccessToken(token, getJwtSecret());
  if (!payload?.userId) return null;
  return {
    id: Number(payload.userId),
    name: payload.name as string | undefined,
    role: payload.role as string | undefined,
    email: payload.email as string | undefined,
  };
}

function roomName(propostaId: number) {
  return `proposta:${propostaId}`;
}

async function handleChatMessage(
  io: Server,
  propostaId: number,
  input: { senderType: string; senderName?: string; message: string },
) {
  const saved = await propostasService.addChatMessage(propostaId, input);
  io.of('/propostas').to(roomName(propostaId)).emit('chat:message', {
    propostaId,
    message: saved,
  });
  return saved;
}

export function registerPropostaChatSocket(io: Server) {
  const nsp = io.of('/propostas');

  nsp.on('connection', (socket: Socket) => {
    socket.on('join', async (payload: { propostaId: number; token?: string; guestName?: string }) => {
      try {
        const propostaId = Number(payload?.propostaId);
        if (!propostaId) {
          socket.emit('error', { message: 'propostaId obrigatório' });
          return;
        }

        const user = verifySocketToken(payload.token);
        socket.data.propostaId = propostaId;
        socket.data.user = user;
        socket.data.guestName = payload.guestName;
        socket.join(roomName(propostaId));

        const hitl = await propostasService.getHitlState(propostaId);
        const history = await propostasService.listChat(propostaId);

        socket.emit('joined', { propostaId, hitl, history });
      } catch (error) {
        socket.emit('error', { message: (error as Error).message });
      }
    });

    socket.on(
      'chat:message',
      async (payload: { propostaId: number; message: string; senderType?: string; senderName?: string }) => {
        try {
          const propostaId = Number(payload.propostaId);
          const user = socket.data.user as { id: number; name?: string; role?: string } | undefined;
          const senderType =
            payload.senderType ?? (user ? (user.role === 'user' ? 'client' : 'agent') : 'client');
          const senderName =
            payload.senderName ?? user?.name ?? (socket.data.guestName as string | undefined) ?? 'Visitante';

          const saved = await handleChatMessage(io, propostaId, {
            senderType,
            senderName,
            message: payload.message,
          });

          const hitl = await propostasService.getHitlState(propostaId);
          if (hitl?.hitlMode === 'ai' && senderType === 'client') {
            await handleChatMessage(io, propostaId, {
              senderType: 'ai',
              senderName: 'CaldasAI',
              message:
                'Recebi sua mensagem! Um consultor pode assumir este chat a qualquer momento. Posso ajudar com valores, datas e condições enquanto isso.',
            });
          }

          socket.emit('chat:ack', { messageId: saved.id });
        } catch (error) {
          socket.emit('error', { message: (error as Error).message });
        }
      },
    );

    socket.on('hitl:request', async (payload: { propostaId: number; clientName?: string }) => {
      try {
        const state = await propostasService.requestHitl(Number(payload.propostaId), payload.clientName);
        nsp.to(roomName(Number(payload.propostaId))).emit('hitl:state', state);
      } catch (error) {
        socket.emit('error', { message: (error as Error).message });
      }
    });

    socket.on('hitl:takeover', async (payload: { propostaId: number; token?: string }) => {
      try {
        const user = verifySocketToken(payload.token ?? undefined);
        if (!user || !['admin', 'manager', 'user'].includes(user.role ?? '')) {
          socket.emit('error', { message: 'Agente não autorizado' });
          return;
        }
        const state = await propostasService.takeoverHitl(Number(payload.propostaId), {
          id: user.id,
          name: user.name,
        });
        nsp.to(roomName(Number(payload.propostaId))).emit('hitl:state', state);
      } catch (error) {
        socket.emit('error', { message: (error as Error).message });
      }
    });

    socket.on('hitl:release', async (payload: { propostaId: number; token?: string }) => {
      try {
        const user = verifySocketToken(payload.token ?? undefined);
        if (!user) {
          socket.emit('error', { message: 'Token obrigatório' });
          return;
        }
        const state = await propostasService.releaseHitl(Number(payload.propostaId), user.id);
        nsp.to(roomName(Number(payload.propostaId))).emit('hitl:state', state);
      } catch (error) {
        socket.emit('error', { message: (error as Error).message });
      }
    });

    socket.on('join:parceiro', (payload: { parceiroId: string; token?: string }) => {
      const parceiroId = String(payload?.parceiroId ?? '').trim();
      if (!parceiroId) {
        socket.emit('error', { message: 'parceiroId obrigatório' });
        return;
      }
      const user = verifySocketToken(payload.token ?? undefined);
      if (!user) {
        socket.emit('error', { message: 'Token obrigatório para canal parceiro' });
        return;
      }
      socket.join(parceiroRoomName(parceiroId));
      socket.emit('joined:parceiro', { parceiroId });
    });
  });

  console.log('[WS] Namespace /propostas (Chat HITL) registrado ✓');
}

module.exports = { registerPropostaChatSocket };
