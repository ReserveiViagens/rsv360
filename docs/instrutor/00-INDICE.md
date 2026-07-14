# Índice — Agente Instrutor (guias semente)

**Versão base:** `2026-07-13` · App Turismo `:3005`  
Seed para RAG (F2c-2). Escrito a partir das telas reais em `apps/turismo/pages`.

| # | Guia | Papel | Rotas principais |
|---|------|-------|------------------|
| 01 | Criar orçamento/cotação com itens | staff | `/orcamentos`, `/orcamentos/nova` |
| 02 | Orçamento → proposta e link público | staff | `/propostas`, `/propostas/nova`, `/propostas/[id]` |
| 03 | Abertura da proposta + chat HITL | staff | `/propostas/[id]/atendimento` |
| 04 | Aceite → financeiro → voucher | staff | 🚧 parcial |
| 05 | Aprovar/rejeitar unidades de anfitriões | staff | 🚧 UI staff ausente |
| 06 | Cadastrar unidade + status de publicação | anfitriao | `/anfitriao/unidades` |
| 07 | Importar planilha + corrigir preview | anfitriao | `/anfitriao/importar` |
| 08 | Bloquear datas no calendário | anfitriao | `/anfitriao/unidades/[id]/disponibilidade` |
| 09 | Definir tarifas e temporada | anfitriao | `/anfitriao/tarifas` |
| 10 | Acompanhar comissões e repasses | anfitriao | `/anfitriao/comissoes` |

## Regra de ouro

O Instrutor **explica o caminho** (onde clicar). Não inventa preços, estornos nem valores de comissão — confirme no sistema ou com um humano.
