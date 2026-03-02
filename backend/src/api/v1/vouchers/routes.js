const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../../../middleware/auth');
const { asyncHandler } = require('../../../middleware/errorHandler');
const vouchersController = require('./controller');

/**
 * Rotas de Vouchers
 */

// Listar todos os vouchers
router.get('/', authenticateToken, asyncHandler(vouchersController.list));

// Obter voucher por ID
router.get('/:id', authenticateToken, asyncHandler(vouchersController.getById));

// Criar novo voucher
router.post('/', authenticateToken, asyncHandler(vouchersController.create));

// Atualizar voucher
router.put('/:id', authenticateToken, asyncHandler(vouchersController.update));

// Deletar voucher
router.delete('/:id', authenticateToken, asyncHandler(vouchersController.delete));

// Estatísticas
router.get('/stats/overview', authenticateToken, asyncHandler(vouchersController.getStats));

// Gerar QR Code
router.post('/:id/qrcode', authenticateToken, asyncHandler(vouchersController.generateQRCode));

// Exportar vouchers
router.get('/export/data', authenticateToken, asyncHandler(vouchersController.export));

// Importar vouchers
router.post('/import/data', authenticateToken, asyncHandler(vouchersController.import));

module.exports = router;
