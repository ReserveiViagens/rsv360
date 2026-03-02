const { db } = require('../../config/database');
const { AppError } = require('../../middleware/errorHandler');
const logger = require('../../utils/logger');
const verificationService = require('./verificationService');

/**
 * Matching Engine
 * Motor de matching em tempo real que cruza Bids e Asks
 */

/**
 * Verificar se um bid e ask são compatíveis para match
 * @param {Object} bid - Objeto bid
 * @param {Object} ask - Objeto ask
 * @returns {Promise<boolean>} True se compatíveis
 */
async function checkForMatches(bid, ask) {
  try {
    // 1. Verificar se são do mesmo mercado
    if (bid.market_id !== ask.market_id) {
      return false;
    }

    // 2. Verificar se ambos estão ativos
    if (bid.status !== 'active' || ask.status !== 'active') {
      return false;
    }

    // 3. Verificar se os preços se tocam
    // Match acontece quando bid_price >= ask_price
    if (parseFloat(bid.bid_price) < parseFloat(ask.ask_price)) {
      return false;
    }

    // 4. Verificar compatibilidade de datas
    const bidDates = typeof bid.travel_dates === 'string' 
      ? JSON.parse(bid.travel_dates) 
      : bid.travel_dates;
    const askDates = typeof ask.availability_dates === 'string'
      ? JSON.parse(ask.availability_dates)
      : ask.availability_dates;

    if (!areDatesCompatible(bidDates, askDates)) {
      return false;
    }

    // 5. Verificar quantidade
    if (parseInt(bid.quantity) > parseInt(ask.quantity)) {
      return false;
    }

    // 6. Verificar se não expiraram
    const now = new Date();
    if (bid.expires_at && new Date(bid.expires_at) < now) {
      return false;
    }
    if (ask.expires_at && new Date(ask.expires_at) < now) {
      return false;
    }

    return true;
  } catch (error) {
    logger.error('Erro ao verificar compatibilidade:', error);
    return false;
  }
}

/**
 * Verificar compatibilidade de datas
 * @param {Object} bidDates - Datas do bid
 * @param {Object} askDates - Datas do ask
 * @returns {boolean}
 */
function areDatesCompatible(bidDates, askDates) {
  try {
    // Se o bid é flexível, aceita qualquer data disponível no ask
    if (bidDates.flexible) {
      return true;
    }

    const bidCheckIn = new Date(bidDates.check_in);
    const bidCheckOut = new Date(bidDates.check_out);

    // Verificar se as datas do bid estão dentro do range do ask
    if (Array.isArray(askDates.available_ranges)) {
      return askDates.available_ranges.some(range => {
        const rangeStart = new Date(range.start);
        const rangeEnd = new Date(range.end);
        return bidCheckIn >= rangeStart && bidCheckOut <= rangeEnd;
      });
    }

    // Se ask tem datas fixas
    if (askDates.start && askDates.end) {
      const askStart = new Date(askDates.start);
      const askEnd = new Date(askDates.end);
      return bidCheckIn >= askStart && bidCheckOut <= askEnd;
    }

    return false;
  } catch (error) {
    logger.error('Erro ao verificar datas:', error);
    return false;
  }
}

/**
 * Calcular preço de strike (preço final do match)
 * @param {number} bidPrice - Preço do bid
 * @param {number} askPrice - Preço do ask
 * @returns {number} Preço de strike
 */
function calculateStrikePrice(bidPrice, askPrice) {
  // Estratégia: usar o preço médio entre bid e ask
  // Isso garante que ambos os lados se beneficiam
  return (parseFloat(bidPrice) + parseFloat(askPrice)) / 2;
}

/**
 * Calcular spread (margem do sistema)
 * @param {number} bidPrice - Preço do bid
 * @param {number} askPrice - Preço do ask
 * @returns {number} Spread
 */
function calculateSpread(bidPrice, askPrice) {
  return parseFloat(bidPrice) - parseFloat(askPrice);
}

/**
 * Calcular comissão do sistema
 * @param {number} strikePrice - Preço de strike
 * @param {number} quantity - Quantidade
 * @param {number} commissionRate - Taxa de comissão (padrão 5%)
 * @returns {number} Comissão
 */
function calculateCommission(strikePrice, quantity, commissionRate = 0.05) {
  const totalAmount = parseFloat(strikePrice) * parseInt(quantity);
  return totalAmount * commissionRate;
}

/**
 * Executar match (strike)
 * @param {string} bidId - ID do bid
 * @param {string} askId - ID do ask
 * @returns {Promise<Object>} Match criado
 */
