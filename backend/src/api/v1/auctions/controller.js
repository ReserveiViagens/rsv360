const auctionsService = require('./service');
const logger = require('../../../utils/logger');

/**
 * Controller para gerenciar leilões
 */

/**
 * Listar leilões
 */
const list = async (req, res) => {
  try {
    const filters = {
      page: req.query.page,
      limit: req.query.limit,
      status: req.query.status,
      enterprise_id: req.query.enterprise_id,
      property_id: req.query.property_id,
      accommodation_id: req.query.accommodation_id,
      search: req.query.search,
    };

    const result = await auctionsService.list(filters);
    res.json(result);
  } catch (error) {
    logger.error('Error in list auctions:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    });
  }
};

/**
 * Obter leilão por ID
 */
const getById = async (req, res) => {
  try {
    const { id } = req.params;
    const auction = await auctionsService.findById(id);

    if (!auction) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Auction not found',
      });
    }

    res.json(auction);
  } catch (error) {
    logger.error('Error in get auction by id:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    });
  }
};

/**
 * Criar novo leilão
 */
const create = async (req, res) => {
  try {
    const {
      enterprise_id,
      property_id,
      accommodation_id,
      title,
      description,
      start_price,
      min_increment,
      reserve_price,
      start_date,
      end_date,
    } = req.body;

    // Validação básica
    if (!enterprise_id || !title || !start_price || !start_date || !end_date) {
      return res.status(400).json({
        error: 'Bad request',
        message: 'Missing required fields: enterprise_id, title, start_price, start_date, end_date',
      });
    }

    const auctionData = {
      enterprise_id,
      property_id,
      accommodation_id,
      title,
      description,
      start_price: parseFloat(start_price),
      min_increment: parseFloat(min_increment) || 10.00,
      reserve_price: reserve_price ? parseFloat(reserve_price) : null,
      start_date,
      end_date,
      created_by: req.user?.id || req.user?.userId,
    };

    const auction = await auctionsService.create(auctionData);

    // Emitir evento WebSocket
    if (global.wsServer) {
      global.wsServer.emitToAll('auction:created', auction);
    }

    res.status(201).json(auction);
  } catch (error) {
    logger.error('Error in create auction:', error);
    res.status(400).json({
      error: 'Bad request',
      message: error.message,
    });
  }
};

/**
 * Atualizar leilão
 */
const update = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const auction = await auctionsService.update(id, updateData);

    // Emitir evento WebSocket
    if (global.wsServer) {
      global.wsServer.emitToAuction(id, 'auction:updated', auction);
    }

    res.json(auction);
  } catch (error) {
    logger.error('Error in update auction:', error);
    res.status(400).json({
      error: 'Bad request',
      message: error.message,
    });
  }
};

/**
 * Deletar leilão
 */
const remove = async (req, res) => {
  try {
    const { id } = req.params;
    await auctionsService.delete(id);

    res.status(204).send();
  } catch (error) {
    logger.error('Error in delete auction:', error);
    res.status(400).json({
      error: 'Bad request',
      message: error.message,
    });
  }
};

/**
 * Listar lances de um leilão
 */
const getBids = async (req, res) => {
  try {
    const { id } = req.params;
    const filters = {
      page: req.query.page,
      limit: req.query.limit,
    };

    const result = await auctionsService.getBids(id, filters);
    res.json(result);
  } catch (error) {
    logger.error('Error in get bids:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    });
  }
};

/**
 * Fazer lance em um leilão
 */
const placeBid = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        error: 'Bad request',
        message: 'Amount is required and must be greater than 0',
      });
    }

    const customerId = req.user?.id || req.user?.userId || req.body.customer_id;
    if (!customerId) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Customer ID is required',
      });
    }

    const bid = await auctionsService.placeBid(id, customerId, parseFloat(amount));

    // Buscar leilão atualizado
    const auction = await auctionsService.findById(id);

    // Emitir evento WebSocket
    if (global.wsServer) {
      global.wsServer.emitToAuction(id, 'bid:new', {
        bid,
        auction,
      });
    }

    res.status(201).json(bid);
  } catch (error) {
    logger.error('Error in place bid:', error);
    res.status(400).json({
      error: 'Bad request',
      message: error.message,
    });
  }
};

/**
 * Listar leilões ativos
 * Aceita filtros: search, checkIn, checkOut, minPrice, maxPrice
 */
const getActive = async (req, res) => {
  try {
    const filters = {
      search: req.query.search,
      checkIn: req.query.checkIn,
      checkOut: req.query.checkOut,
      minPrice: req.query.minPrice ? parseFloat(req.query.minPrice) : undefined,
      maxPrice: req.query.maxPrice ? parseFloat(req.query.maxPrice) : undefined,
    };
    const auctions = await auctionsService.getActive(filters);
    res.json(auctions);
  } catch (error) {
    logger.error('Error in get active auctions:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    });
  }
};

/**
 * Dados para mapa (id, title, lat, lng, status)
 */
const getMapData = async (req, res) => {
  try {
    const data = await auctionsService.getMapData();
    res.json(data);
  } catch (error) {
    logger.error('Error in get auction map data:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    });
  }
};

/**
 * Listar próximos leilões
 */
const getUpcoming = async (req, res) => {
  try {
    const auctions = await auctionsService.getUpcoming();
    res.json(auctions);
  } catch (error) {
    logger.error('Error in get upcoming auctions:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    });
  }
};

/**
 * Listar leilões finalizados
 */
const getFinished = async (req, res) => {
  try {
    const auctions = await auctionsService.getFinished();
    res.json(auctions);
  } catch (error) {
    logger.error('Error in get finished auctions:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    });
  }
};

/**
 * Finalizar leilão
 */
const finish = async (req, res) => {
  try {
    const { id } = req.params;
    const auction = await auctionsService.finish(id);

    // Emitir evento WebSocket
    if (global.wsServer) {
      global.wsServer.emitToAuction(id, 'auction:finished', auction);
    }

    res.json(auction);
  } catch (error) {
    logger.error('Error in finish auction:', error);
    res.status(400).json({
      error: 'Bad request',
      message: error.message,
    });
  }
};

/**
 * Criar reserva após leilão ganho
 */
const createBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const paymentData = req.body;

    const booking = await auctionsService.createBookingFromAuction(id, paymentData);

    res.status(201).json(booking);
  } catch (error) {
    logger.error('Error in create booking from auction:', error);
    res.status(400).json({
      error: 'Bad request',
      message: error.message,
    });
  }
};

module.exports = {
  list,
  getById,
  create,
  update,
  remove,
  getBids,
  placeBid,
  getActive,
  getUpcoming,
  getFinished,
  getMapData,
  finish,
  createBooking,
};
