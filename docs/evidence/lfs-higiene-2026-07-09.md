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

## O que NÃO foi feito (aguarda confirmação do owner)

`git lfs migrate export --include="*.log,*.pdf" --everything` (ou BFG) **reescreve histórico** e exige **force-push** coordenado em `main` + branches abertas.

Comando proposto (só após OK explícito):

```bash
git lfs migrate export --include="*.log,*.pdf" --everything
# depois: force-push coordenado + notificar clones
```

Alternativa: remover do tracking remoto via suporte GitHub LFS / apagar objetos órfãos após migrate.

## Depois do migrate (esperado)

- Cota LFS libera os ~160 ponteiros log/pdf.
- Clones precisam `git fetch` + reset/rebase nas branches reescritas.
- Manter `lfs: false` nos workflows até cota saudável.
