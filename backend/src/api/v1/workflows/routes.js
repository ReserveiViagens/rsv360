const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../../../middleware/auth');
const { asyncHandler } = require('../../../middleware/errorHandler');
const workflowsController = require('./controller');

/**
 * Rotas de Workflows
 */

// Listar todos os workflows
router.get('/', authenticateToken, asyncHandler(workflowsController.list));

// Obter workflow por ID
router.get('/:id', authenticateToken, asyncHandler(workflowsController.getById));

// Criar novo workflow
router.post('/', authenticateToken, asyncHandler(workflowsController.create));

// Atualizar workflow
router.put('/:id', authenticateToken, asyncHandler(workflowsController.update));

// Deletar workflow
router.delete('/:id', authenticateToken, asyncHandler(workflowsController.delete));

// Estatísticas
router.get('/stats/overview', authenticateToken, asyncHandler(workflowsController.getStats));

// Executar workflow
router.post('/:id/execute', authenticateToken, asyncHandler(workflowsController.execute));

// Atualizar status
router.patch('/:id/status', authenticateToken, asyncHandler(workflowsController.updateStatus));

// Execuções do workflow
router.get('/:id/executions', authenticateToken, asyncHandler(workflowsController.getExecutions));

// Exportar workflows
router.get('/export/data', authenticateToken, asyncHandler(workflowsController.export));

module.exports = router;
