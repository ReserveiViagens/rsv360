const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../../../middleware/auth');
const { asyncHandler } = require('../../../middleware/errorHandler');
const settingsController = require('./controller');

/**
 * Rotas de Configurações
 */

// Obter todas as configurações
router.get('/', authenticateToken, asyncHandler(settingsController.getAll));

// Obter configurações por categoria
router.get('/category/:category', authenticateToken, asyncHandler(settingsController.getByCategory));

// Atualizar configurações de uma categoria
router.put('/category/:category', authenticateToken, asyncHandler(settingsController.update));

// Atualizar configuração específica
router.patch('/category/:category/:key', authenticateToken, asyncHandler(settingsController.updateSetting));

// Resetar configurações
router.post('/reset', authenticateToken, asyncHandler(settingsController.reset));

// Criar backup
router.post('/backup/create', authenticateToken, asyncHandler(settingsController.createBackup));

// Restaurar backup
router.post('/backup/restore', authenticateToken, asyncHandler(settingsController.restoreBackup));

// Obter estatísticas
router.get('/stats/overview', authenticateToken, asyncHandler(settingsController.getStats));

module.exports = router;
