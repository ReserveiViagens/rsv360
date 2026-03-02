/**
 * ✅ WEBSOCKET SERVER
 * Servidor Socket.io para comunicação real-time
 */

import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import * as jwt from 'jsonwebtoken';
import { queryDatabase } from './db';

export interface SocketUser {
  userId: number;
  email: string;
  name: string;
  role: string;
  socketId: string;
}

export interface SocketMessage {
  id: string;
  room_id: string;
  user_id: number;
  user_name: string;
  message: string;
  timestamp: string;
  type?: 'message' | 'system' | 'notification';
}

let io: SocketIOServer | null = null;
const connectedUsers = new Map<number, string>(); // userId -> socketId
const userSockets = new Map<string, SocketUser>(); // socketId -> user

/**
 * Inicializar servidor WebSocket
 */
export function initializeWebSocket(server: HTTPServer): SocketIOServer {
  io = new SocketIOServer(server, {
    cors: {
      origin: process.env.NODE_ENV === 'production'
        ? process.env.FRONTEND_URL?.split(',') || ['https://rsv.com']
        : ['http://localhost:3000', 'http://localhost:3001'],
      credentials: true,
      methods: ['GET', 'POST']
    },
    pingTimeout: 60000,
    pingInterval: 25000,
    transports: ['websocket', 'polling']
  });

  // Middleware de autenticação
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token || 
                   socket.handshake.headers.authorization?.replace('Bearer ', '');

      if (!token) {
        return next(new Error('Token de autenticação necessário'));
      }

      // Verificar JWT
      const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
      const decoded = jwt.verify(token, JWT_SECRET) as any;

      // Buscar usuário no banco
      const users = await queryDatabase(
        'SELECT id, email, name, role, status FROM users WHERE id = $1',
        [decoded.userId || decoded.id]
      );

      if (users.length === 0) {
        return next(new Error('Usuário não encontrado'));
      }

      const user = users[0];
      if (user.status !== 'active') {
        return next(new Error('Usuário inativo'));
      }

      // Adicionar dados do usuário ao socket
      (socket as any).userId = user.id;
      (socket as any).userEmail = user.email;
      (socket as any).userName = user.name;
      (socket as any).userRole = user.role;

      next();
    } catch (error: any) {
      console.error('Erro de autenticação WebSocket:', error);
      next(new Error('Autenticação falhou'));
    }
  });

  // Handler de conexão
  io.on('connection', (socket) => {
    const userId = (socket as any).userId;
    const userEmail = (socket as any).userEmail;
    const userName = (socket as any).userName;
    const userRole = (socket as any).userRole;

    console.log(`🔌 WebSocket conectado: ${userEmail} (${socket.id})`);

    // Armazenar conexão
    connectedUsers.set(userId, socket.id);
    userSockets.set(socket.id, {
      userId,
      email: userEmail,
      name: userName,
      role: userRole,
      socketId: socket.id
    });

    // Entrar em rooms padrão
    socket.join(`user:${userId}`);
    socket.join(`role:${userRole}`);
    socket.join('all');

    // Enviar mensagem de boas-vindas
    socket.emit('connected', {
      message: 'Conectado ao RSV Gen 2 WebSocket',
      userId,
      timestamp: new Date().toISOString()
    });

    // Notificar outros usuários que este usuário está online
    socket.broadcast.emit('user:online', {
      userId,
      userName,
      timestamp: new Date().toISOString()
    });

    // ============================================
    // HANDLERS DE CHAT
    // ============================================

    /**
     * Entrar em room de chat (ex: grupo de viagem)
     */
    socket.on('chat:join', async (data: { room_id: string }) => {
      if (!data.room_id) return;
      
      socket.join(`chat:${data.room_id}`);
      console.log(`Usuário ${userEmail} entrou no chat ${data.room_id}`);
      
      // Notificar outros no room
      socket.to(`chat:${data.room_id}`).emit('chat:user_joined', {
        user_id: userId,
        user_name: userName,
        room_id: data.room_id,
        timestamp: new Date().toISOString()
      });
    });

    /**
     * Sair de room de chat
     */
    socket.on('chat:leave', (data: { room_id: string }) => {
      if (!data.room_id) return;
      
      socket.leave(`chat:${data.room_id}`);
      socket.to(`chat:${data.room_id}`).emit('chat:user_left', {
        user_id: userId,
        user_name: userName,
        room_id: data.room_id,
        timestamp: new Date().toISOString()
      });
    });

    /**
     * Enviar mensagem no chat
     */
    socket.on('chat:message', async (data: {
      room_id: string;
      message: string;
    }) => {
      if (!data.room_id || !data.message) return;

      const message: SocketMessage = {
        id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        room_id: data.room_id,
        user_id: userId,
        user_name: userName,
        message: data.message,
        timestamp: new Date().toISOString(),
        type: 'message'
      };

      // Salvar mensagem no banco (se tabela existir)
      try {
        await queryDatabase(
          `INSERT INTO group_chat_messages (group_id, user_id, message, created_at)
           VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
           ON CONFLICT DO NOTHING`,
          [parseInt(data.room_id), userId, data.message]
        );
      } catch (error) {
        // Tabela pode não existir, continuar mesmo assim
        console.log('Tabela group_chat_messages não encontrada, continuando sem salvar');
      }

      // Enviar para todos no room
      io?.to(`chat:${data.room_id}`).emit('chat:message', message);
    });

    /**
     * Indicador de digitação
     */
    socket.on('chat:typing', (data: { room_id: string; typing: boolean }) => {
      if (!data.room_id) return;
      
      socket.to(`chat:${data.room_id}`).emit('chat:typing', {
        user_id: userId,
        user_name: userName,
        room_id: data.room_id,
        typing: data.typing,
        timestamp: new Date().toISOString()
      });
    });

    // ============================================
    // HANDLERS DE NOTIFICAÇÕES
    // ============================================

    /**
     * Enviar notificação para usuário específico
     */
    socket.on('notification:send', (data: {
      target_user_id: number;
      title: string;
      message: string;
      type?: string;
    }) => {
      // Verificar se usuário tem permissão (admin ou mesmo usuário)
      if (userRole !== 'admin' && userId !== data.target_user_id) {
        socket.emit('error', { message: 'Sem permissão' });
        return;
      }

      io?.to(`user:${data.target_user_id}`).emit('notification', {
        title: data.title,
        message: data.message,
        type: data.type || 'info',
        timestamp: new Date().toISOString()
      });
    });

    // ============================================
    // HANDLERS DE RESERVAS
    // ============================================

    /**
     * Entrar em room de reserva (para atualizações em tempo real)
     */
    socket.on('booking:join', (data: { booking_id: number }) => {
      if (!data.booking_id) return;
      socket.join(`booking:${data.booking_id}`);
    });

    /**
     * Sair de room de reserva
     */
    socket.on('booking:leave', (data: { booking_id: number }) => {
      if (!data.booking_id) return;
      socket.leave(`booking:${data.booking_id}`);
    });

    // ============================================
    // HANDLERS GENÉRICOS
    // ============================================

    /**
     * Entrar em room customizado
     */
    socket.on('room:join', (roomName: string) => {
      if (roomName && typeof roomName === 'string' && roomName.length < 100) {
        socket.join(roomName);
        console.log(`Usuário ${userEmail} entrou no room: ${roomName}`);
      }
    });

    /**
     * Sair de room customizado
     */
    socket.on('room:leave', (roomName: string) => {
      if (roomName && typeof roomName === 'string') {
        socket.leave(roomName);
      }
    });

    /**
     * Atualizar status do usuário
     */
    socket.on('user:status', (status: 'online' | 'away' | 'busy') => {
      if (!['online', 'away', 'busy'].includes(status)) return;
      
      socket.broadcast.emit('user:status_update', {
        userId,
        userName,
        status,
        timestamp: new Date().toISOString()
      });
    });

    // ============================================
    // HANDLER DE DESCONEXÃO
    // ============================================

    socket.on('disconnect', (reason) => {
      console.log(`🔌 WebSocket desconectado: ${userEmail} (${reason})`);
      
      // Remover conexão
      connectedUsers.delete(userId);
      userSockets.delete(socket.id);

      // Notificar outros usuários
      socket.broadcast.emit('user:offline', {
        userId,
        userName,
        timestamp: new Date().toISOString()
      });
    });
  });

  return io;
}

