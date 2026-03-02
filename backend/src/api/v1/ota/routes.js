const express = require('express');
const router = express.Router();
const otaController = require('./controller');
const { authenticateToken } = require('../../../middleware/auth');

/**
 * Todas as rotas OTA requerem autenticação
 */

// Listar conexões OTA
router.get('/connections', authenticateToken, otaController.listConnections);

// Obter conexão OTA por ID
router.get('/connections/:id', authenticateToken, otaController.getConnectionById);

// Criar conexão OTA
router.post('/connections', authenticateToken, otaController.createConnection);

// Atualizar conexão OTA
router.put('/connections/:id', authenticateToken, otaController.updateConnection);

// Deletar conexão OTA
router.delete('/connections/:id', authenticateToken, otaController.deleteConnection);

// Sincronizar disponibilidade
router.post('/connections/:id/sync/availability', authenticateToken, otaController.syncAvailability);

// Sincronizar reservas
router.post('/connections/:id/sync/reservations', authenticateToken, otaController.syncReservations);

// Sincronizar tudo
router.post('/connections/:id/sync', authenticateToken, otaController.syncAll);

// Obter status de sincronização
router.get('/connections/:id/sync/status', authenticateToken, otaController.getSyncStatus);

// Listar reservas sincronizadas
router.get('/connections/:id/reservations', authenticateToken, otaController.listReservations);

// Listar logs de sincronização
router.get('/connections/:id/logs', authenticateToken, otaController.listSyncLogs);

// Rotas de conveniência (mantidas para compatibilidade)
router.post('/sync', authenticateToken, (req, res) => {
  // Redirecionar para sync all da primeira conexão ou criar nova
  res.status(400).json({
    error: 'Bad request',
    message: 'Please specify connection ID: POST /api/v1/ota/connections/:id/sync',
  });
});

router.get('/sync/status', authenticateToken, (req, res) => {
  res.status(400).json({
    error: 'Bad request',
    message: 'Please specify connection ID: GET /api/v1/ota/connections/:id/sync/status',
  });
});

router.get('/reservations', authenticateToken, (req, res) => {
  res.status(400).json({
    error: 'Bad request',
    message: 'Please specify connection ID: GET /api/v1/ota/connections/:id/reservations',
  });
});

router.get('/logs', authenticateToken, (req, res) => {
  res.status(400).json({
    error: 'Bad request',
    message: 'Please specify connection ID: GET /api/v1/ota/connections/:id/logs',
  });
});

// Compatibilidade: sync-logs sem ID retorna array vazio (usado pelo dashboard)
router.get('/sync-logs', authenticateToken, async (req, res) => {
  try {
    const otaService = require('./service');
    const pool = require('../../../db/pool');
    const tableCheck = await pool.query(`
      SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'ota_sync_logs')
    `);
    if (!tableCheck.rows[0]?.exists) {
      return res.json({ data: [], total: 0 });
    }
    const limit = Math.min(parseInt(req.query.limit) || 50, 100);
    const result = await pool.query(
      `SELECT * FROM ota_sync_logs ORDER BY started_at DESC LIMIT $1`,
      [limit]
    );
    res.json({ data: result.rows, total: result.rows.length });
  } catch (err) {
    res.json({ data: [], total: 0 });
  }
});

module.exports = router;
