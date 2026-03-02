const { validationResult } = require('express-validator');
const excursaoService = require('../../../services/excursoes/excursaoService');
const { AppError } = require('../../../middleware/errorHandler');
const logger = require('../../../utils/logger');
const { logAuditEvent } = require('../../../utils/auditLogger');

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
      destino: req.query.destino,
      search: req.query.search,
      data_inicio: req.query.data_inicio,
      data_fim: req.query.data_fim,
    };

    const result = await excursaoService.getAllExcursoes(filters, { page, limit });

    try {
      await logAuditEvent({
        userId: req.user?.id,
        action: 'LIST_EXCURSOES',
        entityType: 'excursoes',
        metadata: { filters, pagination: { page, limit } },
        req,
      });
    } catch (auditError) {
      logger.warn('Erro ao registrar audit log:', auditError.message);
    }

    res.json({
      success: true,
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    logger.error('Erro ao listar excursões:', error);
    throw error;
  }
};

exports.getById = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { id } = req.params;
    const excursao = await excursaoService.getExcursaoById(id);

    if (!excursao) {
      throw new AppError('Excursão não encontrada', 404);
    }

    try {
      await logAuditEvent({
        userId: req.user?.id,
        action: 'VIEW_EXCURSAO',
        entityType: 'excursoes',
        entityId: id,
        req,
      });
    } catch (auditError) {
      logger.warn('Erro ao registrar audit log:', auditError.message);
    }

    res.json({
      success: true,
      data: excursao,
    });
  } catch (error) {
    logger.error('Erro ao buscar excursão:', error);
    throw error;
  }
};

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

    const excursaoData = {
      ...req.body,
      created_by: userId,
      vagas_disponiveis: req.body.vagas_totais || req.body.vagas_disponiveis,
    };

    const excursao = await excursaoService.createExcursao(excursaoData);

    try {
      await logAuditEvent({
        userId,
        action: 'CREATE_EXCURSAO',
        entityType: 'excursoes',
        entityId: excursao.id,
        metadata: { nome: excursao.nome },
        req,
      });
    } catch (auditError) {
      logger.warn('Erro ao registrar audit log:', auditError.message);
    }

    res.status(201).json({
      success: true,
      data: excursao,
      message: 'Excursão criada com sucesso',
    });
  } catch (error) {
    logger.error('Erro ao criar excursão:', error);
    throw error;
  }
};

exports.update = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const userPermissions = req.user?.permissions || [];

    const excursao = await excursaoService.updateExcursao(id, req.body, userId, userPermissions);

    try {
      await logAuditEvent({
        userId,
        action: 'UPDATE_EXCURSAO',
        entityType: 'excursoes',
        entityId: id,
        req,
      });
    } catch (auditError) {
      logger.warn('Erro ao registrar audit log:', auditError.message);
    }

    res.json({
      success: true,
      data: excursao,
      message: 'Excursão atualizada com sucesso',
    });
  } catch (error) {
    logger.error('Erro ao atualizar excursão:', error);
    throw error;
  }
};

exports.delete = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const userPermissions = req.user?.permissions || [];

    await excursaoService.deleteExcursao(id, userId, userPermissions);

    try {
      await logAuditEvent({
        userId,
        action: 'DELETE_EXCURSAO',
        entityType: 'excursoes',
        entityId: id,
        req,
      });
    } catch (auditError) {
      logger.warn('Erro ao registrar audit log:', auditError.message);
    }

    res.json({
      success: true,
      message: 'Excursão cancelada/deletada com sucesso',
    });
  } catch (error) {
    logger.error('Erro ao deletar excursão:', error);
    throw error;
  }
};

exports.getParticipantes = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { id } = req.params;
    const participantes = await excursaoService.getParticipantes(id);

    res.json({
      success: true,
      data: participantes,
    });
  } catch (error) {
    logger.error('Erro ao listar participantes:', error);
    throw error;
  }
};

exports.addParticipante = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { id } = req.params;
    const { user_id } = req.body;

    const participante = await excursaoService.addParticipante(id, user_id);

    try {
      await logAuditEvent({
        userId: req.user?.id,
        action: 'ADD_PARTICIPANTE',
        entityType: 'excursoes',
        entityId: id,
        metadata: { user_id },
        req,
      });
    } catch (auditError) {
      logger.warn('Erro ao registrar audit log:', auditError.message);
    }

    res.status(201).json({
      success: true,
      data: participante,
      message: 'Participante adicionado com sucesso',
    });
  } catch (error) {
    logger.error('Erro ao adicionar participante:', error);
    throw error;
  }
};

exports.removeParticipante = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { id, userId } = req.params;

    await excursaoService.removeParticipante(id, userId);

    try {
      await logAuditEvent({
        userId: req.user?.id,
        action: 'REMOVE_PARTICIPANTE',
        entityType: 'excursoes',
        entityId: id,
        metadata: { user_id: userId },
        req,
      });
    } catch (auditError) {
      logger.warn('Erro ao registrar audit log:', auditError.message);
    }

    res.json({
      success: true,
      message: 'Participante removido com sucesso',
    });
  } catch (error) {
    logger.error('Erro ao remover participante:', error);
    throw error;
  }
};

exports.getRoteiros = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { id } = req.params;
    const roteiros = await excursaoService.getRoteiros(id);

    res.json({
      success: true,
      data: roteiros,
    });
  } catch (error) {
    logger.error('Erro ao listar roteiros:', error);
    throw error;
  }
};

exports.createRoteiro = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { id } = req.params;
    const roteiroData = {
      ...req.body,
      excursao_id: id,
    };

    const roteiro = await excursaoService.createRoteiro(id, roteiroData);

    try {
      await logAuditEvent({
        userId: req.user?.id,
        action: 'CREATE_ROTEIRO',
        entityType: 'excursoes',
        entityId: id,
        req,
      });
    } catch (auditError) {
      logger.warn('Erro ao registrar audit log:', auditError.message);
    }

    res.status(201).json({
      success: true,
      data: roteiro,
      message: 'Roteiro criado com sucesso',
    });
  } catch (error) {
    logger.error('Erro ao criar roteiro:', error);
    throw error;
  }
};

