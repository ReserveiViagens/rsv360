const flashDealsService = require('./service');
const logger = require('../../../utils/logger');

/**
 * Controller para gerenciar Flash Deals
 */

/**
 * Listar flash deals
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

    const result = await flashDealsService.list(filters);
    res.json(result);
  } catch (error) {
    logger.error('Error in list flash deals:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    });
  }
};

/**
 * Obter flash deal por ID
 */
const getById = async (req, res) => {
  try {
    const { id } = req.params;
    const flashDeal = await flashDealsService.findById(id);

    if (!flashDeal) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Flash deal not found',
      });
    }

    res.json(flashDeal);
  } catch (error) {
    logger.error('Error in get flash deal by id:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    });
  }
};

/**
 * Criar novo flash deal
 */
const create = async (req, res) => {
  try {
    const {
      enterprise_id,
      property_id,
      accommodation_id,
      title,
      description,
      original_price,
      discount_percentage,
      max_discount,
      discount_increment,
      increment_interval,
      units_available,
      start_date,
      end_date,
    } = req.body;

    // Validação básica
    if (!enterprise_id || !title || !original_price || !start_date || !end_date || !units_available) {
      return res.status(400).json({
        error: 'Bad request',
        message: 'Missing required fields: enterprise_id, title, original_price, start_date, end_date, units_available',
      });
    }

    const flashDealData = {
      enterprise_id,
      property_id,
      accommodation_id,
      title,
      description,
      original_price: parseFloat(original_price),
      discount_percentage: discount_percentage ? parseInt(discount_percentage) : 0,
      max_discount: max_discount ? parseInt(max_discount) : 50,
      discount_increment: discount_increment ? parseInt(discount_increment) : 5,
      increment_interval: increment_interval ? parseInt(increment_interval) : 60,
      units_available: parseInt(units_available),
      start_date,
      end_date,
      created_by: req.user?.id || req.user?.userId,
    };

    const flashDeal = await flashDealsService.create(flashDealData);

    // Emitir evento WebSocket
    if (global.wsServer) {
      global.wsServer.emitToAll('flash-deal:created', flashDeal);
    }

    res.status(201).json(flashDeal);
  } catch (error) {
    logger.error('Error in create flash deal:', error);
    res.status(400).json({
      error: 'Bad request',
      message: error.message,
    });
  }
};

/**
 * Atualizar flash deal
 */
const update = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const flashDeal = await flashDealsService.update(id, updateData);

    // Emitir evento WebSocket
    if (global.wsServer) {
      global.wsServer.emitToFlashDeal(id, 'flash-deal:updated', flashDeal);
    }

    res.json(flashDeal);
  } catch (error) {
    logger.error('Error in update flash deal:', error);
    res.status(400).json({
      error: 'Bad request',
      message: error.message,
    });
  }
};

/**
 * Deletar flash deal
 */
const remove = async (req, res) => {
  try {
    const { id } = req.params;
    await flashDealsService.delete(id);

    res.status(204).send();
  } catch (error) {
    logger.error('Error in delete flash deal:', error);
    res.status(400).json({
      error: 'Bad request',
      message: error.message,
    });
  }
};

/**
 * Listar flash deals ativos
 */
const getActive = async (req, res) => {
  try {
    const flashDeals = await flashDealsService.getActive();
    res.json(flashDeals);
  } catch (error) {
    logger.error('Error in get active flash deals:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    });
  }
};

/**
 * Reservar flash deal
 */
const reserve = async (req, res) => {
  try {
    const { id } = req.params;
    const { payment_method, payment_transaction_id } = req.body;

    const customerId = req.user?.id || req.user?.userId || req.body.customer_id;
    if (!customerId) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Customer ID is required',
      });
    }

    const paymentData = {
      method: payment_method,
      transaction_id: payment_transaction_id,
      status: 'paid',
    };

    const booking = await flashDealsService.reserve(id, customerId, paymentData);

    // Buscar flash deal atualizado
    const flashDeal = await flashDealsService.findById(id);

    // Emitir evento WebSocket
    if (global.wsServer) {
      global.wsServer.emitToFlashDeal(id, 'flash-deal:reserved', {
        flashDeal,
        booking,
      });
    }

    res.status(201).json(booking);
  } catch (error) {
    logger.error('Error in reserve flash deal:', error);
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
  getActive,
  reserve,
};
