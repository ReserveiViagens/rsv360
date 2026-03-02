const twilio = require('twilio');
const logger = require('../utils/logger');

/**
 * Integração Twilio Voice
 */
class TwilioVoiceIntegration {
  constructor() {
    this.client = null;
    this.phoneNumber = process.env.TWILIO_PHONE_NUMBER;

    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
      this.client = twilio(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_AUTH_TOKEN
      );
    }
  }

  /**
   * Fazer chamada outbound
   */
  async makeOutboundCall(to, from, twimlUrl) {
    try {
      if (!this.client) {
        throw new Error('Twilio client not configured');
      }

      const call = await this.client.calls.create({
        to,
        from: from || this.phoneNumber,
        url: twimlUrl,
        method: 'POST',
      });

      return call;
    } catch (error) {
      logger.error('Error making outbound call:', error);
      throw error;
    }
  }

  /**
   * Gerar TwiML response
   */
  generateTwimlResponse(message, gatherOptions = {}) {
    const twiml = new twilio.twiml.VoiceResponse();

    if (gatherOptions.enabled) {
      const gather = twiml.gather({
        input: gatherOptions.input || 'speech',
        language: gatherOptions.language || 'pt-BR',
        timeout: gatherOptions.timeout || 5,
        numDigits: gatherOptions.numDigits,
        action: gatherOptions.action,
        method: 'POST',
      });
      gather.say({ language: 'pt-BR' }, message);
    } else {
      twiml.say({ language: 'pt-BR' }, message);
    }

    return twiml.toString();
  }

  /**
   * Validar assinatura de webhook Twilio
   */
  validateTwilioSignature(req) {
    try {
      if (!process.env.TWILIO_AUTH_TOKEN) {
        logger.warn('Twilio auth token not configured, skipping signature validation');
        return true;
      }

      const signature = req.headers['x-twilio-signature'];
      const url = req.protocol + '://' + req.get('host') + req.originalUrl;
      const params = req.body;

      return twilio.validateRequest(
        process.env.TWILIO_AUTH_TOKEN,
        signature,
        url,
        params
      );
    } catch (error) {
      logger.error('Error validating Twilio signature:', error);
      return false;
    }
  }
}

module.exports = new TwilioVoiceIntegration();
