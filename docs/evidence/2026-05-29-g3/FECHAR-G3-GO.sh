#!/usr/bin/env bash
# Uma rodada: drill rollback (opcional se já feito) + G3 + referência docs GO
set -euo pipefail

export S2_ROOT="${S2_ROOT:-/mnt/c/Users/RSV 360/Documents/Sistema Reservei Viagens com todos os Servidores}"
export S1_ROOT="${S1_ROOT:-/mnt/c/Users/RSV 360/Documents/GitHub/Crm-RSV-360}"
EVID="$S2_ROOT/docs/evidence/2026-05-29-g3"

echo "=== 1) Rollback drill (se postgres up) ==="
if docker ps --format '{{.Names}}' | grep -q '^rsv360-postgres$'; then
  bash "$EVID/logs/run-rollback-drill.sh"
else
  echo "SKIP: rsv360-postgres não está up"
fi

echo "=== 2) G3 evidence ==="
bash "$EVID/run-g3-security-wsl.sh"
echo ""
grep -E '^PASS=|^WARN=|^FAIL=' <<< "$(awk -F'\t' 'NR>1{c[$2]++} END{printf "PASS=%d WARN=%d FAIL=%d\n", c["PASS"]+0, c["WARN"]+0, c["FAIL"]+0}' "$EVID/logs/G3-SUMMARY.tsv")" || true
cat "$EVID/logs/G3-SUMMARY.tsv"

echo "=== 3) Decisão ==="
echo "SECURITY-BASELINE.md e GATES-v3.md → GO (após revisão humana)"
echo "Branch T0b: security/t0b-next15-site-publico → merge quando aprovado"
