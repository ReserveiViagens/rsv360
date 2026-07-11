# Wizard — modelo híbrido Premium / varanda (decisão 9 jul 2026)

> **Notion:** *Inventário & Tarifário Reservei* (17 unidades Etapa A, Fornecedor = Altravia).  
> **Repo:** `data/etapa-a/mapeamento-tipo-17-unidades.csv` espelha classificação + flags de upgrade.

## Decisão de produto

| Papel | O que é | Exemplo |
|-------|---------|---------|
| **Base** | Capacidade que o cliente escolhe (1q / 2q) | ATR-SUV como 1 quarto |
| **Upgrade varanda** | Add-on opcional no Wizard (+R$/noite) | ATR-SUV, AQR-FAM (+R$ 80) |
| **Premium âncora** | Produto diferente no topo (não é toggle) | ALD-FAM chalé família cap. 8 |

**Por quê:** varanda/vista é atributo de upgrade, não categoria de busca. Premium âncora posiciona o resto como acessível.

## Unidades Etapa A — resumo

| Código | Tipo tarifário | Upgrade varanda |
|--------|----------------|-----------------|
| ATR-SUV | 1 quarto | sim (+R$ 80/noite) |
| AQR-FAM | 2 quartos | sim (+R$ 80/noite) |
| ALD-FAM | Premium âncora | não (produto próprio) |
| KN39H | 1 quarto entrada | não (alvo baixa R$ 200) |
| Demais 13 | conforme mapeamento CSV | não |

## O que o código já tem (S2)

- Tabela `wizard_addons` — seed histórico **"Upgrade Suíte Master"** (`0021`) — **desativado** (`ativo=false`) após modelo por unidade (evita cobrança dupla / oferta sem lastro). Script: `backend/scripts/desativar-addon-suite-master.mjs`
- Wizard: toggle varanda **por unidade** (`upgrade_varanda_*` no metadata) — não o add-on global
- Pricing: `sumUpgradeVaranda()` + `sumWizardAddons()` (só add-ons ainda ativos)

## Lacuna para implementar (PR futuro)

~~Hoje add-ons são **globais** (`escopo = 'hotel'`), não por unidade.~~

| # | Entrega mínima | Status |
|---|----------------|--------|
| 1 | Campos em `acomodacoes.metadata`: `upgrade_varanda_disponivel`, `upgrade_varanda_valor` | ✅ PR `feat/wizard-upgrade-varanda-kn39h` |
| 2 | API disponibilidade/wizard: expor flag só para unidades elegíveis | ✅ `listarDisponiveis` → `upgradeVaranda*` |
| 3 | UI: toggle "Adicionar varanda/vista (+R$ X/noite)" **após** seleção da unidade base | ✅ `WizardStepHotel` |
| 4 | Total: base × noites + upgrade × noites | ✅ `sumUpgradeVaranda` + `calculateWizardTotal` |
| 5 | Premium âncora: badge + sort no topo (ALD-FAM) | ✅ `premium_ancora` + sort |
| 6 | Persistir escolha no payload da proposta (auditoria) | ✅ `feat/proposta-payload-upgrade-varanda` |
| — | Arquétipos genéricos → unidades reais Etapa A (ATR-SUV / AQR-FAM / ALD-FAM / KN39H) | ✅ `feat/wizard-etapa-a-arquetipos-atr-suv` |

**Seed local:** `backend/scripts/seed-upgrade-varanda-metadata.mjs` (ATR-SUV/AQR-FAM + ALD-FAM âncora + KN39H→200).

**Não ligar** `tarifario_dinamico_ativo` até smoke manual. **IA sugere delta; humano aprova** (camada 3).

## Pré-requisito obrigatório antes de ligar o motor

Carga A′ (PR #46) populou diárias base seg–qui e documentou FDS / estadia mín. / taxa parque em `configuracoes_sistema.tarifario_politica_etapa_a`. O `resolverTarifa` **ainda não aplica adicional por dia da semana**.

| Antes de `tarifario_dinamico_ativo = true` | Status |
|--------------------------------------------|--------|
| Implementar FDS (+35–40% sex–dom conforme tipo) em `resolverTarifa` | ⛔ bloqueante |
| Aplicar / validar estadia mínima (2; feriado 3+) no fluxo de reserva | ⛔ bloqueante |
| Taxa parque R$10/pessoa/dia **à parte** (não embutir na diária) | ⛔ bloqueante |
| Smoke UI wizard flat + simulador staff `?preview=1` | ✅ |

Sem FDS no motor, sexta/sábado cobrariam só a diária base (perda de +35–40%).

## KN39H — preço flat

- **Notion / tarifário alvo:** baixa R$ 200  
- **`acomodacoes.preco_diaria` (DB):** atualizado via seed script (id 27 → R$ 200)

## Referências

- `data/etapa-a/modelo-tarifario-reservei.csv` — preços por tipo × temporada (referência)
- `docs/cotacao/ESCOPO-MODULO-ANFITRIAO.md` §10 Etapa A′
