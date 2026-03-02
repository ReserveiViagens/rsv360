const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../../../middleware/auth');
const { asyncHandler } = require('../../../middleware/errorHandler');
const insuranceController = require('./controller');

/**
 * Rotas de Seguros
 */

// Listar apólices
router.get('/policies', authenticateToken, asyncHandler(insuranceController.listPolicies));

// Listar sinistros
router.get('/claims', authenticateToken, asyncHandler(insuranceController.listClaims));

// Obter estatísticas
router.get('/stats', authenticateToken, asyncHandler(insuranceController.getStats));

// Obter tipos de seguro
router.get('/types', authenticateToken, asyncHandler(insuranceController.getTypes));

// Criar apólice
router.post('/policies', authenticateToken, asyncHandler(insuranceController.createPolicy));

// Atualizar apólice
router.put('/policies/:id', authenticateToken, asyncHandler(insuranceController.updatePolicy));

// Deletar apólice
router.delete('/policies/:id', authenticateToken, asyncHandler(insuranceController.deletePolicy));

// Exportar apólices
router.get('/policies/export', authenticateToken, asyncHandler(insuranceController.exportPolicies));

module.exports = router;
