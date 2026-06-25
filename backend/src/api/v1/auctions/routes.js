const express = require('express');
const { extractBearerToken, verifyAccessToken } = require('../auth/jwt-verify');
const {
  isAuctionsDbEnabled,
  listAuctions,
  listActiveAuctions,
  getAuctionMapData,
  getAuctionById,
  listBids,
  placeBid,
  createAuction,
} = require('./service');

const router = express.Router();

function resolveBearerUser(req) {
  const token = extractBearerToken(req);
  if (!token) return null;
  const secret = process.env.JWT_SECRET || 'REDACTED_JWT_SECRET';
  const payload = verifyAccessToken(token, secret);
  if (!payload) return null;
  const userId = payload.userId ?? payload.sub ?? payload.id;
  if (!userId) return null;
  return {
    userId: Number(userId),
    email: payload.email,
    name: payload.name,
  };
}

function requireDb(res) {
  if (!isAuctionsDbEnabled()) {
    res.status(501).json({
      success: false,
      error: 'Leilões indisponíveis. Configure DATABASE_URL.',
    });
    return false;
  }
  return true;
}

/** GET /api/v1/auctions — lista paginada */
router.get('/', async (req, res) => {
  if (!requireDb(res)) return;

  try {
    const result = await listAuctions({
      status: req.query.status,
      enterprise_id: req.query.enterprise_id,
      property_id: req.query.property_id,
      search: req.query.search,
      page: req.query.page,
      limit: req.query.limit,
      minPrice: req.query.minPrice,
      maxPrice: req.query.maxPrice,
    });

    return res.json({
      success: true,
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    console.error('[AUCTIONS] list error:', error.message);
    return res.status(503).json({ success: false, error: 'Serviço temporariamente indisponível' });
  }
});

/** GET /api/v1/auctions/active — leilões ativos (site-publico) */
router.get('/active', async (req, res) => {
  if (!requireDb(res)) return;

  try {
    const data = await listActiveAuctions({
      enterprise_id: req.query.enterprise_id,
      search: req.query.search,
    });
    return res.json(data);
  } catch (error) {
    console.error('[AUCTIONS] active error:', error.message);
    return res.status(503).json({ success: false, error: 'Serviço temporariamente indisponível' });
  }
});

/** GET /api/v1/auctions/map-data — marcadores do mapa */
router.get('/map-data', async (req, res) => {
  if (!requireDb(res)) return;

  try {
    const data = await getAuctionMapData();
    return res.json(data);
  } catch (error) {
    console.error('[AUCTIONS] map-data error:', error.message);
    return res.status(503).json({ success: false, error: 'Serviço temporariamente indisponível' });
  }
});

/** POST /api/v1/auctions — criar leilão */
router.post('/', async (req, res) => {
  if (!requireDb(res)) return;

  const bearer = resolveBearerUser(req);
  if (!bearer) {
    return res.status(401).json({ success: false, error: 'Token ausente ou inválido' });
  }

  try {
    const result = await createAuction(req.body);
    if (result?.error) {
      return res.status(result.status).json({ success: false, error: result.message });
    }
    return res.status(201).json({ success: true, data: result.auction });
  } catch (error) {
    console.error('[AUCTIONS] create error:', error.message);
    return res.status(503).json({ success: false, error: 'Serviço temporariamente indisponível' });
  }
});

/** GET /api/v1/auctions/:id/bids — histórico de lances */
router.get('/:id/bids', async (req, res) => {
  if (!requireDb(res)) return;

  const auctionId = parseInt(req.params.id, 10);
  if (!Number.isFinite(auctionId)) {
    return res.status(400).json({ success: false, error: 'ID inválido' });
  }

  try {
    const auction = await getAuctionById(auctionId);
    if (!auction) {
      return res.status(404).json({ success: false, error: 'Leilão não encontrado' });
    }
    const data = await listBids(auctionId);
    return res.json({ success: true, data });
  } catch (error) {
    console.error('[AUCTIONS] bids list error:', error.message);
    return res.status(503).json({ success: false, error: 'Serviço temporariamente indisponível' });
  }
});

/** POST /api/v1/auctions/:id/bids — registrar lance */
router.post('/:id/bids', async (req, res) => {
  if (!requireDb(res)) return;

  const bearer = resolveBearerUser(req);
  if (!bearer) {
    return res.status(401).json({ success: false, message: 'Autenticação necessária para dar lance' });
  }

  const auctionId = parseInt(req.params.id, 10);
  if (!Number.isFinite(auctionId)) {
    return res.status(400).json({ success: false, message: 'ID inválido' });
  }

  try {
    const result = await placeBid(auctionId, bearer, req.body?.amount);
    if (result?.error) {
      return res.status(result.status).json({ success: false, message: result.message });
    }
    return res.status(201).json({ success: true, data: result.bid });
  } catch (error) {
    console.error('[AUCTIONS] bid error:', error.message);
    return res.status(503).json({ success: false, message: 'Serviço temporariamente indisponível' });
  }
});

/** GET /api/v1/auctions/:id — detalhe */
router.get('/:id', async (req, res) => {
  if (!requireDb(res)) return;

  const auctionId = parseInt(req.params.id, 10);
  if (!Number.isFinite(auctionId)) {
    return res.status(400).json({ success: false, error: 'ID inválido' });
  }

  try {
    const auction = await getAuctionById(auctionId);
    if (!auction) {
      return res.status(404).json({ success: false, error: 'Leilão não encontrado' });
    }
    return res.json(auction);
  } catch (error) {
    console.error('[AUCTIONS] get error:', error.message);
    return res.status(503).json({ success: false, error: 'Serviço temporariamente indisponível' });
  }
});

module.exports = { auctionsRouter: router };
