const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(compression());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    service: 'RSV Ecosystem Master',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Serve static files
app.use(express.static('public'));

// API Routes
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

// API Gateway routes
app.use('/api', (req, res) => {
  res.json({
    message: 'API Gateway - RSV Ecosystem',
    availableServices: [
      'CRM System (port 3001)',
      'Booking Engine (port 3002)',
      'Hotel Management (port 3003)',
      'Analytics Intelligence (port 3004)'
    ]
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

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    message: 'The requested endpoint does not exist'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 RSV Ecosystem Master running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🌐 API Gateway: http://localhost:${PORT}/api`);
});
