# Soak 72h — encerramento + relatório preliminar
$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
$LogDir = Join-Path $Root 'logs'
$Summary = Join-Path $LogDir 'SOAK-SAMPLES.tsv'
$Report = Join-Path $Root 'SOAK-72H-REPORT.md'

& (Join-Path $Root 'run-soak-sample.ps1') -SampleId 'final' -Label 'closing'

if (-not (Test-Path $Summary)) {
  Write-Error 'SOAK-SAMPLES.tsv ausente — execute amostras antes.'
  exit 1
}

$rows = Import-Csv $Summary -Delimiter "`t"
$total = $rows.Count
$ok = ($rows | Where-Object { $_.verdict -eq 'OK' }).Count
$fail = $total - $ok
$httpOk = ($rows | Where-Object { $_.h3002 -eq '200' -and $_.h3000 -eq '200' }).Count
$pgOk = ($rows | Where-Object { $_.postgres_health -eq 'healthy' }).Count

$verdict = 'GO'
if ($fail -gt 0) { $verdict = 'NOGO' }
if ($total -lt 12) { $verdict = 'NOGO'; $noteIncomplete = 'Amostras insuficientes (<12 periódicas + baseline)' }
$pctHealthy = if ($total -gt 0) { [math]::Round(100 * $ok / $total, 1) } else { 0 }

$body = @"
# Soak 72h — relatório final

**Gerado:** $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')
**Janela:** 2026-05-30 → 2026-06-02 (America/Sao_Paulo)
**Veredito preliminar:** **$verdict**

## Métricas

| Métrica | Valor |
|---------|--------|
| Amostras registradas | $total |
| Amostras OK | $ok |
| Amostras FAIL | $fail |
| HTTP 200 (:3002 + :3000) | $httpOk / $total |
| Postgres healthy | $pgOk / $total |
| % amostras OK | $pctHealthy% |

## Critérios S1–S7

| ID | Status | Nota |
|----|--------|------|
| S1 backend ≥95% | $(if ($pctHealthy -ge 95) { 'PASS' } else { 'REVIEW' }) | |
| S2 site ≥95% | $(if ($pctHealthy -ge 95) { 'PASS' } else { 'REVIEW' }) | |
| S3 postgres 100% | $(if ($pgOk -eq $total) { 'PASS' } else { 'FAIL' }) | |
| S4 :3002 12/12 | REVIEW | conferir amostras periódicas |
| S5 :3000 12/12 | REVIEW | conferir amostras periódicas |
| S6 restarts 0 | MANUAL | inspecionar colunas restart |
| S7 API P0 fim | PENDING | executar ``run-api-p0-round1.sh`` |

## Próximo passo

1. Se **GO**: rodar API P0 final; atualizar veredito S7; promover G4 completo em ``SPRINT-0-EVIDENCIA-OPERACIONAL.md``.
2. PR ``ops/soak-72h-g4-final`` → merge ``main``.

$(if ($noteIncomplete) { "**Atenção:** $noteIncomplete`n" } else { '' })
"@

$body | Set-Content $Report -Encoding utf8
Write-Host "Relatório: $Report"
Write-Host "Veredito preliminar: $verdict"
