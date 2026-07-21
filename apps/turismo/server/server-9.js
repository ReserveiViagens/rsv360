const { getJwtSecret, JWT_HS256_VERIFY_OPTIONS, assertJwtSecretsConfigured } = require('@rsv360/shared');
// 🎯 ECOSYSTEM MASTER - Servidor Principal
// RSV 360° Ecosystem - API Gateway e Servidor Central

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const { Pool } = require('pg');
const redis = require('redis');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
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
  defaultMeta: { service: 'ecosystem-master' },
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
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10]
});

const httpRequestsTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code']
});

register.registerMetric(httpRequestDuration);
register.registerMetric(httpRequestsTotal);

// Configurar aplicação Express
assertJwtSecretsConfigured();
const app = express();
const PORT = process.env.PORT || 3000;

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
    
    httpRequestsTotal
      .labels(req.method, route, res.statusCode)
      .inc();
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
    const decoded = jwt.verify(token, getJwtSecret(), JWT_HS256_VERIFY_OPTIONS);
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
    message: 'RSV 360° Ecosystem Master - Servidor Principal',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/health',
      metrics: '/metrics',
      api: '/api/v1'
    }
  });
});

// Rotas da API
app.use('/api/v1', authenticateToken);

// Rota de autenticação
app.post('/api/v1/auth/login', async (req, res) => {
  try {
    const schema = Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().min(6).required()
    });

    const { error, value } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { email, password } = value;

    // Buscar usuário no banco
    const result = await pool.query(
      'SELECT id, email, password_hash FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const user = result.rows[0];

    // Verificar senha
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    // Gerar token JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      getJwtSecret(),
      { expiresIn: '24h' }
    );

    // Armazenar token no Redis
    await redisClient.setEx(`token:${user.id}`, 86400, token);

    logger.info(`User ${email} logged in successfully`);

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email
      }
    });
  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota de logout
app.post('/api/v1/auth/logout', authenticateToken, async (req, res) => {
  try {
    // Remover token do Redis
    await redisClient.del(`token:${req.user.userId}`);
    
    logger.info(`User ${req.user.email} logged out`);
    
    res.json({ message: 'Logout realizado com sucesso' });
  } catch (error) {
    logger.error('Logout error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota de informações do usuário
app.get('/api/v1/user/profile', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, email, created_at FROM users WHERE id = $1',
      [req.user.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    logger.error('Profile error:', error);
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
      logger.info(`🚀 RSV Ecosystem Master running on port ${PORT}`);
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
