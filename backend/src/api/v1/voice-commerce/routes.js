const express = require('express');
const router = express.Router();
const voiceCommerceController = require('./controller');
const { authenticateToken } = require('../../../middleware/auth');

/**
 * Webhooks do Twilio (sem autenticação, mas com validação de assinatura)
 */

// Webhook para chamadas recebidas
router.post('/webhooks/inbound', voiceCommerceController.handleInboundCall);

// Webhook para status de chamada
router.post('/webhooks/status', voiceCommerceController.handleCallStatus);

// Webhook para gather (entrada de voz)
router.post('/webhooks/gather', voiceCommerceController.handleGather);

/**
 * Rotas autenticadas
 */

// Sessões
router.post('/sessions', authenticateToken, voiceCommerceController.createSession);
router.get('/sessions/:id', authenticateToken, voiceCommerceController.getSession);

// Chamadas
router.get('/calls/:id', authenticateToken, voiceCommerceController.getCall);
router.get('/calls/:id/interactions', authenticateToken, voiceCommerceController.getCallInteractions);

module.exports = router;
