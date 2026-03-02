// 🏨 HOTEL MANAGEMENT - Gestão de Hotéis
// RSV 360° Ecosystem - Sistema de Gestão de Hotéis

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
  defaultMeta: { service: 'hotel-management' },
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
  name: 'hotel_http_request_duration_seconds',
  help: 'Duration of Hotel Management HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10]
});

const hotelOperationsTotal = new client.Counter({
  name: 'hotel_operations_total',
  help: 'Total number of hotel operations',
  labelNames: ['operation', 'status']
});

register.registerMetric(httpRequestDuration);
register.registerMetric(hotelOperationsTotal);

// Configurar aplicação Express
const app = express();
const PORT = process.env.PORT || 3003;

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
      service: 'hotel-management',
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
      service: 'hotel-management',
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
    message: 'RSV 360° Ecosystem - Hotel Management',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/health',
      metrics: '/metrics',
      api: '/api/v1'
    }
  });
});

// Rotas da API de Gestão de Hotéis
app.use('/api/v1', authenticateToken);

// Rota para listar hotéis
app.get('/api/v1/hotels', async (req, res) => {
  try {
    const { page = 1, limit = 10, city, stars } = req.query;
    const offset = (page - 1) * limit;

    let query = 'SELECT * FROM hotel_management';
    let params = [];
    let paramCount = 0;
    let conditions = [];

    if (city) {
      paramCount++;
      conditions.push(`city ILIKE $${paramCount}`);
      params.push(`%${city}%`);
    }

    if (stars) {
      paramCount++;
      conditions.push(`stars = $${paramCount}`);
      params.push(stars);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ` ORDER BY created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);

    // Contar total de registros
    let countQuery = 'SELECT COUNT(*) FROM hotel_management';
    let countParams = [];
    if (conditions.length > 0) {
      countQuery += ' WHERE ' + conditions.join(' AND ');
      countParams = params.slice(0, -2); // Remove limit e offset
    }
    const countResult = await pool.query(countQuery, countParams);

    res.json({
      hotels: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(countResult.rows[0].count),
        pages: Math.ceil(countResult.rows[0].count / limit)
      }
    });
  } catch (error) {
    logger.error('Error fetching hotels:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota para criar hotel
app.post('/api/v1/hotels', async (req, res) => {
  try {
    const schema = Joi.object({
      name: Joi.string().min(2).max(100).required(),
      address: Joi.string().min(10).max(200).required(),
      city: Joi.string().min(2).max(50).required(),
      state: Joi.string().min(2).max(50).required(),
      country: Joi.string().min(2).max(50).required(),
      stars: Joi.number().integer().min(1).max(5).required(),
      description: Joi.string().max(1000).optional(),
      amenities: Joi.array().items(Joi.string()).optional(),
      contact_email: Joi.string().email().required(),
      contact_phone: Joi.string().min(10).max(20).required()
    });

    const { error, value } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const {
      name, address, city, state, country, stars,
      description, amenities, contact_email, contact_phone
    } = value;

    const hotel_id = uuidv4();

    const result = await pool.query(
      `INSERT INTO hotel_management (
        id, name, address, city, state, country, stars, 
        description, amenities, contact_email, contact_phone, 
        status, created_at, updated_at
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'active', NOW(), NOW())
       RETURNING *`,
      [hotel_id, name, address, city, state, country, stars, description, amenities, contact_email, contact_phone]
    );

    hotelOperationsTotal.labels('create', 'success').inc();

    logger.info(`Hotel created: ${hotel_id} - ${name}`);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    hotelOperationsTotal.labels('create', 'error').inc();
    logger.error('Error creating hotel:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota para obter hotel por ID
app.get('/api/v1/hotels/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Tentar buscar no cache primeiro
    const cached = await redisClient.get(`hotel:${id}`);
    if (cached) {
      return res.json(JSON.parse(cached));
    }

    const result = await pool.query(
      'SELECT * FROM hotel_management WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Hotel não encontrado' });
    }

    // Armazenar no cache
    await redisClient.setEx(`hotel:${id}`, 3600, JSON.stringify(result.rows[0]));

    res.json(result.rows[0]);
  } catch (error) {
    logger.error('Error fetching hotel:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota para atualizar hotel
app.put('/api/v1/hotels/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const schema = Joi.object({
      name: Joi.string().min(2).max(100).optional(),
      address: Joi.string().min(10).max(200).optional(),
      city: Joi.string().min(2).max(50).optional(),
      state: Joi.string().min(2).max(50).optional(),
      country: Joi.string().min(2).max(50).optional(),
      stars: Joi.number().integer().min(1).max(5).optional(),
      description: Joi.string().max(1000).optional(),
      amenities: Joi.array().items(Joi.string()).optional(),
      contact_email: Joi.string().email().optional(),
      contact_phone: Joi.string().min(10).max(20).optional(),
      status: Joi.string().valid('active', 'inactive', 'maintenance').optional()
    });

    const { error, value } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    // Construir query dinamicamente
    const fields = [];
    const values = [];
    let paramCount = 0;

    Object.keys(value).forEach(key => {
      if (value[key] !== undefined) {
        paramCount++;
        fields.push(`${key} = $${paramCount}`);
        values.push(value[key]);
      }
    });

    if (fields.length === 0) {
      return res.status(400).json({ error: 'Nenhum campo para atualizar' });
    }

    paramCount++;
    fields.push(`updated_at = NOW()`);
    values.push(id);

    const query = `UPDATE hotel_management SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`;
    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Hotel não encontrado' });
    }

    // Atualizar cache
    await redisClient.setEx(`hotel:${id}`, 3600, JSON.stringify(result.rows[0]));

    hotelOperationsTotal.labels('update', 'success').inc();

    logger.info(`Hotel updated: ${id}`);

    res.json(result.rows[0]);
  } catch (error) {
    hotelOperationsTotal.labels('update', 'error').inc();
    logger.error('Error updating hotel:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota para deletar hotel
app.delete('/api/v1/hotels/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'UPDATE hotel_management SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      ['inactive', id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Hotel não encontrado' });
    }

    // Remover do cache
    await redisClient.del(`hotel:${id}`);

    hotelOperationsTotal.labels('delete', 'success').inc();

    logger.info(`Hotel deactivated: ${id}`);

    res.json({ message: 'Hotel desativado com sucesso' });
  } catch (error) {
    hotelOperationsTotal.labels('delete', 'error').inc();
    logger.error('Error deactivating hotel:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota para listar quartos de um hotel
app.get('/api/v1/hotels/:id/rooms', async (req, res) => {
  try {
    const { id } = req.params;
    const { room_type, status } = req.query;

    let query = 'SELECT * FROM hotel_rooms WHERE hotel_id = $1';
    let params = [id];
    let paramCount = 1;

    if (room_type) {
      paramCount++;
      query += ` AND room_type = $${paramCount}`;
      params.push(room_type);
    }

    if (status) {
      paramCount++;
      query += ` AND status = $${paramCount}`;
      params.push(status);
    }

    query += ' ORDER BY room_number';

    const result = await pool.query(query, params);

    res.json({
      hotel_id: id,
      rooms: result.rows
    });
  } catch (error) {
    logger.error('Error fetching hotel rooms:', error);
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
      logger.info(`🚀 RSV Hotel Management running on port ${PORT}`);
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
