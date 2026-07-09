#!/usr/bin/env bash
# Fail if any Drizzle SQL migration starts with UTF-8 BOM (EF BB BF).
# Postgres rejects BOM with: syntax error at or near ""
set -euo pipefail

DRIZZLE_DIR="${1:-backend/drizzle}"

if [ ! -d "$DRIZZLE_DIR" ]; then
  echo "::error::Drizzle directory not found: $DRIZZLE_DIR"
  exit 1
fi

failed=0
shopt -s nullglob
for file in "$DRIZZLE_DIR"/*.sql; do
  # od -An -tx1 reads first 3 bytes as hex
  hex="$(od -An -N3 -tx1 "$file" | tr -d ' \n')"
  if [ "$hex" = "efbbbf" ]; then
    echo "::error file=$file::UTF-8 BOM detected — rewrite as UTF-8 without BOM"
    failed=1
  fi
done

if [ "$failed" -ne 0 ]; then
  echo "One or more SQL migrations contain a UTF-8 BOM."
  exit 1
fi

echo "[OK] No UTF-8 BOM in $DRIZZLE_DIR/*.sql"
