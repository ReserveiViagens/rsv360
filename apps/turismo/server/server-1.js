const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    service: 'RSV Booking Engine',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// API Routes
app.get('/', (req, res) => {
  res.json({
    message: 'RSV Booking Engine - Motor de Reservas',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/health',
      bookings: '/api/bookings',
      hotels: '/api/hotels'
    }
  });
});

// Booking API routes
app.use('/api/bookings', (req, res) => {
  res.json({
    message: 'Booking Engine API',
    status: 'active',
    features: ['Reservation management', 'Availability checking', 'Payment processing']
  });
});

app.use('/api/hotels', (req, res) => {
  res.json({
    message: 'Hotel Management API',
    status: 'active',
    features: ['Hotel listings', 'Room availability', 'Pricing management']
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
  console.log(`🎯 RSV Booking Engine running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
});
