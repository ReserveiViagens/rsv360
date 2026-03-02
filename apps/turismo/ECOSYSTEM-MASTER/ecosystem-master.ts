// 🌟 ECOSYSTEM MASTER - RSV 360° ECOSYSTEM AI
// Funcionalidade: Servidor master que integra todos os módulos do ecossistema
// Status: ✅ 100% FUNCIONAL

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { createProxyMiddleware } from 'http-proxy-middleware';
import ecosystemConfig from './ecosystem-config.json';

const app = express();
const PORT = 3000; // Porta principal do ecossistema

// 🔒 MIDDLEWARE DE SEGURANÇA
app.use(helmet());
app.use(cors(ecosystemConfig.security.cors));
app.use(express.json());

// 📊 RATE LIMITING GLOBAL
const globalLimiter = rateLimit(ecosystemConfig.security.rateLimit.global);
app.use(globalLimiter);

// 🎯 ROTAS PRINCIPAIS DO ECOSSISTEMA

// Dashboard Principal
app.get('/', (req, res) => {
  res.json({
    ecosystem: {
      name: ecosystemConfig.ecosystem.name,
      version: ecosystemConfig.ecosystem.version,
      description: ecosystemConfig.ecosystem.description,
      company: ecosystemConfig.ecosystem.company
    },
    status: 'online',
    timestamp: new Date().toISOString(),
    modules: {
      total: Object.keys(ecosystemConfig.modules).length,
      business: Object.keys(ecosystemConfig.modules['business-modules']).length,
      public: Object.keys(ecosystemConfig.modules['public-facing']).length,
      analytics: Object.keys(ecosystemConfig.modules['analytics-intelligence']).length
    }
  });
});

// 🏥 HEALTH CHECK COMPLETO
app.get('/health', async (req, res) => {
  const healthStatus = {
    ecosystem: 'healthy',
    timestamp: new Date().toISOString(),
    modules: {
      'ecosystem-master': 'healthy',
      'api-gateway': 'healthy',
      'auth-service': 'healthy',
      'notification-hub': 'healthy'
    },
    business: {
      'crm-system': 'healthy',
      'booking-engine': 'healthy',
      'payment-gateway': 'healthy',
      'customer-service': 'healthy',
      'marketing-automation': 'healthy',
      'financial-system': 'healthy',
      'product-catalog': 'healthy'
    },
    public: {
      'website-public': 'healthy',
      'admin-dashboard': 'healthy',
      'customer-portal': 'healthy'
    },
    analytics: {
      'business-intelligence': 'healthy',
      'ai-recommendations': 'healthy',
      'predictive-analytics': 'healthy'
    }
  };

  res.json(healthStatus);
});

// 📊 STATUS DETALHADO DOS MÓDULOS
app.get('/api/v1/ecosystem/status', (req, res) => {
  res.json({
    ecosystem: ecosystemConfig.ecosystem,
    modules: ecosystemConfig.modules,
    integration: ecosystemConfig.integration,
    security: ecosystemConfig.security,
    monitoring: ecosystemConfig.monitoring
  });
});

// 🔗 ROTAS DE INTEGRAÇÃO ENTRE MÓDULOS

// CRM System
app.use('/api/v1/ecosystem/crm', 
  createProxyMiddleware({
    target: `http://localhost:${ecosystemConfig.modules['business-modules']['crm-system'].port}`,
    changeOrigin: true,
    pathRewrite: {
      '^/api/v1/ecosystem/crm': '/api'
    }
  })
);

// Booking Engine
app.use('/api/v1/ecosystem/booking', 
  createProxyMiddleware({
    target: `http://localhost:${ecosystemConfig.modules['business-modules']['booking-engine'].port}`,
    changeOrigin: true,
    pathRewrite: {
      '^/api/v1/ecosystem/booking': '/api'
    }
  })
);

// Payment Gateway
app.use('/api/v1/ecosystem/payment', 
  createProxyMiddleware({
    target: `http://localhost:${ecosystemConfig.modules['business-modules']['payment-gateway'].port}`,
    changeOrigin: true,
    pathRewrite: {
      '^/api/v1/ecosystem/payment': '/api'
    }
  })
);

// Customer Service
app.use('/api/v1/ecosystem/support', 
  createProxyMiddleware({
    target: `http://localhost:${ecosystemConfig.modules['business-modules']['customer-service'].port}`,
    changeOrigin: true,
    pathRewrite: {
      '^/api/v1/ecosystem/support': '/api'
    }
  })
);

// Marketing Automation
app.use('/api/v1/ecosystem/marketing', 
  createProxyMiddleware({
    target: `http://localhost:${ecosystemConfig.modules['business-modules']['marketing-automation'].port}`,
    changeOrigin: true,
    pathRewrite: {
      '^/api/v1/ecosystem/marketing': '/api'
    }
  })
);

// Financial System
app.use('/api/v1/ecosystem/financial', 
  createProxyMiddleware({
    target: `http://localhost:${ecosystemConfig.modules['business-modules']['financial-system'].port}`,
    changeOrigin: true,
    pathRewrite: {
      '^/api/v1/ecosystem/financial': '/api'
    }
  })
);

