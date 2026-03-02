const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 5002;

// Middleware
app.use(cors());
app.use(express.json());

// Health Check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'RSV Onboarding Backend',
    port: PORT,
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Onboarding Status
app.get('/api/onboarding/status', (req, res) => {
  res.json({
    status: 'active',
    totalAgents: 150,
    activeAgents: 45,
    completedModules: 120,
    lastUpdate: new Date().toISOString()
  });
});

// Training Modules
app.get('/api/onboarding/training', (req, res) => {
  res.json({
    modules: [
      { id: 1, name: 'Introdução ao RSV 360', completed: true },
      { id: 2, name: 'Gestão de Hotéis', completed: true },
      { id: 3, name: 'Sistema de Reservas', completed: false },
      { id: 4, name: 'Atendimento ao Cliente', completed: false }
    ],
    totalModules: 4,
    completedModules: 2
  });
});

// Progress Tracking
app.get('/api/onboarding/progress/:agentId', (req, res) => {
  const { agentId } = req.params;
  res.json({
    agentId: agentId,
    progress: 65,
    completedModules: 2,
    totalModules: 4,
    lastActivity: new Date().toISOString(),
    nextModule: 'Sistema de Reservas'
  });
});

// Hotels CRUD
app.get('/admin/hotels', (req, res) => {
  res.json({
    hotels: [
      { id: 1, name: 'Hotel RSV Premium', location: 'Caldas Novas', status: 'active' },
      { id: 2, name: 'Resort RSV Spa', location: 'Rio Quente', status: 'active' }
    ]
  });
});

// Promotions CRUD
app.get('/admin/promotions', (req, res) => {
  res.json({
    promotions: [
      { id: 1, title: 'Pacote Família', discount: 20, validUntil: '2025-12-31' },
      { id: 2, title: 'Fim de Semana', discount: 15, validUntil: '2025-11-30' }
    ]
  });
});

// Attractions CRUD
app.get('/admin/attractions', (req, res) => {
  res.json({
    attractions: [
      { id: 1, name: 'Parque Aquático', type: 'aquatic', capacity: 500 },
      { id: 2, name: 'Termas', type: 'thermal', capacity: 200 }
    ]
  });
});

// Tickets CRUD
app.get('/admin/tickets', (req, res) => {
  res.json({
    tickets: [
      { id: 1, type: 'Diário', price: 50.00, validFor: '1 day' },
      { id: 2, type: 'Semanal', price: 200.00, validFor: '7 days' }
    ]
  });
});

// Upload API
app.post('/uploads', (req, res) => {
  res.json({
    message: 'Upload endpoint ready',
    status: 'success',
    timestamp: new Date().toISOString()
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'RSV Onboarding Backend API',
    version: '1.0.0',
    endpoints: [
      'GET /health',
      'GET /api/onboarding/status',
      'GET /api/onboarding/training',
      'GET /api/onboarding/progress/:agentId',
      'GET /admin/hotels',
      'GET /admin/promotions',
      'GET /admin/attractions',
      'GET /admin/tickets',
      'POST /uploads'
    ]
  });
});

app.listen(PORT, () => {
  console.log(`🚀 RSV Onboarding Backend rodando na porta ${PORT}`);
  console.log(`📊 Health Check: http://localhost:${PORT}/health`);
  console.log(`📚 API Docs: http://localhost:${PORT}/`);
});
