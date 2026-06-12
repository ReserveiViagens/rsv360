# Soak 72h — encerramento + relatório (auditoria)
$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
$LogDir = Join-Path $Root 'logs'
$Summary = Join-Path $LogDir 'SOAK-SAMPLES.tsv'
$Report = Join-Path $Root 'SOAK-72H-REPORT.md'

$Kickoff = '2026-06-08T22:00:00-03:00'
$EndAt = '2026-06-11T22:00:00-03:00'
$ExpectedPeriodic = 12
$ExpectedWithBaseline = 13

& (Join-Path $Root 'run-soak-sample.ps1') -SampleId 'final' -Label 'closing'

if (-not (Test-Path $Summary)) {
  Write-Error 'SOAK-SAMPLES.tsv ausente — execute amostras antes.'
  exit 1
}

$rows = Import-Csv $Summary -Delimiter "`t"
$total = $rows.Count
$periodic = $rows | Where-Object { $_.sample_id -match '^\d{3}$' -and $_.sample_id -ne '000' }
$periodicCount = @($periodic).Count
$baseline = $rows | Where-Object { $_.sample_id -eq '000' }

$ok = ($rows | Where-Object { $_.verdict -eq 'OK' }).Count
$fail = $total - $ok
$httpOk = ($rows | Where-Object { $_.h3002 -eq '200' -and $_.h3000 -eq '200' }).Count
$pgOk = ($rows | Where-Object { $_.postgres_health -eq 'healthy' }).Count
$periodicHttpOk = ($periodic | Where-Object { $_.h3002 -eq '200' }).Count
$periodicSiteOk = ($periodic | Where-Object { $_.h3000 -eq '200' }).Count

$notes = @()
$verdict = 'GO'
if ($fail -gt 0) { $verdict = 'NOGO'; $notes += "$fail amostra(s) com verdict FAIL" }
if (-not $baseline) { $verdict = 'NOGO'; $notes += 'Baseline 000 ausente' }
if ($periodicCount -lt $ExpectedPeriodic) {
  $verdict = 'NOGO'
  $notes += "Periodicas insuficientes: $periodicCount / $ExpectedPeriodic (esperado 001-012)"
}
if ($periodicHttpOk -lt $ExpectedPeriodic) { $notes += "S4 :3002 - $periodicHttpOk / $ExpectedPeriodic periodicas 200" }
if ($periodicSiteOk -lt $ExpectedPeriodic) { $notes += "S5 :3000 - $periodicSiteOk / $ExpectedPeriodic periodicas 200" }
if ($pgOk -lt $total) { $verdict = 'NOGO'; $notes += "Postgres healthy $pgOk / $total" }

$pctOk = if ($total -gt 0) { [math]::Round(100 * $ok / $total, 1) } else { 0 }
$s1 = if ($pctOk -ge 95) { 'PASS' } else { 'FAIL' }
$s4 = if ($periodicHttpOk -ge $ExpectedPeriodic) { 'PASS' } else { 'FAIL' }
$s5 = if ($periodicSiteOk -ge $ExpectedPeriodic) { 'PASS' } else { 'FAIL' }
$s3 = if ($pgOk -eq $total) { 'PASS' } else { 'FAIL' }

$noteBlock = if ($notes.Count) { ($notes | ForEach-Object { "- $_" }) -join "`n" } else { '- Nenhuma excecao' }

$body = @"
# Soak 72h — relatório final

**Gerado:** $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')
**Janela operacional:** ``$Kickoff`` → ``$EndAt`` (America/Sao_Paulo, kickoff + 72h)
**Veredito soak (pré API P0):** **$verdict**

## Amostras

| Métrica | Valor | Esperado |
|---------|--------|----------|
| Total linhas | $total | ≥ $ExpectedWithBaseline (+ opcional ``final``) |
| Baseline 000 | $(if ($baseline) { 'sim' } else { 'não' }) | sim |
| Periódicas 001-012 | $periodicCount | $ExpectedPeriodic |
| OK / FAIL | $ok / $fail | 100% OK |
| HTTP 200 (todas) | $httpOk / $total | |
| S4 periódicas :3002 | $periodicHttpOk / $ExpectedPeriodic | $ExpectedPeriodic |
| S5 periódicas :3000 | $periodicSiteOk / $ExpectedPeriodic | $ExpectedPeriodic |
| Postgres healthy | $pgOk / $total | $total |

## Critérios S1–S7

| ID | Status | Nota |
|----|--------|------|
| S1 backend ≥95% | $s1 | $pctOk% amostras OK |
| S2 site ≥95% | $s1 | proxy amostra OK |
| S3 postgres 100% | $s3 | |
| S4 :3002 12/12 periódicas | $s4 | |
| S5 :3000 12/12 periódicas | $s5 | |
| S6 restarts 0 | MANUAL | inspecionar TSV |
| S7 API P0 fim | **PENDING** | ``docs/evidence/g4-kickoff/run-api-p0-round1.sh`` |

## Observações

$noteBlock

## Fechamento G4

1. Rodar API P0; se 8/8 → marcar S7 PASS e veredito **G4 completo = GO**.
2. Preencher ``SOAK-72H-CLOSE-CHECKLIST.md`` e atualizar PR #249.
3. Merge #249 em ``main`` somente se soak + API P0 verdes.

"@

$body | Set-Content $Report -Encoding utf8
Write-Host "Relatório: $Report"
Write-Host "Veredito soak (pré P0): $verdict"
if ($periodicCount -lt $ExpectedPeriodic) {
  Write-Warning "Faltam periódicas: $periodicCount / $ExpectedPeriodic"
}
