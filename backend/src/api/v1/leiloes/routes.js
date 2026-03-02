const express = require('express');
const router = express.Router();
const leiloesController = require('./controller');
const { authenticateToken } = require('../../../middleware/auth');
const { asyncHandler } = require('../../../middleware/errorHandler');
const { body, query, param, validationResult } = require('express-validator');

/**
 * @swagger
 * /api/v1/leiloes:
 *   get:
 *     tags: [Leilões]
 *     summary: Listar todos os leilões
 */
router.get(
  '/',
  authenticateToken,
  [
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
    query('status').optional().isIn(['scheduled', 'active', 'ended', 'cancelled']),
    query('type').optional().isIn(['auction', 'flash_deal']),
    query('search').optional().isString().trim(),
  ],
  asyncHandler(leiloesController.list)
);

/**
 * @swagger
 * /api/v1/leiloes/flash-deals:
 *   get:
 *     tags: [Leilões]
 *     summary: Listar flash deals ativos
 */
router.get(
  '/flash-deals',
  authenticateToken,
  [
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  ],
  asyncHandler(leiloesController.getFlashDeals)
);

/**
 * @swagger
 * /api/v1/leiloes/relatorios:
 *   get:
 *     tags: [Leilões]
 *     summary: Obter relatórios de leilões
 */
router.get(
  '/relatorios',
  authenticateToken,
  [
    query('start_date').optional().isISO8601(),
    query('end_date').optional().isISO8601(),
    query('status').optional().isIn(['scheduled', 'active', 'ended', 'cancelled']),
    query('type').optional().isIn(['auction', 'flash_deal']),
  ],
  asyncHandler(leiloesController.getRelatorios)
);

/**
 * @swagger
 * /api/v1/leiloes/:id:
 *   get:
 *     tags: [Leilões]
 *     summary: Buscar leilão por ID
 */
router.get(
  '/:id',
  authenticateToken,
  [param('id').isUUID()],
  asyncHandler(leiloesController.getById)
);

/**
 * @swagger
 * /api/v1/leiloes:
 *   post:
 *     tags: [Leilões]
 *     summary: Criar novo leilão
 */
router.post(
  '/',
  authenticateToken,
  [
    body('title').notEmpty().withMessage('Título é obrigatório'),
    body('starting_price').isFloat({ min: 0 }).withMessage('Preço inicial deve ser um número positivo'),
    body('start_date').isISO8601().withMessage('Data de início inválida'),
    body('end_date').isISO8601().withMessage('Data de término inválida'),
    body('type').optional().isIn(['auction', 'flash_deal']),
    body('status').optional().isIn(['scheduled', 'active', 'ended', 'cancelled']),
  ],
  asyncHandler(leiloesController.create)
);

/**
 * @swagger
 * /api/v1/leiloes/:id:
 *   put:
 *     tags: [Leilões]
 *     summary: Atualizar leilão
 */
router.put(
  '/:id',
  authenticateToken,
  [
    param('id').isUUID(),
    body('title').optional().notEmpty(),
    body('starting_price').optional().isFloat({ min: 0 }),
    body('start_date').optional().isISO8601(),
    body('end_date').optional().isISO8601(),
  ],
  asyncHandler(leiloesController.update)
);

/**
 * @swagger
 * /api/v1/leiloes/:id:
 *   delete:
 *     tags: [Leilões]
 *     summary: Cancelar/deletar leilão
 */
router.delete(
  '/:id',
  authenticateToken,
  [param('id').isUUID()],
  asyncHandler(leiloesController.delete)
);

/**
 * @swagger
 * /api/v1/leiloes/:id/lances:
 *   get:
 *     tags: [Leilões]
 *     summary: Listar lances de um leilão
 */
router.get(
  '/:id/lances',
  authenticateToken,
  [param('id').isUUID()],
  asyncHandler(leiloesController.getLances)
);

/**
 * @swagger
 * /api/v1/leiloes/:id/lances:
 *   post:
 *     tags: [Leilões]
 *     summary: Criar lance em um leilão
 */
router.post(
  '/:id/lances',
  authenticateToken,
  [
    param('id').isUUID(),
    body('amount').isFloat({ min: 0 }).withMessage('Valor do lance deve ser um número positivo'),
  ],
  asyncHandler(leiloesController.createLance)
);

module.exports = router;

