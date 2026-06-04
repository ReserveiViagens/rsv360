#!/usr/bin/env bash
# G4 API P0 — primeira rodada (smoke + payload mínimo)
set -u

LOG_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/logs"
mkdir -p "$LOG_DIR"
TS="$(date -Iseconds)"
SUMMARY="$LOG_DIR/API-P0-SUMMARY.tsv"
echo -e "id\tmethod\turl\thttp_code\tverdict\tnote" > "$SUMMARY"

run() {
  local id="$1" method="$2" url="$3" payload="${4:-}"
  local auth_header="${5:-}"
  local log="$LOG_DIR/${id}.log"
  local code body_file
  body_file="$(mktemp)"
  local -a curl_args=(-sS -o "$body_file" -w '%{http_code}')

  {
    echo "[ID] $id"
    echo "[TS] $TS"
    echo "[METHOD] $method"
    echo "[URL] $url"
    echo "[PAYLOAD] ${payload:-<none>}"
    echo "[AUTH] ${auth_header:-<none>}"
    echo "---"
  } > "$log"

  if [[ -n "$auth_header" ]]; then
    curl_args+=(-H "$auth_header")
  fi
  if [[ "$method" != "GET" ]]; then
    curl_args+=(-X "$method" -H 'Content-Type: application/json')
    [[ -n "$payload" ]] && curl_args+=(-d "$payload")
  fi
  curl_args+=("$url")
  code=$(curl "${curl_args[@]}" 2>>"$log") || code="000"

  {
    echo "[HTTP] $code"
    echo "--- body (max 2k) ---"
    head -c 2048 "$body_file"
    echo
  } >> "$log"
  rm -f "$body_file"

  local verdict="FAIL"
  case "$id" in
    A1|A2) [[ "$code" == "200" ]] && verdict="OK" ;;
    A3) [[ "$code" == "400" || "$code" == "401" || "$code" == "429" ]] && verdict="OK" ;;
    A4) [[ "$code" == "400" || "$code" == "401" ]] && verdict="OK" ;;
    A5g) [[ "$code" == "200" || "$code" == "400" || "$code" == "401" ]] && verdict="OK" ;;
    A5p) [[ "$code" == "400" ]] && verdict="OK" ;;
    A6) [[ "$code" == "401" ]] && verdict="OK"; [[ "$code" == "200" ]] && verdict="GAP" ;;
    A7g|A7p) [[ "$code" == "200" ]] && verdict="OK" ;;
  esac
  if [[ "$code" == "000" ]]; then verdict="FAIL"; fi
  if [[ "$code" == "404" && "$id" == "A2" ]]; then verdict="GAP"; fi

  echo -e "${id}\t${method}\t${url}\t${code}\t${verdict}\t" >> "$SUMMARY"
  echo "$id $verdict HTTP $code -> $log"
}

# S2 backend :3002
run A1 GET "http://127.0.0.1:3002/health"
run A2 GET "http://127.0.0.1:3002/health/security"

# S2 site-publico BFF :3000
run A3 POST "http://127.0.0.1:3000/api/auth/login" '{"email":"g4-smoke@reserveiviagens.com.br","password":"invalid-password"}'
run A4 POST "http://127.0.0.1:3000/api/auth/refresh" '{}'
run A5g GET "http://127.0.0.1:3000/api/bookings"
run A5p POST "http://127.0.0.1:3000/api/bookings" '{}'
run A6 GET "http://127.0.0.1:3000/api/admin/website/pages"

# Payments backend
run A7g GET "http://127.0.0.1:3002/api/v1/payments/payments?enterpriseId=ent_1"
run A7p POST "http://127.0.0.1:3002/api/v1/payments/payments" \
  '{"enterpriseId":"ent_1","amount":1,"currency":"BRL","customerId":"cus_g4","paymentMethod":"pix"}'

echo ""
echo "Summary: $SUMMARY"
cat "$SUMMARY"
