// 📅 BOOKING ENGINE - Motor de Reservas
// RSV 360° Ecosystem - Sistema de Reservas

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const { Pool } = require('pg');
const redis = require('redis');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const winston = require('winston');
const client = require('prom-client');
const moment = require('moment');
const { v4: uuidv4 } = require('uuid');

// Configurar variáveis de ambiente
require('dotenv').config();

// Configurar logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'booking-engine' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

// Configurar métricas Prometheus
const register = new client.Registry();
client.collectDefaultMetrics({ register });

// Métricas customizadas
const httpRequestDuration = new client.Histogram({
  name: 'booking_http_request_duration_seconds',
  help: 'Duration of Booking HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10]
});

const bookingReservationsTotal = new client.Counter({
  name: 'booking_reservations_total',
  help: 'Total number of bookings',
  labelNames: ['status', 'type']
});

register.registerMetric(httpRequestDuration);
register.registerMetric(bookingReservationsTotal);

// Configurar aplicação Express
const app = express();
const PORT = process.env.PORT || 3002;

// Middleware de segurança
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));

// Middleware de parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Configurar conexão com PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Configurar conexão com Redis
const redisClient = redis.createClient({
  url: process.env.REDIS_URL
});

redisClient.on('error', (err) => logger.error('Redis Client Error:', err));
redisClient.on('connect', () => logger.info('Redis Client Connected'));

// Middleware de métricas
app.use((req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    const route = req.route ? req.route.path : req.path;
    
    httpRequestDuration
      .labels(req.method, route, res.statusCode)
      .observe(duration);
  });
  
  next();
});

// Middleware de autenticação
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token de acesso requerido' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    logger.error('Token inválido:', error);
    return res.status(403).json({ error: 'Token inválido' });
  }
};

