const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../../../middleware/auth');
const { asyncHandler } = require('../../../middleware/errorHandler');
const visasController = require('./controller');

/**
 * Rotas de Vistos
 */

// Listar aplicações
router.get('/applications', authenticateToken, asyncHandler(visasController.listApplications));

// Obter estatísticas
router.get('/stats', authenticateToken, asyncHandler(visasController.getStats));

// Obter tipos de visto
router.get('/types', authenticateToken, asyncHandler(visasController.getTypes));

// Obter países
router.get('/countries', authenticateToken, asyncHandler(visasController.getCountries));

// Criar aplicação
router.post('/applications', authenticateToken, asyncHandler(visasController.createApplication));

// Atualizar aplicação
router.put('/applications/:id', authenticateToken, asyncHandler(visasController.updateApplication));

// Deletar aplicação
router.delete('/applications/:id', authenticateToken, asyncHandler(visasController.deleteApplication));

// Exportar aplicações
router.get('/applications/export', authenticateToken, asyncHandler(visasController.exportApplications));

module.exports = router;
