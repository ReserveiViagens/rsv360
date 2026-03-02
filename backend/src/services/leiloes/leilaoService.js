const { db } = require('../../config/database');
const { AppError } = require('../../middleware/errorHandler');
const logger = require('../../utils/logger');

/**
 * Listar todos os leilões com filtros e paginação
 */
async function getAllLeiloes(filters = {}, pagination = {}) {
  try {
    const page = pagination.page || 1;
    const limit = pagination.limit || 10;
    const offset = (page - 1) * limit;

    let query = db('auctions').select('*');

    // Aplicar filtros
    if (filters.status) {
      query = query.where('status', filters.status);
    }

    if (filters.type) {
      query = query.where('type', filters.type);
    }

    if (filters.search) {
      query = query.where(function() {
        this.where('title', 'ilike', `%${filters.search}%`)
            .orWhere('description', 'ilike', `%${filters.search}%`);
      });
    }

    if (filters.start_date) {
      query = query.where('start_date', '>=', filters.start_date);
    }

    if (filters.end_date) {
      query = query.where('end_date', '<=', filters.end_date);
    }

    // Contar total
    const countQuery = query.clone().clearSelect().count('* as total').first();
    const totalResult = await countQuery;
    const total = parseInt(totalResult.total);

    // Aplicar paginação e ordenação
    const leiloes = await query
      .orderBy('created_at', 'desc')
      .limit(limit)
      .offset(offset);

    return {
      data: leiloes,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    logger.error('Erro ao buscar leilões:', error);
    throw new AppError('Erro ao buscar leilões', 500);
  }
}

/**
 * Buscar leilão por ID
 */
async function getLeilaoById(id) {
  try {
    const leilao = await db('auctions').where('id', id).first();

    if (!leilao) {
      throw new AppError('Leilão não encontrado', 404);
    }

    return leilao;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    logger.error('Erro ao buscar leilão:', error);
    throw new AppError('Erro ao buscar leilão', 500);
  }
}

/**
 * Criar novo leilão
 */
async function createLeilao(data, userId) {
  try {
    const leilaoData = {
      title: data.title,
      description: data.description || null,
      property_id: data.property_id || null,
      starting_price: data.starting_price,
      current_price: data.starting_price, // Inicialmente igual ao preço inicial
      reserve_price: data.reserve_price || null,
      start_date: data.start_date,
      end_date: data.end_date,
      status: data.status || 'scheduled',
      type: data.type || 'auction',
      discount_percentage: data.discount_percentage || null,
      max_participants: data.max_participants || null,
      created_by: userId,
      created_at: new Date(),
      updated_at: new Date(),
    };

    const [leilao] = await db('auctions')
      .insert(leilaoData)
      .returning('*');

    return leilao;
  } catch (error) {
    logger.error('Erro ao criar leilão:', error);
    throw new AppError('Erro ao criar leilão', 500);
  }
}

/**
 * Atualizar leilão
 */
async function updateLeilao(id, data, userId, userPermissions = []) {
  try {
    // Verificar se o leilão existe
    const leilao = await getLeilaoById(id);

    // Verificar permissão (apenas criador ou admin)
    if (leilao.created_by !== userId && !userPermissions.includes('admin')) {
      throw new AppError('Sem permissão para atualizar este leilão', 403);
    }

    const updateData = {
      ...data,
      updated_at: new Date(),
    };

    // Remover campos que não devem ser atualizados diretamente
    delete updateData.id;
    delete updateData.created_at;
    delete updateData.created_by;

    const [updated] = await db('auctions')
      .where('id', id)
      .update(updateData)
      .returning('*');

    return updated;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    logger.error('Erro ao atualizar leilão:', error);
    throw new AppError('Erro ao atualizar leilão', 500);
  }
}

/**
 * Deletar/Cancelar leilão
 */
async function deleteLeilao(id, userId, userPermissions = []) {
  try {
    const leilao = await getLeilaoById(id);

    // Verificar permissão
    if (leilao.created_by !== userId && !userPermissions.includes('admin')) {
      throw new AppError('Sem permissão para deletar este leilão', 403);
    }

    // Se o leilão já começou, apenas cancelar
    if (leilao.status === 'active') {
      await db('auctions')
        .where('id', id)
        .update({ status: 'cancelled', updated_at: new Date() });
    } else {
      // Se ainda não começou, pode deletar
      await db('bids').where('auction_id', id).delete();
      await db('auctions').where('id', id).delete();
    }

    return true;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    logger.error('Erro ao deletar leilão:', error);
    throw new AppError('Erro ao deletar leilão', 500);
  }
}

/**
 * Listar lances de um leilão
 */
async function getLances(auctionId) {
  try {
    const lances = await db('bids')
      .leftJoin('users', 'bids.user_id', 'users.id')
      .select(
        'bids.*',
        'users.name as user_name',
        'users.email as user_email'
      )
      .where('bids.auction_id', auctionId)
      .orderBy('bids.created_at', 'desc');

    return lances;
  } catch (error) {
    logger.error('Erro ao buscar lances:', error);
    throw new AppError('Erro ao buscar lances', 500);
  }
}

/**
 * Criar lance
 */
async function createLance(auctionId, userId, amount) {
  try {
    // Verificar se o leilão existe e está ativo
    const leilao = await getLeilaoById(auctionId);

    if (leilao.status !== 'active') {
      throw new AppError('Leilão não está ativo', 400);
    }

    // Verificar se o lance é maior que o preço atual
    if (amount <= leilao.current_price) {
      throw new AppError('Lance deve ser maior que o preço atual', 400);
    }

    // Verificar se o leilão ainda não terminou
    if (new Date(leilao.end_date) < new Date()) {
      throw new AppError('Leilão já terminou', 400);
    }

    // Verificar se o leilão já começou
    if (new Date(leilao.start_date) > new Date()) {
      throw new AppError('Leilão ainda não começou', 400);
    }

    // Criar lance
    const [lance] = await db('bids')
      .insert({
        auction_id: auctionId,
        user_id: userId,
        amount: amount,
        is_winning: true, // Será o lance vencedor até que outro seja maior
        created_at: new Date(),
      })
      .returning('*');

    // Atualizar lance vencedor anterior
    await db('bids')
      .where('auction_id', auctionId)
      .where('id', '!=', lance.id)
      .update({ is_winning: false });

    // Atualizar preço atual do leilão
    await db('auctions')
      .where('id', auctionId)
      .update({
        current_price: amount,
        updated_at: new Date(),
      });

    return lance;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    logger.error('Erro ao criar lance:', error);
    throw new AppError('Erro ao criar lance', 500);
  }
}

/**
 * Listar flash deals
 */
async function getFlashDeals(pagination = {}) {
  try {
    return await getAllLeiloes({ type: 'flash_deal', status: 'active' }, pagination);
  } catch (error) {
    logger.error('Erro ao buscar flash deals:', error);
    throw new AppError('Erro ao buscar flash deals', 500);
  }
}

/**
 * Calcular relatórios
 */
async function calculateRelatorios(filters = {}) {
  try {
    let query = db('auctions');

    // Aplicar filtros
    if (filters.start_date) {
      query = query.where('start_date', '>=', filters.start_date);
    }

    if (filters.end_date) {
      query = query.where('end_date', '<=', filters.end_date);
    }

    if (filters.status) {
      query = query.where('status', filters.status);
    }

    if (filters.type) {
      query = query.where('type', filters.type);
    }

    // Estatísticas gerais
    const totalLeiloes = await query.clone().count('* as total').first();
    const totalReceita = await query.clone()
      .sum('current_price as total')
      .first();

    // Leilões por status
    const porStatus = await db('auctions')
      .select('status')
      .count('* as count')
      .groupBy('status');

    // Leilões por tipo
    const porTipo = await db('auctions')
      .select('type')
      .count('* as count')
      .groupBy('type');

    // Total de lances
    const totalLances = await db('bids')
      .count('* as total')
      .first();

    return {
      total_leiloes: parseInt(totalLeiloes.total),
      total_receita: parseFloat(totalReceita.total || 0),
      total_lances: parseInt(totalLances.total),
      por_status: porStatus,
      por_tipo: porTipo,
    };
  } catch (error) {
    logger.error('Erro ao calcular relatórios:', error);
    throw new AppError('Erro ao calcular relatórios', 500);
  }
}

module.exports = {
  getAllLeiloes,
  getLeilaoById,
  createLeilao,
  updateLeilao,
  deleteLeilao,
  getLances,
  createLance,
  getFlashDeals,
  calculateRelatorios,
};

