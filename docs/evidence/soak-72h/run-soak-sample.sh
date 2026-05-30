#!/usr/bin/env bash
# Soak 72h — amostra periódica (Linux/WSL)
set -u

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOG_DIR="$ROOT/logs"
mkdir -p "$LOG_DIR"
PROJECT="${RSV360_DOCKER_PROJECT:-rsv360}"
TS="$(TZ=America/Sao_Paulo date -Iseconds)"
SAMPLE_ID="${1:-$(printf '%03d' $(($(wc -l < "$LOG_DIR/SOAK-SAMPLES.tsv" 2>/dev/null || echo 1) - 1)))}"
LABEL="${2:-periodic}"
SUMMARY="$LOG_DIR/SOAK-SAMPLES.tsv"
LOG_FILE="$LOG_DIR/sample-${SAMPLE_ID}-${LABEL}.log"

if [[ ! -f "$SUMMARY" ]]; then
  printf 'sample_id\tts_sp\th3002\th3000\tbackend_health\tsite_health\tpostgres_health\tbackend_restarts\tsite_restarts\tpostgres_restarts\terror_rate_note\tverdict\n' > "$SUMMARY"
fi

health_of() {
  docker inspect "${PROJECT}-$1" --format '{{if .State.Health}}{{.State.Health.Status}}{{else}}n/a{{end}}' 2>/dev/null || echo "missing"
}
restarts_of() {
  docker inspect "${PROJECT}-$1" --format '{{.RestartCount}}' 2>/dev/null || echo "-1"
}
http_code() {
  curl -sS -o /dev/null -w '%{http_code}' --connect-timeout 15 "$1" 2>/dev/null || echo "000"
}

{
  echo "[SAMPLE] $SAMPLE_ID"
  echo "[LABEL] $LABEL"
  echo "[TS] $TS"
  echo "---"
} > "$LOG_FILE"

H2=$(http_code "http://127.0.0.1:3002/health")
H0=$(http_code "http://127.0.0.1:3000/")
HB=$(health_of backend)
HS=$(health_of site-publico)
HP=$(health_of postgres)
RB=$(restarts_of backend)
RS=$(restarts_of site-publico)
RP=$(restarts_of postgres)

docker ps --filter "name=${PROJECT}-" --format '{{.Names}} {{.Status}}' >> "$LOG_FILE" 2>&1

ERR_NOTE="smoke-only"
curl -sf "http://127.0.0.1:9090/-/healthy" >/dev/null 2>&1 && ERR_NOTE="prometheus_up"

VERDICT="OK"
[[ "$H2" == "200" && "$H0" == "200" && "$HB" == "healthy" && "$HS" == "healthy" && "$HP" == "healthy" ]] || VERDICT="FAIL"

printf '%s\n' "$SAMPLE_ID" "$TS" "$H2" "$H0" >> "$LOG_FILE"
echo "VERDICT=$VERDICT" >> "$LOG_FILE"
printf '%s\t%s\t%s\t%s\t%s\t%s\t%s\t%s\t%s\t%s\t%s\t%s\n' \
  "$SAMPLE_ID" "$TS" "$H2" "$H0" "$HB" "$HS" "$HP" "$RB" "$RS" "$RP" "$ERR_NOTE" "$VERDICT" >> "$SUMMARY"
echo "Soak sample $SAMPLE_ID @ $TS -> $VERDICT"
