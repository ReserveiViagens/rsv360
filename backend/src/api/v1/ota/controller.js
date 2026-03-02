const otaService = require('./service');
const logger = require('../../../utils/logger');

/**
 * Controller para gerenciar integrações OTA
 */

/**
 * Listar conexões OTA
 */
const listConnections = async (req, res) => {
  try {
    const filters = {
      property_id: req.query.property_id,
      accommodation_id: req.query.accommodation_id,
      status: req.query.status,
    };

    const connections = await otaService.listConnections(filters);
    res.json({ data: connections });
  } catch (error) {
    logger.error('Error in list OTA connections:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    });
  }
};

/**
 * Obter conexão OTA por ID
 */
const getConnectionById = async (req, res) => {
  try {
    const { id } = req.params;
    const connection = await otaService.findConnectionById(id);

    if (!connection) {
      return res.status(404).json({
        error: 'Not found',
        message: 'OTA connection not found',
      });
    }

    // Não retornar api_key e api_secret por segurança
    delete connection.api_key;
    delete connection.api_secret;

    res.json(connection);
  } catch (error) {
    logger.error('Error in get OTA connection by id:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    });
  }
};

/**
 * Criar conexão OTA
 */
const createConnection = async (req, res) => {
  try {
    const {
      ota_name,
      api_key,
      api_secret,
      property_id,
      accommodation_id,
      sync_frequency,
      auto_sync,
      sync_availability,
      sync_reservations,
      sync_pricing,
    } = req.body;

    // Validação básica (property_id opcional para configuração inicial)
    if (!ota_name || !api_key || !api_secret) {
      return res.status(400).json({
        error: 'Bad request',
        message: 'Missing required fields: ota_name, api_key, api_secret',
      });
    }

    const connectionData = {
      ota_name,
      api_key,
      api_secret,
      property_id,
      accommodation_id,
      sync_frequency,
      auto_sync,
      sync_availability,
      sync_reservations,
      sync_pricing,
      created_by: req.user?.id || req.user?.userId,
    };

    const connection = await otaService.createConnection(connectionData);

    // Não retornar api_key e api_secret por segurança
    delete connection.api_key;
    delete connection.api_secret;

    res.status(201).json(connection);
  } catch (error) {
    logger.error('Error in create OTA connection:', error);
    res.status(400).json({
      error: 'Bad request',
      message: error.message,
    });
  }
};

/**
 * Atualizar conexão OTA
 */
const updateConnection = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const connection = await otaService.updateConnection(id, updateData);

    // Não retornar api_key e api_secret por segurança
    delete connection.api_key;
    delete connection.api_secret;

    res.json(connection);
  } catch (error) {
    logger.error('Error in update OTA connection:', error);
    res.status(400).json({
      error: 'Bad request',
      message: error.message,
    });
  }
};

/**
 * Deletar conexão OTA
 */
const deleteConnection = async (req, res) => {
  try {
    const { id } = req.params;
    await otaService.deleteConnection(id);

    res.status(204).send();
  } catch (error) {
    logger.error('Error in delete OTA connection:', error);
    res.status(400).json({
      error: 'Bad request',
      message: error.message,
    });
  }
};

/**
 * Sincronizar disponibilidade
 */
const syncAvailability = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await otaService.syncAvailability(id);

    res.json(result);
  } catch (error) {
    logger.error('Error in sync availability:', error);
    res.status(400).json({
      error: 'Bad request',
      message: error.message,
    });
  }
};

/**
 * Sincronizar reservas
 */
const syncReservations = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await otaService.syncReservations(id);

    res.json(result);
  } catch (error) {
    logger.error('Error in sync reservations:', error);
    res.status(400).json({
      error: 'Bad request',
      message: error.message,
    });
  }
};

/**
 * Sincronizar tudo
 */
const syncAll = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await otaService.syncAll(id);

    res.json(result);
  } catch (error) {
    logger.error('Error in sync all:', error);
    res.status(400).json({
      error: 'Bad request',
      message: error.message,
    });
  }
};

/**
 * Obter status de sincronização
 */
const getSyncStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const status = await otaService.getSyncStatus(id);

    res.json(status);
  } catch (error) {
    logger.error('Error in get sync status:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    });
  }
};

/**
 * Listar reservas sincronizadas
 */
const listReservations = async (req, res) => {
  try {
    const { id } = req.params;
    const filters = {
      page: req.query.page,
      limit: req.query.limit,
      status: req.query.status,
    };

    const result = await otaService.listReservations(id, filters);
    res.json(result);
  } catch (error) {
    logger.error('Error in list reservations:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    });
  }
};

/**
 * Listar logs de sincronização
 */
const listSyncLogs = async (req, res) => {
  try {
    const { id } = req.params;
    const filters = {
      page: req.query.page,
      limit: req.query.limit,
      sync_type: req.query.sync_type,
      status: req.query.status,
    };

    const result = await otaService.listSyncLogs(id, filters);
    res.json(result);
  } catch (error) {
    logger.error('Error in list sync logs:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    });
  }
};

module.exports = {
  listConnections,
  getConnectionById,
  createConnection,
  updateConnection,
  deleteConnection,
  syncAvailability,
  syncReservations,
  syncAll,
  getSyncStatus,
  listReservations,
  listSyncLogs,
};
