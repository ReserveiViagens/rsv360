# 🤖 Guia de Busca Conversacional com AI

**Data:** 07/12/2025  
**Tarefa:** LOW-2 - AI Search Conversacional

---

## 📋 Visão Geral

Este guia documenta a integração de busca conversacional com inteligência artificial, permitindo que usuários encontrem hospedagens através de conversas naturais usando OpenAI.

---

## 🏗️ Arquitetura

### Componentes Principais

1. **Serviço:** `lib/ai-search-service.ts`
   - Processamento de mensagens com OpenAI
   - Extração de contexto e intenções
   - Geração de queries de busca
   - Gerenciamento de histórico

2. **APIs:**
   - `POST /api/ai-search/chat` - Processar mensagem
   - `POST /api/ai-search/search` - Buscar propriedades
   - `GET /api/ai-search/history` - Obter histórico
   - `DELETE /api/ai-search/history` - Limpar histórico

3. **UI:** `components/ai-search/AISearchChat.tsx`
   - Interface de chat
   - Histórico de conversação
   - Contexto visual

---

## 🚀 Como Usar

### 1. Processar Mensagem

```typescript
import { aiSearchService } from '@/lib/ai-search-service';

const result = await aiSearchService.processMessage(
  'Quero um hotel em Caldas Novas com piscina',
  {
    location: 'Caldas Novas, GO',
    guests: 2,
  }
);

console.log(result.response); // Resposta do assistente
console.log(result.searchQuery); // Query extraída (se aplicável)
```

### 2. Buscar Propriedades

```typescript
const searchResult = await aiSearchService.searchProperties(
  'hotel com piscina e wifi',
  {
    location: 'Caldas Novas',
    budget: { min: 100, max: 500 },
  }
);

console.log(searchResult.results); // Resultados
console.log(searchResult.suggestions); // Sugestões
```

### 3. Usar o Componente

```tsx
import { AISearchChat } from '@/components/ai-search/AISearchChat';

<AISearchChat
  initialContext={{
    location: 'Caldas Novas, GO',
    guests: 2,
    dates: {
      checkIn: '2025-12-15',
      checkOut: '2025-12-20',
    },
  }}
  onSearchResult={(query, results) => {
    console.log('Busca realizada:', query);
    console.log('Resultados:', results);
  }}
/>
```

---

## 🔧 Configuração

### Variáveis de Ambiente

```env
OPENAI_API_KEY=your_openai_api_key_here
```

### Modelo

Por padrão, usa `gpt-4o-mini` (mais econômico). Para melhor qualidade, use `gpt-4`:

```typescript
const aiSearch = new AISearchService(apiKey, 'gpt-4');
```

---

## 📊 Estrutura de Dados

### ChatMessage

```typescript
interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: Date;
}
```

### SearchContext

```typescript
interface SearchContext {
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
```

### SearchResult

```typescript
interface SearchResult {
  query: string;
  results: any[];
  suggestions: string[];
  confidence: number;
}
```

---

## 💬 Exemplos de Conversação

### Exemplo 1: Busca Simples

```
Usuário: Olá
Assistente: Olá! Como posso ajudá-lo a encontrar a hospedagem perfeita?

Usuário: Quero um hotel em Caldas Novas
Assistente: Perfeito! Vou buscar hotéis em Caldas Novas para você. 
           Para quais datas você precisa?

Usuário: 15 a 20 de dezembro
Assistente: Ótimo! Encontrei várias opções para essas datas. 
           Quantas pessoas vão viajar?
```

### Exemplo 2: Busca com Preferências

```
Usuário: Hotel com piscina e wifi
Assistente: Entendi! Você precisa de um hotel com piscina e wifi. 
           Em qual localização você gostaria de se hospedar?

Usuário: Caldas Novas, até R$ 300 por noite
Assistente: Perfeito! Vou buscar hotéis em Caldas Novas com piscina, 
           wifi e até R$ 300 por noite. Encontrei 12 opções!
```

---

## 🎯 Funcionalidades

### 1. Extração de Contexto

O assistente extrai automaticamente:
- Localização (cidade, estado, país)
- Datas (check-in, check-out)
- Número de hóspedes
- Orçamento
- Preferências (piscina, wifi, etc.)

### 2. Sugestões Inteligentes

O assistente faz perguntas quando informações estão faltando:
- "Em qual cidade você gostaria de se hospedar?"
- "Quais são as datas da sua viagem?"
- "Quantas pessoas vão viajar?"

### 3. Histórico de Conversação

- Mantém contexto entre mensagens
- Limita histórico para otimizar tokens
- Permite limpar histórico

### 4. Integração com Busca

- Extrai queries de busca das conversas
- Executa buscas automaticamente
- Retorna resultados relevantes

---

## ⚙️ Personalização

### Ajustar Prompt do Sistema

Edite `buildSystemPrompt()` em `ai-search-service.ts` para personalizar o comportamento do assistente.

### Ajustar Modelo

```typescript
const aiSearch = new AISearchService(apiKey, 'gpt-4'); // Melhor qualidade
const aiSearch = new AISearchService(apiKey, 'gpt-4o-mini'); // Mais econômico
```

### Ajustar Histórico

```typescript
// Alterar maxHistory no construtor
const aiSearch = new AISearchService(apiKey);
aiSearch.maxHistory = 20; // Manter mais mensagens
```

---

## ⚠️ Limitações

1. **Custos:** OpenAI API tem custos por token
2. **Rate Limiting:** Implementar throttling em produção
3. **Privacidade:** Histórico mantido em memória (considerar persistência)
4. **Dependência:** Requer conexão com OpenAI API

---

## 🔮 Melhorias Futuras

- [ ] Persistência de histórico (banco de dados)
- [ ] Cache de respostas frequentes
- [ ] Suporte a múltiplos idiomas
- [ ] Integração com voice input
- [ ] Análise de sentimento
- [ ] Recomendações personalizadas
- [ ] A/B testing de prompts

---

## 🧪 Testes

```bash
npm test __tests__/api/ai-search.test.ts
```

---

## 📚 Referências

- [OpenAI API Documentation](https://platform.openai.com/docs)
- [ChatGPT Search](https://openai.com/blog/chatgpt)
- [GPT-4o Mini](https://openai.com/index/gpt-4o-mini/)

---

## ✅ Checklist de Implementação

- [x] Serviço criado
- [x] APIs criadas
- [x] Componente UI criado
- [x] Documentação criada
- [x] Testes unitários
- [ ] Testes E2E
- [ ] Integração com busca de propriedades real
- [ ] Persistência de histórico

---

**Última atualização:** 07/12/2025

