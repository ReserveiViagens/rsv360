const orderBookService = require('../../../services/route-exchange/orderBookService');
const matchingEngine = require('../../../services/route-exchange/matchingEngine');
const verificationService = require('../../../services/route-exchange/verificationService');
const { db } = require('../../../config/database');
const { AppError } = require('../../../middleware/errorHandler');
const logger = require('../../../utils/logger');

/**
 * Controller para Order Book
 */

/**
 * GET /markets/:marketId/orderbook
 * Obter order book completo de um mercado
 */
async function getOrderBook(req, res) {
  const { marketId } = req.params;
  const orderBook = await orderBookService.getOrderBook(marketId);
  res.json(orderBook);
}

/**
 * GET /markets/:marketId/spread
 * Obter spread de um mercado
 */
async function getSpread(req, res) {
  const { marketId } = req.params;
  const spread = await orderBookService.getSpread(marketId);
  res.json(spread);
}

/**
 * POST /bids
 * Criar nova ordem de compra (Bid)
 */
async function placeBid(req, res) {
  const userId = req.user.id;
  const bid = await orderBookService.placeBid(req.body, userId);

  // Tentar fazer matching automático
  try {
    await matchingEngine.processMatching();
  } catch (error) {
    logger.warn('Erro ao processar matching após criar bid:', error);
    // Não falhar a requisição se o matching falhar
  }

  res.status(201).json(bid);
}

/**
 * GET /bids/my
 * Listar bids do usuário
 */
async function getMyBids(req, res) {
  const userId = req.user.id;
  const filters = req.query;
  const bids = await orderBookService.getUserBids(userId, filters);
  res.json(bids);
}

/**
 * DELETE /bids/:bidId
 * Cancelar bid
 */
async function cancelBid(req, res) {
  const { bidId } = req.params;
  const userId = req.user.id;
  await orderBookService.cancelOrder(bidId, 'bid', userId);
  res.json({ message: 'Bid cancelado com sucesso' });
}

/**
 * POST /asks
 * Criar nova ordem de venda (Ask)
 */
async function placeAsk(req, res) {
  const supplierId = req.user.id;
  const ask = await orderBookService.placeAsk(req.body, supplierId);

  // Tentar fazer matching automático
  try {
    await matchingEngine.processMatching();
  } catch (error) {
    logger.warn('Erro ao processar matching após criar ask:', error);
    // Não falhar a requisição se o matching falhar
  }

  res.status(201).json(ask);
}

/**
 * GET /asks/my
 * Listar asks do fornecedor
 */
async function getMyAsks(req, res) {
  const supplierId = req.user.id;
  const filters = req.query;
  const asks = await orderBookService.getSupplierAsks(supplierId, filters);
  res.json(asks);
}

/**
 * DELETE /asks/:askId
 * Cancelar ask
 */
async function cancelAsk(req, res) {
  const { askId } = req.params;
  const supplierId = req.user.id;
  await orderBookService.cancelOrder(askId, 'ask', supplierId);
  res.json({ message: 'Ask cancelado com sucesso' });
}

/**
 * GET /matches
 * Listar matches do usuário
 */
async function getMatches(req, res) {
  const userId = req.user.id;
  const filters = req.query;

  let query = db('route_matches')
    .leftJoin('route_bids', 'route_matches.bid_id', 'route_bids.id')
    .leftJoin('route_asks', 'route_matches.ask_id', 'route_asks.id')
    .where(function() {
      this.where('route_bids.user_id', userId)
          .orWhere('route_asks.supplier_id', userId);
    })
    .select(
      'route_matches.*',
      'route_bids.user_id as bid_user_id',
      'route_asks.supplier_id as ask_supplier_id'
    )
    .orderBy('route_matches.matched_at', 'desc');

  if (filters.status) {
    query = query.where('route_matches.status', filters.status);
  }

  const matches = await query;
  res.json(matches);
}

/**
 * GET /matches/:matchId
 * Obter match específico
 */
async function getMatchById(req, res) {
  const { matchId } = req.params;
  const userId = req.user.id;

  const match = await db('route_matches')
    .leftJoin('route_bids', 'route_matches.bid_id', 'route_bids.id')
    .leftJoin('route_asks', 'route_matches.ask_id', 'route_asks.id')
    .where('route_matches.id', matchId)
    .where(function() {
      this.where('route_bids.user_id', userId)
          .orWhere('route_asks.supplier_id', userId);
    })
    .select('route_matches.*')
    .first();

  if (!match) {
    throw new AppError('Match não encontrado', 404);
  }

  res.json(match);
}

/**
 * POST /matches/:matchId/confirm
 * Confirmar match
 */
async function confirmMatch(req, res) {
  const { matchId } = req.params;
  const userId = req.user.id;

  const match = await db('route_matches')
    .leftJoin('route_bids', 'route_matches.bid_id', 'route_bids.id')
    .leftJoin('route_asks', 'route_matches.ask_id', 'route_asks.id')
    .where('route_matches.id', matchId)
    .where(function() {
      this.where('route_bids.user_id', userId)
          .orWhere('route_asks.supplier_id', userId);
    })
    .select('route_matches.*')
    .first();

  if (!match) {
    throw new AppError('Match não encontrado', 404);
  }

  if (match.status !== 'pending') {
    throw new AppError('Match já foi confirmado ou cancelado', 400);
  }

  await db('route_matches')
    .where('id', matchId)
    .update({
      status: 'confirmed',
      confirmed_at: new Date(),
    });

  res.json({ message: 'Match confirmado com sucesso' });
}

/**
 * GET /verify/:entityType/:entityId
 * Verificar integridade de uma entidade (Proof of Transparency)
 */
async function verifyEntity(req, res) {
  const { entityType, entityId } = req.params;
  const { hash } = req.query;

  if (hash) {
    // Verificar hash específico
    const isValid = await verificationService.verifyHash(entityType, entityId, hash);
    res.json({
      valid: isValid,
      entity_type: entityType,
      entity_id: entityId,
      hash: hash,
    });
  } else {
    // Verificar integridade completa
    const result = await verificationService.verifyEntityIntegrity(entityType, entityId);
    const chain = await verificationService.getVerificationChain(entityType, entityId);
    
    res.json({
      ...result,
      chain: chain,
    });
  }
}

module.exports = {
  getOrderBook,
  getSpread,
  placeBid,
  getMyBids,
  cancelBid,
  placeAsk,
  getMyAsks,
  cancelAsk,
  getMatches,
  getMatchById,
  confirmMatch,
  verifyEntity,
};