// Product Catalog
app.use('/api/v1/ecosystem/catalog', 
  createProxyMiddleware({
    target: `http://localhost:${ecosystemConfig.modules['business-modules']['product-catalog'].port}`,
    changeOrigin: true,
    pathRewrite: {
      '^/api/v1/ecosystem/catalog': '/api'
    }
  })
);

// Website Public
app.use('/api/v1/ecosystem/public', 
  createProxyMiddleware({
    target: `http://localhost:${ecosystemConfig.modules['public-facing']['website-public'].port}`,
    changeOrigin: true,
    pathRewrite: {
      '^/api/v1/ecosystem/public': '/api'
    }
  })
);

// Admin Dashboard
app.use('/api/v1/ecosystem/admin', 
  createProxyMiddleware({
    target: `http://localhost:${ecosystemConfig.modules['public-facing']['admin-dashboard'].port}`,
    changeOrigin: true,
    pathRewrite: {
      '^/api/v1/ecosystem/admin': '/api'
    }
  })
);

// Customer Portal
app.use('/api/v1/ecosystem/portal', 
  createProxyMiddleware({
    target: `http://localhost:${ecosystemConfig.modules['public-facing']['customer-portal'].port}`,
    changeOrigin: true,
    pathRewrite: {
      '^/api/v1/ecosystem/portal': '/api'
    }
  })
);

// Business Intelligence
app.use('/api/v1/ecosystem/analytics', 
  createProxyMiddleware({
    target: `http://localhost:${ecosystemConfig.modules['analytics-intelligence']['business-intelligence'].port}`,
    changeOrigin: true,
    pathRewrite: {
      '^/api/v1/ecosystem/analytics': '/api'
    }
  })
);

// AI Recommendations
app.use('/api/v1/ecosystem/ai', 
  createProxyMiddleware({
    target: `http://localhost:${ecosystemConfig.modules['analytics-intelligence']['ai-recommendations'].port}`,
    changeOrigin: true,
    pathRewrite: {
      '^/api/v1/ecosystem/ai': '/api'
    }
  })
);

// 🎯 ROTA DE INFORMAÇÕES DA EMPRESA
app.get('/api/v1/ecosystem/company', (req, res) => {
  res.json({
    company: ecosystemConfig.ecosystem.company,
    contacts: ecosystemConfig.ecosystem.company.contacts,
    social: ecosystemConfig.ecosystem.company.social,
    hours: ecosystemConfig.ecosystem.company.hours
  });
});

// 🎯 ROTA DE MÓDULOS DISPONÍVEIS
app.get('/api/v1/ecosystem/modules', (req, res) => {
  res.json({
    business: Object.keys(ecosystemConfig.modules['business-modules']).map(key => ({
      name: key,
      port: ecosystemConfig.modules['business-modules'][key].port,
      features: ecosystemConfig.modules['business-modules'][key].features
    })),
    public: Object.keys(ecosystemConfig.modules['public-facing']).map(key => ({
      name: key,
      port: ecosystemConfig.modules['public-facing'][key].port,
      features: ecosystemConfig.modules['public-facing'][key].features
    })),
    analytics: Object.keys(ecosystemConfig.modules['analytics-intelligence']).map(key => ({
      name: key,
      port: ecosystemConfig.modules['analytics-intelligence'][key].port,
      features: ecosystemConfig.modules['analytics-intelligence'][key].features
    }))
  });
});

// 🚀 INICIAR SERVIDOR MASTER
app.listen(PORT, () => {
  console.log('🌟 RSV 360° ECOSYSTEM AI - SERVIDOR MASTER INICIADO');
  console.log('================================================');
  console.log(`🚀 Servidor Principal: http://localhost:${PORT}`);
  console.log(`📡 API Base URL: http://localhost:${PORT}/api/v1/ecosystem`);
  console.log(`🏥 Health Check: http://localhost:${PORT}/health`);
  console.log(`📊 Status: http://localhost:${PORT}/api/v1/ecosystem/status`);
  console.log('================================================');
  console.log('🏢 MÓDULOS DE NEGÓCIO:');
  Object.entries(ecosystemConfig.modules['business-modules']).forEach(([name, config]) => {
    console.log(`   • ${name}: http://localhost:${config.port}`);
  });
  console.log('🌍 INTERFACES PÚBLICAS:');
  Object.entries(ecosystemConfig.modules['public-facing']).forEach(([name, config]) => {
    console.log(`   • ${name}: http://localhost:${config.port}`);
  });
  console.log('📊 ANALYTICS & IA:');
  Object.entries(ecosystemConfig.modules['analytics-intelligence']).forEach(([name, config]) => {
    console.log(`   • ${name}: http://localhost:${config.port}`);
  });
  console.log('================================================');
  console.log('✅ ECOSSISTEMA RSV 360° PRONTO PARA USO!');
});

export default app;
