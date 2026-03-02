# ADR-003: Rate Limiting Strategy

**Status:** Aceito  
**Data:** 2025-11-22  
**Decisores:** Equipe de Desenvolvimento

## Contexto

O RSV Gen 2 precisa proteger a API contra:
- Abuso e ataques DDoS
- Uso excessivo de recursos
- Scraping não autorizado
- Ataques de força bruta

Requisitos:
- Limites diferentes por tipo de endpoint
- Headers informativos para clientes
- Escalável horizontalmente
- Não impactar usuários legítimos

## Decisão

**Rate Limiting baseado em Redis** com limites diferenciados por tipo de endpoint.

### Estratégia

1. **Sliding Window:** Janela deslizante de tempo
2. **Armazenamento:** Redis para compartilhamento entre instâncias
3. **Fallback:** Memória local se Redis indisponível
4. **Headers:** Informações de limite nas respostas

### Limites por Tipo

| Tipo | Limite | Janela | Justificativa |
|------|--------|--------|---------------|
| Autenticação | 5 req | 15 min | Prevenir força bruta |
| Leitura (GET) | 100 req | 15 min | Menos crítico |
| Escrita (POST/PUT/DELETE) | 20 req | 15 min | Mais crítico, prevenir spam |
| Reservas | 20 req | 15 min | Operação crítica |
| Smart Pricing | 50 req | 15 min | Cálculo pesado |

## Consequências

### Positivas

- ✅ Proteção contra abuso
- ✅ Melhor performance (menos carga)
- ✅ Headers informativos ajudam clientes
- ✅ Escalável com Redis
- ✅ Limites diferenciados por contexto

### Negativas

- ⚠️ Pode bloquear usuários legítimos em picos
- ⚠️ Requer Redis para escalabilidade
- ⚠️ Complexidade adicional

## Alternativas Consideradas

### Fixed Window

**Prós:**
- Implementação simples
- Fácil de entender

**Contras:**
- Pode permitir burst no início da janela
- Menos preciso

**Por que não:** Sliding window é mais preciso e justo.

### Token Bucket

**Prós:**
- Permite burst controlado
- Mais flexível

**Contras:**
- Mais complexo de implementar
- Pode ser menos intuitivo

**Por que não:** Sliding window atende bem às necessidades e é mais simples.

### Rate Limiting por IP

**Prós:**
- Simples de implementar
- Funciona sem autenticação

**Contras:**
- Pode bloquear IPs compartilhados
- Fácil de contornar (múltiplos IPs)

**Por que não:** Combinado com rate limiting por usuário autenticado.

## Implementação

### Estrutura de Chave Redis

```
rl:ip:192.168.1.1:auth -> contador
rl:user:123:bookings -> contador
```

### Headers de Resposta

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1637596800
```

### Resposta 429

```json
{
  "success": false,
  "error": "Too many requests",
  "code": "RATE_LIMIT_EXCEEDED",
  "retryAfter": 900
}
```

### Middleware

```typescript
const rateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 100,
  keyGenerator: (req) => req.user?.id ? `user:${req.user.id}` : `ip:${req.ip}`
});
```

---

**Status:** ✅ Implementado e em produção

