const axios = require("axios");
const { db, cache } = require("../config/database");
const logger = require("../config/logger");

/**
 * Serviço de Chatbot com IA para RSV 360
 * Integra OpenAI GPT, processamento de linguagem natural e automação
 */
class ChatbotAIService {
  constructor() {
    this.openaiApiKey = process.env.OPENAI_API_KEY;
    this.model = "gpt-4";
    this.maxTokens = 500;
    this.temperature = 0.7;
    this.conversationMemory = new Map();
    this.intents = new Map();
    this.responses = new Map();

    this.initializeIntents();
    this.initializeResponses();
  }

  /**
   * Inicializar intenções do chatbot
   */
  initializeIntents() {
    this.intents.set("greeting", {
      keywords: [
        "olá",
        "oi",
        "bom dia",
        "boa tarde",
        "boa noite",
        "hey",
        "hello",
      ],
      confidence: 0.9,
      action: "greet_user",
    });

    this.intents.set("booking_inquiry", {
      keywords: [
        "reserva",
        "reservar",
        "disponibilidade",
        "quarto",
        "hotel",
        "booking",
      ],
      confidence: 0.8,
      action: "help_booking",
    });

    this.intents.set("price_inquiry", {
      keywords: ["preço", "valor", "custo", "quanto custa", "price", "cost"],
      confidence: 0.8,
      action: "provide_pricing",
    });

    this.intents.set("support_request", {
      keywords: [
        "ajuda",
        "suporte",
        "problema",
        "não consegui",
        "erro",
        "help",
        "support",
      ],
      confidence: 0.7,
      action: "escalate_support",
    });

    this.intents.set("location_inquiry", {
      keywords: [
        "onde fica",
        "localização",
        "endereço",
        "como chegar",
        "location",
      ],
      confidence: 0.8,
      action: "provide_location",
    });

    this.intents.set("amenities_inquiry", {
      keywords: [
        "amenidades",
        "facilidades",
        "serviços",
        "tem piscina",
        "tem wifi",
        "amenities",
      ],
      confidence: 0.7,
      action: "list_amenities",
    });

    this.intents.set("cancellation", {
      keywords: ["cancelar", "cancelamento", "remover reserva", "cancel"],
      confidence: 0.9,
      action: "help_cancellation",
    });

    this.intents.set("recommendations", {
      keywords: [
        "recomendação",
        "sugestão",
        "melhor hotel",
        "recommend",
        "suggest",
      ],
      confidence: 0.7,
      action: "provide_recommendations",
    });
  }

