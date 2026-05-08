# Reordenação de Prioridades de Governança

**Data:** 08/05/2026  
**Escopo:** priorização executiva após a confirmação de que o `main` aceita merge sem `Security Scan` como required check.

## 1. Situação confirmada

- `main` não possui branch protection ativa via API.
- `Security Scan` falha com `exit 1`, mas não bloqueia merge.
- As 6 entregas de F-023 foram mergeadas com check vermelho em segurança.
- Existe dívida aberta em `route-smoke` e em dependências de segurança/transitivas.

## 2. Ordem corrigida

1. **F-030** - fase 1 em `Evaluate` para ativar branch protection no `main` sem bloquear o merge de F-027; fase 2 em `Active` só depois de F-027 mergeada e `Security Scan` verde.
1. **F-027** - triagem do `fast-xml-builder` e decisão sobre allowlist ou correção.
1. **F-028** - corrigir `esbuild` para `>= 0.25.0` e remover o bloqueio transitivo.
1. **F-024 + F-025** - higiene de tracking e `.gitignore` combinados.
1. **F-029** - investigar o loop de redirect do guest portal.
1. **F-026** - cleanup do monolito antigo e documentação legada.

## 3. Justificativa

- **F-030 primeiro** porque sem gate obrigatório qualquer falha futura continua entrando em `main`.
- **F-030 em duas fases** porque ativar `Active` antes de F-027 cria deadlock operacional; `Evaluate` valida a regra sem bloquear o sprint corretivo.
- **F-027 e F-028** vêm antes da limpeza porque destravam o próprio `Security Scan`.
- **F-024 + F-025** continuam importantes, mas não resolvem o problema de governança.
- **F-029** é dívida de runtime aberta e deve ser tratada depois da estabilização de segurança.
- **F-026** fica por último porque é limpeza estrutural, não bloqueio operacional.

## 4. Evidências principais

| Item | Evidência | Leitura |
| --- | --- | --- |
| Branch protection | `gh api repos/.../branches/main/protection` → `404 Branch not protected` | `main` está sem proteção |
| Rulesets | `gh api repos/.../rulesets` sem regras aplicáveis | não há gate de branch ativo |
| Security Scan | `fast-xml-builder` bloqueado por audit gate | falha de política, não de UI |
| Dependabot | `dependency_still_vulnerable` em `esbuild` | bloqueio transitivo de versão |
| route-smoke | `ERR_TOO_MANY_REDIRECTS` / timeout no guest portal | dívida aberta de auth/redirect |

## 5. Próximos artefatos

- F-030 - runbook humano mantido fora do repo, como documento de operação no Notion.
- Sprint Codex combinado `F-024 + F-025` já está pronto como artefato externo de execução.

## 6. Regra operacional

- Não abrir a sprint F-024 + F-025 antes de F-030.
- Não mudar `F-030` para `Active` antes de F-027 mergeada com `Security Scan` verde.
- Não aceitar allowlist do `fast-xml-builder` sem triagem de CVE e uso real.
- Não tornar `route-smoke` required antes de F-029.
- Revalidar a proteção de branch com smoke test descartável após salvar as regras.

## 7. Saída esperada

- F-030 concluído como runbook humano.
- F-027 e F-028 convertidos em sprints técnicas separadas.
- F-024 + F-025 só depois do gate de segurança ativo.
- F-029 tratado como dívida funcional.
- F-026 somente após a estabilização das prioridades acima.
