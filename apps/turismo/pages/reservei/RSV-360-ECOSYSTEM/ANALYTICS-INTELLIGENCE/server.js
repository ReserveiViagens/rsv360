// 📊 ANALYTICS INTELLIGENCE - Inteligência de Dados
// RSV 360° Ecosystem - Sistema de Análise e Inteligência

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
const _ = require('lodash');

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
  defaultMeta: { service: 'analytics-intelligence' },
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
  name: 'analytics_http_request_duration_seconds',
  help: 'Duration of Analytics HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10]
});

const analyticsQueriesTotal = new client.Counter({
  name: 'analytics_queries_total',
  help: 'Total number of analytics queries',
  labelNames: ['type', 'status']
});

register.registerMetric(httpRequestDuration);
register.registerMetric(analyticsQueriesTotal);

// Configurar aplicação Express
const app = express();
const PORT = process.env.PORT || 3004;

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
      service: 'analytics-intelligence',
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
      service: 'analytics-intelligence',
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
    message: 'RSV 360° Ecosystem - Analytics Intelligence',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/health',
      metrics: '/metrics',
      api: '/api/v1'
    }
  });
});

// Rotas da API de Analytics
app.use('/api/v1', authenticateToken);

// Rota para dashboard principal
app.get('/api/v1/dashboard', async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    
    // Calcular datas baseadas no período
    const endDate = moment();
    const startDate = moment().subtract(parseInt(period.replace('d', '')), 'days');

    // Buscar métricas principais
    const [
      totalCustomers,
      totalBookings,
      totalRevenue,
      activeHotels
    ] = await Promise.all([
      pool.query('SELECT COUNT(*) as count FROM crm_customers'),
      pool.query('SELECT COUNT(*) as count FROM booking_reservations WHERE created_at >= $1', [startDate.toISOString()]),
      pool.query('SELECT COALESCE(SUM(total_amount), 0) as total FROM booking_reservations WHERE status = $1 AND created_at >= $2', ['confirmed', startDate.toISOString()]),
      pool.query('SELECT COUNT(*) as count FROM hotel_management WHERE status = $1', ['active'])
    ]);

    // Buscar dados de tendências
    const bookingTrends = await pool.query(`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as bookings,
        SUM(total_amount) as revenue
      FROM booking_reservations 
      WHERE created_at >= $1 
      GROUP BY DATE(created_at) 
      ORDER BY date
    `, [startDate.toISOString()]);

    // Buscar top hotéis
    const topHotels = await pool.query(`
      SELECT 
        h.name,
        h.city,
        COUNT(b.id) as bookings,
        SUM(b.total_amount) as revenue
      FROM hotel_management h
      LEFT JOIN booking_reservations b ON h.id = b.hotel_id
      WHERE b.created_at >= $1 OR b.created_at IS NULL
      GROUP BY h.id, h.name, h.city
      ORDER BY bookings DESC
      LIMIT 5
    `, [startDate.toISOString()]);

    analyticsQueriesTotal.labels('dashboard', 'success').inc();

    res.json({
      period,
      summary: {
        total_customers: parseInt(totalCustomers.rows[0].count),
        total_bookings: parseInt(totalBookings.rows[0].count),
        total_revenue: parseFloat(totalRevenue.rows[0].total),
        active_hotels: parseInt(activeHotels.rows[0].count)
      },
      trends: {
        bookings: bookingTrends.rows.map(row => ({
          date: row.date,
          bookings: parseInt(row.bookings),
          revenue: parseFloat(row.revenue || 0)
        }))
      },
      top_hotels: topHotels.rows.map(row => ({
        name: row.name,
        city: row.city,
        bookings: parseInt(row.bookings || 0),
        revenue: parseFloat(row.revenue || 0)
      }))
    });
  } catch (error) {
    analyticsQueriesTotal.labels('dashboard', 'error').inc();
    logger.error('Error fetching dashboard data:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota para relatório de vendas
app.get('/api/v1/reports/sales', async (req, res) => {
  try {
    const { start_date, end_date, group_by = 'day' } = req.query;

    if (!start_date || !end_date) {
      return res.status(400).json({ error: 'start_date e end_date são obrigatórios' });
    }

    const startDate = moment(start_date);
    const endDate = moment(end_date);

    if (!startDate.isValid() || !endDate.isValid()) {
      return res.status(400).json({ error: 'Datas inválidas' });
    }

    let dateFormat;
    switch (group_by) {
      case 'hour':
        dateFormat = 'YYYY-MM-DD HH24:00:00';
        break;
      case 'day':
        dateFormat = 'YYYY-MM-DD';
        break;
      case 'week':
        dateFormat = 'YYYY-"W"WW';
        break;
      case 'month':
        dateFormat = 'YYYY-MM';
        break;
      default:
        dateFormat = 'YYYY-MM-DD';
    }

    const result = await pool.query(`
      SELECT 
        TO_CHAR(created_at, $1) as period,
        COUNT(*) as bookings,
        SUM(total_amount) as revenue,
        AVG(total_amount) as avg_booking_value
      FROM booking_reservations 
      WHERE created_at >= $2 AND created_at <= $3
      AND status = 'confirmed'
      GROUP BY TO_CHAR(created_at, $1)
      ORDER BY period
    `, [dateFormat, startDate.toISOString(), endDate.toISOString()]);

    analyticsQueriesTotal.labels('sales_report', 'success').inc();

    res.json({
      period: { start_date, end_date, group_by },
      data: result.rows.map(row => ({
        period: row.period,
        bookings: parseInt(row.bookings),
        revenue: parseFloat(row.revenue || 0),
        avg_booking_value: parseFloat(row.avg_booking_value || 0)
      }))
    });
  } catch (error) {
    analyticsQueriesTotal.labels('sales_report', 'error').inc();
    logger.error('Error generating sales report:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota para análise de clientes
app.get('/api/v1/analytics/customers', async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    const startDate = moment().subtract(parseInt(period.replace('d', '')), 'days');

    // Análise de novos clientes
    const newCustomers = await pool.query(`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as new_customers
      FROM crm_customers 
      WHERE created_at >= $1
      GROUP BY DATE(created_at)
      ORDER BY date
    `, [startDate.toISOString()]);

    // Análise de clientes por localização
    const customersByLocation = await pool.query(`
      SELECT 
        c.company,
        COUNT(*) as customer_count
      FROM crm_customers c
      WHERE c.created_at >= $1
      AND c.company IS NOT NULL
      GROUP BY c.company
      ORDER BY customer_count DESC
      LIMIT 10
    `, [startDate.toISOString()]);

    // Análise de atividade de clientes
    const customerActivity = await pool.query(`
      SELECT 
        c.id,
        c.name,
        c.email,
        COUNT(b.id) as total_bookings,
        SUM(b.total_amount) as total_spent,
        MAX(b.created_at) as last_booking
      FROM crm_customers c
      LEFT JOIN booking_reservations b ON c.id = b.customer_id
      WHERE c.created_at >= $1
      GROUP BY c.id, c.name, c.email
      ORDER BY total_spent DESC
      LIMIT 20
    `, [startDate.toISOString()]);

    analyticsQueriesTotal.labels('customer_analysis', 'success').inc();

    res.json({
      period,
      new_customers_trend: newCustomers.rows.map(row => ({
        date: row.date,
        new_customers: parseInt(row.new_customers)
      })),
      customers_by_company: customersByLocation.rows.map(row => ({
        company: row.company,
        customer_count: parseInt(row.customer_count)
      })),
      top_customers: customerActivity.rows.map(row => ({
        id: row.id,
        name: row.name,
        email: row.email,
        total_bookings: parseInt(row.total_bookings || 0),
        total_spent: parseFloat(row.total_spent || 0),
        last_booking: row.last_booking
      }))
    });
  } catch (error) {
    analyticsQueriesTotal.labels('customer_analysis', 'error').inc();
    logger.error('Error analyzing customers:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota para análise de hotéis
app.get('/api/v1/analytics/hotels', async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    const startDate = moment().subtract(parseInt(period.replace('d', '')), 'days');

    // Performance por hotel
    const hotelPerformance = await pool.query(`
      SELECT 
        h.id,
        h.name,
        h.city,
        h.stars,
        COUNT(b.id) as total_bookings,
        SUM(b.total_amount) as total_revenue,
        AVG(b.total_amount) as avg_booking_value,
        COUNT(DISTINCT b.customer_id) as unique_customers
      FROM hotel_management h
      LEFT JOIN booking_reservations b ON h.id = b.hotel_id 
        AND b.created_at >= $1
        AND b.status = 'confirmed'
      WHERE h.status = 'active'
      GROUP BY h.id, h.name, h.city, h.stars
      ORDER BY total_revenue DESC
    `, [startDate.toISOString()]);

    // Análise por tipo de quarto
    const roomTypeAnalysis = await pool.query(`
      SELECT 
        room_type,
        COUNT(*) as bookings,
        SUM(total_amount) as revenue,
        AVG(total_amount) as avg_price
      FROM booking_reservations 
      WHERE created_at >= $1
      AND status = 'confirmed'
      GROUP BY room_type
      ORDER BY revenue DESC
    `, [startDate.toISOString()]);

    analyticsQueriesTotal.labels('hotel_analysis', 'success').inc();

    res.json({
      period,
      hotel_performance: hotelPerformance.rows.map(row => ({
        id: row.id,
        name: row.name,
        city: row.city,
        stars: parseInt(row.stars),
        total_bookings: parseInt(row.total_bookings || 0),
        total_revenue: parseFloat(row.total_revenue || 0),
        avg_booking_value: parseFloat(row.avg_booking_value || 0),
        unique_customers: parseInt(row.unique_customers || 0)
      })),
      room_type_analysis: roomTypeAnalysis.rows.map(row => ({
        room_type: row.room_type,
        bookings: parseInt(row.bookings),
        revenue: parseFloat(row.revenue || 0),
        avg_price: parseFloat(row.avg_price || 0)
      }))
    });
  } catch (error) {
    analyticsQueriesTotal.labels('hotel_analysis', 'error').inc();
    logger.error('Error analyzing hotels:', error);
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
      logger.info(`🚀 RSV Analytics Intelligence running on port ${PORT}`);
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
