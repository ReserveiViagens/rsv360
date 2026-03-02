const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../../../middleware/auth');
const { asyncHandler } = require('../../../middleware/errorHandler');
const financeController = require('./controller');

/**
 * Rotas de Finanças
 */

// Estatísticas
router.get('/stats', authenticateToken, asyncHandler(financeController.getStats));

// Dashboard completo
router.get('/dashboard', authenticateToken, asyncHandler(financeController.getDashboard));

// Receitas
router.get('/revenue', authenticateToken, asyncHandler(financeController.getRevenue));

// Despesas
router.get('/expenses', authenticateToken, asyncHandler(financeController.getExpenses));

// Relatórios
router.get('/report', authenticateToken, asyncHandler(financeController.getReport));

// Categorias de despesas
router.get('/expenses/categories', authenticateToken, asyncHandler(financeController.getExpenseCategories));

module.exports = router;
