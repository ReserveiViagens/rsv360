const { pool } = require('../../../../database/db');
const logger = require('../../../utils/logger');
const BookingAdapter = require('./adapters/booking');
const ExpediaAdapter = require('./adapters/expedia');

/**
 * Service para gerenciar integrações OTA
 */
class OTAService {
  /**
   * Criar adapter baseado no nome da OTA
   */
  createAdapter(otaName, config) {
    switch (otaName.toLowerCase()) {
      case 'booking':
      case 'booking.com':
        return new BookingAdapter(config);
      case 'expedia':
        return new ExpediaAdapter(config);
      default:
        throw new Error(`Unsupported OTA: ${otaName}`);
    }
  }

  /**
   * Método privado (mantido para compatibilidade interna)
   */
  _createAdapter(otaName, config) {
    return this.createAdapter(otaName, config);
  }

  /**
   * Listar conexões OTA
   */
  async listConnections(filters = {}) {
    try {
      // Verificar se a tabela existe
      const tableCheck = await pool.query(`
        SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'ota_connections')
      `);
      if (!tableCheck.rows[0]?.exists) {
        return [];
      }

      const { property_id, accommodation_id, status } = filters;

      let query = `
        SELECT 
          oc.*,
          p.name as property_name,
          acc.name as accommodation_name
        FROM ota_connections oc
        LEFT JOIN properties p ON oc.property_id = p.id
        LEFT JOIN accommodations acc ON oc.accommodation_id = acc.id
        WHERE 1=1
      `;
      const params = [];
      let paramCount = 0;

      if (property_id) {
        paramCount++;
        query += ` AND oc.property_id = $${paramCount}`;
        params.push(property_id);
      }

      if (accommodation_id) {
        paramCount++;
        query += ` AND oc.accommodation_id = $${paramCount}`;
        params.push(accommodation_id);
      }

      if (status) {
        paramCount++;
        query += ` AND oc.status = $${paramCount}`;
        params.push(status);
      }

      query += ` ORDER BY oc.created_at DESC`;

      const result = await pool.query(query, params);
      return result.rows;
    } catch (error) {
      logger.error('Error listing OTA connections:', error);
      throw error;
    }
  }

  /**
   * Buscar conexão OTA por ID
   */
  async findConnectionById(id) {
    try {
      const query = `
        SELECT 
          oc.*,
          p.name as property_name,
          acc.name as accommodation_name
        FROM ota_connections oc
        LEFT JOIN properties p ON oc.property_id = p.id
        LEFT JOIN accommodations acc ON oc.accommodation_id = acc.id
        WHERE oc.id = $1
      `;

      const result = await pool.query(query, [id]);
      return result.rows[0] || null;
    } catch (error) {
      logger.error(`Error finding OTA connection ${id}:`, error);
      throw error;
    }
  }

  /**
   * Criar conexão OTA
   */
  async createConnection(connectionData) {
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
        created_by,
      } = connectionData;

      // Validar OTA suportada
      const supportedOTAs = ['booking', 'booking.com', 'expedia'];
      if (!supportedOTAs.includes(ota_name.toLowerCase())) {
        throw new Error(`Unsupported OTA: ${ota_name}. Supported: ${supportedOTAs.join(', ')}`);
      }

      // Testar conexão apenas quando property_id e credenciais reais estão configurados
      const skipTest = !property_id || api_key === 'demo' || api_key === 'dev' || api_secret === 'demo';
      let initialStatus = 'active';

      if (!skipTest) {
        const adapter = this._createAdapter(ota_name, {
          otaName: ota_name,
          apiKey: api_key,
          apiSecret: api_secret,
          propertyId: property_id,
          accommodationId: accommodation_id,
        });
        const isConnected = await adapter.testConnection();
        if (!isConnected) {
          initialStatus = 'inactive'; // Criar como inativo para configurar depois
        }
      } else if (!property_id) {
        initialStatus = 'inactive'; // Sem property_id = configuração inicial
      }

      const query = `
        INSERT INTO ota_connections (
          ota_name, api_key, api_secret, property_id, accommodation_id,
          status, sync_frequency, auto_sync, sync_availability,
          sync_reservations, sync_pricing, created_by, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), NOW())
        RETURNING *
      `;

      const values = [
        ota_name.toLowerCase(),
        api_key,
        api_secret,
        property_id || null,
        accommodation_id || null,
        initialStatus,
        sync_frequency || 15,
        auto_sync !== undefined ? auto_sync : true,
        sync_availability !== undefined ? sync_availability : true,
        sync_reservations !== undefined ? sync_reservations : true,
        sync_pricing !== undefined ? sync_pricing : false,
        created_by,
      ];

