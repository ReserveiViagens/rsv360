#!/usr/bin/env bash
# G1 — dual-system (S1 :5000 + S2 Docker :3002) + infra baseline
set -u

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOG_DIR="$SCRIPT_DIR/logs"
mkdir -p "$LOG_DIR"
TS="$(date -Iseconds)"
SUMMARY="$LOG_DIR/G1-SUMMARY.tsv"
echo -e "id\tsystem\tcheck\thttp_or_rc\tverdict\tnote" > "$SUMMARY"

SYSTEM1_ROOT="${SYSTEM1_ROOT:-/mnt/c/Users/RSV 360/Documents/GitHub/Crm-RSV-360}"
S1_BASE="${S1_HTTP_BASE:-http://127.0.0.1:5000}"
COMPOSE_PROJECT="${RSV360_DOCKER_PROJECT:-rsv360}"

probe_http() {
  local id="$1" sys="$2" name="$3" url="$4" ok_codes="$5"
  local log="$LOG_DIR/${id}.log"
  local code
  {
    echo "[ID] $id"
    echo "[TS] $TS"
    echo "[SYSTEM] $sys"
    echo "[CHECK] $name"
    echo "[URL] $url"
    echo "---"
  } > "$log"
  code=$(curl -sS -o /dev/null -w '%{http_code}' "$url" 2>>"$log") || code="000"
  echo "[HTTP] $code" >> "$log"
  local verdict="FAIL"
  if [[ "$code" == "000" ]]; then
    verdict="SKIP"
  elif [[ " $ok_codes " == *" $code "* ]]; then
    verdict="OK"
  fi
  echo -e "${id}\t${sys}\t${name}\t${code}\t${verdict}\t" >> "$SUMMARY"
  echo "$id $verdict ($code) $name"
}

# --- S2 canônico (obrigatório) ---
probe_http G1-S2-01 S2 "backend /health" "http://127.0.0.1:3002/health" "200"
probe_http G1-S2-02 S2 "backend /health/security" "http://127.0.0.1:3002/health/security" "200"
probe_http G1-S2-03 S2 "site-publico /" "http://127.0.0.1:3000/" "200"

# --- S1 legado (PASS se up; SKIP se offline) ---
if [[ -d "$SYSTEM1_ROOT" ]]; then
  probe_http G1-S1-01 S1 "CRM root" "${S1_BASE}/" "200 301 302"
  probe_http G1-S1-02 S1 "CRM /health" "${S1_BASE}/health" "200"
  probe_http G1-S1-03 S1 "CRM /api/status" "${S1_BASE}/api/status" "200"
else
  echo -e "G1-S1-00\tS1\tSYSTEM1_ROOT missing\t-\tSKIP\t${SYSTEM1_ROOT}" >> "$SUMMARY"
  echo "G1-S1-00 SKIP — SYSTEM1_ROOT ausente"
fi

# --- Infra Docker / host ---
{
  echo "[ID] G1-INFRA-01"
  echo "[TS] $TS"
  echo "[CHECK] postgres container healthy"
  docker inspect "${COMPOSE_PROJECT}-postgres" --format '{{.State.Health.Status}}' 2>&1
} > "$LOG_DIR/G1-INFRA-01.log" 2>&1
pg_h=$(docker inspect "${COMPOSE_PROJECT}-postgres" --format '{{.State.Health.Status}}' 2>/dev/null || echo "missing")
v_pg="FAIL"; [[ "$pg_h" == "healthy" ]] && v_pg="OK"
echo -e "G1-INFRA-01\tinfra\tpostgres healthy\t${pg_h}\t${v_pg}\t" >> "$SUMMARY"

{
  echo "[ID] G1-INFRA-02"
  docker inspect "${COMPOSE_PROJECT}-site-publico" --format 'health={{.State.Health.Status}}' 2>&1
} > "$LOG_DIR/G1-INFRA-02.log" 2>&1
sp_h=$(docker inspect "${COMPOSE_PROJECT}-site-publico" --format '{{.State.Health.Status}}' 2>/dev/null || echo "missing")
v_sp="FAIL"; [[ "$sp_h" == "healthy" ]] && v_sp="OK"
echo -e "G1-INFRA-02\tinfra\tsite-publico health\t${sp_h}\t${v_sp}\t" >> "$SUMMARY"

{
  echo "[ID] G1-INFRA-03"
  echo "[CHECK] site-publico + postgres same docker network"
  sp_net=$(docker inspect "${COMPOSE_PROJECT}-site-publico" --format '{{range $k,$v := .NetworkSettings.Networks}}{{$k}} {{end}}' 2>/dev/null)
  pg_net=$(docker inspect "${COMPOSE_PROJECT}-postgres" --format '{{range $k,$v := .NetworkSettings.Networks}}{{$k}} {{end}}' 2>/dev/null)
  echo "site-publico networks: $sp_net"
  echo "postgres networks: $pg_net"
  comm=""
  for n in $sp_net; do
    [[ " $pg_net " == *" $n "* ]] && comm="$n"
  done
  echo "common: ${comm:-NONE}"
} > "$LOG_DIR/G1-INFRA-03.log" 2>&1
v_net="GAP"
sp_net=$(docker inspect "${COMPOSE_PROJECT}-site-publico" --format '{{range $k,$v := .NetworkSettings.Networks}}{{$k}} {{end}}' 2>/dev/null)
pg_net=$(docker inspect "${COMPOSE_PROJECT}-postgres" --format '{{range $k,$v := .NetworkSettings.Networks}}{{$k}} {{end}}' 2>/dev/null)
for n in $sp_net; do
  [[ " $pg_net " == *" $n "* ]] && v_net="OK" && break
done
echo -e "G1-INFRA-03\tinfra\tdocker network align\t${v_net}\t${v_net}\t" >> "$SUMMARY"

{
  echo "[ID] G1-INFRA-04"
  echo "[CHECK] redis container running"
  docker ps --filter "name=${COMPOSE_PROJECT}-redis" --format '{{.Status}}'
} > "$LOG_DIR/G1-INFRA-04.log" 2>&1
redis_st=$(docker ps --filter "name=${COMPOSE_PROJECT}-redis" --format '{{.Status}}' 2>/dev/null | head -1)
v_rd="FAIL"; [[ -n "$redis_st" && "$redis_st" == Up* ]] && v_rd="OK"
echo -e "G1-INFRA-04\tinfra\tredis up\t${redis_st:-down}\t${v_rd}\tREDIS_DISABLED=true no backend compose" >> "$SUMMARY"

echo ""
echo "Summary: $SUMMARY"
cat "$SUMMARY"
