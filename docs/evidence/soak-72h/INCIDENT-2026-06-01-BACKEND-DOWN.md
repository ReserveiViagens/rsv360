# Incidente Soak 72h — backend down durante janela

**Data:** 2026-06-01 (America/Sao_Paulo)  
**Ambiente:** `rsv360` (Docker local)  
**Janela afetada:** `2026-05-30T09:03:09-03:00` → `2026-06-02T09:03:09-03:00`

## Resumo executivo

Durante a janela de soak, o serviço `rsv360-backend` ficou indisponível (container `Exited 255`), causando falha objetiva de coleta (`sample 009`) e violando o critério de hard stop F1.

## Evidências objetivas

- `SOAK-SAMPLES.tsv`: linha `009` com `verdict=FAIL`.
- `curl http://127.0.0.1:3002/health` = `000` (connection refused).
- `docker ps -a`: `rsv360-backend Exited (255)`.
- `docker inspect`: `FinishedAt=2026-06-01T12:38:34Z`.
- log backend (tail):
  - `[SERVER] Error: Expected property name or '}' in JSON at position 1 (line 1 column 2)`

Snapshot completo pré-restart arquivado em `docs/evidence/soak-72h/logs/archive/` com timestamp `20260601-100730`.

## Classificação

- Severidade operacional: **Alta** (impacta gate G4 completo).
- Tipo: indisponibilidade parcial de API (`:3002`) com frontend (`:3000`) ainda respondendo.

## Decisão formal

- **Encerrar a janela atual como NOGO** por hard stop F1.
- **Aplicar recuperação mínima** do backend.
- **Reiniciar nova janela limpa de 72h** com novo kickoff e novo `end_at`, mantendo trilha de auditoria separada.

## Ações imediatas aprovadas

1. Recuperar `rsv360-backend` sem `--build`.
2. Validar health (`:3002/health`, `:3000/`).
3. Arquivar amostras da janela abortada.
4. Reagendar tasks de sample/close para a nova janela.
5. Coletar baseline `000` da nova janela.

## Resultado da execução imediata

- Backend recuperado com `docker start rsv360-backend`.
- Health validado: `GET :3002/health = 200`, container `healthy`.
- Baseline da nova janela coletado: `000` em `2026-06-01T10:13:29-03:00`, verdict `OK`.
- Reagendamento de tasks encontrou bloqueio local: `Acesso negado` no Task Scheduler.
- Mitigação aplicada: coleta manual a cada 6h até ajuste das tasks com permissão administrativa.

## Observação de governança

A decisão mantém auditabilidade: não há sobrescrita de evidência anterior; a nova rodada inicia com janela canônica própria.
