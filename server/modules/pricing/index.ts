import { Application } from 'express';
import { pricingRoutes, competitorRoutes, otaRoutes, alertsRoutes } from './routes';

export const registerPricingRoutes = (app: Application) => {
  console.log('🔧 Registering pricing module routes...');

  // Base path for all pricing routes
  const basePath = '/api/pricing';

  // Register individual route modules
  app.use(`${basePath}`, pricingRoutes); // /api/pricing/*
  app.use(`${basePath}/competitors`, competitorRoutes); // /api/pricing/competitors/*
  app.use(`${basePath}/ota`, otaRoutes); // /api/pricing/ota/*
  app.use(`${basePath}/alerts`, alertsRoutes); // /api/pricing/alerts/*

  console.log('✅ Pricing module routes registered successfully');
  console.log(`   📍 Base path: ${basePath}`);
  console.log('   🛣️  Routes registered:');
  console.log('     - Pricing Engine: /api/pricing/*');
  console.log('     - Competitors: /api/pricing/competitors/*');
  console.log('     - OTA Scraping: /api/pricing/ota/*');
  console.log('     - Alerts: /api/pricing/alerts/*');
};

export const initializePricingModule = async (app: Application) => {
  try {
    console.log('🚀 Initializing Pricing Module...');

    // Register routes
    registerPricingRoutes(app);

    // Additional initialization logic can be added here
    // For example: scheduled jobs, cache warming, etc.

    console.log('✅ Pricing Module initialized successfully');
  } catch (error) {
    console.error('❌ Error initializing Pricing Module:', error);
    throw error;
  }
};

// Export individual components for testing or manual registration
export {
  pricingRoutes,
  competitorRoutes,
  otaRoutes,
  alertsRoutes
};