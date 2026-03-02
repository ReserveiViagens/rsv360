const express = require('express');
const router = express.Router();
const flashDealsController = require('./controller');
const { authenticateToken } = require('../../../middleware/auth');

/**
 * Rotas públicas (não requerem autenticação)
 */

// Listar flash deals ativos (público)
router.get('/active', flashDealsController.getActive);

/**
 * Rotas autenticadas (DEVEM vir antes de /:id)
 */

// Listar todos os flash deals (com filtros) - CMS Admin
router.get('/', authenticateToken, flashDealsController.list);

// Obter flash deal por ID (público)
router.get('/:id', flashDealsController.getById);

// Criar novo flash deal
router.post('/', authenticateToken, flashDealsController.create);

// Atualizar flash deal
router.put('/:id', authenticateToken, flashDealsController.update);

// Deletar flash deal
router.delete('/:id', authenticateToken, flashDealsController.remove);

// Reservar flash deal (pode ser público, mas recomendado autenticado)
router.post('/:id/reserve', authenticateToken, flashDealsController.reserve);

module.exports = router;
