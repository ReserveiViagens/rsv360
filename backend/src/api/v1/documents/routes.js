const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../../../middleware/auth');
const { asyncHandler } = require('../../../middleware/errorHandler');
const documentsController = require('./controller');

/**
 * Rotas de Documentos
 */

// Listar todos os documentos
router.get('/', authenticateToken, asyncHandler(documentsController.list));

// Obter documento por ID
router.get('/:id', authenticateToken, asyncHandler(documentsController.getById));

// Upload de documento
router.post('/upload', authenticateToken, asyncHandler(documentsController.upload));

// Atualizar documento
router.put('/:id', authenticateToken, asyncHandler(documentsController.update));

// Deletar documento
router.delete('/:id', authenticateToken, asyncHandler(documentsController.delete));

// Download de documento
router.get('/:id/download', authenticateToken, asyncHandler(documentsController.download));

// Obter categorias
router.get('/categories/list', authenticateToken, asyncHandler(documentsController.getCategories));

// Obter estatísticas
router.get('/stats/overview', authenticateToken, asyncHandler(documentsController.getStats));

// Exportar documentos
router.get('/export/data', authenticateToken, asyncHandler(documentsController.export));

// Arquivar documento
router.patch('/:id/archive', authenticateToken, asyncHandler(documentsController.archive));

// Restaurar documento
router.patch('/:id/restore', authenticateToken, asyncHandler(documentsController.restore));

module.exports = router;
