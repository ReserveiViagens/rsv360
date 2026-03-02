const { validationResult } = require('express-validator');
const leilaoService = require('../../../services/leiloes/leilaoService');
const { AppError } = require('../../../middleware/errorHandler');
const logger = require('../../../utils/logger');
const { auditData, logAuditEvent } = require('../../../utils/auditLogger');

/**
 * Listar leilões com filtros e paginação
 */
exports.list = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const page = req.query.page || 1;
    const limit = req.query.limit || 10;
    const filters = {
      status: req.query.status,
      type: req.query.type,
      search: req.query.search,
      start_date: req.query.start_date,
      end_date: req.query.end_date,
    };

    const result = await leilaoService.getAllLeiloes(filters, { page, limit });

    // Audit log (opcional - não quebra se falhar)
    try {
      await logAuditEvent({
        userId: req.user?.id,
        action: 'LIST_LEILOES',
        entityType: 'leiloes',
        metadata: { filters, pagination: { page, limit } },
        req,
      });
    } catch (auditError) {
      // Ignorar erros de audit log - não deve quebrar a requisição
      logger.warn('Erro ao registrar audit log:', auditError.message);
    }

    res.json({
      success: true,
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    logger.error('Erro ao listar leilões:', error);
    throw error;
  }
};

/**
 * Buscar leilão por ID
 */
exports.getById = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { id } = req.params;
    const leilao = await leilaoService.getLeilaoById(id);

    if (!leilao) {
      throw new AppError('Leilão não encontrado', 404);
    }

    try {
      await logAuditEvent({
        userId: req.user?.id,
        action: 'VIEW_LEILAO',
        entityType: 'leiloes',
        entityId: id,
        req,
      });
    } catch (auditError) {
      logger.warn('Erro ao registrar audit log:', auditError.message);
    }

    res.json({
      success: true,
      data: leilao,
    });
  } catch (error) {
    logger.error('Erro ao buscar leilão:', error);
    throw error;
  }
};

/**
 * Criar novo leilão
 */
exports.create = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const userId = req.user?.id;
    if (!userId) {
      throw new AppError('Usuário não autenticado', 401);
    }

    const leilaoData = {
      ...req.body,
      created_by: userId,
    };

    const leilao = await leilaoService.createLeilao(leilaoData);

    try {
      await logAuditEvent({
        userId,
        action: 'CREATE_LEILAO',
        entityType: 'leiloes',
        entityId: leilao.id,
        metadata: { title: leilao.title },
        req,
      });
    } catch (auditError) {
      logger.warn('Erro ao registrar audit log:', auditError.message);
    }

    res.status(201).json({
      success: true,
      data: leilao,
      message: 'Leilão criado com sucesso',
    });
  } catch (error) {
    logger.error('Erro ao criar leilão:', error);
    throw error;
  }
};

/**
 * Atualizar leilão
 */
exports.update = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const userPermissions = req.user?.permissions || [];
    const leilao = await leilaoService.updateLeilao(id, req.body, userId, userPermissions);

    try {
      await logAuditEvent({
        userId,
        action: 'UPDATE_LEILAO',
        entityType: 'leiloes',
        entityId: id,
        req,
      });
    } catch (auditError) {
      logger.warn('Erro ao registrar audit log:', auditError.message);
    }

    res.json({
      success: true,
      data: leilao,
      message: 'Leilão atualizado com sucesso',
    });
  } catch (error) {
    logger.error('Erro ao atualizar leilão:', error);
    throw error;
  }
};

/**
 * Deletar/Cancelar leilão
 */
exports.delete = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const userPermissions = req.user?.permissions || [];
    await leilaoService.deleteLeilao(id, userId, userPermissions);

    try {
      await logAuditEvent({
        userId,
        action: 'DELETE_LEILAO',
        entityType: 'leiloes',
        entityId: id,
        req,
      });
    } catch (auditError) {
      logger.warn('Erro ao registrar audit log:', auditError.message);
    }

    res.json({
      success: true,
      message: 'Leilão cancelado/deletado com sucesso',
    });
  } catch (error) {
    logger.error('Erro ao deletar leilão:', error);
    throw error;
  }
};

/**
 * Listar lances de um leilão
 */
exports.getLances = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { id } = req.params;
    const lances = await leilaoService.getLances(id);

    res.json({
      success: true,
      data: lances,
    });
  } catch (error) {
    logger.error('Erro ao listar lances:', error);
    throw error;
  }
};

/**
 * Criar lance
 */
exports.createLance = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { id } = req.params;
    const { amount } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      throw new AppError('Usuário não autenticado', 401);
    }

    const lance = await leilaoService.createLance(id, userId, amount);

    try {
      await logAuditEvent({
        userId,
        action: 'CREATE_LANCE',
        entityType: 'leiloes',
        entityId: id,
        metadata: { amount },
        req,
      });
    } catch (auditError) {
      logger.warn('Erro ao registrar audit log:', auditError.message);
    }

    res.status(201).json({
      success: true,
      data: lance,
      message: 'Lance criado com sucesso',
    });
  } catch (error) {
    logger.error('Erro ao criar lance:', error);
    throw error;
  }
};

/**
 * Listar flash deals
 */
exports.getFlashDeals = async (req, res) => {
  try {
    const page = req.query.page || 1;
    const limit = req.query.limit || 10;

    const result = await leilaoService.getFlashDeals({ page, limit });

    res.json({
      success: true,
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    logger.error('Erro ao listar flash deals:', error);
    throw error;
  }
};

/**
 * Obter relatórios
 */
exports.getRelatorios = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const filters = {
      start_date: req.query.start_date,
      end_date: req.query.end_date,
      status: req.query.status,
      type: req.query.type,
    };

    const relatorios = await leilaoService.calculateRelatorios(filters);

    try {
      await logAuditEvent({
        userId: req.user?.id,
        action: 'VIEW_RELATORIOS',
        entityType: 'leiloes',
        metadata: { filters },
        req,
      });
    } catch (auditError) {
      logger.warn('Erro ao registrar audit log:', auditError.message);
    }

    res.json({
      success: true,
      data: relatorios,
    });
  } catch (error) {
    logger.error('Erro ao gerar relatórios:', error);
    throw error;
  }
};

