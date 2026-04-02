# Aplicar patch com segurança

Utilitários para reaplicar patch em árvore local divergente sem perder contexto local.

## Scripts disponíveis

- Linux/macOS (bash): `scripts/aplicar-patch-seguro.sh`
- Windows (PowerShell): `scripts/aplicar-patch-seguro.ps1`

## Comandos

```bash
scripts/aplicar-patch-seguro.sh [/caminho/arquivo.patch] [--drop-stash]
```

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\aplicar-patch-seguro.ps1 [-PatchPath "C:\caminho\arquivo.patch"] [-DropStash]
```

## Fluxo executado (ambos)

1. Verifica se está dentro de um repositório Git.
2. Se nenhum arquivo for informado, busca automaticamente o patch mais recente por:
   - extensão (`*.patch`/`*.diff`)
   - conteúdo (`diff --git` ou `*** Begin Patch`) em `.txt/.md/.log`
3. Se houver mudanças locais, faz `git stash push -u` para preservar alterações (incluindo não rastreadas). Se a árvore estiver limpa, segue sem criar stash.
4. Tenta aplicar o patch em duas estratégias válidas:
   - `git apply --3way --whitespace=fix`
   - fallback: `git apply --reject --whitespace=fix`
5. Restaura contexto com `git stash apply --index` apenas se um stash tiver sido criado.
6. Lista arquivos `.rej` (se existirem) para ajuste manual.
7. Exibe um resumo final com `git status --short --branch`.

## Observações

- O script **não combina** `--3way` com `--reject` na mesma chamada (combinação inválida no Git).
- A validação preliminar com `git apply --check` é usada apenas como diagnóstico inicial. Mesmo quando ela falha, os scripts ainda tentam `--3way` antes de cair no fallback com `--reject`.
- Por padrão, o stash de segurança é preservado para rollback manual.
- Para remover automaticamente o stash após restore bem-sucedido, use `--drop-stash` (bash) ou `-DropStash` (PowerShell).
- Se não houver patch encontrado automaticamente, o script encerra com erro e orienta como informar o caminho.
- Se o restore do stash falhar, o stash é preservado e o script retorna código `2`, permitindo tratamento posterior sem perda do backup temporário.

## Exemplos

### Bash

```bash
scripts/aplicar-patch-seguro.sh
scripts/aplicar-patch-seguro.sh /caminho/arquivo.patch
scripts/aplicar-patch-seguro.sh /caminho/arquivo.patch --drop-stash
```

### PowerShell

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\aplicar-patch-seguro.ps1
powershell -ExecutionPolicy Bypass -File .\scripts\aplicar-patch-seguro.ps1 -PatchPath "C:\caminho\arquivo.patch"
powershell -ExecutionPolicy Bypass -File .\scripts\aplicar-patch-seguro.ps1 -PatchPath "C:\caminho\arquivo.patch" -DropStash
```
