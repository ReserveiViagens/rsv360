# Etapa A flat — preços reais confirmados (17 publicados)

**Status (3 jul 2026):** preços REF §11.6 **confirmados** como tarifário flat vigente em [`precos_reais_17.csv`](precos_reais_17.csv) (`nota=confirmado`).

| Arquivo | Uso |
|---------|-----|
| [`precos_reais_17.csv`](precos_reais_17.csv) | Fonte versionada — preços confirmados |
| `precos_reais_17.xlsx` | Gerado localmente (`export-precos-reais-17-xlsx.mjs`) — artefato, não commitar |

O CSV simbólico [`publicar_17_rascunhos.csv`](publicar_17_rascunhos.csv) permanece só como bootstrap/scaffolding.

## Preços confirmados (§11.6)

| id | codigo | preco_diaria |
|---:|---|---:|
| 8 | AGF-STD | 350 |
| 9 | AGF-FAM | 420 |
| 10 | ATR-DUP | 349 |
| 11 | ATR-FAM | 400 |
| 12 | ATR-SUV | 380 |
| 13 | ALD-DUP | 380 |
| 14 | ALD-FAM | 600 |
| 15 | ALV-LUX | 480 |
| 16 | ALV-PRE | 550 |
| 17 | AQR-CZ | 320 |
| 18 | AQR-FAM | 449 |
| 19 | PRT1-2Q | 400 |
| 20 | DRF-1Q | 394 |
| 21 | SDC-2Q | 360 |
| 22 | DAP-2Q | 280 |
| 27 | KN39H | 120 |
| 419 | VC-APTO-409-… | 405 |

## Reaplicar UPDATE (local ou prod)

```powershell
cd "C:\Users\RSV 360\Documents\rsv360\backend"
$env:DATABASE_URL="postgresql://rsv360:rsv360_dev_2024@localhost:5433/rsv_360_ecosystem"
node scripts/atualizar-precos-publicados.mjs ../data/etapa-a/precos_reais_17.csv --dry-run
node scripts/atualizar-precos-publicados.mjs ../data/etapa-a/precos_reais_17.csv
node scripts/smoke-wizard-passo2.mjs
```

**Prod:** substituir `DATABASE_URL` pela conexão de produção antes do UPDATE real.
