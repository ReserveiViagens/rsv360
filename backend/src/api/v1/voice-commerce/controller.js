const voiceCommerceService = require('./service');
const twilioVoice = require('../../../integrations/twilio-voice');
const openaiVoice = require('../../../integrations/openai-voice');
const logger = require('../../../utils/logger');

/**
 * Controller para Voice Commerce
 */

const createSession = async (req, res) => {
  try {
    const { phone_number, customer_id } = req.body;

    if (!phone_number) {
      return res.status(400).json({
        error: 'Bad request',
        message: 'phone_number is required',
      });
    }

    const session = await voiceCommerceService.createSession(phone_number, customer_id);
    res.status(201).json(session);
  } catch (error) {
    logger.error('Error in createSession:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    });
  }
};

const handleInboundCall = async (req, res) => {
  try {
    // Validar assinatura Twilio
    if (!twilioVoice.validateTwilioSignature(req)) {
      return res.status(403).send('Forbidden');
    }

    const callSid = req.body.CallSid;
    const from = req.body.From;
    const to = req.body.To;

    // Criar sessão temporária se necessário
    let session = await voiceCommerceService.createSession(from, null);

    // Processar chamada
    const call = await voiceCommerceService.processCall(callSid, null, session.id, from, to);

    // Gerar resposta inicial
    const message = 'Olá! Bem-vindo ao RSV360. Como posso ajudá-lo hoje?';
    const twiml = twilioVoice.generateTwimlResponse(message, {
      enabled: true,
      action: `/api/v1/voice-commerce/webhooks/gather?callSid=${callSid}`,
      input: 'speech',
    });

    res.type('text/xml');
    res.send(twiml);
  } catch (error) {
    logger.error('Error in handleInboundCall:', error);
    res.type('text/xml');
    res.send(twilioVoice.generateTwimlResponse('Desculpe, ocorreu um erro. Tente novamente mais tarde.'));
  }
};

const handleGather = async (req, res) => {
  try {
    // Validar assinatura Twilio
    if (!twilioVoice.validateTwilioSignature(req)) {
      return res.status(403).send('Forbidden');
    }

    const callSid = req.body.CallSid;
    const speechResult = req.body.SpeechResult;

    if (!speechResult) {
      const twiml = twilioVoice.generateTwimlResponse(
        'Não consegui entender. Pode repetir, por favor?',
        { enabled: true, action: `/api/v1/voice-commerce/webhooks/gather`, input: 'speech' }
      );
      res.type('text/xml');
      return res.send(twiml);
    }

    // Buscar chamada
    const call = await voiceCommerceService.findCallBySid(callSid);
    if (!call) {
      throw new Error('Call not found');
    }

    // Extrair intenção e entidades usando GPT-4o
    const { intent, entities } = await openaiVoice.extractIntentAndEntities(speechResult, {
      call_id: call.id,
    });

    // Gerar resposta usando GPT-4o
    const response = await openaiVoice.generateVoiceResponse(intent, entities, {});

    // Salvar interação
    await voiceCommerceService.saveInteraction(call.id, 1, speechResult, response);

    // Retornar resposta em TwiML
    const twiml = twilioVoice.generateTwimlResponse(response, {
      enabled: true,
      action: `/api/v1/voice-commerce/webhooks/gather?callSid=${callSid}`,
      input: 'speech',
    });

    res.type('text/xml');
    res.send(twiml);
  } catch (error) {
    logger.error('Error in handleGather:', error);
    res.type('text/xml');
    res.send(twilioVoice.generateTwimlResponse('Desculpe, ocorreu um erro. Tente novamente mais tarde.'));
  }
};

const handleCallStatus = async (req, res) => {
  try {
    // Validar assinatura Twilio
    if (!twilioVoice.validateTwilioSignature(req)) {
      return res.status(403).send('Forbidden');
    }

    const callSid = req.body.CallSid;
    const callStatus = req.body.CallStatus;

    // Atualizar status da chamada
    const call = await voiceCommerceService.findCallBySid(callSid);
    if (call) {
      // TODO: Atualizar status no banco
      logger.info(`Call ${callSid} status updated to ${callStatus}`);
    }

    res.status(200).send('OK');
  } catch (error) {
    logger.error('Error in handleCallStatus:', error);
    res.status(200).send('OK'); // Sempre retornar OK para webhooks
  }
};

const getSession = async (req, res) => {
  try {
    const { id } = req.params;
    const session = await voiceCommerceService.findSessionById(id);

    if (!session) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Session not found',
      });
    }

    res.json(session);
  } catch (error) {
    logger.error('Error in getSession:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    });
  }
};

const getCall = async (req, res) => {
  try {
    const { id } = req.params;
    const call = await voiceCommerceService.findCallById(id);

    if (!call) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Call not found',
      });
    }

    res.json(call);
  } catch (error) {
    logger.error('Error in getCall:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    });
  }
};

const getCallInteractions = async (req, res) => {
  try {
    const { id } = req.params;
    const interactions = await voiceCommerceService.getCallInteractions(id);
    res.json(interactions);
  } catch (error) {
    logger.error('Error in getCallInteractions:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    });
  }
};

module.exports = {
  createSession,
  handleInboundCall,
  handleCallStatus,
  handleGather,
  getSession,
  getCall,
  getCallInteractions,
};
