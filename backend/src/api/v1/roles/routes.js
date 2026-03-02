const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../../../middleware/auth');
const { asyncHandler } = require('../../../middleware/errorHandler');
const rolesController = require('./controller');

/**
 * Rotas de Funções (Roles)
 */

// Listar todas as funções
router.get('/', authenticateToken, asyncHandler(rolesController.list));

// Obter função por ID
router.get('/:id', authenticateToken, asyncHandler(rolesController.getById));

// Criar nova função
router.post('/', authenticateToken, asyncHandler(rolesController.create));

// Atualizar função
router.put('/:id', authenticateToken, asyncHandler(rolesController.update));

// Deletar função
router.delete('/:id', authenticateToken, asyncHandler(rolesController.delete));

// Obter permissões disponíveis
router.get('/permissions/available', authenticateToken, asyncHandler(rolesController.getAvailablePermissions));

// Obter estatísticas
router.get('/stats/overview', authenticateToken, asyncHandler(rolesController.getStats));

module.exports = router;