  /**
   * Inicializar respostas padrão
   */
  initializeResponses() {
    this.responses.set("greet_user", [
      "Olá! 👋 Sou o assistente virtual da RSV 360. Como posso ajudá-lo hoje?",
      "Oi! Bem-vindo à RSV 360! 🌟 Em que posso ser útil?",
      "Olá! Estou aqui para ajudar com suas reservas e dúvidas sobre hotéis. Como posso ajudar?",
    ]);

    this.responses.set("help_booking", [
      "Posso ajudá-lo a encontrar e reservar o hotel perfeito! 🏨 Para qual destino você gostaria de viajar?",
      "Claro! Vou ajudar com sua reserva. Preciso saber: destino, datas de check-in e check-out, e número de hóspedes.",
      "Ótimo! Para encontrar as melhores opções, me diga o destino e as datas da sua viagem.",
    ]);

    this.responses.set("provide_pricing", [
      "Os preços variam conforme destino, datas e tipo de acomodação. 💰 Posso buscar opções específicas para você!",
      "Para informações precisas de preços, preciso saber o destino e datas. Posso pesquisar as melhores ofertas!",
      "Temos opções para todos os orçamentos! Me conte mais sobre sua viagem que encontro os melhores preços.",
    ]);

    this.responses.set("escalate_support", [
      "Entendo que você precisa de ajuda específica. 🆘 Vou conectar você com nossa equipe de suporte especializada.",
      "Sem problemas! Vou transferir você para um atendente humano que poderá resolver sua questão.",
      "Vou escalar seu caso para nossa equipe técnica. Você receberá atendimento prioritário!",
    ]);

    this.responses.set("provide_location", [
      "Posso fornecer informações detalhadas sobre localização! 📍 De qual hotel você gostaria de saber?",
      "Claro! Para qual hotel ou destino você precisa das informações de localização?",
      "Tenho informações completas sobre localizações. Me diga o nome do hotel e te ajudo!",
    ]);

    this.responses.set("list_amenities", [
      "Nossos hotéis oferecem diversas comodidades! 🏊‍♀️ Qual hotel te interessa ou que tipo de amenidade procura?",
      "Temos hotéis com piscina, spa, wifi, academia e muito mais! Sobre qual hotel você quer saber?",
      "Posso listar todas as facilidades disponíveis! Me diga o hotel ou destino que te interessa.",
    ]);

    this.responses.set("help_cancellation", [
      "Posso ajudar com cancelamentos. 🔄 Você tem o número da reserva? Vou verificar as condições.",
      "Sem problemas! Para cancelar, preciso do número da reserva. Posso consultar a política de cancelamento.",
      "Vou ajudar com o cancelamento. Me informe o número da reserva e verifico as opções disponíveis.",
    ]);

    this.responses.set("provide_recommendations", [
      "Ótima pergunta! 🌟 Tenho recomendações personalizadas. Qual tipo de viagem você prefere?",
      "Posso sugerir hotéis incríveis! Me conte: praia, cidade, aventura, ou relaxamento?",
      "Tenho sugestões perfeitas para você! Qual o estilo de viagem que mais te atrai?",
    ]);

    this.responses.set("default", [
      "Interessante! Posso ajudar você a encontrar informações sobre hotéis, fazer reservas ou tirar dúvidas. O que você precisa?",
      "Entendi. Sou especialista em viagens e hospedagem. Como posso tornar sua experiência ainda melhor?",
      "Posso ajudar com reservas, informações sobre hotéis, preços e muito mais! O que você gostaria de saber?",
    ]);
  }

  /**
   * Processar mensagem do usuário
   */
  async processMessage(userId, message, conversationId = null) {
    try {
      const startTime = Date.now();

      // Normalizar mensagem
      const normalizedMessage = this.normalizeMessage(message);

      // Detectar intenção
      const intent = this.detectIntent(normalizedMessage);

      // Buscar contexto da conversa
      const context = await this.getConversationContext(userId, conversationId);

      // Gerar resposta
      const response = await this.generateResponse(
        intent,
        normalizedMessage,
        context,
      );

      // Executar ação se necessária
      const actionResult = await this.executeAction(
        intent.action,
        normalizedMessage,
        context,
      );

      // Salvar conversa
      const conversationRecord = await this.saveConversation(
        userId,
        conversationId,
        {
          userMessage: message,
          botResponse: response.text,
          intent: intent.name,
          confidence: intent.confidence,
          actionResult,
          processingTime: Date.now() - startTime,
        },
      );

      // Atualizar contexto
      this.updateConversationMemory(userId, conversationId, {
        lastIntent: intent.name,
        lastMessage: normalizedMessage,
        conversationTurn: context.turn + 1,
      });

      logger.info(
        `🤖 Chatbot processou mensagem para usuário ${userId}: ${intent.name} (${intent.confidence.toFixed(2)})`,
      );

      return {
        response: response.text,
        intent: intent.name,
        confidence: intent.confidence,
        actions: actionResult?.actions || [],
        suggestions: response.suggestions || [],
        conversationId: conversationRecord.conversation_id,
        processingTime: Date.now() - startTime,
      };
    } catch (error) {
      logger.error("❌ Erro no processamento do chatbot:", error);
      return {
        response:
          "Desculpe, houve um problema técnico. Posso transferir você para um atendente humano.",
        intent: "error",
        confidence: 0,
        actions: [{ type: "escalate_support" }],
        error: true,
      };
    }
  }

  /**
   * Normalizar mensagem do usuário
   */
  normalizeMessage(message) {
    return message
      .toLowerCase()
      .trim()
      .replace(/[^\w\s]/gi, " ")
      .replace(/\s+/g, " ");
  }

