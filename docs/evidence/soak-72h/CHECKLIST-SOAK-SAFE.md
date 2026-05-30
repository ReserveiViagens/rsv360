# CHECKLIST SOAK SAFE (Cursor AI + Codex)

**Trilha paralela segura:** [`TRILHA-PARALELA-POS-SOAK.md`](./TRILHA-PARALELA-POS-SOAK.md)  
**Monitor leitura:** `run-soak-safe-monitor.ps1` → `logs/SOAK-SAFE-OBSERVATIONS.log`  
**Codex (copiar sessão):** [`CODEX-SOAK-SAFE.txt`](../../../CODEX-SOAK-SAFE.txt) (raiz do repo)  
**Cursor (regra persistente):** [`.cursor/rules/soak-safe-g4.mdc`](../../../.cursor/rules/soak-safe-g4.mdc)

## Containers monitorados (não reiniciar)

`rsv360-backend`, `rsv360-site-publico`, `rsv360-postgres`, `rsv360-redis`

## Janela congelada (obrigatória)
- **Início:** 2026-05-30T09:03:09-03:00
- **Fim:** 2026-06-02T09:03:09-03:00
- Durante essa janela, o ambiente monitorado fica em **modo observação**.

## Regras duras (NÃO PODE)
- `docker compose up --build` no ambiente monitorado.
- Reiniciar containers monitorados manualmente.
- Alterar `.env`, portas, rede Docker, banco, migrations.
- Merge de PR com impacto em runtime do ambiente em soak.
- Alterar agendamentos das tasks:
  - `RSV360-Soak-72h-Sample`
  - `RSV360-Soak-72h-Close`

## Permitido (PODE)
- Checks de leitura (health HTTP, docker status, logs).
- Documentação, checklist, runbook, evidência.
- Revisão de código sem deploy.
- Backlog e PR draft sem impacto no runtime.
- Merge de PR `docs-only`.

## Rotina operacional mínima
- Confirmar task `RSV360-Soak-72h-Sample` ativa.
- Confirmar crescimento de `logs/SOAK-SAMPLES.tsv`.
- Validar `http://127.0.0.1:3002/health = 200`.
- Validar `http://127.0.0.1:3000/ = 200`.
- Verificar `backend`, `site-publico`, `postgres` sem restart inesperado.

## Incidente durante soak
- Registrar timestamp, impacto, evidência (log/print/status).
- Não aplicar hotfix direto sem decisão formal.
- Decidir entre:
  - continuar soak (sem violar regras), ou
  - abortar e reiniciar janela de 72h.

## Prompt padrão — Cursor AI
```txt
MODO SOAK SAFE ATIVO até 2026-06-02T09:03:09-03:00.
Proibido: docker compose up --build, restart de containers monitorados, mudança de .env/porta/rede/banco/migrations, merge que altere runtime, alterar tasks Sample/Close.
Permitido: somente leitura, documentação, backlog, PR draft, revisão de código sem deploy.
Se eu pedir algo proibido, bloqueie e ofereça alternativa segura.
```

## Prompt padrão — Codex
```txt
MODO SOAK SAFE ATIVO até 2026-06-02T09:03:09-03:00.
Não execute mudanças no ambiente monitorado.
Bloqueie: build/restart de containers, mudanças de env/rede/DB, merges com impacto runtime, alteração de agendamentos do soak.
Atue apenas em trilha paralela segura: docs, evidências, backlog, revisão em leitura, preparação pós-soak.
```

## Critério de saída
- Só encerrar modo Soak Safe após o fechamento oficial (`run-soak-close-scheduled.ps1` / `run-soak-final.ps1`) e veredito final de promoção do G4 completo.

## Pacote de fechamento (revisor)

Enviar após `>= 2026-06-02T09:03:09-03:00`:

1. `logs/SOAK-SAMPLES.tsv` (000 + 001–012)
2. `SOAK-72H-REPORT.md`
3. `docs/evidence/g4-kickoff/logs/API-P0-SUMMARY.tsv` (8/8 OK; logs A1–A7p só se FAIL)
