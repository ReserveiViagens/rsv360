#!/usr/bin/env bash
# Trilha 0 — preflight (estabilidade + observabilidade mínima)
set -u

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOG_DIR="$SCRIPT_DIR/logs"
mkdir -p "$LOG_DIR"
TS="$(date -Iseconds)"
SUMMARY="$LOG_DIR/TRILHA0-PREFLIGHT.tsv"
PROJECT="${RSV360_DOCKER_PROJECT:-rsv360}"

echo -e "id\tcheck\tvalue\tverdict" > "$SUMMARY"

add() {
  local id="$1" check="$2" val="$3" verdict="$4"
  echo -e "${id}\t${check}\t${val}\t${verdict}" >> "$SUMMARY"
  echo "$id $verdict — $check ($val)"
}

# HTTP S2
for pair in "T0-01:3002/health" "T0-02:3000/"; do
  id="${pair%%:*}"
  path="${pair#*:}"
  url="http://127.0.0.1${path}"
  code=$(curl -sS -o /dev/null -w '%{http_code}' "$url" 2>/dev/null) || code="000"
  v="FAIL"; [[ "$code" == "200" ]] && v="OK"
  [[ "$code" == "000" ]] && v="FAIL"
  add "$id" "http $url" "$code" "$v"
done

# Docker health
for svc in postgres backend site-publico; do
  id="T0-$(echo "$svc" | tr -d '-')"
  st=$(docker inspect "${PROJECT}-${svc}" --format '{{.State.Health.Status}}' 2>/dev/null || echo "missing")
  v="FAIL"; [[ "$st" == "healthy" ]] && v="OK"
  add "T0-h-${svc}" "health ${svc}" "$st" "$v"
done

# Network align
sp_net=$(docker inspect "${PROJECT}-site-publico" --format '{{range $k,$v := .NetworkSettings.Networks}}{{$k}} {{end}}' 2>/dev/null)
pg_net=$(docker inspect "${PROJECT}-postgres" --format '{{range $k,$v := .NetworkSettings.Networks}}{{$k}} {{end}}' 2>/dev/null)
v_net="GAP"
for n in $sp_net; do [[ " $pg_net " == *" $n "* ]] && v_net="OK"; done
add "T0-net" "site-publico+postgres network" "sp=[$sp_net] pg=[$pg_net]" "$v_net"

# Observability
for svc in prometheus grafana; do
  st=$(docker ps --filter "name=${PROJECT}-${svc}" --format '{{.Status}}' 2>/dev/null | head -1)
  v="FAIL"; [[ "$st" == Up* ]] && v="OK"
  add "T2-${svc}" "${svc} up" "${st:-down}" "$v"
done

echo ""
echo "Summary: $SUMMARY"
cat "$SUMMARY"
