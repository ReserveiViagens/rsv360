const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../../../middleware/auth');
const { asyncHandler } = require('../../../middleware/errorHandler');
const giftCardsController = require('./controller');

/**
 * Rotas de Gift Cards
 */

// Listar todos os gift cards
router.get('/', authenticateToken, asyncHandler(giftCardsController.list));

// Obter gift card por ID
router.get('/:id', authenticateToken, asyncHandler(giftCardsController.getById));

// Obter gift card por código
router.get('/code/:code', authenticateToken, asyncHandler(giftCardsController.getByCode));

// Criar novo gift card
router.post('/', authenticateToken, asyncHandler(giftCardsController.create));

// Atualizar gift card
router.put('/:id', authenticateToken, asyncHandler(giftCardsController.update));

// Deletar/Cancelar gift card
router.delete('/:id', authenticateToken, asyncHandler(giftCardsController.delete));

// Estatísticas
router.get('/stats/overview', authenticateToken, asyncHandler(giftCardsController.getStats));

// Transações
router.get('/transactions/list', authenticateToken, asyncHandler(giftCardsController.getTransactions));

// Validar gift card
router.post('/validate', authenticateToken, asyncHandler(giftCardsController.validate));

module.exports = router;
