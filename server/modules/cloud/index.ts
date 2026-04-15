import { Application } from 'express';
import cloudRoutes from './routes/cloud.routes';
import { initializeCacheConfig } from './services/cache.service';

export async function initializeCloudModule(app: Application) {
  // Initialize cache configuration
  await initializeCacheConfig();

  // Register routes
  app.use('/api/cloud', cloudRoutes);

  console.log('Cloud module initialized successfully');
}

export default {
  initializeCloudModule,
};