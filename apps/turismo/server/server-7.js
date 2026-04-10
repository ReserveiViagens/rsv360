// 👥 CRM SYSTEM - Sistema de Gestão de Clientes
// RSV 360° Ecosystem - Módulo de CRM

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
  defaultMeta: { service: 'crm-system' },
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
  name: 'crm_http_request_duration_seconds',
  help: 'Duration of CRM HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10]
});

const crmCustomersTotal = new client.Counter({
  name: 'crm_customers_total',
  help: 'Total number of CRM customers',
  labelNames: ['status']
});

register.registerMetric(httpRequestDuration);
register.registerMetric(crmCustomersTotal);

// Configurar aplicação Express
const app = express();
const PORT = process.env.PORT || 3001;

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
      service: 'crm-system',
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
      service: 'crm-system',
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
    message: 'RSV 360° Ecosystem - CRM System',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/health',
      metrics: '/metrics',
      api: '/api/v1'
    }
  });
});

// Rotas da API CRM
app.use('/api/v1', authenticateToken);

// Rota para listar clientes
app.get('/api/v1/customers', async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const offset = (page - 1) * limit;

    let query = 'SELECT * FROM crm_customers';
    let params = [];
    let paramCount = 0;

    if (search) {
      query += ' WHERE name ILIKE $1 OR email ILIKE $1';
      params.push(`%${search}%`);
      paramCount = 1;
    }

    query += ` ORDER BY created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);

    // Contar total de registros
    let countQuery = 'SELECT COUNT(*) FROM crm_customers';
    let countParams = [];
    if (search) {
      countQuery += ' WHERE name ILIKE $1 OR email ILIKE $1';
      countParams.push(`%${search}%`);
    }
    const countResult = await pool.query(countQuery, countParams);

    res.json({
      customers: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(countResult.rows[0].count),
        pages: Math.ceil(countResult.rows[0].count / limit)
      }
    });
  } catch (error) {
    logger.error('Error fetching customers:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota para criar cliente
app.post('/api/v1/customers', async (req, res) => {
  try {
    const schema = Joi.object({
      name: Joi.string().min(2).max(100).required(),
      email: Joi.string().email().required(),
      phone: Joi.string().min(10).max(20).optional(),
      company: Joi.string().max(100).optional(),
      notes: Joi.string().max(500).optional()
    });

    const { error, value } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { name, email, phone, company, notes } = value;

    const result = await pool.query(
      `INSERT INTO crm_customers (name, email, phone, company, notes, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
       RETURNING *`,
      [name, email, phone, company, notes]
    );

    crmCustomersTotal.labels('created').inc();

    logger.info(`Customer created: ${email}`);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    if (error.code === '23505') { // Unique constraint violation
      return res.status(409).json({ error: 'Cliente com este email já existe' });
    }
    logger.error('Error creating customer:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota para obter cliente por ID
app.get('/api/v1/customers/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'SELECT * FROM crm_customers WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    logger.error('Error fetching customer:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota para atualizar cliente
app.put('/api/v1/customers/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const schema = Joi.object({
      name: Joi.string().min(2).max(100).optional(),
      email: Joi.string().email().optional(),
      phone: Joi.string().min(10).max(20).optional(),
      company: Joi.string().max(100).optional(),
      notes: Joi.string().max(500).optional()
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

    const query = `UPDATE crm_customers SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`;
    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }

    crmCustomersTotal.labels('updated').inc();

    logger.info(`Customer updated: ${id}`);

    res.json(result.rows[0]);
  } catch (error) {
    if (error.code === '23505') { // Unique constraint violation
      return res.status(409).json({ error: 'Cliente com este email já existe' });
    }
    logger.error('Error updating customer:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota para deletar cliente
app.delete('/api/v1/customers/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM crm_customers WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }

    crmCustomersTotal.labels('deleted').inc();

    logger.info(`Customer deleted: ${id}`);

    res.json({ message: 'Cliente deletado com sucesso' });
  } catch (error) {
    logger.error('Error deleting customer:', error);
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
      logger.info(`🚀 RSV CRM System running on port ${PORT}`);
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
