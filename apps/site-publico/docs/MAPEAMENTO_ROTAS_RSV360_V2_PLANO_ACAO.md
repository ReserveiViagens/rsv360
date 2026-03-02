# Mapeamento de Rotas RSV360 - V2 (Plano de Acao para Rotas Ausentes)

Baseado no mapeamento consolidado, foram identificadas 4 rotas ausentes:

- `/termos`
- `/privacidade`
- `/api/docs`
- `/leiloes/novo`

Este plano define acao automatica recomendada para cada uma, em ordem de prioridade.

## Ordem de execucao (priorizada)

### P0 - Alta prioridade (quebra fluxo critico / compliance)

| Prioridade | Rota ausente | Origem atual | Acao automatica recomendada | Implementacao sugerida | Resultado esperado |
|---|---|---|---|---|---|
| P0 | `/privacidade` | Link na pagina de login | **Redirect 301/308** para rota canonica existente | Criar `app/privacidade/page.tsx` com `redirect('/politica-privacidade')` | URL antiga deixa de quebrar, usuario cai no conteudo correto |
| P0 | `/termos` | Link na pagina de login | **Criar `page.tsx` placeholder estruturado** | Criar `app/termos/page.tsx` com titulo, texto base juridico e links para `politica-privacidade` e `contato` | Rota passa a responder 200 com informacao minima valida |

### P1 - Media prioridade (link interno quebrado em fluxo de produto)

| Prioridade | Rota ausente | Origem atual | Acao automatica recomendada | Implementacao sugerida | Resultado esperado |
|---|---|---|---|---|---|
| P1 | `/leiloes/novo` | Link em componente de dashboard de leiloes | **Criar `page.tsx` placeholder funcional** | Criar `app/leiloes/novo/page.tsx` com "Novo Leilao - em breve", descricao, botoes para `/leiloes` e `/admin/cms` | Link deixa de dar 404 e orienta o usuario para rotas ativas |

### P2 - Baixa prioridade (rota tecnica alternativa)

| Prioridade | Rota ausente | Origem atual | Acao automatica recomendada | Implementacao sugerida | Resultado esperado |
|---|---|---|---|---|---|
| P2 | `/api/docs` | Link dentro de `/api-docs` | **Redirect tecnico** para pagina existente | Opcao A: ajustar link para `/api-docs` onde usado; Opcao B: criar rota de redirect para `/api-docs` | Evita 404 tecnico e padroniza entrada da documentacao |

## Detalhamento por rota (passo a passo)

### 1) `/privacidade` (P0)

- Tipo: `redirect`
- Implementacao:
  - Criar `app/privacidade/page.tsx`.
  - Conteudo minimo:
    - `import { redirect } from 'next/navigation'`
    - `redirect('/politica-privacidade')`
- Teste de aceite:
  - Acessar `/privacidade`.
  - Deve redirecionar para `/politica-privacidade` sem erro.

### 2) `/termos` (P0)

- Tipo: `placeholder` (ate pagina legal completa ficar pronta)
- Implementacao:
  - Criar `app/termos/page.tsx`.
  - Estrutura minima:
    - Titulo: "Termos de Uso - em elaboracao".
    - Bloco com versao e data de atualizacao.
    - Secoes curtas: escopo, responsabilidades, contato.
    - Links para `/politica-privacidade` e `/contato`.
- Teste de aceite:
  - Acessar `/termos`.
  - Responder 200 com conteudo legivel e navegavel.

### 3) `/leiloes/novo` (P1)

- Tipo: `placeholder funcional`
- Implementacao:
  - Criar `app/leiloes/novo/page.tsx`.
  - Estrutura minima:
    - Titulo: "Novo Leilao - em breve".
    - Texto objetivo do modulo.
    - Acoes:
      - "Voltar para leiloes" -> `/leiloes`
      - "Gerenciar conteudo" -> `/admin/cms`
- Teste de aceite:
  - Acessar `/leiloes/novo`.
  - Responder 200 e sem erro de runtime.

### 4) `/api/docs` (P2)

- Tipo: `redirect/normalizacao`
- Implementacao recomendada (mais simples):
  - Ajustar links atuais para apontar para `/api-docs`.
  - Opcional: criar ponte de redirect para `/api-docs`.
- Teste de aceite:
  - Navegar a partir da tela de docs.
  - Nenhum clique deve levar a 404.

## Pacote de execucao automatica sugerido

1. Criar `app/privacidade/page.tsx` (redirect).
2. Criar `app/termos/page.tsx` (placeholder legal).
3. Criar `app/leiloes/novo/page.tsx` (placeholder do fluxo).
4. Corrigir links de `/api/docs` para `/api-docs` (ou criar redirect).
5. Atualizar smoke tests com assercoes:
   - `/termos` retorna conteudo.
   - `/privacidade` redireciona.
   - `/leiloes/novo` retorna 200.
   - `/api/docs` nao gera 404 no fluxo.

## Criterio final de concluido

- Nenhuma rota ausente do lote atual retorna 404.
- Links internos associados deixam de quebrar fluxo.
- Documentacao de rotas permanece alinhada com testes de smoke.

## Status de execucao (lote aplicado)

- ✅ `/privacidade` implementado como redirect para `/politica-privacidade`.
- ✅ `/termos` criado com `page.tsx` placeholder estruturado.
- ✅ `/leiloes/novo` criado com `page.tsx` placeholder funcional.
- ✅ Smoke tests atualizados para validar os tres pontos acima.
- ✅ `/api/docs` classificado como implementado via endpoint (`app/api/docs/route.ts`) e validado em smoke com HTTP 200.
