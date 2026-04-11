const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Import routes
const brandingRoutes = require('./src/api/v1/branding/routes');
const enterprisesRoutes = require('./src/api/v1/enterprises/routes');
const propertiesRoutes = require('./src/api/v1/properties/routes');
const accommodationsRoutes = require('./src/api/v1/accommodations/routes');
const parksRoutes = require('./src/api/v1/parks/routes');
const attractionsRoutes = require('./src/api/v1/attractions/routes');
const promotionsRoutes = require('./src/api/v1/promotions/routes');
const travelRoutes = require('./src/api/v1/travel/routes');
const recommendationsRoutes = require('./src/api/v1/recommendations/routes');
const searchRoutes = require('./src/api/v1/search/routes');
const leadsRoutes = require('./src/api/v1/leads/routes');
const productsRoutes = require('./src/api/v1/products/routes');

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'RSV360 Backend API Server' });
});

// API routes
app.use('/api/v1/branding', brandingRoutes);
app.use('/api/v1/enterprises', enterprisesRoutes);
app.use('/api/v1/properties', propertiesRoutes);
app.use('/api/v1/accommodations', accommodationsRoutes);
app.use('/api/v1/parks', parksRoutes);
app.use('/api/v1/attractions', attractionsRoutes);
app.use('/api/v1/promotions', promotionsRoutes);
app.use('/api/v1/travel', travelRoutes);
app.use('/api/v1/recommendations', recommendationsRoutes);
app.use('/api/v1/search', searchRoutes);
app.use('/api/v1/leads', leadsRoutes);
app.use('/api/v1/products', productsRoutes);

// Error handling
app.use((err, req, res, next) => {
  console.error('[SERVER] Error:', err.message);
  res.status(500).json({ success: false, error: 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`[SERVER] RSV360 Backend API Server running on port ${PORT}`);
  console.log(`[SERVER] Health check: http://localhost:${PORT}/health`);
});