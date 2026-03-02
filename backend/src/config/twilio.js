const logger = require('../utils/logger');

/**
 * Configuração Twilio
 */
const twilioConfig = {
  accountSid: process.env.TWILIO_ACCOUNT_SID,
  authToken: process.env.TWILIO_AUTH_TOKEN,
  phoneNumber: process.env.TWILIO_PHONE_NUMBER,
  webhookBaseUrl: process.env.TWILIO_WEBHOOK_BASE_URL || process.env.API_BASE_URL || 'http://localhost:5000',
};

/**
 * Validar configuração Twilio
 */
const validateTwilioConfig = () => {
  if (!twilioConfig.accountSid || !twilioConfig.authToken) {
    logger.warn('⚠️ Twilio credentials not configured. Voice Commerce features will be limited.');
    return false;
  }
  return true;
};

/**
 * Obter URL de webhook para Twilio
 */
const getWebhookUrl = (endpoint) => {
  return `${twilioConfig.webhookBaseUrl}/api/v1/voice-commerce/webhooks/${endpoint}`;
};

module.exports = {
  twilioConfig,
  validateTwilioConfig,
  getWebhookUrl,
};
