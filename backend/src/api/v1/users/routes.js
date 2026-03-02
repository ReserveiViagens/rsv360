const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../../../middleware/auth');
const { asyncHandler } = require('../../../middleware/errorHandler');
const usersController = require('./controller');

/**
 * Rotas de Usuários
 */

// Listar todos os usuários
router.get('/', authenticateToken, asyncHandler(usersController.list));

// Obter usuário por ID
router.get('/:id', authenticateToken, asyncHandler(usersController.getById));

// Criar novo usuário
router.post('/', authenticateToken, asyncHandler(usersController.create));

// Atualizar usuário
router.put('/:id', authenticateToken, asyncHandler(usersController.update));

// Deletar usuário
router.delete('/:id', authenticateToken, asyncHandler(usersController.delete));

// Obter funções disponíveis
router.get('/roles/list', authenticateToken, asyncHandler(usersController.getRoles));

// Obter departamentos disponíveis
router.get('/departments/list', authenticateToken, asyncHandler(usersController.getDepartments));

// Atualizar status
router.patch('/:id/status', authenticateToken, asyncHandler(usersController.updateStatus));

// Atualizar verificação
router.patch('/:id/verification', authenticateToken, asyncHandler(usersController.updateVerification));

// Exportar usuários
router.get('/export/data', authenticateToken, asyncHandler(usersController.export));

module.exports = router;
