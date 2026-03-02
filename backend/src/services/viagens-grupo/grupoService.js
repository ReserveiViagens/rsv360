const { db } = require('../../config/database');
const { AppError } = require('../../middleware/errorHandler');
const logger = require('../../utils/logger');

async function getAllGrupos(filters = {}, pagination = {}) {
  try {
    const page = pagination.page || 1;
    const limit = pagination.limit || 10;
    const offset = (page - 1) * limit;

    let query = db('grupos_viagem').select('*');

    if (filters.status) {
      query = query.where('status', filters.status);
    }

    if (filters.destino) {
      query = query.where('destino', 'ilike', `%${filters.destino}%`);
    }

    if (filters.search) {
      query = query.where(function() {
        this.where('nome', 'ilike', `%${filters.search}%`)
            .orWhere('descricao', 'ilike', `%${filters.search}%`)
            .orWhere('destino', 'ilike', `%${filters.search}%`);
      });
    }

    if (filters.data_prevista) {
      query = query.where('data_prevista', '>=', filters.data_prevista);
    }

    const countQuery = query.clone().clearSelect().count('* as total').first();
    const totalResult = await countQuery;
    const total = parseInt(totalResult.total);

    const grupos = await query
      .orderBy('created_at', 'desc')
      .limit(limit)
      .offset(offset);

    return {
      data: grupos,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    logger.error('Erro ao buscar grupos:', error);
    throw new AppError('Erro ao buscar grupos', 500);
  }
}

async function getGrupoById(id) {
  try {
    const grupo = await db('grupos_viagem').where('id', id).first();

    if (!grupo) {
      throw new AppError('Grupo não encontrado', 404);
    }

    return grupo;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    logger.error('Erro ao buscar grupo:', error);
    throw new AppError('Erro ao buscar grupo', 500);
  }
}

async function createGrupo(data, userId) {
  try {
    const grupoData = {
      nome: data.nome,
      destino: data.destino,
      descricao: data.descricao || null,
      data_prevista: data.data_prevista || null,
      limite_participantes: data.limite_participantes || null,
      privacidade: data.privacidade || 'publico',
      status: data.status || 'formando',
      created_by: userId,
      created_at: new Date(),
      updated_at: new Date(),
    };

    const [grupo] = await db('grupos_viagem')
      .insert(grupoData)
      .returning('*');

    return grupo;
  } catch (error) {
    logger.error('Erro ao criar grupo:', error);
    throw new AppError('Erro ao criar grupo', 500);
  }
}

async function updateGrupo(id, data, userId, userPermissions = []) {
  try {
    const grupo = await getGrupoById(id);

    // Verificar se é admin do grupo ou admin do sistema
    const membro = await db('membros_grupo')
      .where({ grupo_id: id, user_id: userId, role: 'admin' })
      .first();

    if (!membro && grupo.created_by !== userId && !userPermissions.includes('admin')) {
      throw new AppError('Sem permissão para atualizar este grupo', 403);
    }

    const updateData = {
      ...data,
      updated_at: new Date(),
    };

    delete updateData.id;
    delete updateData.created_at;
    delete updateData.created_by;

    const [updated] = await db('grupos_viagem')
      .where('id', id)
      .update(updateData)
      .returning('*');

    return updated;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    logger.error('Erro ao atualizar grupo:', error);
    throw new AppError('Erro ao atualizar grupo', 500);
  }
}

async function deleteGrupo(id, userId, userPermissions = []) {
  try {
    const grupo = await getGrupoById(id);

    if (grupo.created_by !== userId && !userPermissions.includes('admin')) {
      throw new AppError('Sem permissão para deletar este grupo', 403);
    }

    // Deletar relacionamentos
    await db('wishlist_items').where('grupo_id', id).delete();
    await db('pagamentos_divididos').where('grupo_id', id).delete();
    await db('membros_grupo').where('grupo_id', id).delete();
    await db('grupos_viagem').where('id', id).delete();

    return true;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    logger.error('Erro ao deletar grupo:', error);
    throw new AppError('Erro ao deletar grupo', 500);
  }
}

async function addMembro(grupoId, userId, role = 'membro') {
  try {
    const [membro] = await db('membros_grupo')
      .insert({
        grupo_id: grupoId,
        user_id: userId,
        role: role,
        status: 'ativo',
        joined_at: new Date(),
      })
      .returning('*');

    return membro;
  } catch (error) {
    logger.error('Erro ao adicionar membro:', error);
    throw new AppError('Erro ao adicionar membro', 500);
  }
}

async function getWishlists(grupoId) {
  try {
    const wishlists = await db('wishlist_items')
      .leftJoin('users', 'wishlist_items.user_id', 'users.id')
      .select(
        'wishlist_items.*',
        'users.name as user_name'
      )
      .where('wishlist_items.grupo_id', grupoId)
      .orderBy('wishlist_items.votos', 'desc')
      .orderBy('wishlist_items.created_at', 'desc');

    return wishlists;
  } catch (error) {
    logger.error('Erro ao buscar wishlists:', error);
    throw new AppError('Erro ao buscar wishlists', 500);
  }
}

async function addWishlistItem(grupoId, userId, data) {
  try {
    const itemData = {
      grupo_id: grupoId,
      user_id: userId,
      item_tipo: data.item_tipo,
      item_id: data.item_id || null,
      descricao: data.descricao,
      votos: 0,
      created_at: new Date(),
    };

    const [item] = await db('wishlist_items')
      .insert(itemData)
      .returning('*');

    return item;
  } catch (error) {
    logger.error('Erro ao adicionar item à wishlist:', error);
    throw new AppError('Erro ao adicionar item à wishlist', 500);
  }
}

async function getPagamentos(grupoId) {
  try {
    const pagamentos = await db('pagamentos_divididos')
      .where('grupo_id', grupoId)
      .orderBy('created_at', 'desc');

    return pagamentos;
  } catch (error) {
    logger.error('Erro ao buscar pagamentos:', error);
    throw new AppError('Erro ao buscar pagamentos', 500);
  }
}

async function createPagamentoDividido(grupoId, userId, data) {
  try {
    // Contar membros ativos do grupo
    const membrosCount = await db('membros_grupo')
      .where({ grupo_id: grupoId, status: 'ativo' })
      .count('* as total')
      .first();

    const totalMembros = parseInt(membrosCount.total) || 1;
    const valorPorPessoa = data.valor_total / totalMembros;

    const pagamentoData = {
      grupo_id: grupoId,
      descricao: data.descricao,
      valor_total: data.valor_total,
      valor_por_pessoa: valorPorPessoa,
      status: 'pendente',
      created_by: userId,
      created_at: new Date(),
    };

    const [pagamento] = await db('pagamentos_divididos')
      .insert(pagamentoData)
      .returning('*');

    return pagamento;
  } catch (error) {
    logger.error('Erro ao criar pagamento dividido:', error);
    throw new AppError('Erro ao criar pagamento dividido', 500);
  }
}

module.exports = {
  getAllGrupos,
  getGrupoById,
  createGrupo,
  updateGrupo,
  deleteGrupo,
  addMembro,
  getWishlists,
  addWishlistItem,
  getPagamentos,
  createPagamentoDividido,
};

