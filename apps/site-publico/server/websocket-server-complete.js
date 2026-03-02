/**
 * ✅ SERVIDOR WEBSOCKET COMPLETO EM NODE.JS
 * 
 * Servidor WebSocket robusto com:
 * - Autenticação JWT
 * - Rooms e namespaces
 * - Rate limiting
 * - Reconexão automática
 * - Logging estruturado
 * - Health checks
 * 
 * Uso: node server/websocket-server-complete.js
 */

const http = require('http');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const { queryDatabase } = require('../lib/db');

// Configurações
const PORT = process.env.WS_PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const NODE_ENV = process.env.NODE_ENV || 'development';

// Rate limiting
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW = 60000; // 1 minuto
const RATE_LIMIT_MAX = 100; // 100 mensagens por minuto

// Estruturas de dados
const connectedUsers = new Map(); // userId -> Set<socketId>
const userRooms = new Map(); // userId -> Set<room>
const roomUsers = new Map(); // room -> Set<userId>

// Criar servidor HTTP
const server = http.createServer((req, res) => {
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'ok',
      timestamp: new Date().toISOString(),
      connectedUsers: connectedUsers.size,
      totalRooms: roomUsers.size,
    }));
  } else {
    res.writeHead(404);
    res.end('Not Found');
  }
});

// Configurar Socket.IO
const io = new Server(server, {
  cors: {
    origin: NODE_ENV === 'production'
      ? process.env.FRONTEND_URL?.split(',') || ['http://localhost:3000']
      : ['http://localhost:3000', 'http://localhost:3001'],
    credentials: true,
    methods: ['GET', 'POST'],
  },
  pingTimeout: 60000,
  pingInterval: 25000,
  transports: ['websocket', 'polling'],
  allowEIO3: true,
});

// Middleware de rate limiting
io.use((socket, next) => {
  const clientId = socket.handshake.address;
  const now = Date.now();
  
  if (!rateLimitMap.has(clientId)) {
    rateLimitMap.set(clientId, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return next();
  }

  const limit = rateLimitMap.get(clientId);
  
  if (now > limit.resetTime) {
    limit.count = 1;
    limit.resetTime = now + RATE_LIMIT_WINDOW;
    rateLimitMap.set(clientId, limit);
    return next();
  }

  if (limit.count >= RATE_LIMIT_MAX) {
    return next(new Error('Rate limit exceeded'));
  }

  limit.count++;
  rateLimitMap.set(clientId, limit);
  next();
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

    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Verificar usuário no banco
    const users = await queryDatabase(
      `SELECT id, email, name, role, status FROM users WHERE id = $1`,
      [decoded.userId]
    );

    if (users.length === 0 || users[0].status !== 'active') {
      return next(new Error('Usuário não encontrado ou inativo'));
    }

    const user = users[0];
    
    // Adicionar dados do usuário ao socket
    socket.userId = user.id;
    socket.userEmail = user.email;
    socket.userName = user.name;
    socket.userRole = user.role;

    next();
  } catch (error) {
    console.error('Erro na autenticação WebSocket:', error);
    next(new Error('Falha na autenticação'));
  }
});

