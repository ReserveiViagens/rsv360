const crypto = require('crypto');
const { db } = require('../../config/database');
const logger = require('../../utils/logger');

/**
 * Verification Service
 * Implementa Proof of Transparency com hash SHA-256
 */

/**
 * Gerar hash SHA-256 de um objeto
 * @param {Object} data - Dados para hash
 * @returns {string} Hash hexadecimal
 */
function generateHash(data) {
  try {
    const dataString = JSON.stringify(data, Object.keys(data).sort());
    return crypto.createHash('sha256').update(dataString).digest('hex');
  } catch (error) {
    logger.error('Erro ao gerar hash:', error);
    throw new Error('Erro ao gerar hash de verificação');
  }
}

/**
 * Verificar hash de uma entidade
 * @param {string} entityType - Tipo da entidade (bid, ask, match)
 * @param {string} entityId - ID da entidade
 * @param {string} hash - Hash a verificar
 * @returns {Promise<boolean>} True se válido
 */
async function verifyHash(entityType, entityId, hash) {
  try {
    // Buscar log de verificação
    const log = await db('route_verification_logs')
      .where({
        entity_type: entityType,
        entity_id: entityId,
        verification_hash: hash,
      })
      .first();

    if (!log) {
      return false;
    }

    // Recalcular hash dos dados do snapshot
    const recalculatedHash = generateHash(log.data_snapshot);

    return recalculatedHash === hash;
  } catch (error) {
    logger.error('Erro ao verificar hash:', error);
    return false;
  }
}

/**
 * Criar log de verificação
 * @param {string} entityType - Tipo da entidade
 * @param {string} entityId - ID da entidade
 * @param {Object} data - Dados para snapshot
 * @returns {Promise<Object>} Log criado
 */
async function createVerificationLog(entityType, entityId, data) {
  try {
    // Buscar hash anterior (para cadeia de verificação)
    const previousLog = await db('route_verification_logs')
      .where({
        entity_type: entityType,
        entity_id: entityId,
      })
      .orderBy('created_at', 'desc')
      .first();

    const previousHash = previousLog?.verification_hash || null;

    // Gerar hash dos dados
    const dataWithPrevious = {
      ...data,
      previous_hash: previousHash,
    };
    const verificationHash = generateHash(dataWithPrevious);

    // Criar log
    const [log] = await db('route_verification_logs')
      .insert({
        entity_type: entityType,
        entity_id: entityId,
        verification_hash: verificationHash,
        previous_hash: previousHash,
        data_snapshot: JSON.stringify(data),
        created_at: new Date(),
      })
      .returning('*');

    logger.info(`Log de verificação criado: ${entityType} ${entityId}`);

    return log;
  } catch (error) {
    logger.error('Erro ao criar log de verificação:', error);
    throw new Error('Erro ao criar log de verificação');
  }
}

/**
 * Obter cadeia de verificação de uma entidade
 * @param {string} entityType - Tipo da entidade
 * @param {string} entityId - ID da entidade
 * @returns {Promise<Array>} Cadeia de logs
 */
async function getVerificationChain(entityType, entityId) {
  try {
    const logs = await db('route_verification_logs')
      .where({
        entity_type: entityType,
        entity_id: entityId,
      })
      .orderBy('created_at', 'asc');

    return logs;
  } catch (error) {
    logger.error('Erro ao buscar cadeia de verificação:', error);
    throw new Error('Erro ao buscar cadeia de verificação');
  }
}

/**
 * Verificar integridade completa de uma entidade
 * @param {string} entityType - Tipo da entidade
 * @param {string} entityId - ID da entidade
 * @returns {Promise<Object>} Resultado da verificação
 */
async function verifyEntityIntegrity(entityType, entityId) {
  try {
    const chain = await getVerificationChain(entityType, entityId);

    if (chain.length === 0) {
      return {
        valid: false,
        reason: 'Nenhum log de verificação encontrado',
      };
    }

    // Verificar cadeia (cada hash deve apontar para o anterior)
    for (let i = 1; i < chain.length; i++) {
      const current = chain[i];
      const previous = chain[i - 1];

      if (current.previous_hash !== previous.verification_hash) {
        return {
          valid: false,
          reason: 'Cadeia de verificação quebrada',
          broken_at: i,
        };
      }
    }

    return {
      valid: true,
      chain_length: chain.length,
      first_hash: chain[0].verification_hash,
      last_hash: chain[chain.length - 1].verification_hash,
    };
  } catch (error) {
    logger.error('Erro ao verificar integridade:', error);
    return {
      valid: false,
      reason: 'Erro ao verificar integridade',
    };
  }
}

module.exports = {
  generateHash,
  verifyHash,
  createVerificationLog,
  getVerificationChain,
  verifyEntityIntegrity,
};
