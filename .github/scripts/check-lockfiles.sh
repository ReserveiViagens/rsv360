#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="${1:-.}"
BACKEND_DIR="${2:-backend}"

check_lockfile() {
  local workdir="$1"
  local label="$2"

  if [ ! -f "$workdir/package-lock.json" ]; then
    echo "[SKIP] $label ($workdir/package-lock.json not found)"
    return 0
  fi

  local tmpdir logfile
  tmpdir="$(mktemp -d)"
  logfile="$tmpdir/${label}-npm-ci-dry-run.log"

  if ! (
    cd "$workdir"
    npm ci --dry-run --ignore-scripts --no-audit --no-fund >"$logfile" 2>&1
  ); then
    echo "::error::$label package-lock.json is not in sync with package.json"
    echo "Relevant npm ci dry-run log:"
    sed -n '1,240p' "$logfile"
    rm -rf "$tmpdir"
    exit 1
  fi

  rm -rf "$tmpdir"
  echo "[OK] $label lockfile dry-run passed"
}

check_lockfile "$ROOT_DIR" "root"
check_lockfile "$BACKEND_DIR" "backend"