      const result = await pool.query(query, values);
      const connection = result.rows[0];

      logger.info(`✅ OTA connection created: ${connection.id} for ${ota_name}`);
      return connection;
    } catch (error) {
      logger.error('Error creating OTA connection:', error);
      throw error;
    }
  }

  /**
   * Atualizar conexão OTA
   */
  async updateConnection(id, connectionData) {
    try {
      const connection = await this.findConnectionById(id);
      if (!connection) {
        throw new Error('OTA connection not found');
      }

      const fields = [];
      const values = [];
      let paramCount = 0;

      Object.keys(connectionData).forEach((key) => {
        if (connectionData[key] !== undefined && key !== 'api_key' && key !== 'api_secret') {
          paramCount++;
          fields.push(`${key} = $${paramCount}`);
          values.push(connectionData[key]);
        }
      });

      // Se api_key ou api_secret foram fornecidos, testar conexão novamente
      if (connectionData.api_key || connectionData.api_secret) {
        const adapter = this._createAdapter(connection.ota_name, {
          otaName: connection.ota_name,
          apiKey: connectionData.api_key || connection.api_key,
          apiSecret: connectionData.api_secret || connection.api_secret,
          propertyId: connection.property_id,
          accommodationId: connection.accommodation_id,
        });

        const isConnected = await adapter.testConnection();
        if (!isConnected) {
          throw new Error('Failed to connect to OTA with new credentials.');
        }

        if (connectionData.api_key) {
          paramCount++;
          fields.push(`api_key = $${paramCount}`);
          values.push(connectionData.api_key);
        }

        if (connectionData.api_secret) {
          paramCount++;
          fields.push(`api_secret = $${paramCount}`);
          values.push(connectionData.api_secret);
        }
      }

      if (fields.length === 0) {
        return connection;
      }

      paramCount++;
      fields.push(`updated_at = NOW()`);
      values.push(id);

      const query = `
        UPDATE ota_connections 
        SET ${fields.join(', ')}
        WHERE id = $${paramCount}
        RETURNING *
      `;

      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      logger.error(`Error updating OTA connection ${id}:`, error);
      throw error;
    }
  }

  /**
   * Deletar conexão OTA
   */
  async deleteConnection(id) {
    try {
      const connection = await this.findConnectionById(id);
      if (!connection) {
        throw new Error('OTA connection not found');
      }

      await pool.query('DELETE FROM ota_connections WHERE id = $1', [id]);
      return true;
    } catch (error) {
      logger.error(`Error deleting OTA connection ${id}:`, error);
      throw error;
    }
  }

  /**
   * Sincronizar disponibilidade
   */
  async syncAvailability(connectionId) {
    try {
      const connection = await this.findConnectionById(connectionId);
      if (!connection) {
        throw new Error('OTA connection not found');
      }

      if (connection.status !== 'active') {
        throw new Error(`OTA connection is not active. Current status: ${connection.status}`);
      }

      // Criar adapter
      const adapter = this.createAdapter(connection.ota_name, {
        otaName: connection.ota_name,
        apiKey: connection.api_key,
        apiSecret: connection.api_secret,
        propertyId: connection.property_id,
        accommodationId: connection.accommodation_id,
      });

      // Buscar disponibilidade dos próximos 90 dias
      const today = new Date();
      const endDate = new Date(today);
      endDate.setDate(endDate.getDate() + 90);

      const availability = await adapter.getAvailability(
        today.toISOString().split('T')[0],
        endDate.toISOString().split('T')[0]
      );

      // Atualizar disponibilidade local
      // TODO: Implementar atualização em accommodation_availability

      // Registrar log de sincronização
      await this._logSync(connectionId, 'availability', 'success', {
        records_synced: availability.length || 0,
      });

      // Atualizar last_sync_at
      await pool.query(
        'UPDATE ota_connections SET last_sync_at = NOW(), updated_at = NOW() WHERE id = $1',
        [connectionId]
      );

      return {
        success: true,
        recordsSynced: availability.length || 0,
      };
    } catch (error) {
      logger.error(`Error syncing availability for connection ${connectionId}:`, error);
      
      // Registrar log de erro
      await this._logSync(connectionId, 'availability', 'error', {
        errors: error.message,
      });

      throw error;
    }
  }

  /**
   * Sincronizar reservas
   */
  async syncReservations(connectionId) {
    try {
      const connection = await this.findConnectionById(connectionId);
      if (!connection) {
        throw new Error('OTA connection not found');
      }

      if (connection.status !== 'active') {
        throw new Error(`OTA connection is not active. Current status: ${connection.status}`);
      }

      // Criar adapter
      const adapter = this.createAdapter(connection.ota_name, {
        otaName: connection.ota_name,
        apiKey: connection.api_key,
        apiSecret: connection.api_secret,
        propertyId: connection.property_id,
        accommodationId: connection.accommodation_id,
      });

      // Buscar reservas dos últimos 30 dias e próximos 90 dias
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 90);

      const reservations = await adapter.getReservations(
        startDate.toISOString().split('T')[0],
        endDate.toISOString().split('T')[0]
      );

      // Processar cada reserva
      let syncedCount = 0;
      let errorCount = 0;
      const errors = [];

      for (const reservation of reservations) {
        try {
          // Verificar se já existe
          const existingQuery = `
            SELECT * FROM ota_reservations 
            WHERE ota_connection_id = $1 AND ota_reservation_id = $2
          `;
          const existingResult = await pool.query(existingQuery, [
            connectionId,
            reservation.otaReservationId,
          ]);

          if (existingResult.rows.length > 0) {
            // Atualizar existente
            await pool.query(
              `UPDATE ota_reservations 
               SET check_in = $1, check_out = $2, guests = $3, total_amount = $4,
                   status = $5, guest_name = $6, guest_email = $7, guest_phone = $8,
                   synced_at = NOW(), updated_at = NOW()
               WHERE id = $9`,
              [
                reservation.checkIn,
                reservation.checkOut,
                reservation.guests,
                reservation.totalAmount,
                reservation.status,
                reservation.guestName,
                reservation.guestEmail,
                reservation.guestPhone,
                existingResult.rows[0].id,
              ]
            );
          } else {
            // Criar nova
            await pool.query(
              `INSERT INTO ota_reservations (
                ota_connection_id, ota_reservation_id, check_in, check_out,
                guests, total_amount, currency, status, guest_name, guest_email,
                guest_phone, synced_at, created_at, updated_at
              ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW(), NOW())`,
              [
                connectionId,
                reservation.otaReservationId,
                reservation.checkIn,
                reservation.checkOut,
                reservation.guests,
                reservation.totalAmount,
                reservation.currency || 'BRL',
                reservation.status,
                reservation.guestName,
                reservation.guestEmail,
                reservation.guestPhone,
              ]
            );
          }

          syncedCount++;
        } catch (error) {
          errorCount++;
          errors.push(`Reservation ${reservation.otaReservationId}: ${error.message}`);
        }
      }

      // Registrar log de sincronização
      await this._logSync(connectionId, 'reservations', errorCount > 0 ? 'partial' : 'success', {
        records_synced: syncedCount,
        records_failed: errorCount,
        errors: errors.length > 0 ? errors.join('; ') : null,
      });

      // Atualizar last_sync_at
      await pool.query(
        'UPDATE ota_connections SET last_sync_at = NOW(), updated_at = NOW() WHERE id = $1',
        [connectionId]
      );

      return {
        success: true,
        recordsSynced: syncedCount,
        recordsFailed: errorCount,
        errors: errors.length > 0 ? errors : null,
      };
    } catch (error) {
      logger.error(`Error syncing reservations for connection ${connectionId}:`, error);
      
      // Registrar log de erro
      await this._logSync(connectionId, 'reservations', 'error', {
        errors: error.message,
      });

      throw error;
    }
  }

  /**
   * Sincronizar tudo (disponibilidade + reservas)
   */
  async syncAll(connectionId) {
    try {
      const availabilityResult = await this.syncAvailability(connectionId);
      const reservationsResult = await this.syncReservations(connectionId);

      return {
        availability: availabilityResult,
        reservations: reservationsResult,
      };
    } catch (error) {
      logger.error(`Error syncing all for connection ${connectionId}:`, error);
      throw error;
    }
  }

  /**
   * Obter status de sincronização
   */
  async getSyncStatus(connectionId) {
    try {
      const connection = await this.findConnectionById(connectionId);
      if (!connection) {
        throw new Error('OTA connection not found');
      }

      // Buscar último log de sincronização
      const logQuery = `
        SELECT * FROM ota_sync_logs
        WHERE ota_connection_id = $1
        ORDER BY started_at DESC
        LIMIT 1
      `;
      const logResult = await pool.query(logQuery, [connectionId]);
      const lastLog = logResult.rows[0] || null;

      return {
        connection: {
          id: connection.id,
          ota_name: connection.ota_name,
          status: connection.status,
          last_sync_at: connection.last_sync_at,
          auto_sync: connection.auto_sync,
          sync_frequency: connection.sync_frequency,
        },
        lastSync: lastLog ? {
          type: lastLog.sync_type,
          status: lastLog.status,
          recordsSynced: lastLog.records_synced,
          recordsFailed: lastLog.records_failed,
          startedAt: lastLog.started_at,
          finishedAt: lastLog.finished_at,
          durationSeconds: lastLog.duration_seconds,
          errors: lastLog.errors,
        } : null,
      };
    } catch (error) {
      logger.error(`Error getting sync status for connection ${connectionId}:`, error);
      throw error;
    }
  }

  /**
   * Listar reservas sincronizadas
   */
  async listReservations(connectionId, filters = {}) {
    try {
      const { page = 1, limit = 50, status } = filters;

      let query = `
        SELECT * FROM ota_reservations
        WHERE ota_connection_id = $1
      `;
      const params = [connectionId];
      let paramCount = 1;

      if (status) {
        paramCount++;
        query += ` AND status = $${paramCount}`;
        params.push(status);
      }

      query += ` ORDER BY synced_at DESC`;

      // Contar total
      const countQuery = query.replace(/SELECT.*FROM/, 'SELECT COUNT(*) as total FROM').split('ORDER BY')[0];
      const countResult = await pool.query(countQuery, params);
      const totalCount = parseInt(countResult.rows[0]?.total || 0);

      // Adicionar paginação
      paramCount++;
      query += ` LIMIT $${paramCount}`;
      params.push(limit);
      paramCount++;
      query += ` OFFSET $${paramCount}`;
      params.push((page - 1) * limit);

      const result = await pool.query(query, params);
      const reservations = result.rows;

      return {
        data: reservations,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: totalCount,
          totalPages: Math.ceil(totalCount / limit),
        },
      };
    } catch (error) {
      logger.error(`Error listing reservations for connection ${connectionId}:`, error);
      throw error;
    }
  }

  /**
   * Listar logs de sincronização
   */
  async listSyncLogs(connectionId, filters = {}) {
    try {
      const { page = 1, limit = 50, sync_type, status } = filters;

      let query = `
        SELECT * FROM ota_sync_logs
        WHERE ota_connection_id = $1
      `;
      const params = [connectionId];
      let paramCount = 1;

      if (sync_type) {
        paramCount++;
        query += ` AND sync_type = $${paramCount}`;
        params.push(sync_type);
      }

      if (status) {
        paramCount++;
        query += ` AND status = $${paramCount}`;
        params.push(status);
      }

      query += ` ORDER BY started_at DESC`;

      // Contar total
      const countQuery = query.replace(/SELECT.*FROM/, 'SELECT COUNT(*) as total FROM').split('ORDER BY')[0];
      const countResult = await pool.query(countQuery, params);
      const totalCount = parseInt(countResult.rows[0]?.total || 0);

      // Adicionar paginação
      paramCount++;
      query += ` LIMIT $${paramCount}`;
      params.push(limit);
      paramCount++;
      query += ` OFFSET $${paramCount}`;
      params.push((page - 1) * limit);

      const result = await pool.query(query, params);
      const logs = result.rows;

      return {
        data: logs,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: totalCount,
          totalPages: Math.ceil(totalCount / limit),
        },
      };
    } catch (error) {
      logger.error(`Error listing sync logs for connection ${connectionId}:`, error);
      throw error;
    }
  }

  /**
   * Registrar log de sincronização
   */
  async _logSync(connectionId, syncType, status, data = {}) {
    try {
      const startedAt = data.startedAt || new Date();
      const finishedAt = data.finishedAt || new Date();
      const durationSeconds = data.durationSeconds || Math.floor((finishedAt - startedAt) / 1000);

      const query = `
        INSERT INTO ota_sync_logs (
          ota_connection_id, sync_type, status, records_synced, records_failed,
          errors, warnings, started_at, finished_at, duration_seconds, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
        RETURNING *
      `;

      const values = [
        connectionId,
        syncType,
        status,
        data.records_synced || 0,
        data.records_failed || 0,
        data.errors || null,
        data.warnings || null,
        startedAt,
        finishedAt,
        durationSeconds,
      ];

      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      logger.error('Error logging sync:', error);
      // Não lançar erro para não interromper o processo principal
    }
  }
}

module.exports = new OTAService();