  /**
   * Detectar intenção da mensagem
   */
  detectIntent(normalizedMessage) {
    let bestMatch = {
      name: "default",
      confidence: 0,
      action: "provide_general_help",
    };

    for (const [intentName, intentData] of this.intents) {
      let score = 0;
      let matches = 0;

      for (const keyword of intentData.keywords) {
        if (normalizedMessage.includes(keyword)) {
          matches++;
          score += 1;
        }
      }

      if (matches > 0) {
        const confidence =
          (score / intentData.keywords.length) * intentData.confidence;

        if (confidence > bestMatch.confidence) {
          bestMatch = {
            name: intentName,
            confidence,
            action: intentData.action,
            matches,
          };
        }
      }
    }

    return bestMatch;
  }

  /**
   * Gerar resposta baseada na intenção
   */
  async generateResponse(intent, message, context) {
    try {
      // Buscar resposta padrão
      const standardResponses =
        this.responses.get(intent.action) || this.responses.get("default");
      let response =
        standardResponses[Math.floor(Math.random() * standardResponses.length)];

      // Se confiança é baixa ou contexto complexo, usar IA
      if (intent.confidence < 0.6 || context.turn > 3) {
        const aiResponse = await this.generateAIResponse(message, context);
        if (aiResponse) {
          response = aiResponse;
        }
      }

      // Adicionar sugestões baseadas na intenção
      const suggestions = this.generateSuggestions(intent.name, context);

      return {
        text: response,
        suggestions,
      };
    } catch (error) {
      logger.error("❌ Erro ao gerar resposta:", error);
      return {
        text: "Posso ajudá-lo de outra forma? Estou aqui para esclarecer dúvidas sobre hotéis e reservas.",
        suggestions: [
          "Ver hotéis disponíveis",
          "Falar com atendente",
          "Cancelar reserva",
        ],
      };
    }
  }

