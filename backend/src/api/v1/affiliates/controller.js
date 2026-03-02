const affiliatesService = require('./service');
const logger = require('../../../utils/logger');

/**
 * Controller para gerenciar Afiliados
 */

const listAffiliates = async (req, res) => {
  try {
    const filters = {
      page: req.query.page,
      limit: req.query.limit,
      status: req.query.status,
      search: req.query.search,
    };

    const result = await affiliatesService.listAffiliates(filters);
    res.json(result);
  } catch (error) {
    logger.error('Error in listAffiliates:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    });
  }
};

const getAffiliate = async (req, res) => {
  try {
    const { id } = req.params;
    const affiliate = await affiliatesService.findAffiliateById(id);

    if (!affiliate) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Affiliate not found',
      });
    }

    res.json(affiliate);
  } catch (error) {
    logger.error('Error in getAffiliate:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    });
  }
};

const getAffiliateByCode = async (req, res) => {
  try {
    const { code } = req.params;
    const affiliate = await affiliatesService.getAffiliateByCode(code);

    if (!affiliate) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Affiliate not found',
      });
    }

    res.json(affiliate);
  } catch (error) {
    logger.error('Error in getAffiliateByCode:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    });
  }
};

const createAffiliate = async (req, res) => {
  try {
    const affiliate = await affiliatesService.createAffiliate(req.body);
    res.status(201).json(affiliate);
  } catch (error) {
    logger.error('Error in createAffiliate:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    });
  }
};

const updateAffiliate = async (req, res) => {
  try {
    const { id } = req.params;
    const affiliate = await affiliatesService.updateAffiliate(id, req.body);

    if (!affiliate) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Affiliate not found',
      });
    }

    res.json(affiliate);
  } catch (error) {
    logger.error('Error in updateAffiliate:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    });
  }
};

const createReferral = async (req, res) => {
  try {
    const { id } = req.params;
    const { enterprise_id } = req.body;

    if (!enterprise_id) {
      return res.status(400).json({
        error: 'Bad request',
        message: 'enterprise_id is required',
      });
    }

    const referral = await affiliatesService.createReferral(id, enterprise_id);
    res.status(201).json(referral);
  } catch (error) {
    logger.error('Error in createReferral:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    });
  }
};

const listReferrals = async (req, res) => {
  try {
    const { id } = req.params;
    const filters = {
      page: req.query.page,
      limit: req.query.limit,
      status: req.query.status,
    };

    const referrals = await affiliatesService.listReferrals(id, filters);
    res.json(referrals);
  } catch (error) {
    logger.error('Error in listReferrals:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    });
  }
};

const listCommissions = async (req, res) => {
  try {
    const { id } = req.params;
    const filters = {
      page: req.query.page,
      limit: req.query.limit,
      status: req.query.status,
    };

    const commissions = await affiliatesService.listCommissions(id, filters);
    res.json(commissions);
  } catch (error) {
    logger.error('Error in listCommissions:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    });
  }
};

const createPayout = async (req, res) => {
  try {
    const { id } = req.params;
    const { commission_ids } = req.body;

    if (!commission_ids || !Array.isArray(commission_ids) || commission_ids.length === 0) {
      return res.status(400).json({
        error: 'Bad request',
        message: 'commission_ids array is required',
      });
    }

    const payout = await affiliatesService.processPayout(id, commission_ids);
    res.status(201).json(payout);
  } catch (error) {
    logger.error('Error in createPayout:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    });
  }
};

const listPayouts = async (req, res) => {
  try {
    const { id } = req.params;
    const filters = {
      page: req.query.page,
      limit: req.query.limit,
      status: req.query.status,
    };

    const payouts = await affiliatesService.listPayouts(id, filters);
    res.json(payouts);
  } catch (error) {
    logger.error('Error in listPayouts:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    });
  }
};

const getDashboard = async (req, res) => {
  try {
    const { id } = req.params;
    const period = {
      start_date: req.query.start_date || new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString(),
      end_date: req.query.end_date || new Date().toISOString(),
    };

    const dashboard = await affiliatesService.getAffiliateDashboard(id, period);
    res.json(dashboard);
  } catch (error) {
    logger.error('Error in getDashboard:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    });
  }
};

module.exports = {
  listAffiliates,
  getAffiliate,
  getAffiliateByCode,
  createAffiliate,
  updateAffiliate,
  createReferral,
  listReferrals,
  listCommissions,
  createPayout,
  listPayouts,
  getDashboard,
};
