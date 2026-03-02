// 🌐 API GATEWAY - RSV 360° ECOSYSTEM AI
// Funcionalidade: Gateway central para todos os módulos do ecossistema
// Status: ✅ 100% FUNCIONAL

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import jwt from 'jsonwebtoken';
import { createProxyMiddleware } from 'http-proxy-middleware';
import ecosystemConfig from '../ecosystem-config.json';

const app = express();
const PORT = ecosystemConfig.modules['ecosystem-master']['api-gateway'].port;

// 🔒 MIDDLEWARE DE SEGURANÇA
app.use(helmet());
app.use(cors(ecosystemConfig.security.cors));

// 📊 RATE LIMITING
const globalLimiter = rateLimit(ecosystemConfig.security.rateLimit.global);
const apiLimiter = rateLimit(ecosystemConfig.security.rateLimit.api);

app.use(globalLimiter);

// 🔐 MIDDLEWARE DE AUTENTICAÇÃO
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token de acesso requerido' });
  }

  jwt.verify(token, ecosystemConfig.modules['ecosystem-master']['auth-service'].jwt.secret, (err: any, user: any) => {
    if (err) {
      return res.status(403).json({ error: 'Token inválido' });
    }
    req.user = user;
    next();
  });
};

// 🎯 ROTAS DOS MÓDULOS DE NEGÓCIO
const businessModules = ecosystemConfig.modules['business-modules'];

// CRM System
app.use('/api/v1/ecosystem/crm', apiLimiter, authenticateToken, 
  createProxyMiddleware({
    target: `http://localhost:${businessModules['crm-system'].port}`,
    changeOrigin: true,
    pathRewrite: {
      '^/api/v1/ecosystem/crm': '/api'
    }
  })
);

// Booking Engine
app.use('/api/v1/ecosystem/booking', apiLimiter, authenticateToken,
  createProxyMiddleware({
    target: `http://localhost:${businessModules['booking-engine'].port}`,
    changeOrigin: true,
    pathRewrite: {
      '^/api/v1/ecosystem/booking': '/api'
    }
  })
);

// Payment Gateway
app.use('/api/v1/ecosystem/payment', apiLimiter, authenticateToken,
  createProxyMiddleware({
    target: `http://localhost:${businessModules['payment-gateway'].port}`,
    changeOrigin: true,
    pathRewrite: {
      '^/api/v1/ecosystem/payment': '/api'
    }
  })
);

// Customer Service
app.use('/api/v1/ecosystem/support', apiLimiter, authenticateToken,
  createProxyMiddleware({
    target: `http://localhost:${businessModules['customer-service'].port}`,
    changeOrigin: true,
    pathRewrite: {
      '^/api/v1/ecosystem/support': '/api'
    }
  })
);

// Marketing Automation
app.use('/api/v1/ecosystem/marketing', apiLimiter, authenticateToken,
  createProxyMiddleware({
    target: `http://localhost:${businessModules['marketing-automation'].port}`,
    changeOrigin: true,
    pathRewrite: {
      '^/api/v1/ecosystem/marketing': '/api'
    }
  })
);

// Financial System
app.use('/api/v1/ecosystem/financial', apiLimiter, authenticateToken,
  createProxyMiddleware({
    target: `http://localhost:${businessModules['financial-system'].port}`,
    changeOrigin: true,
    pathRewrite: {
      '^/api/v1/ecosystem/financial': '/api'
    }
  })
);

// Product Catalog
app.use('/api/v1/ecosystem/catalog', apiLimiter, authenticateToken,
  createProxyMiddleware({
    target: `http://localhost:${businessModules['product-catalog'].port}`,
    changeOrigin: true,
    pathRewrite: {
      '^/api/v1/ecosystem/catalog': '/api'
    }
  })
);

// 🎯 ROTAS DOS MÓDULOS PÚBLICOS
const publicModules = ecosystemConfig.modules['public-facing'];

// Website Public
app.use('/api/v1/ecosystem/public',
  createProxyMiddleware({
    target: `http://localhost:${publicModules['website-public'].port}`,
    changeOrigin: true,
    pathRewrite: {
      '^/api/v1/ecosystem/public': '/api'
    }
  })
);

// Customer Portal
app.use('/api/v1/ecosystem/portal', authenticateToken,
  createProxyMiddleware({
    target: `http://localhost:${publicModules['customer-portal'].port}`,
    changeOrigin: true,
    pathRewrite: {
      '^/api/v1/ecosystem/portal': '/api'
    }
  })
);

// 🎯 ROTAS DOS MÓDULOS DE ANALYTICS
const analyticsModules = ecosystemConfig.modules['analytics-intelligence'];

// Business Intelligence
app.use('/api/v1/ecosystem/analytics', apiLimiter, authenticateToken,
  createProxyMiddleware({
    target: `http://localhost:${analyticsModules['business-intelligence'].port}`,
    changeOrigin: true,
    pathRewrite: {
      '^/api/v1/ecosystem/analytics': '/api'
    }
  })
);

// AI Recommendations
app.use('/api/v1/ecosystem/ai', apiLimiter, authenticateToken,
  createProxyMiddleware({
    target: `http://localhost:${analyticsModules['ai-recommendations'].port}`,
    changeOrigin: true,
    pathRewrite: {
      '^/api/v1/ecosystem/ai': '/api'
    }
  })
);

// 🏥 HEALTH CHECK
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    ecosystem: ecosystemConfig.ecosystem.name,
    version: ecosystemConfig.ecosystem.version,
    timestamp: new Date().toISOString(),
    modules: {
      business: Object.keys(businessModules).length,
      public: Object.keys(publicModules).length,
      analytics: Object.keys(analyticsModules).length
    }
  });
});

// 📊 ECOSYSTEM STATUS
app.get('/api/v1/ecosystem/status', authenticateToken, (req, res) => {
  res.json({
    ecosystem: {
      name: ecosystemConfig.ecosystem.name,
      version: ecosystemConfig.ecosystem.version,
      company: ecosystemConfig.ecosystem.company
    },
    modules: {
      business: businessModules,
      public: publicModules,
      analytics: analyticsModules
    },
    integration: ecosystemConfig.integration,
    security: {
      cors: ecosystemConfig.security.cors,
      rateLimit: ecosystemConfig.security.rateLimit
    }
  });
});

// 🚀 INICIAR SERVIDOR
app.listen(PORT, () => {
  console.log(`🌟 RSV 360° Ecosystem AI Gateway rodando na porta ${PORT}`);
  console.log(`📡 Base URL: http://localhost:${PORT}/api/v1/ecosystem`);
  console.log(`🏥 Health Check: http://localhost:${PORT}/health`);
  console.log(`📊 Status: http://localhost:${PORT}/api/v1/ecosystem/status`);
});

export default app;
