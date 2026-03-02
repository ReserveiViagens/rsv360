const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../../../middleware/auth');
const { asyncHandler } = require('../../../middleware/errorHandler');
const recommendationsController = require('./controller');

/**
 * Rotas de Recomendações
 */

// Listar todas as recomendações
router.get('/', authenticateToken, asyncHandler(recommendationsController.list));

// Obter recomendação por ID
router.get('/:id', authenticateToken, asyncHandler(recommendationsController.getById));

// Criar nova recomendação
router.post('/', authenticateToken, asyncHandler(recommendationsController.create));

// Atualizar recomendação
router.put('/:id', authenticateToken, asyncHandler(recommendationsController.update));

// Deletar recomendação
router.delete('/:id', authenticateToken, asyncHandler(recommendationsController.delete));

// Estatísticas
router.get('/stats/overview', authenticateToken, asyncHandler(recommendationsController.getStats));

// Recomendações por audiência
router.get('/audience/:audience', authenticateToken, asyncHandler(recommendationsController.getByAudience));

// Ativar/Desativar recomendação
router.patch('/:id/status', authenticateToken, asyncHandler(recommendationsController.toggleStatus));

module.exports = router;
