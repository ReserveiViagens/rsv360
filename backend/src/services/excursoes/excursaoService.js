const { db } = require('../../config/database');
const { AppError } = require('../../middleware/errorHandler');
const logger = require('../../utils/logger');

async function getAllExcursoes(filters = {}, pagination = {}) {
  try {
    const page = pagination.page || 1;
    const limit = pagination.limit || 10;
    const offset = (page - 1) * limit;

    let query = db('excursoes').select('*');

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

    if (filters.data_inicio) {
      query = query.where('data_inicio', '>=', filters.data_inicio);
    }

    if (filters.data_fim) {
      query = query.where('data_fim', '<=', filters.data_fim);
    }

    const countQuery = query.clone().clearSelect().count('* as total').first();
    const totalResult = await countQuery;
    const total = parseInt(totalResult.total);

    const excursoes = await query
      .orderBy('created_at', 'desc')
      .limit(limit)
      .offset(offset);

    return {
      data: excursoes,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    logger.error('Erro ao buscar excursões:', error);
    throw new AppError('Erro ao buscar excursões', 500);
  }
}

async function getExcursaoById(id) {
  try {
    const excursao = await db('excursoes').where('id', id).first();

    if (!excursao) {
      throw new AppError('Excursão não encontrada', 404);
    }

    return excursao;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    logger.error('Erro ao buscar excursão:', error);
    throw new AppError('Erro ao buscar excursão', 500);
  }
}

async function createExcursao(data, userId) {
  try {
    const excursaoData = {
      nome: data.nome,
      destino: data.destino,
      descricao: data.descricao || null,
      data_inicio: data.data_inicio,
      data_fim: data.data_fim,
      preco: data.preco,
      vagas_disponiveis: data.vagas_disponiveis || data.vagas_totais,
      vagas_totais: data.vagas_totais,
      status: data.status || 'planejamento',
      inclui_transporte: data.inclui_transporte || false,
      inclui_hospedagem: data.inclui_hospedagem || false,
      inclui_refeicoes: data.inclui_refeicoes || false,
      created_by: userId,
      created_at: new Date(),
      updated_at: new Date(),
    };

    const [excursao] = await db('excursoes')
      .insert(excursaoData)
      .returning('*');

    return excursao;
  } catch (error) {
    logger.error('Erro ao criar excursão:', error);
    throw new AppError('Erro ao criar excursão', 500);
  }
}

async function updateExcursao(id, data, userId, userPermissions = []) {
  try {
    const excursao = await getExcursaoById(id);

    if (excursao.created_by !== userId && !userPermissions.includes('admin')) {
      throw new AppError('Sem permissão para atualizar esta excursão', 403);
    }

    const updateData = {
      ...data,
      updated_at: new Date(),
    };

    delete updateData.id;
    delete updateData.created_at;
    delete updateData.created_by;

    const [updated] = await db('excursoes')
      .where('id', id)
      .update(updateData)
      .returning('*');

    return updated;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    logger.error('Erro ao atualizar excursão:', error);
    throw new AppError('Erro ao atualizar excursão', 500);
  }
}

async function deleteExcursao(id, userId, userPermissions = []) {
  try {
    const excursao = await getExcursaoById(id);

    if (excursao.created_by !== userId && !userPermissions.includes('admin')) {
      throw new AppError('Sem permissão para deletar esta excursão', 403);
    }

    if (excursao.status === 'em_andamento') {
      await db('excursoes')
        .where('id', id)
        .update({ status: 'cancelada', updated_at: new Date() });
    } else {
      await db('roteiros').where('excursao_id', id).delete();
      await db('participantes_excursao').where('excursao_id', id).delete();
      await db('excursoes').where('id', id).delete();
    }

    return true;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    logger.error('Erro ao deletar excursão:', error);
    throw new AppError('Erro ao deletar excursão', 500);
  }
}

async function getParticipantes(excursaoId) {
  try {
    const participantes = await db('participantes_excursao')
      .leftJoin('users', 'participantes_excursao.user_id', 'users.id')
      .select(
        'participantes_excursao.*',
        'users.name as user_name',
        'users.email as user_email'
      )
      .where('participantes_excursao.excursao_id', excursaoId)
      .orderBy('participantes_excursao.created_at', 'desc');

    return participantes;
  } catch (error) {
    logger.error('Erro ao buscar participantes:', error);
    throw new AppError('Erro ao buscar participantes', 500);
  }
}

async function addParticipante(excursaoId, userId) {
  try {
    const excursao = await getExcursaoById(excursaoId);

    if (excursao.vagas_disponiveis <= 0) {
      throw new AppError('Não há vagas disponíveis', 400);
    }

    // Verificar se já é participante
    const existing = await db('participantes_excursao')
      .where({ excursao_id: excursaoId, user_id: userId })
      .first();

    if (existing) {
      throw new AppError('Usuário já é participante desta excursão', 400);
    }

    const [participante] = await db('participantes_excursao')
      .insert({
        excursao_id: excursaoId,
        user_id: userId,
        status: 'pendente',
        pagamento_status: 'pendente',
        created_at: new Date(),
      })
      .returning('*');

    // Atualizar vagas disponíveis
    await db('excursoes')
      .where('id', excursaoId)
      .update({
        vagas_disponiveis: db.raw('vagas_disponiveis - 1'),
        updated_at: new Date(),
      });

    return participante;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    logger.error('Erro ao adicionar participante:', error);
    throw new AppError('Erro ao adicionar participante', 500);
  }
}

async function removeParticipante(excursaoId, userId) {
  try {
    await db('participantes_excursao')
      .where({ excursao_id: excursaoId, user_id: userId })
      .delete();

    // Atualizar vagas disponíveis
    await db('excursoes')
      .where('id', excursaoId)
      .update({
        vagas_disponiveis: db.raw('vagas_disponiveis + 1'),
        updated_at: new Date(),
      });

    return true;
  } catch (error) {
    logger.error('Erro ao remover participante:', error);
    throw new AppError('Erro ao remover participante', 500);
  }
}

async function getRoteiros(excursaoId) {
  try {
    const roteiros = await db('roteiros')
      .where('excursao_id', excursaoId)
      .orderBy('dia', 'asc')
      .orderBy('ordem', 'asc');

    return roteiros;
  } catch (error) {
    logger.error('Erro ao buscar roteiros:', error);
    throw new AppError('Erro ao buscar roteiros', 500);
  }
}

async function createRoteiro(excursaoId, data) {
  try {
    const roteiroData = {
      excursao_id: excursaoId,
      dia: data.dia,
      horario: data.horario || null,
      atividade: data.atividade,
      descricao: data.descricao || null,
      ordem: data.ordem,
      created_at: new Date(),
    };

    const [roteiro] = await db('roteiros')
      .insert(roteiroData)
      .returning('*');

    return roteiro;
  } catch (error) {
    logger.error('Erro ao criar roteiro:', error);
    throw new AppError('Erro ao criar roteiro', 500);
  }
}

module.exports = {
  getAllExcursoes,
  getExcursaoById,
  createExcursao,
  updateExcursao,
  deleteExcursao,
  getParticipantes,
  addParticipante,
  removeParticipante,
  getRoteiros,
  createRoteiro,
};

