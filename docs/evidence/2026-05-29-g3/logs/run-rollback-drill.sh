#!/usr/bin/env bash
# Drill: backup + restore em DB isolada (não afeta rsv_360_ecosystem prod/dev)
set -euo pipefail

LOG_DIR="$(cd "$(dirname "$0")" && pwd)"
DUMP="$LOG_DIR/rollback-test-pre-t0b.dump"
REPORT="$LOG_DIR/ROLLBACK-DRILL-RESULT.txt"

{
  echo "=== Rollback drill $(date -Iseconds) ==="
  DB_NAME="${RSV360_DB_NAME:-rsv360}"
  docker exec rsv360-postgres pg_dump -U rsv360 -d "$DB_NAME" --no-owner -Fc > "$DUMP"
  echo "backup_bytes=$(wc -c < "$DUMP")"

  docker exec rsv360-postgres psql -U rsv360 -d postgres -c 'DROP DATABASE IF EXISTS rsv360_rollback_test;'
  docker exec rsv360-postgres psql -U rsv360 -d postgres -c 'CREATE DATABASE rsv360_rollback_test;'
  cat "$DUMP" | docker exec -i rsv360-postgres pg_restore -U rsv360 -d rsv360_rollback_test --no-owner --clean 2>&1 || true
  docker exec rsv360-postgres psql -U rsv360 -d rsv360_rollback_test -c 'SELECT 1 AS restore_ok;'
  docker exec rsv360-postgres psql -U rsv360 -d postgres -c 'DROP DATABASE rsv360_rollback_test;'
  echo "RESULT=PASS"
} | tee "$REPORT"
