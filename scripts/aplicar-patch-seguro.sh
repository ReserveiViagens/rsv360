#!/usr/bin/env bash
set -euo pipefail

PATCH_PATH=""
KEEP_STASH=1
SEARCH_DIRS=(
  "."
  "$HOME/Downloads"
  "$HOME/Desktop"
  "$HOME/Documents"
  "/workspace"
)

log() { printf '[INFO] %s\n' "$*"; }
warn() { printf '[WARN] %s\n' "$*"; }
err() { printf '[ERRO] %s\n' "$*" >&2; }

usage() {
  cat <<'USAGE'
Uso:
  scripts/aplicar-patch-seguro.sh [caminho.patch|caminho.diff] [--drop-stash]

Opções:
  --drop-stash  Remove o stash de segurança automaticamente após restore bem-sucedido.
                (Padrão: manter stash para rollback manual.)
USAGE
}

parse_args() {
  for arg in "$@"; do
    case "$arg" in
      --drop-stash)
        KEEP_STASH=0
        ;;
      -h|--help)
        usage
        exit 0
        ;;
      *)
        if [[ -z "$PATCH_PATH" ]]; then
          PATCH_PATH="$arg"
        else
          err "Parâmetro não reconhecido: $arg"
          usage
          exit 1
        fi
        ;;
    esac
  done
}

require_git_repo() {
  if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
    err "Este diretório não é um repositório Git."
    exit 1
  fi
}

find_patch_by_extension() {
  local candidate
  local newest=""

  for dir in "${SEARCH_DIRS[@]}"; do
    [[ -d "$dir" ]] || continue
    while IFS= read -r candidate; do
      if [[ -z "$newest" || "$candidate" -nt "$newest" ]]; then
        newest="$candidate"
      fi
    done < <(find "$dir" -maxdepth 4 -type f \( -name '*.patch' -o -name '*.diff' \) 2>/dev/null)
  done

  printf '%s' "$newest"
}

find_patch_by_content() {
  local candidate
  local newest=""

  for dir in "${SEARCH_DIRS[@]}"; do
    [[ -d "$dir" ]] || continue
    while IFS= read -r candidate; do
      if grep -qE '^(diff --git |\*\*\* Begin Patch)' "$candidate" 2>/dev/null; then
        if [[ -z "$newest" || "$candidate" -nt "$newest" ]]; then
          newest="$candidate"
        fi
      fi
    done < <(find "$dir" -maxdepth 4 -type f \( -name '*.txt' -o -name '*.md' -o -name '*.log' \) 2>/dev/null)
  done

  printf '%s' "$newest"
}

apply_patch_with_fallback() {
  local patch_file="$1"

  log "Tentando validação preliminar (git apply --check)..."
  if git apply --check "$patch_file" >/dev/null 2>&1; then
    log "Patch passou em --check. Aplicando com --3way --whitespace=fix"
    git apply --3way --whitespace=fix "$patch_file"
    return 0
  fi

  warn "Patch não passou em --check. Tentando aplicação robusta com --3way..."
  if git apply --3way --whitespace=fix "$patch_file"; then
    return 0
  fi

  warn "Aplicação 3-way falhou. Tentando fallback com --reject..."
  git apply --reject --whitespace=fix "$patch_file"
}

restore_stash_context() {
  local stash_ref="$1"

  log "Restaurando contexto local com 'git stash apply $stash_ref' (não destrutivo)..."
  if git stash apply --index "$stash_ref" >/dev/null 2>&1; then
    if [[ "$KEEP_STASH" -eq 0 ]]; then
      log "Removendo stash de segurança ($stash_ref)..."
      git stash drop "$stash_ref" >/dev/null
    else
      log "Stash de segurança preservado: $stash_ref"
    fi
    return 0
  fi

  warn "Falha ao restaurar stash automaticamente. O stash foi preservado para recuperação manual: $stash_ref"
  return 2
}

run_apply_flow() {
  local patch_file="$1"
  local stash_name="pre-reapply-patch-$(date +%Y%m%d-%H%M%S)"
  local stash_ref=""
  local restore_status=0
  local has_local_changes=0

  if [[ ! -f "$patch_file" ]]; then
    err "Arquivo de patch não encontrado: $patch_file"
    exit 1
  fi

  log "Repo raiz: $(git rev-parse --show-toplevel)"
  log "Branch atual: $(git branch --show-current)"
  log "Patch selecionado: $patch_file"

  if [[ -n "$(git status --porcelain)" ]]; then
    has_local_changes=1
  fi

  if [[ "$has_local_changes" -eq 1 ]]; then
    log "Salvando estado local (tracked + untracked) em stash..."
    git stash push -u -m "$stash_name" >/dev/null
    stash_ref="$(git stash list --format='%gd %s' | awk -v msg="$stash_name" '$0 ~ msg {print $1; exit}')"
    if [[ -z "$stash_ref" ]]; then
      err "Não foi possível localizar a referência do stash criado."
      exit 1
    fi
  else
    log "Sem alterações locais para stash. Prosseguindo sem criar backup temporário."
  fi

  apply_patch_with_fallback "$patch_file"

  if [[ -n "$stash_ref" ]]; then
    restore_stash_context "$stash_ref" || restore_status=$?
  fi

  local rej_count=0
  rej_count=$(find . -type f -name '*.rej' | wc -l | tr -d ' ')
  if [[ "$rej_count" -gt 0 ]]; then
    warn "Foram gerados $rej_count arquivo(s) .rej para ajuste manual:"
    find . -type f -name '*.rej'
  else
    log "Nenhum arquivo .rej encontrado."
  fi

  log "Status final resumido:"
  git status --short --branch

  return "$restore_status"
}

main() {
  parse_args "$@"
  require_git_repo

  if [[ -z "$PATCH_PATH" ]]; then
    PATCH_PATH="$(find_patch_by_extension)"
    if [[ -z "$PATCH_PATH" ]]; then
      warn "Nenhum .patch/.diff encontrado. Buscando arquivo com conteúdo de patch..."
      PATCH_PATH="$(find_patch_by_content)"
    fi

    if [[ -z "$PATCH_PATH" ]]; then
      err "Nenhum patch encontrado por extensão ou conteúdo. Informe o caminho manualmente:"
      err "  scripts/aplicar-patch-seguro.sh /caminho/arquivo.patch"
      exit 1
    fi

    log "Patch localizado automaticamente: $PATCH_PATH"
  fi

  run_apply_flow "$PATCH_PATH"
}

main "$@"
