const { OpenAI } = require('openai');
const logger = require('../utils/logger');

/**
 * Integração OpenAI para Voice Commerce
 */
class OpenAIVoiceIntegration {
  constructor() {
    this.client = null;

    if (process.env.OPENAI_API_KEY) {
      this.client = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
    }
  }

  /**
   * Extrair intenção e entidades da transcrição
   */
  async extractIntentAndEntities(transcription, context = {}) {
    try {
      if (!this.client) {
        throw new Error('OpenAI client not configured');
      }

      const prompt = this.createVoicePrompt(context, transcription);

      const completion = await this.client.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'Você é um assistente de reservas de hotel. Extraia a intenção e entidades da conversa do cliente.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.3,
      });

      const response = JSON.parse(completion.choices[0].message.content);

      return {
        intent: response.intent || 'unknown',
        entities: response.entities || {},
        confidence: response.confidence || 0.5,
      };
    } catch (error) {
      logger.error('Error extracting intent and entities:', error);
      throw error;
    }
  }

  /**
   * Gerar resposta natural usando GPT-4o
   */
  async generateVoiceResponse(intent, entities, context = {}) {
    try {
      if (!this.client) {
        throw new Error('OpenAI client not configured');
      }

      const prompt = this.createResponsePrompt(intent, entities, context);

      const completion = await this.client.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'Você é um assistente de reservas de hotel amigável e profissional. Responda de forma natural e conversacional em português brasileiro.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 200,
      });

      return completion.choices[0].message.content;
    } catch (error) {
      logger.error('Error generating voice response:', error);
      throw error;
    }
  }

  /**
   * Criar prompt contextualizado para extração
   */
  createVoicePrompt(context, transcription) {
    return `
Analise a seguinte transcrição de uma chamada de voz para reserva de hotel e extraia a intenção e entidades.

Contexto:
- Cliente: ${context.customer_name || 'Desconhecido'}
- Sessão: ${context.session_id || 'Nova'}
- Turno: ${context.turn_number || 1}

Transcrição: "${transcription}"

Retorne um JSON com:
{
  "intent": "reserve_room|check_availability|modify_booking|cancel_booking|get_info|greeting|unknown",
  "entities": {
    "destination": "cidade ou local",
    "check_in": "data de check-in (YYYY-MM-DD)",
    "check_out": "data de check-out (YYYY-MM-DD)",
    "guests": número de hóspedes,
    "property_name": "nome do hotel",
    "accommodation_type": "tipo de acomodação"
  },
  "confidence": 0.0-1.0
}
    `.trim();
  }

  /**
   * Criar prompt para geração de resposta
   */
  createResponsePrompt(intent, entities, context) {
    let prompt = `Intenção detectada: ${intent}\n\n`;

    if (Object.keys(entities).length > 0) {
      prompt += `Entidades extraídas:\n${JSON.stringify(entities, null, 2)}\n\n`;
    }

    if (context.available_properties) {
      prompt += `Propriedades disponíveis:\n${JSON.stringify(context.available_properties, null, 2)}\n\n`;
    }

    prompt += `Gere uma resposta natural e conversacional em português brasileiro para o cliente. `;

    switch (intent) {
      case 'reserve_room':
        prompt += 'Ajude o cliente a fazer uma reserva.';
        break;
      case 'check_availability':
        prompt += 'Informe a disponibilidade de quartos.';
        break;
      case 'modify_booking':
        prompt += 'Ajude o cliente a modificar a reserva.';
        break;
      case 'cancel_booking':
        prompt += 'Ajude o cliente a cancelar a reserva.';
        break;
      case 'get_info':
        prompt += 'Forneça informações sobre o hotel.';
        break;
      default:
        prompt += 'Seja amigável e ofereça ajuda.';
    }

    return prompt;
  }
}

module.exports = new OpenAIVoiceIntegration();
