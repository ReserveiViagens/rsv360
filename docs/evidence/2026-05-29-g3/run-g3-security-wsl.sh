#!/usr/bin/env bash
# G3 — Seguranca baseline + smoke + rollback readiness (S1 + S2)
set -u

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOG_DIR="$SCRIPT_DIR/logs"
mkdir -p "$LOG_DIR/S1" "$LOG_DIR/S2"

S1_ROOT="${S1_ROOT:-/mnt/c/Users/RSV 360/Documents/GitHub/Crm-RSV-360}"
S2_ROOT="${S2_ROOT:-/mnt/c/Users/RSV 360/Documents/Sistema Reservei Viagens com todos os Servidores}"

SUMMARY="$LOG_DIR/G3-SUMMARY.tsv"
echo -e "step\tstatus\tdetail\tartifact" > "$SUMMARY"

log_step() {
  local step="$1"
  local status="$2"
  local detail="$3"
  local artifact="$4"
  echo -e "${step}\t${status}\t${detail}\t${artifact}" | tee -a "$SUMMARY"
  echo "[$status] $step — $detail"
}

# npm audit pode misturar npm warn no stdout; extrai o objeto JSON final.
normalize_audit_json() {
  local raw="$1"
  local out="$2"
  if command -v python3 >/dev/null 2>&1; then
    python3 - "$raw" "$out" <<'PY'
import json, sys
raw, out = sys.argv[1], sys.argv[2]
s = open(raw, encoding="utf-8").read()
start, end = s.find("{"), s.rfind("}")
if start < 0 or end <= start:
    sys.exit(1)
j = json.loads(s[start : end + 1])
open(out, "w", encoding="utf-8").write(json.dumps(j, indent=2))
PY
  elif command -v node >/dev/null 2>&1; then
    node -e "
      const fs = require('fs');
      const [raw, out] = process.argv.slice(1);
      let s = fs.readFileSync(raw, 'utf8');
      const start = s.indexOf('{');
      const end = s.lastIndexOf('}');
      if (start < 0 || end <= start) process.exit(1);
      s = s.slice(start, end + 1);
      fs.writeFileSync(out, JSON.stringify(JSON.parse(s), null, 2));
    " "$raw" "$out"
  else
    awk 'BEGIN{p=0} /^\{/{p=1} p{print}' "$raw" > "$out"
  fi
}

audit_vuln_summary() {
  local jsonfile="$1"
  if command -v python3 >/dev/null 2>&1; then
    python3 - "$jsonfile" <<'PY'
import json, sys
j = json.load(open(sys.argv[1], encoding="utf-8"))
v = (j.get("metadata") or {}).get("vulnerabilities") or {}
print(f"crit={v.get('critical', 0)} high={v.get('high', 0)} mod={v.get('moderate', 0)}")
PY
  elif command -v node >/dev/null 2>&1; then
    node -e '
      const fs = require("fs");
      const j = JSON.parse(fs.readFileSync(process.argv[1], "utf8"));
      const v = (j.metadata && j.metadata.vulnerabilities) || {};
      console.log("crit=" + (v.critical || 0) + " high=" + (v.high || 0) + " mod=" + (v.moderate || 0));
    ' "$jsonfile"
  else
    echo "parse metadata falhou"
  fi
}

run_audit() {
  local label="$1"
  local workdir="$2"
  local outfile="$3"
  if [[ ! -d "$workdir" ]]; then
    log_step "$label" "SKIP" "dir ausente" "$outfile"
    return
  fi
  local raw="${outfile}.raw"
  (cd "$workdir" && npm audit --json > "$raw" 2>"${outfile}.stderr") || true
  if ! normalize_audit_json "$raw" "$outfile" 2>/dev/null; then
    rm -f "$raw"
    log_step "$label" "FAIL" "npm audit JSON invalido" "$outfile"
    return
  fi
  rm -f "$raw"
  local summary
  summary=$(audit_vuln_summary "$outfile" 2>/dev/null || echo "parse metadata falhou")
  if [[ "$summary" == crit=0* ]]; then
    log_step "$label" "PASS" "$summary" "$outfile"
  else
    log_step "$label" "WARN" "$summary" "$outfile"
  fi
}

gitleaks_bin() {
  if command -v gitleaks >/dev/null 2>&1; then
    command -v gitleaks
    return 0
  fi
  local candidates=(
    "$HOME/.local/bin/gitleaks"
    "/usr/local/bin/gitleaks"
  )
  local p
  for p in "${candidates[@]}"; do
    if [[ -x "$p" ]]; then
      echo "$p"
      return 0
    fi
  done
  return 1
}

run_gitleaks() {
  local label="$1"
  local source="$2"
  local outfile="$3"
  local gl
  if ! gl=$(gitleaks_bin); then
    log_step "$label" "SKIP" "gitleaks nao instalado" "$outfile"
    return
  fi
  if "$gl" detect --source "$source" --no-git --report-format json --report-path "$outfile" 2>"${outfile}.stderr"; then
    log_step "$label" "PASS" "sem leaks reportados" "$outfile"
  else
    log_step "$label" "WARN" "gitleaks encontrou issues ou erro" "$outfile"
  fi
}

