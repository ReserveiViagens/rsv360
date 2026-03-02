const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../../../middleware/auth');
const { asyncHandler } = require('../../../middleware/errorHandler');
const notificationsController = require('./controller');

/**
 * Rotas de Notificações
 */

// Listar todas as notificações
router.get('/', authenticateToken, asyncHandler(notificationsController.list));

// Obter notificação por ID
router.get('/:id', authenticateToken, asyncHandler(notificationsController.getById));

// Criar nova notificação
router.post('/', authenticateToken, asyncHandler(notificationsController.create));

// Atualizar notificação
router.put('/:id', authenticateToken, asyncHandler(notificationsController.update));

// Deletar notificação
router.delete('/:id', authenticateToken, asyncHandler(notificationsController.delete));

// Estatísticas
router.get('/stats/overview', authenticateToken, asyncHandler(notificationsController.getStats));

// Marcar como lida
router.patch('/:id/read', authenticateToken, asyncHandler(notificationsController.markAsRead));

// Arquivar
router.patch('/:id/archive', authenticateToken, asyncHandler(notificationsController.archive));

// Enviar
router.post('/:id/send', authenticateToken, asyncHandler(notificationsController.send));

// Agendar
router.post('/:id/schedule', authenticateToken, asyncHandler(notificationsController.schedule));

// Exportar
router.get('/export/data', authenticateToken, asyncHandler(notificationsController.export));

module.exports = router;