// Handler de conexão
io.on('connection', (socket) => {
  const userId = socket.userId;
  const userEmail = socket.userEmail;
  const userName = socket.userName;

  console.log(`✅ [${new Date().toISOString()}] WebSocket conectado: ${userName || userEmail} (${socket.id})`);

  // Registrar usuário conectado
  if (!connectedUsers.has(userId)) {
    connectedUsers.set(userId, new Set());
  }
  connectedUsers.get(userId).add(socket.id);

  if (!userRooms.has(userId)) {
    userRooms.set(userId, new Set());
  }

  // Notificar outros usuários que este usuário está online
  socket.broadcast.emit('user:online', {
    userId,
    userName,
    userEmail,
    timestamp: new Date().toISOString(),
  });

  // Enviar lista de usuários online para o novo usuário
  const onlineUsers = Array.from(connectedUsers.keys()).map((uid) => {
    const userSockets = connectedUsers.get(uid);
    return {
      userId: uid,
      socketIds: Array.from(userSockets),
    };
  });
  socket.emit('users:online', onlineUsers);

  // ============================================
  // GRUPO DE CHAT
  // ============================================

  socket.on('group_chat:join', async (data) => {
    try {
      const { group_chat_id } = data;
      if (!group_chat_id) {
        socket.emit('error', { message: 'group_chat_id é obrigatório' });
        return;
      }

      const room = `group_chat:${group_chat_id}`;
      await socket.join(room);

      userRooms.get(userId).add(room);
      if (!roomUsers.has(room)) {
        roomUsers.set(room, new Set());
      }
      roomUsers.get(room).add(userId);

      console.log(`👥 [${new Date().toISOString()}] Usuário ${userName} entrou no chat ${group_chat_id}`);

      // Notificar outros membros
      socket.to(room).emit('group_chat:user_joined', {
        group_chat_id,
        user: { id: userId, name: userName, email: userEmail },
        timestamp: new Date().toISOString(),
      });

      // Enviar confirmação
      socket.emit('group_chat:joined', {
        group_chat_id,
        room,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Erro ao entrar no grupo:', error);
      socket.emit('error', { message: 'Erro ao entrar no grupo' });
    }
  });

  socket.on('group_chat:leave', (data) => {
    try {
      const { group_chat_id } = data;
      const room = `group_chat:${group_chat_id}`;
      socket.leave(room);

      userRooms.get(userId)?.delete(room);
      roomUsers.get(room)?.delete(userId);
      if (roomUsers.get(room)?.size === 0) {
        roomUsers.delete(room);
      }

      console.log(`👋 [${new Date().toISOString()}] Usuário ${userName} saiu do chat ${group_chat_id}`);

      socket.to(room).emit('group_chat:user_left', {
        group_chat_id,
        user_id: userId,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Erro ao sair do grupo:', error);
    }
  });

  socket.on('group_chat:message', async (data) => {
    try {
      const { group_chat_id, message, reply_to_message_id } = data;

      if (!group_chat_id || !message) {
        socket.emit('error', { message: 'group_chat_id e message são obrigatórios' });
        return;
      }

      const room = `group_chat:${group_chat_id}`;

      // Verificar se usuário está no grupo
      if (!socket.rooms.has(room)) {
        socket.emit('error', { message: 'Você não está neste grupo' });
        return;
      }

      const messageData = {
        group_chat_id,
        sender_id: userId,
        sender_email: userEmail,
        sender_name: userName,
        message,
        message_type: 'text',
        reply_to_message_id: reply_to_message_id || null,
        created_at: new Date().toISOString(),
      };

      // Broadcast para todos na sala
      io.to(room).emit('group_chat:message', messageData);

      console.log(`💬 [${new Date().toISOString()}] Mensagem enviada no chat ${group_chat_id} por ${userName}`);
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      socket.emit('error', { message: 'Erro ao enviar mensagem' });
    }
  });

  socket.on('group_chat:typing', (data) => {
    try {
      const { group_chat_id } = data;
      const room = `group_chat:${group_chat_id}`;

      socket.to(room).emit('group_chat:typing', {
        group_chat_id,
        user: { id: userId, name: userName },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Erro ao enviar indicador de digitação:', error);
    }
  });

  socket.on('group_chat:typing_stop', (data) => {
    try {
      const { group_chat_id } = data;
      const room = `group_chat:${group_chat_id}`;

      socket.to(room).emit('group_chat:typing_stopped', {
        group_chat_id,
        user_id: userId,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Erro ao parar indicador de digitação:', error);
    }
  });

  socket.on('group_chat:read', (data) => {
    try {
      const { group_chat_id, message_ids } = data;
      const room = `group_chat:${group_chat_id}`;

      socket.to(room).emit('group_chat:messages_read', {
        group_chat_id,
        message_ids: message_ids || [],
        read_by: { id: userId, name: userName },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Erro ao marcar mensagens como lidas:', error);
    }
  });

  // ============================================
  // NOTIFICAÇÕES EM TEMPO REAL
  // ============================================

  socket.on('notifications:subscribe', () => {
    const room = `notifications:${userId}`;
    socket.join(room);
    console.log(`🔔 [${new Date().toISOString()}] Usuário ${userName} inscrito em notificações`);
  });

  socket.on('notifications:unsubscribe', () => {
    const room = `notifications:${userId}`;
    socket.leave(room);
    console.log(`🔕 [${new Date().toISOString()}] Usuário ${userName} desinscrito de notificações`);
  });

  // ============================================
  // RESERVAS EM TEMPO REAL
  // ============================================

  socket.on('bookings:subscribe', (data) => {
    const { booking_id } = data;
    if (booking_id) {
      const room = `booking:${booking_id}`;
      socket.join(room);
      console.log(`📅 [${new Date().toISOString()}] Usuário ${userName} inscrito em reserva ${booking_id}`);
    }
  });

  // ============================================
  // PING/PONG (Health Check)
  // ============================================

  socket.on('ping', () => {
    socket.emit('pong', { timestamp: new Date().toISOString() });
  });

  // ============================================
  // HANDLER DE DESCONEXÃO
  // ============================================

  socket.on('disconnect', (reason) => {
    console.log(`❌ [${new Date().toISOString()}] WebSocket desconectado: ${userName || userEmail} (${socket.id}) - ${reason}`);

    // Remover usuário da lista de conectados
    const userSockets = connectedUsers.get(userId);
    if (userSockets) {
      userSockets.delete(socket.id);
      if (userSockets.size === 0) {
        connectedUsers.delete(userId);
        // Notificar que usuário está offline
        socket.broadcast.emit('user:offline', {
          userId,
          userName,
          userEmail,
          timestamp: new Date().toISOString(),
        });

        // Limpar rooms do usuário
        const rooms = userRooms.get(userId);
        if (rooms) {
          rooms.forEach((room) => {
            roomUsers.get(room)?.delete(userId);
            if (roomUsers.get(room)?.size === 0) {
              roomUsers.delete(room);
            }
          });
          userRooms.delete(userId);
        }
      }
    }
  });
});

// Funções auxiliares para emitir eventos
function emitToGroupChat(groupChatId, event, data) {
  io.to(`group_chat:${groupChatId}`).emit(event, data);
}

function emitToUser(userId, event, data) {
  const userSockets = connectedUsers.get(userId);
  if (userSockets) {
    userSockets.forEach((socketId) => {
      io.to(socketId).emit(event, data);
    });
  }
}

function emitNotification(userId, notification) {
  io.to(`notifications:${userId}`).emit('notification:new', notification);
}

function emitBookingUpdate(bookingId, update) {
  io.to(`booking:${bookingId}`).emit('booking:update', update);
}

// Limpar rate limit map periodicamente
setInterval(() => {
  const now = Date.now();
  for (const [clientId, limit] of rateLimitMap.entries()) {
    if (now > limit.resetTime) {
      rateLimitMap.delete(clientId);
    }
  }
}, RATE_LIMIT_WINDOW);

// Iniciar servidor
server.listen(PORT, () => {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`🚀 Servidor WebSocket rodando na porta ${PORT}`);
  console.log(`📍 Ambiente: ${NODE_ENV}`);
  console.log(`🔗 URL: ws://localhost:${PORT}`);
  console.log(`📊 Health Check: http://localhost:${PORT}/health`);
  console.log(`\n✅ Pronto para receber conexões WebSocket!`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('\n📡 SIGTERM recebido. Encerrando servidor WebSocket...');
  io.close(() => {
    server.close(() => {
      console.log('✅ Servidor WebSocket encerrado.');
      process.exit(0);
    });
  });
});

process.on('SIGINT', () => {
  console.log('\n📡 SIGINT recebido. Encerrando servidor WebSocket...');
  io.close(() => {
    server.close(() => {
      console.log('✅ Servidor WebSocket encerrado.');
      process.exit(0);
    });
  });
});

// Exportar funções auxiliares
module.exports = {
  io,
  emitToGroupChat,
  emitToUser,
  emitNotification,
  emitBookingUpdate,
  getConnectedUsers: () => Array.from(connectedUsers.keys()),
  getRoomUsers: (room) => Array.from(roomUsers.get(room) || []),
};