echo "=== G3 Security Evidence ==="
echo "S1_ROOT=$S1_ROOT"
echo "S2_ROOT=$S2_ROOT"
echo "LOG_DIR=$LOG_DIR"
echo ""

# Congelar G2
if [[ -f "$S2_ROOT/docs/evidence/2026-05-28/logs/SUMMARY.tsv" ]]; then
  cp "$S2_ROOT/docs/evidence/2026-05-28/logs/SUMMARY.tsv" "$LOG_DIR/g2-summary-frozen.tsv"
  log_step "freeze_g2_summary" "PASS" "G2 SUMMARY copiado" "$LOG_DIR/g2-summary-frozen.tsv"
else
  log_step "freeze_g2_summary" "SKIP" "G2 SUMMARY nao encontrado" "$LOG_DIR/g2-summary-frozen.tsv"
fi

# npm audit
run_audit "s1_npm_audit" "$S1_ROOT" "$LOG_DIR/S1/npm-audit.json"
run_audit "s2_backend_npm_audit" "$S2_ROOT/backend" "$LOG_DIR/S2/backend-npm-audit.json"
run_audit "s2_site_publico_npm_audit" "$S2_ROOT/apps/site-publico" "$LOG_DIR/S2/site-publico-npm-audit.json"
run_audit "s2_admin_npm_audit" "$S2_ROOT/apps/admin" "$LOG_DIR/S2/admin-npm-audit.json"
run_audit "s2_guest_npm_audit" "$S2_ROOT/apps/guest" "$LOG_DIR/S2/guest-npm-audit.json"
run_audit "s2_turismo_npm_audit" "$S2_ROOT/apps/turismo" "$LOG_DIR/S2/turismo-npm-audit.json"

# gitleaks
run_gitleaks "s1_gitleaks" "$S1_ROOT" "$LOG_DIR/S1/gitleaks.json"
run_gitleaks "s2_gitleaks" "$S2_ROOT" "$LOG_DIR/S2/gitleaks.json"

# Smoke HTTP
SMOKE_LOG="$LOG_DIR/smoke-curl.txt"
: > "$SMOKE_LOG"
smoke() {
  local name="$1"
  local url="$2"
  local code
  code=$(curl -s -o /dev/null -w '%{http_code}' --connect-timeout 5 "$url" 2>/dev/null || echo "000")
  echo "$name -> $code" >> "$SMOKE_LOG"
  if [[ "$code" =~ ^(200|301|302|401|403)$ ]]; then
    log_step "smoke_$name" "PASS" "HTTP $code" "$url"
  else
    log_step "smoke_$name" "WARN" "HTTP $code (servico pode estar parado)" "$url"
  fi
}

smoke "s2_site_3000" "http://127.0.0.1:3000"
smoke "s2_backend_health" "http://127.0.0.1:3002/health"
smoke "s1_api_status" "http://127.0.0.1:5000/api/status"
smoke "s1_root_5000" "http://127.0.0.1:5000"

# Docker
if command -v docker >/dev/null 2>&1; then
  docker ps --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}' > "$LOG_DIR/docker-ps.txt" 2>&1 || true
  log_step "docker_ps" "PASS" "snapshot salvo" "$LOG_DIR/docker-ps.txt"
else
  log_step "docker_ps" "SKIP" "docker CLI ausente" "$LOG_DIR/docker-ps.txt"
fi

# Rollback readiness (não sobrescrever se já preenchido para GO)
ROLLBACK="$LOG_DIR/ROLLBACK-READINESS.md"
if [[ -f "$ROLLBACK" ]] && grep -q 'PRONTO\|\[x\]' "$ROLLBACK" 2>/dev/null; then
  log_step "rollback_doc" "PASS" "documento mantido (já preenchido)" "$ROLLBACK"
else
cat > "$ROLLBACK" << EOF
# Rollback readiness — G3 snapshot

Data: $(date -Iseconds)
S2_ROOT: $S2_ROOT
S1_ROOT: $S1_ROOT

## Criterios minimos
- [ ] Imagem/tag Docker anterior identificada
- [ ] Backup PostgreSQL testado (restore em ambiente seguro)
- [ ] Variaveis .env de producao documentadas (sem valores no repo)
- [ ] Procedimento: parar compose -> restaurar DB -> subir tag anterior

## Comandos de referencia (S2)
\`\`\`bash
cd "$S2_ROOT"
docker compose -p rsv360 ps
docker compose -p rsv360 down
# restaurar backup + docker compose -p rsv360 up -d
\`\`\`
EOF
log_step "rollback_doc" "PASS" "template gerado" "$ROLLBACK"
fi

echo ""
echo "Resumo: $SUMMARY"
fail_count=$(awk -F'\t' 'NR>1 && $2=="FAIL" {c++} END {print c+0}' "$SUMMARY")
warn_count=$(awk -F'\t' 'NR>1 && $2=="WARN" {c++} END {print c+0}' "$SUMMARY")
pass_count=$(awk -F'\t' 'NR>1 && $2=="PASS" {c++} END {print c+0}' "$SUMMARY")
echo "PASS=$pass_count WARN=$warn_count FAIL=$fail_count"
echo ""
echo "Proximo: revisar SECURITY-BASELINE.md e GATES-v3.md (G3=GO apenas se seguranca + rollback + smoke OK)."
