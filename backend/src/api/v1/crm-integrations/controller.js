const crmIntegrationsService = require('./service');
const logger = require('../../../utils/logger');

/**
 * Controller para integrações CRM
 */

const getAuctionParticipants = async (req, res) => {
  try {
    const { id } = req.params;
    const customers = await crmIntegrationsService.getCustomersByAuctionParticipation(id);
    res.json(customers);
  } catch (error) {
    logger.error('Error in getAuctionParticipants:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    });
  }
};

const getFlashDealCustomers = async (req, res) => {
  try {
    const { id } = req.params;
    const customers = await crmIntegrationsService.getCustomersByFlashDeal(id);
    res.json(customers);
  } catch (error) {
    logger.error('Error in getFlashDealCustomers:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    });
  }
};

const createAuctionSegment = async (req, res) => {
  try {
    const { id } = req.params;
    const { segment_name } = req.body;

    if (!segment_name) {
      return res.status(400).json({
        error: 'Bad request',
        message: 'segment_name is required',
      });
    }

    const segment = await crmIntegrationsService.createSegmentFromAuction(id, segment_name);
    res.status(201).json(segment);
  } catch (error) {
    logger.error('Error in createAuctionSegment:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    });
  }
};

const createFlashDealSegment = async (req, res) => {
  try {
    const { id } = req.params;
    const { segment_name } = req.body;

    if (!segment_name) {
      return res.status(400).json({
        error: 'Bad request',
        message: 'segment_name is required',
      });
    }

    const segment = await crmIntegrationsService.createSegmentFromFlashDeal(id, segment_name);
    res.status(201).json(segment);
  } catch (error) {
    logger.error('Error in createFlashDealSegment:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    });
  }
};

const getAuctionAnalytics = async (req, res) => {
  try {
    const period = {
      start_date: req.query.start_date || new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString(),
      end_date: req.query.end_date || new Date().toISOString(),
    };

    const analytics = await crmIntegrationsService.getAuctionAnalytics(period);
    res.json(analytics);
  } catch (error) {
    logger.error('Error in getAuctionAnalytics:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    });
  }
};

const getFlashDealAnalytics = async (req, res) => {
  try {
    const period = {
      start_date: req.query.start_date || new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString(),
      end_date: req.query.end_date || new Date().toISOString(),
    };

    const analytics = await crmIntegrationsService.getFlashDealAnalytics(period);
    res.json(analytics);
  } catch (error) {
    logger.error('Error in getFlashDealAnalytics:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    });
  }
};

const getCustomerHistory = async (req, res) => {
  try {
    const { id } = req.params;

    const [auctionHistory, flashDealHistory] = await Promise.all([
      crmIntegrationsService.getCustomerAuctionHistory(id),
      crmIntegrationsService.getCustomerFlashDealHistory(id),
    ]);

    res.json({
      customer_id: id,
      auction_history: auctionHistory,
      flash_deal_history: flashDealHistory,
    });
  } catch (error) {
    logger.error('Error in getCustomerHistory:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    });
  }
};

module.exports = {
  getAuctionParticipants,
  getFlashDealCustomers,
  createAuctionSegment,
  createFlashDealSegment,
  getAuctionAnalytics,
  getFlashDealAnalytics,
  getCustomerHistory,
};
