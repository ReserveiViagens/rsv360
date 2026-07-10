# Roteiro Inteligente — PR A (motor inerte)

Motor de montagem de roteiro dia-a-dia com regras de turno, weekday e perfil.
Neste PR o comportamento visivel permanece **100% legado** ate o PR B.

## Feature flag

| Variavel | Valor | Comportamento |
|----------|-------|---------------|
| `ROTEIRO_INTELIGENTE_ENABLED` | ausente / `false` | Heuristica legada (`montarDailyScheduleLegado`) |
| `ROTEIRO_INTELIGENTE_ENABLED` | `true` (estrito) | Motor shared + catalogo `roteiro_atracoes` |

Check estrito: apenas `=== 'true'` liga o motor. Qualquer outro valor = legado.

**CI / route-smoke / prod:** nao definir a variavel (padrao legado).

## Rollback instantaneo

1. Definir `ROTEIRO_INTELIGENTE_ENABLED=false` ou remover a variavel
2. Reiniciar backend — sem migration reversa necessaria

## Timezone / weekday

Datas de estadia usam parse civil `YYYY-MM-DD` com `new Date(y, m-1, d)`.
**Nunca** usar `new Date(isoString).getDay()` — causa shift UTC (ex.: sabado vira sexta).

Teste de regressao: `weekdayCodeFromDate('2026-08-01') === 'sab'`.

## Catalogo `roteiro_atracoes`

- Migration: `backend/drizzle/0035_roteiro_atracoes.sql`
- Seed idempotente: `ON CONFLICT (slug) DO NOTHING`
- Endpoint: `GET /api/v1/cotacao-publica/roteiro-atracoes`
- BFF: `GET /api/cotacao/roteiro-atracoes` (cache 300s)

## Imagens (politica anti-OTA)

- Seed inicial com `imagem_url = NULL`
- PR B: assets proprios/oficiais ou fallback visual (gradiente)
- Proibido hotlink de OTAs ou scraping de imagens de terceiros

## Fontes dos dias de funcionamento (seed)

| Atracao | dias_funcionamento | Fonte |
|---------|-------------------|-------|
| Feira do Luar | `["sab"]` | Tradicao turistica Caldas Novas (feira aos sabados, 18h-23h) — SETUR/hoteis regionais |
| Serra de Caldas / Jardim Japones | todos os dias | Parque Estadual da Serra de Caldas — visitacao diurna |
| Caldas Shopping | seg-dom | Padrao shopping center (horario comercial) |
| Monumento das Aguas / Praca da Matriz | todos os dias | Pontos publicos abertos ao publico |
| Restaurantes / parques | conforme seed | Horarios tipicos de almoco/noite e parques termais |

Confirmar horarios no local em feriados e alta temporada.

## PR B (proximo)

- Ligar flag em dev/docker
- Migrar `montar-roteiro-preview.ts` para motor shared
- UI `<RoteiroImersivo>` + fallback sem imagem
