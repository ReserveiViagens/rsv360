/**
 * ✅ TAREFA LOW-2: Serviço de Busca Conversacional com AI
 * Integração com OpenAI para busca conversacional inteligente
 * PR-13e-followup-a: via shared llmChatCompletion gateway
 */

import { llmChatCompletion } from '@rsv360/shared';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: Date;
}

export interface SearchContext {
  location?: string;
  dates?: {
    checkIn: string;
    checkOut: string;
  };
  guests?: number;
  preferences?: string[];
  budget?: {
    min: number;
    max: number;
  };
}

export interface SearchResult {
  query: string;
  results: any[];
  suggestions: string[];
  confidence: number;
}

/**
 * Serviço de busca conversacional com AI
 */
export class AISearchService {
  private apiKey?: string;
  private model: string;
  /** PR-13a: per-user history — never share a process-wide singleton across users. */
  private histories = new Map<string, ChatMessage[]>();
  private maxHistory: number = 10;

  constructor(apiKey?: string, model: string = 'gpt-4o-mini') {
    this.apiKey = apiKey || process.env.OPENAI_API_KEY;
    this.model = model;
  }

  private historyKey(userId: number | string): string {
    return String(userId);
  }

  private getBucket(userId: number | string): ChatMessage[] {
    const key = this.historyKey(userId);
    let bucket = this.histories.get(key);
    if (!bucket) {
      bucket = [];
      this.histories.set(key, bucket);
    }
    return bucket;
  }

  /**
   * Processar mensagem do usuário e retornar resposta
   */
  async processMessage(
    userMessage: string,
    context?: SearchContext,
    userId?: number | string,
  ): Promise<{ response: string; searchQuery?: string; results?: any[] }> {
    try {
      if (userId === undefined || userId === null || userId === '') {
        throw new Error('userId is required for AI search history');
      }

      if (!this.apiKey) {
        const mock = this.getMockResponse(userMessage, context);
        const bucket = this.getBucket(userId);
        bucket.push({
          role: 'user',
          content: userMessage,
          timestamp: new Date(),
        });
        bucket.push({
          role: 'assistant',
          content: mock.response,
          timestamp: new Date(),
        });
        if (bucket.length > this.maxHistory) {
          this.histories.set(
            this.historyKey(userId),
            bucket.slice(-this.maxHistory),
          );
        }
        return mock;
      }

      // Adicionar contexto do sistema
      const systemMessage: ChatMessage = {
        role: 'system',
        content: this.buildSystemPrompt(context),
      };

      // Adicionar mensagem do usuário
      const userMsg: ChatMessage = {
        role: 'user',
        content: userMessage,
        timestamp: new Date(),
      };

      // Manter histórico limitado (por usuário)
      const conversationHistory = this.getBucket(userId);
      conversationHistory.push(userMsg);
      if (conversationHistory.length > this.maxHistory) {
        this.histories.set(
          this.historyKey(userId),
          conversationHistory.slice(-this.maxHistory),
        );
      }

      const history = this.getBucket(userId);

      // Preparar mensagens para API
      const messages = [
        systemMessage,
        ...history.slice(-5), // Últimas 5 mensagens
      ];

      // PR-13e-followup-a: shared gateway (timeout / budget / sanitize / safe logs)
      const result = await llmChatCompletion(
        {
          surface: 'ai-search',
          model: this.model,
          temperature: 0.7,
          maxTokens: 500,
          maxOutputChars: 2_000,
          messages: messages.map((msg) => ({
            role: msg.role,
            content: msg.content,
          })),
        },
        { apiKey: this.apiKey },
      );

      if (!result.ok) {
        throw new Error(`OpenAI gateway error: ${result.error}`);
      }

      const assistantMessage = result.content || 'Desculpe, não entendi.';

      // Adicionar resposta ao histórico
      const assistantMsg: ChatMessage = {
        role: 'assistant',
        content: assistantMessage,
        timestamp: new Date(),
      };
      this.getBucket(userId).push(assistantMsg);

      // Extrair query de busca se aplicável
      const searchQuery = this.extractSearchQuery(userMessage, assistantMessage);

      return {
        response: assistantMessage,
        searchQuery,
      };
    } catch (error: any) {
      console.error('Erro ao processar mensagem:', error);
      return {
        response: 'Desculpe, ocorreu um erro ao processar sua mensagem. Tente novamente.',
      };
    }
  }

  /**
   * Buscar propriedades baseado em query conversacional
   */
  async searchProperties(
    query: string,
    context?: SearchContext,
    userId?: number | string,
  ): Promise<SearchResult> {
    try {
      // Processar query com AI para extrair parâmetros
      const aiResponse = await this.processMessage(query, context, userId);
      
      // Se AI extraiu uma query, usar ela
      const searchQuery = aiResponse.searchQuery || query;

      // Buscar propriedades (integrar com serviço de busca existente)
      const results = await this.performPropertySearch(searchQuery, context);

      // Gerar sugestões
      const suggestions = await this.generateSuggestions(query, context);

      return {
        query: searchQuery,
        results,
        suggestions,
        confidence: 0.8,
      };
    } catch (error: any) {
      console.error('Erro ao buscar propriedades:', error);
      return {
        query,
        results: [],
        suggestions: [],
        confidence: 0,
      };
    }
  }

