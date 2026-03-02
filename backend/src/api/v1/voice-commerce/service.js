const { pool } = require('../../../../database/db');
const logger = require('../../../utils/logger');

/**
 * Service para gerenciar Voice Commerce
 */
class VoiceCommerceService {
  /**
   * Criar sessão de voice commerce
   */
  async createSession(phoneNumber, customerId) {
    try {
      // Gerar session_id único
      const sessionId = `vc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const query = `
        INSERT INTO voice_commerce_sessions (
          session_id, phone_number, customer_id, status
        )
        VALUES ($1, $2, $3, 'active')
        RETURNING *
      `;

      const result = await pool.query(query, [sessionId, phoneNumber, customerId]);
      return result.rows[0];
    } catch (error) {
      logger.error('Error creating voice commerce session:', error);
      throw error;
    }
  }

  /**
   * Processar chamada recebida
   */
  async processCall(callSid, audioUrl, sessionId, fromNumber, toNumber) {
    try {
      const query = `
        INSERT INTO voice_commerce_calls (
          session_id, call_sid, direction, from_number, to_number, status, recording_url
        )
        VALUES ($1, $2, 'inbound', $3, $4, 'in-progress', $5)
        RETURNING *
      `;

      const result = await pool.query(query, [
        sessionId,
        callSid,
        fromNumber || 'unknown',
        toNumber || 'unknown',
        audioUrl,
      ]);
      return result.rows[0];
    } catch (error) {
      logger.error('Error processing call:', error);
      throw error;
    }
  }

  /**
   * Salvar interação da chamada
   */
  async saveInteraction(callId, turnNumber, userInput, assistantResponse) {
    try {
      // Inserir interação do usuário
      const userQuery = `
        INSERT INTO voice_commerce_interactions (
          call_id, turn_number, speaker, user_input
        )
        VALUES ($1, $2, 'user', $3)
        RETURNING *
      `;
      await pool.query(userQuery, [callId, turnNumber, userInput]);

      // Inserir resposta do assistente
      const assistantQuery = `
        INSERT INTO voice_commerce_interactions (
          call_id, turn_number, speaker, assistant_response
        )
        VALUES ($1, $2, 'assistant', $3)
        RETURNING *
      `;
      const result = await pool.query(assistantQuery, [callId, turnNumber, assistantResponse]);
      
      return result.rows[0];
    } catch (error) {
      logger.error('Error saving interaction:', error);
      throw error;
    }
  }

  /**
   * Criar reserva a partir de voz
   */
  async createBookingFromVoice(sessionId, callId, bookingData) {
    try {
      const {
        property_id,
        accommodation_id,
        check_in,
        check_out,
        guests,
        total_amount,
      } = bookingData;

      // Criar reserva
      const bookingQuery = `
        INSERT INTO bookings (
          customer_id, property_id, accommodation_id,
          check_in, check_out, guests, total_amount, status,
          source, source_reference
        )
        VALUES (
          (SELECT customer_id FROM voice_commerce_sessions WHERE id = $1),
          $2, $3, $4, $5, $6, $7, 'pending',
          'voice_commerce', $8
        )
        RETURNING *
      `;

      const bookingResult = await pool.query(bookingQuery, [
        sessionId,
        property_id,
        accommodation_id,
        check_in,
        check_out,
        guests,
        total_amount,
        callId.toString(),
      ]);

      // Atualizar chamada com referência à reserva
      const updateCallQuery = `
        UPDATE voice_commerce_calls
        SET booking_id = $1, status = 'completed'
        WHERE id = $2
      `;
      await pool.query(updateCallQuery, [bookingResult.rows[0].id, callId]);

      return bookingResult.rows[0];
    } catch (error) {
      logger.error('Error creating booking from voice:', error);
      throw error;
    }
  }

  /**
   * Buscar sessão por ID
   */
  async findSessionById(id) {
    try {
      const query = 'SELECT * FROM voice_commerce_sessions WHERE id = $1';
      const result = await pool.query(query, [id]);
      return result.rows[0] || null;
    } catch (error) {
      logger.error('Error finding session by ID:', error);
      throw error;
    }
  }

  /**
   * Buscar chamada por ID
   */
  async findCallById(id) {
    try {
      const query = 'SELECT * FROM voice_commerce_calls WHERE id = $1';
      const result = await pool.query(query, [id]);
      return result.rows[0] || null;
    } catch (error) {
      logger.error('Error finding call by ID:', error);
      throw error;
    }
  }

  /**
   * Buscar chamada por Call SID
   */
  async findCallBySid(callSid) {
    try {
      const query = 'SELECT * FROM voice_commerce_calls WHERE call_sid = $1';
      const result = await pool.query(query, [callSid]);
      return result.rows[0] || null;
    } catch (error) {
      logger.error('Error finding call by SID:', error);
      throw error;
    }
  }

  /**
   * Obter interações de uma chamada
   */
  async getCallInteractions(callId) {
    try {
      const query = `
        SELECT * FROM voice_commerce_interactions
        WHERE call_id = $1
        ORDER BY turn_number, created_at
      `;

      const result = await pool.query(query, [callId]);
      return result.rows;
    } catch (error) {
      logger.error('Error getting call interactions:', error);
      throw error;
    }
  }
}

module.exports = new VoiceCommerceService();