// Rotas de saúde e monitoramento
app.get('/health', async (req, res) => {
  try {
    // Verificar conexão com banco de dados
    await pool.query('SELECT 1');
    
    // Verificar conexão com Redis
    await redisClient.ping();
    
    res.status(200).json({
      status: 'healthy',
      service: 'booking-engine',
      timestamp: new Date().toISOString(),
      services: {
        database: 'connected',
        redis: 'connected',
        uptime: process.uptime()
      }
    });
  } catch (error) {
    logger.error('Health check failed:', error);
    res.status(503).json({
      status: 'unhealthy',
      service: 'booking-engine',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

// Rota de métricas Prometheus
app.get('/metrics', async (req, res) => {
  try {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  } catch (error) {
    logger.error('Metrics error:', error);
    res.status(500).end();
  }
});

// Rota principal
app.get('/', (req, res) => {
  res.json({
    message: 'RSV 360° Ecosystem - Booking Engine',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/health',
      metrics: '/metrics',
      api: '/api/v1'
    }
  });
});

// Rotas da API de Reservas
app.use('/api/v1', authenticateToken);

// Rota para listar reservas
app.get('/api/v1/bookings', async (req, res) => {
  try {
    const { page = 1, limit = 10, status, customer_id } = req.query;
    const offset = (page - 1) * limit;

    let query = 'SELECT * FROM booking_reservations';
    let params = [];
    let paramCount = 0;
    let conditions = [];

    if (status) {
      paramCount++;
      conditions.push(`status = $${paramCount}`);
      params.push(status);
    }

    if (customer_id) {
      paramCount++;
      conditions.push(`customer_id = $${paramCount}`);
      params.push(customer_id);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ` ORDER BY created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);

    // Contar total de registros
    let countQuery = 'SELECT COUNT(*) FROM booking_reservations';
    let countParams = [];
    if (conditions.length > 0) {
      countQuery += ' WHERE ' + conditions.join(' AND ');
      countParams = params.slice(0, -2); // Remove limit e offset
    }
    const countResult = await pool.query(countQuery, countParams);

    res.json({
      bookings: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(countResult.rows[0].count),
        pages: Math.ceil(countResult.rows[0].count / limit)
      }
    });
  } catch (error) {
    logger.error('Error fetching bookings:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota para criar reserva
app.post('/api/v1/bookings', async (req, res) => {
  try {
    const schema = Joi.object({
      customer_id: Joi.string().uuid().required(),
      hotel_id: Joi.string().uuid().required(),
      room_type: Joi.string().valid('single', 'double', 'suite', 'deluxe').required(),
      check_in: Joi.date().iso().required(),
      check_out: Joi.date().iso().greater(Joi.ref('check_in')).required(),
      guests: Joi.number().integer().min(1).max(6).required(),
      total_amount: Joi.number().positive().required(),
      special_requests: Joi.string().max(500).optional()
    });

    const { error, value } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const {
      customer_id,
      hotel_id,
      room_type,
      check_in,
      check_out,
      guests,
      total_amount,
      special_requests
    } = value;

    // Verificar se as datas são válidas
    const checkInDate = moment(check_in);
    const checkOutDate = moment(check_out);
    const today = moment().startOf('day');

    if (checkInDate.isBefore(today)) {
      return res.status(400).json({ error: 'Data de check-in não pode ser no passado' });
    }

    // Verificar disponibilidade (simplificado)
    const availabilityCheck = await pool.query(
      `SELECT COUNT(*) FROM booking_reservations 
       WHERE hotel_id = $1 AND room_type = $2 AND status IN ('confirmed', 'pending')
       AND ((check_in <= $3 AND check_out > $3) OR (check_in < $4 AND check_out >= $4))`,
      [hotel_id, room_type, check_in, check_out]
    );

    if (parseInt(availabilityCheck.rows[0].count) > 0) {
      return res.status(409).json({ error: 'Quarto não disponível para as datas selecionadas' });
    }

    const booking_id = uuidv4();

    const result = await pool.query(
      `INSERT INTO booking_reservations (
        id, customer_id, hotel_id, room_type, check_in, check_out, 
        guests, total_amount, special_requests, status, created_at, updated_at
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'pending', NOW(), NOW())
       RETURNING *`,
      [booking_id, customer_id, hotel_id, room_type, check_in, check_out, guests, total_amount, special_requests]
    );

    bookingReservationsTotal.labels('created', 'hotel').inc();

    // Armazenar no Redis para cache
    await redisClient.setEx(`booking:${booking_id}`, 3600, JSON.stringify(result.rows[0]));

    logger.info(`Booking created: ${booking_id} for customer ${customer_id}`);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    logger.error('Error creating booking:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota para obter reserva por ID
app.get('/api/v1/bookings/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Tentar buscar no cache primeiro
    const cached = await redisClient.get(`booking:${id}`);
    if (cached) {
      return res.json(JSON.parse(cached));
    }

    const result = await pool.query(
      'SELECT * FROM booking_reservations WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Reserva não encontrada' });
    }

    // Armazenar no cache
    await redisClient.setEx(`booking:${id}`, 3600, JSON.stringify(result.rows[0]));

    res.json(result.rows[0]);
  } catch (error) {
    logger.error('Error fetching booking:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota para atualizar status da reserva
app.patch('/api/v1/bookings/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'confirmed', 'cancelled', 'completed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        error: 'Status inválido. Valores aceitos: ' + validStatuses.join(', ')
      });
    }

    const result = await pool.query(
      'UPDATE booking_reservations SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Reserva não encontrada' });
    }

    // Atualizar cache
    await redisClient.setEx(`booking:${id}`, 3600, JSON.stringify(result.rows[0]));

    bookingReservationsTotal.labels('updated', status).inc();

    logger.info(`Booking ${id} status updated to ${status}`);

    res.json(result.rows[0]);
  } catch (error) {
    logger.error('Error updating booking status:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota para cancelar reserva
app.delete('/api/v1/bookings/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'UPDATE booking_reservations SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      ['cancelled', id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Reserva não encontrada' });
    }

    // Remover do cache
    await redisClient.del(`booking:${id}`);

    bookingReservationsTotal.labels('cancelled', 'hotel').inc();

    logger.info(`Booking cancelled: ${id}`);

    res.json({ message: 'Reserva cancelada com sucesso' });
  } catch (error) {
    logger.error('Error cancelling booking:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota para verificar disponibilidade
app.get('/api/v1/availability', async (req, res) => {
  try {
    const { hotel_id, room_type, check_in, check_out } = req.query;

    if (!hotel_id || !room_type || !check_in || !check_out) {
      return res.status(400).json({ 
        error: 'Parâmetros obrigatórios: hotel_id, room_type, check_in, check_out' 
      });
    }

    const result = await pool.query(
      `SELECT COUNT(*) as booked_rooms FROM booking_reservations 
       WHERE hotel_id = $1 AND room_type = $2 AND status IN ('confirmed', 'pending')
       AND ((check_in <= $3 AND check_out > $3) OR (check_in < $4 AND check_out >= $4))`,
      [hotel_id, room_type, check_in, check_out]
    );

    const bookedRooms = parseInt(result.rows[0].booked_rooms);
    const totalRooms = 10; // Assumindo 10 quartos por tipo por hotel
    const availableRooms = Math.max(0, totalRooms - bookedRooms);

    res.json({
      hotel_id,
      room_type,
      check_in,
      check_out,
      total_rooms: totalRooms,
      booked_rooms: bookedRooms,
      available_rooms: availableRooms,
      is_available: availableRooms > 0
    });
  } catch (error) {
    logger.error('Error checking availability:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Middleware de tratamento de erros
app.use((error, req, res, next) => {
  logger.error('Unhandled error:', error);
  res.status(500).json({ error: 'Erro interno do servidor' });
});

// Middleware para rotas não encontradas
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Rota não encontrada' });
});

// Função para inicializar conexões
async function initializeConnections() {
  try {
    // Conectar ao Redis
    await redisClient.connect();
    
    // Testar conexão com PostgreSQL
    await pool.query('SELECT 1');
    
    logger.info('All connections initialized successfully');
  } catch (error) {
    logger.error('Failed to initialize connections:', error);
    process.exit(1);
  }
}

// Função para encerrar conexões
async function gracefulShutdown() {
  logger.info('Starting graceful shutdown...');
  
  try {
    await redisClient.quit();
    await pool.end();
    logger.info('All connections closed successfully');
    process.exit(0);
  } catch (error) {
    logger.error('Error during shutdown:', error);
    process.exit(1);
  }
}

// Tratamento de sinais para shutdown graceful
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Inicializar servidor
async function startServer() {
  try {
    await initializeConnections();
    
    app.listen(PORT, '0.0.0.0', () => {
      logger.info(`🚀 RSV Booking Engine running on port ${PORT}`);
      logger.info(`📊 Health check: http://localhost:${PORT}/health`);
      logger.info(`📈 Metrics: http://localhost:${PORT}/metrics`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Iniciar servidor
startServer();

module.exports = app;
