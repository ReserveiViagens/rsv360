const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    service: 'RSV CRM System',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// API Routes
app.get('/', (req, res) => {
  res.json({
    message: 'RSV CRM System - Sistema de Gestão de Clientes',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/health',
      customers: '/api/customers',
      users: '/api/users'
    }
  });
});

// CRM API routes
app.use('/api/customers', (req, res) => {
  res.json({
    message: 'CRM Customers API',
    status: 'active',
    features: ['Customer profiles', 'Contact management', 'Interaction history']
  });
});

app.use('/api/users', (req, res) => {
  res.json({
    message: 'CRM Users API',
    status: 'active',
    features: ['User management', 'Role-based access', 'Authentication']
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
  console.log(`🏢 RSV CRM System running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
});
