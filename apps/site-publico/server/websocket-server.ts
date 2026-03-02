/**
 * ✅ WEBSOCKET SERVER
 * Servidor WebSocket standalone para mensagens em tempo real
 * 
 * Uso: node server/websocket-server.js
 * ou: npm run ws:server
 */

import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import jwt from 'jsonwebtoken';
import { queryDatabase } from '../lib/db';

interface AuthenticatedSocket {
  userId: number;
  userEmail: string;
  userName?: string;
  userRole?: string;
}

let io: SocketIOServer | null = null;
const connectedUsers = new Map<number, Set<string>>(); // userId -> Set<socketId>

export function initializeWebSocketServer(httpServer: HTTPServer): SocketIOServer {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.NODE_ENV === 'production'
        ? process.env.FRONTEND_URL?.split(',') || ['http://localhost:3000']
        : ['http://localhost:3000', 'http://localhost:3001'],
      credentials: true,
      methods: ['GET', 'POST'],
    },
    pingTimeout: 60000,
    pingInterval: 25000,
    transports: ['websocket', 'polling'],
  });

  // Middleware de autenticação
  io.use(async (socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.query?.token ||
        socket.handshake.headers.authorization?.split(' ')[1];

      if (!token) {
        return next(new Error('Token de autenticação necessário'));
      }

      // Verificar JWT
      const decoded = jwt.verify(
        token as string,
        process.env.JWT_SECRET || 'your-secret-key-change-in-production'
      ) as { userId: number; email: string; role?: string };

      // Buscar usuário no banco
      const users = await queryDatabase(
        `SELECT id, email, name, role FROM users WHERE id = $1 AND status = 'active'`,
        [decoded.userId]
      );

      if (users.length === 0) {
        return next(new Error('Usuário não encontrado ou inativo'));
      }

      const user = users[0];

      // Adicionar dados do usuário ao socket
      (socket as any).userId = user.id;
      (socket as any).userEmail = user.email;
      (socket as any).userName = user.name;
      (socket as any).userRole = user.role;

      next();
    } catch (error: any) {
      console.error('Erro na autenticação WebSocket:', error);
      next(new Error('Falha na autenticação'));
    }
  });

  // Handler de conexão
  io.on('connection', (socket) => {
    const userId = (socket as any).userId;
    const userEmail = (socket as any).userEmail;
    const userName = (socket as any).userName;

    console.log(`✅ WebSocket conectado: ${userName || userEmail} (${socket.id})`);

    // Registrar usuário conectado
    if (!connectedUsers.has(userId)) {
      connectedUsers.set(userId, new Set());
    }
    connectedUsers.get(userId)!.add(socket.id);

    // Notificar outros usuários que este usuário está online
    socket.broadcast.emit('user:online', { userId, userName, userEmail });

    // Entrar em sala de grupo de chat
    socket.on('join:group_chat', async (data: { group_chat_id: number }) => {
      const room = `group_chat:${data.group_chat_id}`;
      socket.join(room);
      console.log(`👥 Usuário ${userName} entrou no chat ${data.group_chat_id}`);
      
      // Notificar outros membros
      socket.to(room).emit('user:joined_chat', {
        group_chat_id: data.group_chat_id,
        user: { id: userId, name: userName, email: userEmail },
      });
    });

    // Sair de sala de grupo de chat
    socket.on('leave:group_chat', (data: { group_chat_id: number }) => {
      const room = `group_chat:${data.group_chat_id}`;
      socket.leave(room);
      console.log(`👋 Usuário ${userName} saiu do chat ${data.group_chat_id}`);
    });

    // Enviar mensagem
    socket.on('message:send', async (data: {
      group_chat_id: number;
      message: string;
      reply_to_message_id?: number;
    }) => {
      try {
        const room = `group_chat:${data.group_chat_id}`;
        
        // Criar mensagem no banco (via API REST ou diretamente)
        // Por enquanto, apenas broadcast
        const messageData = {
          group_chat_id: data.group_chat_id,
          sender_id: userId,
          sender_email: userEmail,
          sender_name: userName,
          message: data.message,
          message_type: 'text',
          reply_to_message_id: data.reply_to_message_id,
          created_at: new Date().toISOString(),
        };

        // Broadcast para todos na sala
        io!.to(room).emit('message:new', messageData);
        console.log(`💬 Mensagem enviada no chat ${data.group_chat_id} por ${userName}`);
      } catch (error) {
        console.error('Erro ao enviar mensagem:', error);
        socket.emit('message:error', { error: 'Erro ao enviar mensagem' });
      }
    });

    // Indicador de digitação
    socket.on('typing:start', (data: { group_chat_id: number }) => {
      const room = `group_chat:${data.group_chat_id}`;
      socket.to(room).emit('typing:user', {
        group_chat_id: data.group_chat_id,
        user: { id: userId, name: userName },
      });
    });

    socket.on('typing:stop', (data: { group_chat_id: number }) => {
      const room = `group_chat:${data.group_chat_id}`;
      socket.to(room).emit('typing:stopped', {
        group_chat_id: data.group_chat_id,
        user_id: userId,
      });
    });

    // Marcar mensagens como lidas
    socket.on('messages:read', (data: {
      group_chat_id: number;
      message_ids: number[];
    }) => {
      const room = `group_chat:${data.group_chat_id}`;
      socket.to(room).emit('messages:read_by', {
        group_chat_id: data.group_chat_id,
        message_ids: data.message_ids,
        read_by: { id: userId, name: userName },
      });
    });

    // Handler de desconexão
    socket.on('disconnect', (reason) => {
      console.log(`❌ WebSocket desconectado: ${userName || userEmail} (${socket.id}) - ${reason}`);

      // Remover usuário da lista de conectados
      const userSockets = connectedUsers.get(userId);
      if (userSockets) {
        userSockets.delete(socket.id);
        if (userSockets.size === 0) {
          connectedUsers.delete(userId);
          // Notificar que usuário está offline
          socket.broadcast.emit('user:offline', { userId, userName, userEmail });
        }
      }
    });
  });

  return io;
}

export function getIO(): SocketIOServer | null {
  return io;
}

// Funções auxiliares para emitir eventos
export function emitToGroupChat(groupChatId: number, event: string, data: any) {
  if (io) {
    io.to(`group_chat:${groupChatId}`).emit(event, data);
  }
}

export function emitToUser(userId: number, event: string, data: any) {
  if (io) {
    const userSockets = connectedUsers.get(userId);
    if (userSockets) {
      userSockets.forEach((socketId) => {
        io!.to(socketId).emit(event, data);
      });
    }
  }
}