  /**
   * Gerar resposta usando IA (OpenAI)
   */
  async generateAIResponse(message, context) {
    if (!this.openaiApiKey) {
      logger.warn("⚠️ OpenAI API key não configurada");
      return null;
    }

    try {
      const systemPrompt = `
        Você é um assistente virtual especializado em turismo e hospedagem da empresa RSV 360.
        Você é amigável, prestativo e conhece muito sobre hotéis, reservas e viagens.

        Contexto da conversa:
        - Turno: ${context.turn}
        - Última intenção: ${context.lastIntent || "primeira mensagem"}
        - Perfil do usuário: ${context.userProfile || "não definido"}

        Diretrizes:
        - Seja conciso (máximo 100 palavras)
        - Use emojis apropriados
        - Ofereça ajuda específica
        - Se não souber, ofereça transferir para humano
        - Foque em reservas, hotéis, preços e destinos
      `;

      const response = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
          model: this.model,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: message },
          ],
          max_tokens: this.maxTokens,
          temperature: this.temperature,
        },
        {
          headers: {
            Authorization: `Bearer ${this.openaiApiKey}`,
            "Content-Type": "application/json",
          },
          timeout: 10000,
        },
      );

      return response.data.choices[0]?.message?.content?.trim();
    } catch (error) {
      logger.error("❌ Erro na API OpenAI:", error.message);
      return null;
    }
  }

  /**
   * Gerar sugestões baseadas na intenção
   */
  generateSuggestions(intentName, context) {
    const suggestions = {
      greeting: [
        "Ver hotéis disponíveis",
        "Fazer uma reserva",
        "Falar com atendente",
      ],
      booking_inquiry: [
        "Buscar por destino",
        "Ver ofertas especiais",
        "Verificar disponibilidade",
      ],
      price_inquiry: ["Comparar preços", "Ver promoções", "Calcular total"],
      support_request: ["Falar com atendente", "Ver FAQ", "Reportar problema"],
      location_inquiry: ["Ver no mapa", "Como chegar", "Pontos turísticos"],
      amenities_inquiry: [
        "Ver fotos",
        "Comparar hotéis",
        "Filtrar por amenidades",
      ],
      cancellation: [
        "Política de cancelamento",
        "Falar com atendente",
        "Ver alternativas",
      ],
      recommendations: [
        "Hotéis populares",
        "Ofertas especiais",
        "Destinos em alta",
      ],
    };

    return (
      suggestions[intentName] || [
        "Como posso ajudar?",
        "Ver hotéis",
        "Falar com atendente",
      ]
    );
  }

  /**
   * Executar ação baseada na intenção
   */
  async executeAction(action, message, context) {
    try {
      switch (action) {
        case "help_booking":
          return await this.searchHotels(message, context);

        case "provide_pricing":
          return await this.getPricing(message, context);

        case "escalate_support":
          return await this.escalateToHuman(context);

        case "provide_location":
          return await this.getLocationInfo(message, context);

        case "list_amenities":
          return await this.getAmenities(message, context);

        case "help_cancellation":
          return await this.getCancellationInfo(message, context);

        case "provide_recommendations":
          return await this.getRecommendations(context);

        default:
          return { actions: [] };
      }
    } catch (error) {
      logger.error(`❌ Erro ao executar ação ${action}:`, error);
      return { actions: [{ type: "error", message: "Erro interno" }] };
    }
  }

  /**
   * Buscar hotéis baseado na mensagem
   */
  async searchHotels(message, context) {
    // Extrair informações da mensagem
    const destination = this.extractDestination(message);
    const dates = this.extractDates(message);

    if (!destination) {
      return {
        actions: [
          {
            type: "request_info",
            field: "destination",
            message: "Para qual destino você gostaria de viajar?",
          },
        ],
      };
    }

    // Buscar hotéis
    const hotels = await db("hotels")
      .select(["id", "name", "location", "category", "rating"])
      .where("location", "ilike", `%${destination}%`)
      .where("status", "active")
      .limit(3);

    return {
      actions: [
        {
          type: "show_hotels",
          data: hotels,
          message: `Encontrei ${hotels.length} hotéis em ${destination}:`,
        },
      ],
    };
  }

  /**
   * Obter informações de preços
   */
  async getPricing(message, context) {
    const destination =
      this.extractDestination(message) || context.lastDestination;

    if (!destination) {
      return {
        actions: [
          {
            type: "request_info",
            field: "destination",
            message: "Para qual destino você quer saber os preços?",
          },
        ],
      };
    }

    const priceRanges = await db("hotels")
      .select(
        db.raw("MIN(price_range) as min_range, MAX(price_range) as max_range"),
      )
      .where("location", "ilike", `%${destination}%`)
      .first();

    return {
      actions: [
        {
          type: "show_pricing",
          data: priceRanges,
          message: `Em ${destination}, os preços variam de ${priceRanges.min_range} a ${priceRanges.max_range}.`,
        },
      ],
    };
  }

  /**
   * Escalar para atendimento humano
   */
  async escalateToHuman(context) {
    const ticket = await db("support_tickets")
      .insert({
        user_id: context.userId,
        conversation_id: context.conversationId,
        status: "open",
        priority: "normal",
        source: "chatbot",
        subject: "Escalated from chatbot",
        description: "User requested human support from chatbot",
        created_at: new Date(),
      })
      .returning("*");

    return {
      actions: [
        {
          type: "escalate_support",
          data: { ticketId: ticket[0].id },
          message:
            "Ticket de suporte criado. Um atendente entrará em contato em breve.",
        },
      ],
    };
  }

  /**
   * Buscar contexto da conversa
   */
  async getConversationContext(userId, conversationId) {
    const memoryKey = `${userId}_${conversationId || "default"}`;

    // Buscar da memória em cache
    let context = this.conversationMemory.get(memoryKey);

    if (!context) {
      // Buscar do banco de dados
      const lastConversations = await db("chatbot_conversations")
        .where("user_id", userId)
        .where(
          "conversation_id",
          conversationId || db.raw("conversation_id IS NOT NULL"),
        )
        .orderBy("created_at", "desc")
        .limit(5);

      context = {
        turn: lastConversations.length,
        lastIntent: lastConversations[0]?.intent,
        conversationHistory: lastConversations,
        userId,
        conversationId,
      };

      // Salvar na memória
      this.conversationMemory.set(memoryKey, context);
    }

    return context;
  }

  /**
   * Salvar conversa no banco
   */
  async saveConversation(userId, conversationId, data) {
    const conversationRecord = {
      user_id: userId,
      conversation_id: conversationId || this.generateConversationId(),
      user_message: data.userMessage,
      bot_response: data.botResponse,
      intent: data.intent,
      confidence: data.confidence,
      action_result: JSON.stringify(data.actionResult),
      processing_time_ms: data.processingTime,
      created_at: new Date(),
    };

    const [savedRecord] = await db("chatbot_conversations")
      .insert(conversationRecord)
      .returning("*");

    return savedRecord;
  }

  /**
   * Atualizar memória da conversa
   */
  updateConversationMemory(userId, conversationId, updates) {
    const memoryKey = `${userId}_${conversationId || "default"}`;
    const currentContext = this.conversationMemory.get(memoryKey) || {};

    this.conversationMemory.set(memoryKey, {
      ...currentContext,
      ...updates,
      lastUpdated: new Date(),
    });
  }

  /**
   * Gerar ID único para conversa
   */
  generateConversationId() {
    return `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Extrair destino da mensagem
   */
  extractDestination(message) {
    const destinations = [
      "rio de janeiro",
      "são paulo",
      "salvador",
      "fortaleza",
      "recife",
      "belo horizonte",
      "brasília",
      "curitiba",
      "porto alegre",
      "manaus",
      "belém",
      "natal",
      "joão pessoa",
      "aracaju",
      "maceió",
      "vitória",
      "florianópolis",
      "goiânia",
      "campo grande",
      "cuiabá",
    ];

    for (const dest of destinations) {
      if (message.includes(dest)) {
        return dest;
      }
    }

    return null;
  }

  /**
   * Extrair datas da mensagem
   */
  extractDates(message) {
    // Regex básico para datas
    const dateRegex = /(\d{1,2}\/\d{1,2}\/\d{4}|\d{1,2}\/\d{1,2})/g;
    const matches = message.match(dateRegex);

    return matches ? matches.slice(0, 2) : null;
  }

  /**
   * Obter estatísticas do chatbot
   */
  async getStats() {
    const totalConversations = await db("chatbot_conversations")
      .count("* as count")
      .first();

    const intentDistribution = await db("chatbot_conversations")
      .select("intent")
      .count("* as count")
      .groupBy("intent")
      .orderBy("count", "desc");

    const avgConfidence = await db("chatbot_conversations")
      .avg("confidence as avg_confidence")
      .first();

    const avgProcessingTime = await db("chatbot_conversations")
      .avg("processing_time_ms as avg_time")
      .first();

    const recentActivity = await db("chatbot_conversations")
      .where("created_at", ">", db.raw("NOW() - INTERVAL '24 hours'"))
      .count("* as count")
      .first();

    return {
      totalConversations: parseInt(totalConversations.count),
      intentDistribution,
      avgConfidence: parseFloat(avgConfidence.avg_confidence) || 0,
      avgProcessingTime: parseFloat(avgProcessingTime.avg_time) || 0,
      recentActivity24h: parseInt(recentActivity.count),
      memoryUsage: this.conversationMemory.size,
    };
  }

  /**
   * Limpar memória antiga
   */
  cleanupMemory() {
    const now = new Date();
    const cutoff = new Date(now.getTime() - 2 * 60 * 60 * 1000); // 2 horas

    for (const [key, context] of this.conversationMemory) {
      if (context.lastUpdated && context.lastUpdated < cutoff) {
        this.conversationMemory.delete(key);
      }
    }

    logger.info(
      `🧹 Limpeza de memória: ${this.conversationMemory.size} conversas ativas`,
    );
  }

  /**
   * Inicializar limpeza automática
   */
  startMemoryCleanup() {
    // Limpar memória a cada hora
    setInterval(
      () => {
        this.cleanupMemory();
      },
      60 * 60 * 1000,
    );
  }
}

module.exports = ChatbotAIService;
