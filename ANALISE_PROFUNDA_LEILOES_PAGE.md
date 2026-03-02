# Análise Profunda – Página de Leilões e Sistema RSV360

**Data:** 28/01/2026  
**Escopo:** Identificação da raiz dos problemas, itens incompletos e pendências

---

## 1. Erros Identificados e Causas Raiz

### 1.1 Maximum Update Depth Exceeded (CRÍTICO – CORRIGIDO)

**Sintoma:** Loop infinito no console, página trava ou fica instável.

**Causa raiz:** O hook `useHotels.ts` tinha dependências instáveis no `useEffect`:
- O objeto `filters` passado por `useCaldasNovasHotels` era recriado a cada render
- `filters?.propertyType?.slice().sort().join(',')` podia lançar erro quando `propertyType` era `undefined`
- Arrays nas dependências geravam referências novas a cada render

**Correção aplicada:**
- Função `safeArrayKey()` para serializar arrays de forma estável
- `filtersKey` baseado em primitivos (string) em vez de objetos
- `AbortController` para cancelar fetches ao desmontar
- `mountedRef` para evitar `setState` após unmount

**Arquivo:** `apps/site-publico/hooks/useHotels.ts`

---

### 1.2 Google Maps BillingNotEnabledMapError

**Sintoma:** "Esta página não carregou o Google Maps corretamente. Você é o proprietário deste site?"

**Causa raiz:** Faturamento não ativado no Google Cloud ou API Key mal configurada.

**Correção aplicada:**
- Fallback para OpenStreetMap quando o Google Maps falha
- Mensagem orientando ativar faturamento e configurar restrições
- Uso de `@googlemaps/js-api-loader` para carregamento assíncrono

**Ação necessária (fora do código):**
1. Ativar faturamento no Google Cloud Console
2. Habilitar Maps JavaScript API e Places API
3. Configurar restrições da API Key (domínios permitidos)

---

### 1.3 Google Maps loading=async Warning

**Sintoma:** "Google Maps JavaScript API has been loaded directly without loading=async"

**Status:** O projeto já usa `@googlemaps/js-api-loader`, que carrega de forma assíncrona. O aviso pode vir de outro script ou de cache. Não há mudança necessária no código.

---

### 1.4 Extra attributes: data-np-intersection-state

**Sintoma:** "Warning: Extra attributes from the server: data-np-intersection-state at input"

**Causa raiz:** Extensão de navegador (ex.: Norton Password Manager) injeta atributos nos inputs.

**Correção aplicada:**
- `suppressHydrationWarning` nos inputs da página de leilões
- `suppressHydrationWarning` no wrapper do header

**Arquivo:** `apps/site-publico/app/leiloes/page.tsx`

---

### 1.5 Web Vitals LCP – Limite Incorreto

**Sintoma:** "LCP acima do limite: 1332s > 2.5s" (falso positivo)

**Causa raiz:** `web-vitals` retorna valores em milissegundos; o limite estava em segundos (2.5).

**Correção aplicada:**
- `LCP_LIMIT_MS = 2500` (2,5 segundos em ms)
- Comparação correta: `metric.value > 2500`

**Arquivo:** `apps/site-publico/components/performance/WebVitalsReporter.tsx`

---

## 2. Itens Incompletos ou Pendentes

### 2.1 Backend – Tabelas e Migrations

| Item | Status | Ação |
|------|--------|------|
| Tabela `flash_deals` | Pode não existir | Executar migration `010_fix_flash_deals_and_auctions.sql` |
| Colunas `winner_id`, `winner_bid_id` em `auctions` | Pode faltar | Mesma migration |
| Coluna `enterprise_id` em `auctions` | Pode faltar | Mesma migration |
| Tabela `ota_connections` | Pode não existir | Verificar migrations do backend |

### 2.2 Google Maps

| Item | Status | Ação |
|------|--------|------|
| Faturamento no Google Cloud | Pendente | Ativar no console |
| Restrições da API Key | Pendente | Adicionar domínios (localhost, produção) |
| Fallback OpenStreetMap | Implementado | Funciona quando o Google Maps falha |

### 2.3 Autenticação (PLANO_TESTES_CORRECOES.md)

| Item | Status | Ação |
|------|--------|------|
| AuthContext → `/api/auth/login` | Verificar | Conferir se está alinhado com o backend |
| Rotas affiliates (referrals, payouts) | Verificar | Confirmar se existem no backend |
| Easing Motion (cubic-bezier) | Verificar | Substituir por easing aceito pelo Motion |

### 2.4 CMS e Dados

| Item | Status | Ação |
|------|--------|------|
| PostgreSQL porta 5433 | Verificar | Rodar `Iniciar Sistema Completo.ps1` |
| Dados do CMS (website_content, etc.) | Verificar | Executar `node scripts/verificar-dados-cms.js` |
| Migração de dados | Verificar | Rodar `node scripts/migrar-registros-customizados.js` se necessário |

---

## 3. Fluxo de Inicialização Recomendado

```powershell
cd "RSV360 Versao Oficial"
.\Iniciar Sistema Completo.ps1
```

Ordem de inicialização:
1. PostgreSQL (5433)
2. Backend Principal (5000)
3. Backend Admin/CMS (5002)
4. 32 microserviços (6000–6031)
5. Dashboard Turismo (3005)
6. Site Público (3000)

---

## 4. Arquivos Modificados Nesta Análise

| Arquivo | Alteração |
|---------|-----------|
| `apps/site-publico/hooks/useHotels.ts` | Correção do loop infinito (filtersKey, AbortController, mountedRef) |
| `apps/site-publico/components/performance/WebVitalsReporter.tsx` | LCP limit em milissegundos |
| `apps/site-publico/app/leiloes/page.tsx` | `suppressHydrationWarning` no header |

---

## 5. Checklist de Verificação

- [ ] Executar `Iniciar Sistema Completo.ps1` e confirmar que todos os serviços sobem
- [ ] Acessar http://localhost:3000/leiloes e verificar ausência de loop infinito
- [ ] Conferir se o mapa (Google Maps ou OpenStreetMap) carrega
- [ ] Verificar se os leilões são listados (backend na porta 5000)
- [ ] Executar migrations do backend se houver erros de tabela
- [ ] Configurar Google Maps (faturamento e API Key) para produção

---

## 6. Documentos Relacionados

- `INICIAR_BACKEND_LEILOES.md` – Como iniciar o backend
- `PLANO_TESTES_CORRECOES.md` – Plano de testes e correções
- `CORRECAO_CMS_DADOS_NAO_CARREGAM.md` – CMS e PostgreSQL
- `SOLUCAO_DEFINITIVA_LOOP_CARREGAMENTO.md` – Loop de carregamento (AuthContext)
- `DOCUMENTACAO_COMPLETA_NTX_LEILOES_FLASHDEALS.md` – Documentação geral