  /**
   * Limpar histórico de conversação do usuário autenticado
   */
  clearHistory(userId: number | string): void {
    this.histories.delete(this.historyKey(userId));
  }

  /**
   * Obter histórico de conversação do usuário autenticado
   */
  getHistory(userId: number | string): ChatMessage[] {
    return [...this.getBucket(userId)];
  }

  /** Test helper — wipe all in-memory histories. */
  clearAllHistoriesForTests(): void {
    this.histories.clear();
  }

  /**
   * Construir prompt do sistema
   */
  private buildSystemPrompt(context?: SearchContext): string {
    let prompt = `Você é um assistente de busca inteligente para o RSV 360, uma plataforma de reservas de hotéis e experiências.

Sua função é ajudar usuários a encontrar a hospedagem perfeita através de conversas naturais.

Contexto atual:
`;

    if (context?.location) {
      prompt += `- Localização: ${context.location}\n`;
    }
    if (context?.dates) {
      prompt += `- Datas: ${context.dates.checkIn} até ${context.dates.checkOut}\n`;
    }
    if (context?.guests) {
      prompt += `- Hóspedes: ${context.guests}\n`;
    }
    if (context?.budget) {
      prompt += `- Orçamento: R$ ${context.budget.min} - R$ ${context.budget.max}\n`;
    }
    if (context?.preferences && context.preferences.length > 0) {
      prompt += `- Preferências: ${context.preferences.join(', ')}\n`;
    }

    prompt += `
Instruções:
1. Seja amigável e conversacional
2. Faça perguntas de esclarecimento quando necessário
3. Extraia informações relevantes da conversa
4. Sugira opções baseadas nas preferências do usuário
5. Se o usuário mencionar características específicas (piscina, wifi, etc), anote isso

Formato de resposta: Seja natural e útil, como um assistente de viagem experiente.`;

    return prompt;
  }

  /**
   * Extrair query de busca da mensagem
   */
  private extractSearchQuery(userMessage: string, aiResponse: string): string | undefined {
    // Detectar intenção de busca
    const searchKeywords = ['buscar', 'encontrar', 'procurar', 'quero', 'preciso', 'hotel', 'hospedagem'];
    const hasSearchIntent = searchKeywords.some(keyword => 
      userMessage.toLowerCase().includes(keyword)
    );

    if (hasSearchIntent) {
      // Extrair localização, datas, etc da mensagem
      return userMessage;
    }

    return undefined;
  }

  /**
   * Realizar busca de propriedades
   */
  private async performPropertySearch(
    query: string,
    context?: SearchContext
  ): Promise<any[]> {
    // Integrar com serviço de busca existente
    // Por enquanto, retornar mock
    return [
      {
        id: 1,
        name: 'Hotel Exemplo',
        location: context?.location || 'Caldas Novas',
        price: 200,
        rating: 4.5,
      },
    ];
  }

  /**
   * Gerar sugestões baseadas na query
   */
  private async generateSuggestions(
    query: string,
    context?: SearchContext
  ): Promise<string[]> {
    // Gerar sugestões inteligentes
    const suggestions: string[] = [];

    if (!context?.location) {
      suggestions.push('Em qual cidade você gostaria de se hospedar?');
    }

    if (!context?.dates) {
      suggestions.push('Quais são as datas da sua viagem?');
    }

    if (!context?.guests) {
      suggestions.push('Quantas pessoas vão viajar?');
    }

    return suggestions;
  }

  /**
   * Resposta mock para desenvolvimento
   */
  private getMockResponse(
    userMessage: string,
    context?: SearchContext
  ): { response: string; searchQuery?: string } {
    const lowerMessage = userMessage.toLowerCase();

    if (lowerMessage.includes('olá') || lowerMessage.includes('oi')) {
      return {
        response: 'Olá! Como posso ajudá-lo a encontrar a hospedagem perfeita?',
      };
    }

    if (lowerMessage.includes('buscar') || lowerMessage.includes('encontrar')) {
      return {
        response: `Vou buscar opções para você${context?.location ? ` em ${context.location}` : ''}. Deixe-me encontrar as melhores opções...`,
        searchQuery: userMessage,
      };
    }

    if (lowerMessage.includes('preço') || lowerMessage.includes('quanto')) {
      return {
        response: 'Posso ajudá-lo a encontrar opções dentro do seu orçamento. Qual é o valor máximo que você gostaria de gastar por noite?',
      };
    }

    return {
      response: 'Entendi! Como posso ajudá-lo com sua busca de hospedagem? Você pode me dizer a localização, datas e número de hóspedes.',
    };
  }
}

// Instância singleton
export const aiSearchService = new AISearchService();

