const { db } = require('../../config/database');
const { AppError } = require('../../middleware/errorHandler');
const logger = require('../../utils/logger');
const verificationService = require('./verificationService');
const crypto = require('crypto');

/**
 * Order Book Service
 * Gerencia o livro de ordens (Bids e Asks) do sistema de bolsa
 */

/**
 * Obter Order Book completo de um mercado
 * @param {string} marketId - ID do mercado
 * @returns {Promise<Object>} Order book com bids e asks ordenados
 */
async function getOrderBook(marketId) {
  try {
    // Buscar bids ativos ordenados por preço (maior para menor)
    const bids = await db('route_bids')
      .where({ market_id: marketId, status: 'active' })
      .orderBy('bid_price', 'desc')
      .limit(20); // Top 20 bids

    // Buscar asks ativos ordenados por preço (menor para maior)
    const asks = await db('route_asks')
      .where({ market_id: marketId, status: 'active' })
      .orderBy('ask_price', 'asc')
      .limit(20); // Top 20 asks

    // Calcular spread (diferença entre melhor ask e melhor bid)
    const bestBid = bids[0]?.bid_price || 0;
    const bestAsk = asks[0]?.ask_price || 0;
    const spread = bestAsk > 0 && bestBid > 0 ? bestAsk - bestBid : 0;
    const spreadPercentage = bestBid > 0 ? ((spread / bestBid) * 100).toFixed(2) : 0;

    return {
      market_id: marketId,
      bids: bids,
      asks: asks,
      best_bid: bestBid,
      best_ask: bestAsk,
      spread: spread,
      spread_percentage: parseFloat(spreadPercentage),
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    logger.error('Erro ao buscar order book:', error);
    throw new AppError('Erro ao buscar order book', 500);
  }
}

/**
 * Criar nova ordem de compra (Bid)
 * @param {Object} bidData - Dados do bid
 * @param {string} userId - ID do usuário
 * @returns {Promise<Object>} Bid criado
 */
async function placeBid(bidData, userId) {
  try {
    const {
      market_id,
      bid_type = 'market',
      bid_price,
      quantity,
      max_price,
      travel_dates,
      requirements = {},
    } = bidData;

    // Validar dados
    if (!market_id || !bid_price || !quantity || !travel_dates) {
      throw new AppError('Dados obrigatórios faltando', 400);
    }

    // Verificar se o mercado existe
    const market = await db('route_exchange_markets')
      .where({ id: market_id, status: 'active' })
      .first();

    if (!market) {
      throw new AppError('Mercado não encontrado ou inativo', 404);
    }

    // Converter userId para UUID se necessário
    const userIdUUID = convertUserIdToUUID(userId);

    // Gerar hash de verificação
    const bidDataForHash = {
      market_id,
      user_id: userIdUUID,
      bid_type,
      bid_price,
      quantity,
      travel_dates,
      timestamp: new Date().toISOString(),
    };
    const verificationHash = verificationService.generateHash(bidDataForHash);

    // Criar bid
    const [bid] = await db('route_bids')
      .insert({
        market_id,
        user_id: userIdUUID,
        bid_type,
        bid_price: parseFloat(bid_price),
        quantity: parseInt(quantity),
        max_price: max_price ? parseFloat(max_price) : null,
        travel_dates: JSON.stringify(travel_dates),
        requirements: JSON.stringify(requirements),
        status: 'active',
        verification_hash: verificationHash,
        expires_at: bidData.expires_at || null,
        created_at: new Date(),
        updated_at: new Date(),
      })
      .returning('*');

    // Criar log de verificação
    await verificationService.createVerificationLog('bid', bid.id, bidDataForHash);

    logger.info(`Bid criado: ${bid.id} para mercado ${market_id} por usuário ${userId}`);

    return bid;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    logger.error('Erro ao criar bid:', error);
    throw new AppError('Erro ao criar bid', 500);
  }
}

/**
 * Criar nova ordem de venda (Ask)
 * @param {Object} askData - Dados do ask
 * @param {string} supplierId - ID do fornecedor
 * @returns {Promise<Object>} Ask criado
 */
async function placeAsk(askData, supplierId) {
  try {
    const {
      market_id,
      ask_type = 'market',
      ask_price,
      quantity,
      min_price,
      availability_dates,
      supplier_info = {},
    } = askData;

    // Validar dados
    if (!market_id || !ask_price || !quantity || !availability_dates) {
      throw new AppError('Dados obrigatórios faltando', 400);
    }

    // Verificar se o mercado existe
    const market = await db('route_exchange_markets')
      .where({ id: market_id, status: 'active' })
      .first();

    if (!market) {
      throw new AppError('Mercado não encontrado ou inativo', 404);
    }

    // Converter supplierId para UUID se necessário
    const supplierIdUUID = convertUserIdToUUID(supplierId);

    // Gerar hash de verificação
    const askDataForHash = {
      market_id,
      supplier_id: supplierIdUUID,
      ask_type,
      ask_price,
      quantity,
      availability_dates,
      timestamp: new Date().toISOString(),
    };
    const verificationHash = verificationService.generateHash(askDataForHash);

    // Criar ask
    const [ask] = await db('route_asks')
      .insert({
        market_id,
        supplier_id: supplierIdUUID,
        ask_type,
        ask_price: parseFloat(ask_price),
        quantity: parseInt(quantity),
        min_price: min_price ? parseFloat(min_price) : null,
        availability_dates: JSON.stringify(availability_dates),
        supplier_info: JSON.stringify(supplier_info),
        status: 'active',
        verification_hash: verificationHash,
        expires_at: askData.expires_at || null,
        created_at: new Date(),
        updated_at: new Date(),
      })
      .returning('*');

    // Criar log de verificação
    await verificationService.createVerificationLog('ask', ask.id, askDataForHash);

    logger.info(`Ask criado: ${ask.id} para mercado ${market_id} por fornecedor ${supplierId}`);

    return ask;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    logger.error('Erro ao criar ask:', error);
    throw new AppError('Erro ao criar ask', 500);
  }
}

/**
 * Cancelar ordem (Bid ou Ask)
 * @param {string} orderId - ID da ordem
 * @param {string} orderType - 'bid' ou 'ask'
 * @param {string} userId - ID do usuário (para verificação de permissão)
 * @returns {Promise<boolean>}
 */
async function cancelOrder(orderId, orderType, userId) {
  try {
    const tableName = orderType === 'bid' ? 'route_bids' : 'route_asks';
    const userIdField = orderType === 'bid' ? 'user_id' : 'supplier_id';

    // Converter userId para UUID se necessário
    const userIdUUID = convertUserIdToUUID(userId);

    // Verificar se a ordem existe e pertence ao usuário
    const order = await db(tableName)
      .where({ id: orderId })
      .first();

    if (!order) {
      throw new AppError('Ordem não encontrada', 404);
    }

    if (order[userIdField] !== userIdUUID) {
      throw new AppError('Sem permissão para cancelar esta ordem', 403);
    }

    // Verificar se pode ser cancelada
    if (order.status === 'matched') {
      throw new AppError('Ordem já foi executada e não pode ser cancelada', 400);
    }

    // Cancelar ordem
    await db(tableName)
      .where({ id: orderId })
      .update({
        status: 'cancelled',
        updated_at: new Date(),
      });

    logger.info(`Ordem ${orderType} ${orderId} cancelada por usuário ${userId}`);

    return true;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    logger.error('Erro ao cancelar ordem:', error);
    throw new AppError('Erro ao cancelar ordem', 500);
  }
}

/**
 * Calcular spread de um mercado
 * @param {string} marketId - ID do mercado
 * @returns {Promise<Object>} Informações do spread
 */
async function getSpread(marketId) {
  try {
    const orderBook = await getOrderBook(marketId);

    return {
      market_id: marketId,
      best_bid: orderBook.best_bid,
      best_ask: orderBook.best_ask,
      spread: orderBook.spread,
      spread_percentage: orderBook.spread_percentage,
      timestamp: orderBook.timestamp,
    };
  } catch (error) {
    logger.error('Erro ao calcular spread:', error);
    throw new AppError('Erro ao calcular spread', 500);
  }
}

/**
 * Converter userId (integer) para UUID format
 * Se já for UUID, retorna como está
 */
function convertUserIdToUUID(userId) {
  if (typeof userId === 'string' && userId.includes('-')) {
    // Já é UUID
    return userId;
  }
  // Converter integer para UUID format (usando padding zeros)
  const uuidFormat = `00000000-0000-0000-0000-${String(userId).padStart(12, '0')}`;
  return uuidFormat;
}

/**
 * Listar bids de um usuário
 * @param {string|number} userId - ID do usuário (integer ou UUID)
 * @param {Object} filters - Filtros opcionais
 * @returns {Promise<Array>} Lista de bids
 */
async function getUserBids(userId, filters = {}) {
  try {
    // Converter userId para UUID se necessário
    const userIdUUID = convertUserIdToUUID(userId);
    
    let query = db('route_bids')
      .where('user_id', userIdUUID)
      .orderBy('created_at', 'desc');

    if (filters.status) {
      query = query.where('status', filters.status);
    }

    if (filters.market_id) {
      query = query.where('market_id', filters.market_id);
    }

    return await query;
  } catch (error) {
    logger.error('Erro ao buscar bids do usuário:', error);
    throw new AppError('Erro ao buscar bids', 500);
  }
}

/**
 * Listar asks de um fornecedor
 * @param {string|number} supplierId - ID do fornecedor (integer ou UUID)
 * @param {Object} filters - Filtros opcionais
 * @returns {Promise<Array>} Lista de asks
 */
async function getSupplierAsks(supplierId, filters = {}) {
  try {
    // Converter supplierId para UUID se necessário
    const supplierIdUUID = convertUserIdToUUID(supplierId);
    
    let query = db('route_asks')
      .where('supplier_id', supplierIdUUID)
      .orderBy('created_at', 'desc');

    if (filters.status) {
      query = query.where('status', filters.status);
    }

    if (filters.market_id) {
      query = query.where('market_id', filters.market_id);
    }

    return await query;
  } catch (error) {
    logger.error('Erro ao buscar asks do fornecedor:', error);
    throw new AppError('Erro ao buscar asks', 500);
  }
}

module.exports = {
  getOrderBook,
  placeBid,
  placeAsk,
  cancelOrder,
  getSpread,
  getUserBids,
  getSupplierAsks,
};
