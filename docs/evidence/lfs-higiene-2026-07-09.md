# Higiene Git LFS — 9 jul 2026

## Problema

Repositório `ReserveiViagens/rsv360` excedeu a cota LFS (`This repository exceeded its LFS budget`).  
CI/CodeQL falhavam em checkouts com `lfs: true` (mitigado no PR #45 com `lfs: false` nos workflows).

## Inventário (`git lfs ls-files`) — antes

| Tipo | Qtd |
|------|----:|
| `*.log` | 158 |
| `*.pdf` | 2 |
| **Total** | **160** |

PDFs:

- `docs/Focalboard-guest-admin.pdf`
- `docs/Resumo-Final-RSV360.pdf`

Lista completa: [`lfs-inventory-2026-07-09.txt`](./lfs-inventory-2026-07-09.txt)

Cache local `.git/lfs` (esta máquina): ~202 MB / 286 objetos (não é o tamanho remoto da cota).

## Workflows

Varredura `.github/workflows/`: **nenhum** `lfs: true` restante — todos `lfs: false` (já na main via PR #45).

## O que este PR faz (sem rewrite)

1. `.gitattributes`: `*.log` e `*.pdf` passam a texto Git normal (não LFS) para **commits novos**.
2. Documenta inventário e plano de migrate.

## Decisão owner (9 jul 2026) — **NÃO** rodar migrate agora

Reescrever histórico **não libera storage LFS** no GitHub (objetos remotos continuam contando até delete/recriar repo ou suporte). O que quebrava o CI era **fetch/banda**; com `lfs: false` nos workflows a pressão prática caiu.

| Opção | Libera cota? |
|-------|--------------|
| Migrate + force-push | Storage: **não**. Só limpa histórico |
| PR #47 (`.gitattributes` + workflows) | Estanca **banda** em novos checkouts CI |
| Data pack (~US$5/mês) | Sim, imediato |
| Recriar repo (planejado) | Sim, storage de fato |

## Como distinguir banda vs storage

1. Abrir (owner/billing admin): [Billing summary](https://github.com/settings/billing/summary) ou org [ReserveiViagens → Billing](https://github.com/organizations/ReserveiViagens/settings/billing)
2. Seção **Git LFS Data** → comparar **Bandwidth** (reset mensal) vs **Storage** (acumula).
3. API REST de billing LFS retornou **404** para o token atual (sem permissão org billing) — conferência visual obrigatória.

Mensagem histórica do CI (`exceeded its LFS budget` / checkout LFS) aponta forte para **banda no fetch**; storage só confirma na UI.

## Migrate (só se entrar no plano de recriar repo)

```bash
git lfs migrate export --include="*.log,*.pdf" --everything
# + force-push coordenado — NÃO executar sem OK explícito do owner
```