async function executeMatch(bidId, askId) {
  try {
    // Buscar bid e ask
    const bid = await db('route_bids').where('id', bidId).first();
    const ask = await db('route_asks').where('id', askId).first();

    if (!bid || !ask) {
      throw new AppError('Bid ou Ask não encontrado', 404);
    }

    // Verificar compatibilidade
    const isCompatible = await checkForMatches(bid, ask);
    if (!isCompatible) {
      throw new AppError('Bid e Ask não são compatíveis para match', 400);
    }

    // Calcular valores
    const strikePrice = calculateStrikePrice(bid.bid_price, ask.ask_price);
    const spread = calculateSpread(bid.bid_price, ask.ask_price);
    const quantity = Math.min(parseInt(bid.quantity), parseInt(ask.quantity));
    const totalAmount = strikePrice * quantity;
    const commission = calculateCommission(strikePrice, quantity);

    // Gerar hash de verificação do match
    const matchDataForHash = {
      bid_id: bidId,
      ask_id: askId,
      market_id: bid.market_id,
      strike_price: strikePrice,
      quantity,
      timestamp: new Date().toISOString(),
    };
    const verificationHash = verificationService.generateHash(matchDataForHash);

    // Criar match
    const [match] = await db('route_matches')
      .insert({
        bid_id: bidId,
        ask_id: askId,
        market_id: bid.market_id,
        strike_price: strikePrice,
        spread: spread,
        quantity: quantity,
        total_amount: totalAmount,
        commission: commission,
        status: 'pending',
        payment_status: 'pending',
        verification_hash: verificationHash,
        matched_at: new Date(),
        created_at: new Date(),
      })
      .returning('*');

    // Atualizar status do bid e ask
    await db('route_bids')
      .where('id', bidId)
      .update({
        status: 'matched',
        matched_at: new Date(),
        updated_at: new Date(),
      });

    await db('route_asks')
      .where('id', askId)
      .update({
        status: 'matched',
        matched_at: new Date(),
        updated_at: new Date(),
      });

    // Criar log de verificação
    await verificationService.createVerificationLog('match', match.id, matchDataForHash);

    // Registrar no histórico de preços
    await recordPriceSnapshot(bid.market_id, strikePrice, quantity);

    logger.info(`Match executado: ${match.id} entre bid ${bidId} e ask ${askId}`);

    return match;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    logger.error('Erro ao executar match:', error);
    throw new AppError('Erro ao executar match', 500);
  }
}

/**
 * Processar matching automático
 * Verifica todos os bids e asks ativos e executa matches
 * @returns {Promise<Array>} Lista de matches executados
 */
async function processMatching() {
  try {
    const matches = [];

    // Buscar todos os bids ativos
    const activeBids = await db('route_bids')
      .where('status', 'active')
      .orderBy('bid_price', 'desc');

    // Buscar todos os asks ativos
    const activeAsks = await db('route_asks')
      .where('status', 'active')
      .orderBy('ask_price', 'asc');

    // Tentar fazer match de cada bid com cada ask
    for (const bid of activeBids) {
      for (const ask of activeAsks) {
        try {
          const isCompatible = await checkForMatches(bid, ask);
          if (isCompatible) {
            const match = await executeMatch(bid.id, ask.id);
            matches.push(match);

            // Atualizar bid e ask para evitar múltiplos matches
            await db('route_bids').where('id', bid.id).update({ status: 'matched' });
            await db('route_asks').where('id', ask.id).update({ status: 'matched' });

            // Parar loop interno (já fez match)
            break;
          }
        } catch (error) {
          // Continuar para próximo ask se houver erro
          logger.warn(`Erro ao tentar match bid ${bid.id} com ask ${ask.id}:`, error.message);
        }
      }
    }

    logger.info(`Processamento de matching concluído: ${matches.length} matches executados`);

    return matches;
  } catch (error) {
    logger.error('Erro ao processar matching:', error);
    throw new AppError('Erro ao processar matching', 500);
  }
}

/**
 * Registrar snapshot de preço no histórico
 * @param {string} marketId - ID do mercado
 * @param {number} price - Preço
 * @param {number} volume - Volume
 */
async function recordPriceSnapshot(marketId, price, volume) {
  try {
    const now = new Date();
    const periodStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours());

    // Verificar se já existe snapshot para este período
    const existing = await db('route_price_history')
      .where({
        market_id: marketId,
        period_start: periodStart,
        period_type: 'hour',
      })
      .first();

    if (existing) {
      // Atualizar snapshot existente
      await db('route_price_history')
        .where('id', existing.id)
        .update({
          high_price: Math.max(parseFloat(existing.high_price), parseFloat(price)),
          low_price: Math.min(parseFloat(existing.low_price), parseFloat(price)),
          close_price: parseFloat(price),
          volume: parseInt(existing.volume) + parseInt(volume),
          total_value: parseFloat(existing.total_value) + (parseFloat(price) * parseInt(volume)),
        });
    } else {
      // Criar novo snapshot
      await db('route_price_history')
        .insert({
          market_id: marketId,
          period_start: periodStart,
          period_type: 'hour',
          open_price: parseFloat(price),
          high_price: parseFloat(price),
          low_price: parseFloat(price),
          close_price: parseFloat(price),
          volume: parseInt(volume),
          total_value: parseFloat(price) * parseInt(volume),
          created_at: new Date(),
        });
    }
  } catch (error) {
    logger.error('Erro ao registrar snapshot de preço:', error);
    // Não lançar erro, apenas logar (não é crítico)
  }
}

/**
 * Notificar partes envolvidas sobre match
 * @param {string} matchId - ID do match
 * @returns {Promise<void>}
 */
async function notifyMatch(matchId) {
  try {
    const match = await db('route_matches').where('id', matchId).first();
    if (!match) {
      return;
    }

    // Aqui você pode integrar com sistema de notificações
    // Por exemplo: WebSocket, email, push notification, etc.
    
    logger.info(`Notificação de match enviada: ${matchId}`);
    
    // TODO: Implementar notificações reais
    // await notificationService.sendMatchNotification(match);
  } catch (error) {
    logger.error('Erro ao notificar match:', error);
    // Não lançar erro, apenas logar
  }
}

module.exports = {
  checkForMatches,
  executeMatch,
  processMatching,
  calculateStrikePrice,
  calculateSpread,
  notifyMatch,
};
