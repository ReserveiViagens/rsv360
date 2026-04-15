// Communication Module — Initialization

import { Application } from 'express';
import communicationRoutes from './routes';
import { startCommunicationCron } from './communication-cron';

export async function initializeCommunicationModule(app: Application): Promise<void> {
  try {
    // Mount communication routes under /api/v1/comm
    app.use('/api/v1/comm', communicationRoutes);
    startCommunicationCron();

    console.log('✅ Communication module initialized successfully');
    console.log('📡 Routes mounted at: /api/v1/comm');
    console.log('🏥 Health check available at: /api/v1/comm/health');
  } catch (error) {
    console.error('❌ Failed to initialize communication module:', error);
    throw error;
  }
}

export default initializeCommunicationModule;