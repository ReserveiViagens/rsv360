# Evidencias G3 — 2026-05-29

**Pre-requisito:** G2-integrado **GO** (21/21) — ver `docs/evidence/2026-05-28/logs/SUMMARY.tsv`

## Um terminal basta

Use `cd` ou funcoes antes de cada comando:

```bash
S1_ROOT='/mnt/c/Users/RSV 360/Documents/GitHub/Crm-RSV-360'
S2_ROOT='/mnt/c/Users/RSV 360/Documents/Sistema Reservei Viagens com todos os Servidores'

s1() { (cd "$S1_ROOT" && "$@"); }
s2() { (cd "$S2_ROOT" && "$@"); }

s1 npm run build
s2 docker compose -p rsv360 ps
```

Dois terminais so sao necessarios para **dev servers longos** em paralelo.

## Executar coleta G3 automatizada

```bash
export S2_ROOT='/mnt/c/Users/RSV 360/Documents/Sistema Reservei Viagens com todos os Servidores'
export S1_ROOT='/mnt/c/Users/RSV 360/Documents/GitHub/Crm-RSV-360'
bash "$S2_ROOT/docs/evidence/2026-05-29-g3/run-g3-security-wsl.sh"
cat "$S2_ROOT/docs/evidence/2026-05-29-g3/logs/G3-SUMMARY.tsv"
```

## Saidas

| Arquivo | Conteudo |
|---------|----------|
| `logs/G3-SUMMARY.tsv` | Resultado por step |
| `logs/g2-summary-frozen.tsv` | Copia do G2 GO |
| `logs/S1/npm-audit.json` | SCA S1 |
| `logs/S2/*-npm-audit.json` | SCA workspaces S2 |
| `logs/S1/gitleaks.json` | Secrets S1 (se gitleaks instalado) |
| `logs/S2/gitleaks.json` | Secrets S2 |
| `logs/smoke-curl.txt` | HTTP smoke |
| `logs/docker-ps.txt` | Containers |
| `logs/ROLLBACK-READINESS.md` | Template rollback |

## Plano S2 high (site-publico)

Ver **[S2-SITE-PUBLICO-HIGH-MITIGATION.md](./S2-SITE-PUBLICO-HIGH-MITIGATION.md)** — T0 Next 14.2.35, T1 nodemailer 7.x, T2 xlsx.

## Resultado 29/05/2026 (rodada 4 — S1 zerado + gitleaks)

- S1 **0 vulns**; gitleaks **0 findings**; G3 **PASS=10**
- S2 bloqueio: **6 high** site-publico, **1 high** turismo (`xlsx`)
- `SECURITY-BASELINE` / **G3** = **NOGO** (S2 + rollback)

## Fechar G3

1. Corrigir critical (jspdf) + plano para high
2. Instalar gitleaks e reexecutar o script
3. Subir S1 dev e repetir smoke `:5000`
4. Completar `ROLLBACK-READINESS.md`
5. Atualizar `SECURITY-BASELINE.md` e marcar G3=GO em `GATES-v3.md`
