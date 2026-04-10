const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3004;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    service: 'RSV Analytics Intelligence',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// API Routes
app.get('/', (req, res) => {
  res.json({
    message: 'RSV Analytics Intelligence - Inteligência de Dados',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/health',
      analytics: '/api/analytics',
      reports: '/api/reports'
    }
  });
});

// Analytics API routes
app.use('/api/analytics', (req, res) => {
  res.json({
    message: 'Analytics Intelligence API',
    status: 'active',
    features: ['Data analysis', 'Business intelligence', 'Performance metrics']
  });
});

app.use('/api/reports', (req, res) => {
  res.json({
    message: 'Reports API',
    status: 'active',
    features: ['Custom reports', 'Data visualization', 'Export functionality']
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

app.listen(PORT, () => {
  console.log(`📊 RSV Analytics Intelligence running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
});
