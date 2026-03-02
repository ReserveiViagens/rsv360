const marketplaceService = require('./service');
const logger = require('../../../utils/logger');

/**
 * Controller para gerenciar Marketplace
 */

const listListings = async (req, res) => {
  try {
    const filters = {
      page: req.query.page,
      limit: req.query.limit,
      status: req.query.status,
      enterprise_id: req.query.enterprise_id,
      property_id: req.query.property_id,
      search: req.query.search,
    };

    const result = await marketplaceService.listListings(filters);
    res.json(result);
  } catch (error) {
    logger.error('Error in listListings:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    });
  }
};

const getListing = async (req, res) => {
  try {
    const { id } = req.params;
    const listing = await marketplaceService.findListingById(id);

    if (!listing) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Listing not found',
      });
    }

    res.json(listing);
  } catch (error) {
    logger.error('Error in getListing:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    });
  }
};

const createListing = async (req, res) => {
  try {
    const data = {
      ...req.body,
      created_by: req.user?.id,
    };

    const listing = await marketplaceService.createListing(data);
    res.status(201).json(listing);
  } catch (error) {
    logger.error('Error in createListing:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    });
  }
};

const updateListing = async (req, res) => {
  try {
    const { id } = req.params;
    const data = {
      ...req.body,
      updated_by: req.user?.id,
    };

    const listing = await marketplaceService.updateListing(id, data);
    
    if (!listing) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Listing not found',
      });
    }

    res.json(listing);
  } catch (error) {
    logger.error('Error in updateListing:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    });
  }
};

const approveListing = async (req, res) => {
  try {
    const { id } = req.params;
    const approverId = req.user?.id;

    if (!approverId) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Approver ID required',
      });
    }

    const listing = await marketplaceService.approveListing(id, approverId);
    res.json(listing);
  } catch (error) {
    logger.error('Error in approveListing:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    });
  }
};

const rejectListing = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const approverId = req.user?.id;

    if (!approverId) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Approver ID required',
      });
    }

    if (!reason) {
      return res.status(400).json({
        error: 'Bad request',
        message: 'Rejection reason is required',
      });
    }

    const listing = await marketplaceService.rejectListing(id, reason, approverId);
    res.json(listing);
  } catch (error) {
    logger.error('Error in rejectListing:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    });
  }
};

const listOrders = async (req, res) => {
  try {
    const filters = {
      page: req.query.page,
      limit: req.query.limit,
      status: req.query.status,
      enterprise_id: req.query.enterprise_id,
      customer_id: req.query.customer_id,
    };

    const orders = await marketplaceService.listOrders(filters);
    res.json(orders);
  } catch (error) {
    logger.error('Error in listOrders:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    });
  }
};

const createOrder = async (req, res) => {
  try {
    const { listing_id, customer_id, ...bookingData } = req.body;

    if (!listing_id || !customer_id) {
      return res.status(400).json({
        error: 'Bad request',
        message: 'listing_id and customer_id are required',
      });
    }

    const order = await marketplaceService.createOrder(listing_id, customer_id, bookingData);
    res.status(201).json(order);
  } catch (error) {
    logger.error('Error in createOrder:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    });
  }
};

const listCommissions = async (req, res) => {
  try {
    const filters = {
      page: req.query.page,
      limit: req.query.limit,
      status: req.query.status,
      enterprise_id: req.query.enterprise_id,
    };

    const commissions = await marketplaceService.listCommissions(filters);
    res.json(commissions);
  } catch (error) {
    logger.error('Error in listCommissions:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    });
  }
};

module.exports = {
  listListings,
  getListing,
  createListing,
  updateListing,
  approveListing,
  rejectListing,
  listOrders,
  createOrder,
  listCommissions,
};
