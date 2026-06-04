# Fechamento soak — executar após end_at (agendado ou manual)
$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
$EndAt = [DateTimeOffset]::Parse('2026-06-02T09:03:09-03:00')
$Tz = [TimeZoneInfo]::FindSystemTimeZoneById('E. South America Standard Time')
$Now = [TimeZoneInfo]::ConvertTimeFromUtc((Get-Date).ToUniversalTime(), $Tz)

if ($Now -lt $EndAt.DateTime) {
  Write-Warning "Ainda antes de end_at ($($EndAt.ToString('yyyy-MM-ddTHH:mm:sszzz'))). SP agora: $($Now.ToString('yyyy-MM-ddTHH:mm:ss'))"
  Write-Host 'Coleta em andamento — fechamento bloqueado para preservar auditoria 72h.'
  exit 2
}

& (Join-Path $Root 'run-soak-final.ps1')
& (Join-Path (Split-Path $Root -Parent) 'g4-kickoff\run-api-p0-round1.ps1')
Write-Host "`nPacote fechamento pronto em:"
Write-Host "  $Root\logs\SOAK-SAMPLES.tsv"
Write-Host "  $Root\SOAK-72H-REPORT.md"
Write-Host "  $(Join-Path (Split-Path $Root -Parent) 'g4-kickoff\logs\API-P0-SUMMARY.tsv')"
