require('dotenv').config();
const PORT = process.env.PORT || 3001;
const { createApp } = require('./app');

async function startServer() {
  try {
    const app = await createApp();
    app.listen(PORT, () => {
      console.log(`[SERVER] RSV360 Backend API Server running on port ${PORT}`);
      console.log(`[SERVER] Health check: http://localhost:${PORT}/health`);
      console.log(`[SECURITY] Security health check: http://localhost:${PORT}/health/security`);
    });
  } catch (error) {
    console.error('[INIT] Failed to initialize server:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  startServer();
}

module.exports = { startServer };