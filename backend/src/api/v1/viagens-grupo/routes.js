const express = require('express');
const router = express.Router();
const viagensGrupoController = require('./controller');
const { authenticateToken } = require('../../../middleware/auth');
const { asyncHandler } = require('../../../middleware/errorHandler');
const { body, query, param } = require('express-validator');

router.get(
  '/',
  authenticateToken,
  [
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
    query('status').optional().isIn(['formando', 'confirmado', 'em_andamento', 'concluido', 'cancelado']),
    query('search').optional().isString().trim(),
  ],
  asyncHandler(viagensGrupoController.list)
);

router.get(
  '/:id',
  authenticateToken,
  [param('id').isUUID()],
  asyncHandler(viagensGrupoController.getById)
);

router.post(
  '/',
  authenticateToken,
  [
    body('nome').notEmpty().withMessage('Nome é obrigatório'),
    body('destino').notEmpty().withMessage('Destino é obrigatório'),
    body('privacidade').optional().isIn(['publico', 'privado', 'somente_convite']),
  ],
  asyncHandler(viagensGrupoController.create)
);

router.put(
  '/:id',
  authenticateToken,
  [
    param('id').isUUID(),
    body('nome').optional().notEmpty(),
  ],
  asyncHandler(viagensGrupoController.update)
);

router.delete(
  '/:id',
  authenticateToken,
  [param('id').isUUID()],
  asyncHandler(viagensGrupoController.delete)
);

router.get(
  '/:id/wishlists',
  authenticateToken,
  [param('id').isUUID()],
  asyncHandler(viagensGrupoController.getWishlists)
);

router.post(
  '/:id/wishlists',
  authenticateToken,
  [
    param('id').isUUID(),
    body('item_tipo').notEmpty().withMessage('Tipo do item é obrigatório'),
    body('descricao').notEmpty().withMessage('Descrição é obrigatória'),
  ],
  asyncHandler(viagensGrupoController.addWishlistItem)
);

router.get(
  '/:id/pagamentos',
  authenticateToken,
  [param('id').isUUID()],
  asyncHandler(viagensGrupoController.getPagamentos)
);

router.post(
  '/:id/pagamentos',
  authenticateToken,
  [
    param('id').isUUID(),
    body('descricao').notEmpty().withMessage('Descrição é obrigatória'),
    body('valor_total').isFloat({ min: 0 }).withMessage('Valor total deve ser um número positivo'),
  ],
  asyncHandler(viagensGrupoController.createPagamentoDividido)
);

module.exports = router;

