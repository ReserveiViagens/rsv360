const { Server } = require('socket.io');
const logger = require('../utils/logger');
const { authenticateToken } = require('../middleware/auth');

// Rate limiting para WebSocket
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW = 60000; // 1 minuto
const RATE_LIMIT_MAX = 100; // 100 eventos por minuto

// Verificar rate limit
const checkRateLimit = (socketId) => {
  const now = Date.now();
  const userLimits = rateLimitMap.get(socketId) || { count: 0, resetTime: now + RATE_LIMIT_WINDOW };

  if (now > userLimits.resetTime) {
    userLimits.count = 0;
    userLimits.resetTime = now + RATE_LIMIT_WINDOW;
  }

  if (userLimits.count >= RATE_LIMIT_MAX) {
    return false;
  }

  userLimits.count++;
  rateLimitMap.set(socketId, userLimits);
  return true;
};

let rateLimitCleanupInterval = null;

const cleanupExpiredRateLimits = () => {
  const now = Date.now();
  for (const [socketId, limits] of rateLimitMap.entries()) {
    if (now > limits.resetTime) {
      rateLimitMap.delete(socketId);
    }
  }
};

const startRateLimitCleanup = () => {
  if (rateLimitCleanupInterval) return;
  rateLimitCleanupInterval = setInterval(cleanupExpiredRateLimits, RATE_LIMIT_WINDOW);
  rateLimitCleanupInterval.unref?.();
};

const stopRateLimitCleanup = () => {
  if (rateLimitCleanupInterval) {
    clearInterval(rateLimitCleanupInterval);
    rateLimitCleanupInterval = null;
  }
};

if (process.env.NODE_ENV !== 'test') {
  startRateLimitCleanup();
}

// Criar servidor WebSocket
const createWebSocketServer = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.NODE_ENV === 'production'
        ? process.env.FRONTEND_URL
        : ['http://localhost:3000', 'http://localhost:3005'],
      credentials: true,
      methods: ['GET', 'POST'],
    },
    transports: ['websocket', 'polling'],
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  // Middleware de autenticação
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');
      
      if (!token) {
        // Permitir conexões não autenticadas para eventos públicos (leilões, flash deals)
        socket.isAuthenticated = false;
        return next();
      }

      // Verificar token JWT
      const decoded = await authenticateToken(token);
      if (decoded) {
        socket.userId = decoded.userId || decoded.id;
        socket.userRole = decoded.role;
        socket.isAuthenticated = true;
      } else {
        socket.isAuthenticated = false;
      }
      
      next();
    } catch (error) {
      logger.error('WebSocket authentication error:', error.message);
      socket.isAuthenticated = false;
      next();
    }
  });

  // Gerenciar conexões
  io.on('connection', (socket) => {
    logger.info(`🔌 WebSocket client connected: ${socket.id} (Authenticated: ${socket.isAuthenticated})`);

    // Rate limiting
    if (!checkRateLimit(socket.id)) {
      socket.emit('error', { message: 'Rate limit exceeded' });
      socket.disconnect();
      return;
    }

    // Eventos de leilões
    socket.on('auction:subscribe', (auctionId) => {
      if (!auctionId) {
        socket.emit('error', { message: 'Auction ID is required' });
        return;
      }
      socket.join(`auction:${auctionId}`);
      logger.info(`📢 Client ${socket.id} subscribed to auction ${auctionId}`);
    });

    socket.on('auction:unsubscribe', (auctionId) => {
      socket.leave(`auction:${auctionId}`);
      logger.info(`📴 Client ${socket.id} unsubscribed from auction ${auctionId}`);
    });

    // Eventos de flash deals
    socket.on('flash-deal:subscribe', (flashDealId) => {
      if (!flashDealId) {
        socket.emit('error', { message: 'Flash Deal ID is required' });
        return;
      }
      socket.join(`flash-deal:${flashDealId}`);
      logger.info(`📢 Client ${socket.id} subscribed to flash deal ${flashDealId}`);
    });

    socket.on('flash-deal:unsubscribe', (flashDealId) => {
      socket.leave(`flash-deal:${flashDealId}`);
      logger.info(`📴 Client ${socket.id} unsubscribed from flash deal ${flashDealId}`);
    });

    // Desconexão
    socket.on('disconnect', (reason) => {
      logger.info(`🔌 WebSocket client disconnected: ${socket.id} (Reason: ${reason})`);
      rateLimitMap.delete(socket.id);
    });

    // Erro
    socket.on('error', (error) => {
      logger.error(`❌ WebSocket error for ${socket.id}:`, error);
    });
  });

  // Funções auxiliares para emitir eventos
  const emitToAuction = (auctionId, event, data) => {
    io.to(`auction:${auctionId}`).emit(event, data);
    logger.info(`📢 Emitted ${event} to auction ${auctionId}`);
  };

  const emitToFlashDeal = (flashDealId, event, data) => {
    io.to(`flash-deal:${flashDealId}`).emit(event, data);
    logger.info(`📢 Emitted ${event} to flash deal ${flashDealId}`);
  };

  const emitToAll = (event, data) => {
    io.emit(event, data);
    logger.info(`📢 Emitted ${event} to all clients`);
  };

  return {
    io,
    emitToAuction,
    emitToFlashDeal,
    emitToAll,
  };
};

module.exports = {
  createWebSocketServer,
  stopRateLimitCleanup,
};