/**
 * Obter instância do servidor WebSocket
 */
export function getWebSocketServer(): SocketIOServer | null {
  return io;
}

/**
 * Enviar notificação para usuário específico
 */
export function sendNotificationToUser(
  userId: number,
  notification: {
    title: string;
    message: string;
    type?: string;
    data?: any;
  }
): void {
  if (!io) return;
  
  io.to(`user:${userId}`).emit('notification', {
    ...notification,
    timestamp: new Date().toISOString()
  });
}

/**
 * Enviar notificação para todos os usuários de um role
 */
export function sendNotificationToRole(
  role: string,
  notification: {
    title: string;
    message: string;
    type?: string;
    data?: any;
  }
): void {
  if (!io) return;
  
  io.to(`role:${role}`).emit('notification', {
    ...notification,
    timestamp: new Date().toISOString()
  });
}

/**
 * Enviar atualização de reserva
 */
export function emitBookingUpdate(
  bookingId: number,
  update: {
    type: 'created' | 'confirmed' | 'cancelled' | 'updated';
    data: any;
  }
): void {
  if (!io) return;
  
  io.to(`booking:${bookingId}`).emit('booking:update', {
    booking_id: bookingId,
    type: update.type,
    data: update.data,
    timestamp: new Date().toISOString()
  });
}

/**
 * Enviar mensagem para room de chat
 */
export function sendChatMessage(
  roomId: string,
  message: {
    user_id: number;
    user_name: string;
    message: string;
  }
): void {
  if (!io) return;
  
  const chatMessage: SocketMessage = {
    id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    room_id: roomId,
    user_id: message.user_id,
    user_name: message.user_name,
    message: message.message,
    timestamp: new Date().toISOString(),
    type: 'message'
  };
  
  io.to(`chat:${roomId}`).emit('chat:message', chatMessage);
}

/**
 * Verificar se usuário está online
 */
export function isUserOnline(userId: number): boolean {
  return connectedUsers.has(userId);
}

/**
 * Obter socket ID de um usuário
 */
export function getUserSocketId(userId: number): string | undefined {
  return connectedUsers.get(userId);
}

/**
 * Obter todos os usuários online
 */
export function getOnlineUsers(): SocketUser[] {
  return Array.from(userSockets.values());
}

