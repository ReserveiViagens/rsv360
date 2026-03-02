const { validationResult } = require('express-validator');
const grupoService = require('../../../services/viagens-grupo/grupoService');
const { AppError } = require('../../../middleware/errorHandler');
const logger = require('../../../utils/logger');
const { auditData } = require('../../../utils/auditLogger');

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
      data_prevista: req.query.data_prevista,
    };

    const result = await grupoService.getAllGrupos(filters, { page, limit });

    auditData({
      action: 'LIST_GRUPOS',
      userId: req.user?.id,
      metadata: { filters, pagination: { page, limit } },
    });

    res.json({
      success: true,
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    logger.error('Erro ao listar grupos:', error);
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
    const grupo = await grupoService.getGrupoById(id);

    if (!grupo) {
      throw new AppError('Grupo não encontrado', 404);
    }

    auditData({
      action: 'VIEW_GRUPO',
      userId: req.user?.id,
      metadata: { grupo_id: id },
    });

    res.json({
      success: true,
      data: grupo,
    });
  } catch (error) {
    logger.error('Erro ao buscar grupo:', error);
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

    const grupoData = {
      ...req.body,
      created_by: userId,
    };

    const grupo = await grupoService.createGrupo(grupoData);

    // Adicionar criador como admin do grupo
    await grupoService.addMembro(grupo.id, userId, 'admin');

    auditData({
      action: 'CREATE_GRUPO',
      userId,
      metadata: { grupo_id: grupo.id, nome: grupo.nome },
    });

    res.status(201).json({
      success: true,
      data: grupo,
      message: 'Grupo criado com sucesso',
    });
  } catch (error) {
    logger.error('Erro ao criar grupo:', error);
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

    const grupo = await grupoService.updateGrupo(id, req.body, userId, userPermissions);

    auditData({
      action: 'UPDATE_GRUPO',
      userId,
      metadata: { grupo_id: id },
    });

    res.json({
      success: true,
      data: grupo,
      message: 'Grupo atualizado com sucesso',
    });
  } catch (error) {
    logger.error('Erro ao atualizar grupo:', error);
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

    await grupoService.deleteGrupo(id, userId, userPermissions);

    auditData({
      action: 'DELETE_GRUPO',
      userId,
      metadata: { grupo_id: id },
    });

    res.json({
      success: true,
      message: 'Grupo deletado com sucesso',
    });
  } catch (error) {
    logger.error('Erro ao deletar grupo:', error);
    throw error;
  }
};

exports.getWishlists = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { id } = req.params;
    const wishlists = await grupoService.getWishlists(id);

    res.json({
      success: true,
      data: wishlists,
    });
  } catch (error) {
    logger.error('Erro ao listar wishlists:', error);
    throw error;
  }
};

exports.addWishlistItem = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const item = await grupoService.addWishlistItem(id, userId, req.body);

    auditData({
      action: 'ADD_WISHLIST_ITEM',
      userId,
      metadata: { grupo_id: id },
    });

    res.status(201).json({
      success: true,
      data: item,
      message: 'Item adicionado à wishlist com sucesso',
    });
  } catch (error) {
    logger.error('Erro ao adicionar item à wishlist:', error);
    throw error;
  }
};

exports.getPagamentos = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { id } = req.params;
    const pagamentos = await grupoService.getPagamentos(id);

    res.json({
      success: true,
      data: pagamentos,
    });
  } catch (error) {
    logger.error('Erro ao listar pagamentos:', error);
    throw error;
  }
};

exports.createPagamentoDividido = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const pagamento = await grupoService.createPagamentoDividido(id, userId, req.body);

    auditData({
      action: 'CREATE_PAGAMENTO_DIVIDIDO',
      userId,
      metadata: { grupo_id: id },
    });

    res.status(201).json({
      success: true,
      data: pagamento,
      message: 'Pagamento dividido criado com sucesso',
    });
  } catch (error) {
    logger.error('Erro ao criar pagamento dividido:', error);
    throw error;
  }
};

