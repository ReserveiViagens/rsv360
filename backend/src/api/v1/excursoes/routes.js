const express = require('express');
const router = express.Router();
const excursoesController = require('./controller');
const { authenticateToken } = require('../../../middleware/auth');
const { asyncHandler } = require('../../../middleware/errorHandler');
const { body, query, param } = require('express-validator');

router.get(
  '/',
  authenticateToken,
  [
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
    query('status').optional().isIn(['planejamento', 'em_andamento', 'concluida', 'cancelada']),
    query('search').optional().isString().trim(),
  ],
  asyncHandler(excursoesController.list)
);

router.get(
  '/:id',
  authenticateToken,
  [param('id').isUUID()],
  asyncHandler(excursoesController.getById)
);

router.post(
  '/',
  authenticateToken,
  [
    body('nome').notEmpty().withMessage('Nome é obrigatório'),
    body('destino').notEmpty().withMessage('Destino é obrigatório'),
    body('data_inicio').isISO8601().withMessage('Data de início inválida'),
    body('data_fim').isISO8601().withMessage('Data de término inválida'),
    body('preco').isFloat({ min: 0 }).withMessage('Preço deve ser um número positivo'),
    body('vagas_totais').isInt({ min: 1 }).withMessage('Vagas totais deve ser um número positivo'),
  ],
  asyncHandler(excursoesController.create)
);

router.put(
  '/:id',
  authenticateToken,
  [
    param('id').isUUID(),
    body('nome').optional().notEmpty(),
    body('preco').optional().isFloat({ min: 0 }),
  ],
  asyncHandler(excursoesController.update)
);

router.delete(
  '/:id',
  authenticateToken,
  [param('id').isUUID()],
  asyncHandler(excursoesController.delete)
);

router.get(
  '/:id/participantes',
  authenticateToken,
  [param('id').isUUID()],
  asyncHandler(excursoesController.getParticipantes)
);

router.post(
  '/:id/participantes',
  authenticateToken,
  [
    param('id').isUUID(),
    body('user_id').isUUID().withMessage('ID do usuário inválido'),
  ],
  asyncHandler(excursoesController.addParticipante)
);

router.delete(
  '/:id/participantes/:userId',
  authenticateToken,
  [param('id').isUUID(), param('userId').isUUID()],
  asyncHandler(excursoesController.removeParticipante)
);

router.get(
  '/:id/roteiros',
  authenticateToken,
  [param('id').isUUID()],
  asyncHandler(excursoesController.getRoteiros)
);

router.post(
  '/:id/roteiros',
  authenticateToken,
  [
    param('id').isUUID(),
    body('atividade').notEmpty().withMessage('Atividade é obrigatória'),
    body('dia').isInt({ min: 1 }).withMessage('Dia deve ser um número positivo'),
    body('ordem').isInt({ min: 0 }).withMessage('Ordem deve ser um número positivo'),
  ],
  asyncHandler(excursoesController.createRoteiro)
);

module.exports = router;

