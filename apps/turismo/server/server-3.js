const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3003;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    service: 'RSV Hotel Management',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// API Routes
app.get('/', (req, res) => {
  res.json({
    message: 'RSV Hotel Management - Gestão de Hotéis',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/health',
      hotels: '/api/hotels',
      rooms: '/api/rooms'
    }
  });
});

// Hotel Management API routes
app.use('/api/hotels', (req, res) => {
  res.json({
    message: 'Hotel Management API',
    status: 'active',
    features: ['Hotel information', 'Room management', 'Amenities tracking']
  });
});

app.use('/api/rooms', (req, res) => {
  res.json({
    message: 'Room Management API',
    status: 'active',
    features: ['Room availability', 'Pricing', 'Maintenance tracking']
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
  console.log(`🏨 RSV Hotel Management running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
});
