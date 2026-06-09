# Soak 72h — agendamento dinâmico pós-Next 16 (#283)
# Uso: .\register-soak-scheduler-next16.ps1 [-Kickoff '2026-06-08T22:00:00-03:00']
param(
  [string]$Kickoff = '2026-06-08T22:00:00-03:00'
)

$ErrorActionPreference = 'Stop'
$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
$SampleScript = Join-Path $Root 'run-soak-sample.ps1'
$CloseScript = Join-Path $Root 'run-soak-close-scheduled.ps1'
$KickoffDt = [DateTimeOffset]::Parse($Kickoff)
$EndAt = $KickoffDt.AddHours(72)
$Now = [DateTimeOffset]::Now

$Settings = New-ScheduledTaskSettingsSet `
  -AllowStartIfOnBatteries `
  -DontStopIfGoingOnBatteries `
  -StartWhenAvailable `
  -ExecutionTimeLimit (New-TimeSpan -Minutes 15)
$Principal = New-ScheduledTaskPrincipal -UserId $env:USERNAME -LogonType Interactive -RunLevel Limited

Unregister-ScheduledTask -TaskName 'RSV360-Soak-72h-Sample' -Confirm:$false -ErrorAction SilentlyContinue
for ($i = 1; $i -le 12; $i++) {
  $id = '{0:D3}' -f $i
  Unregister-ScheduledTask -TaskName "RSV360-Soak-72h-Sample-$id" -Confirm:$false -ErrorAction SilentlyContinue
}

$manifest = @(
  '# Soak 72h — tarefas agendadas (janela pós-Next 16)',
  "Kickoff: $Kickoff",
  "End_at: $($EndAt.ToString('yyyy-MM-ddTHH:mm:sszzz'))",
  "Gerado: $(Get-Date -Format 'yyyy-MM-ddTHH:mm:ss')",
  '',
  '| Task | Sample | Data/Hora (-03) |',
  '|------|--------|-----------------|'
)

$ok = 0
for ($i = 1; $i -le 12; $i++) {
  $id = '{0:D3}' -f $i
  $atOffset = $KickoffDt.AddHours(6 * $i)
  $at = $atOffset.LocalDateTime
  $atStr = $at.ToString('yyyy-MM-dd HH:mm:ss')
  $taskName = "RSV360-Soak-72h-Sample-$id"
  if ($atOffset -lt $Now) {
    Write-Host "SKIP $taskName -> $atStr (slot passado)" -ForegroundColor Yellow
    $manifest += "| $taskName | $id | $atStr | SKIP (passado) |"
    continue
  }
  $action = New-ScheduledTaskAction -Execute 'powershell.exe' `
    -Argument "-NoProfile -ExecutionPolicy Bypass -File `"$SampleScript`" -SampleId $id"
  $trigger = New-ScheduledTaskTrigger -Once -At $at
  try {
    Register-ScheduledTask -TaskName $taskName -Action $action -Trigger $trigger `
      -Settings $Settings -Principal $Principal `
      -Description "Soak pós-Next16 amostra $id $atStr -03" | Out-Null
    Write-Host "OK  $taskName -> $atStr" -ForegroundColor Green
    $ok++
    $manifest += "| $taskName | $id | $atStr |"
  } catch {
    Write-Warning "FALHA ${taskName}: $($_.Exception.Message)"
    $manifest += "| $taskName | $id | $atStr | FALHOU |"
  }
}

$closeAt = $EndAt.AddMinutes(2).LocalDateTime
$closeAction = New-ScheduledTaskAction -Execute 'powershell.exe' `
  -Argument "-NoProfile -ExecutionPolicy Bypass -File `"$CloseScript`""
$closeTrigger = New-ScheduledTaskTrigger -Once -At $closeAt
try {
  Unregister-ScheduledTask -TaskName 'RSV360-Soak-72h-Close' -Confirm:$false -ErrorAction SilentlyContinue
  Register-ScheduledTask -TaskName 'RSV360-Soak-72h-Close' -Action $closeAction -Trigger $closeTrigger `
    -Settings (New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -StartWhenAvailable -ExecutionTimeLimit (New-TimeSpan -Minutes 30)) `
    -Principal $Principal -Description 'Soak pós-Next16 fechamento + API P0' | Out-Null
  Write-Host "OK  RSV360-Soak-72h-Close -> $($closeAt.ToString('yyyy-MM-dd HH:mm:ss'))" -ForegroundColor Green
} catch {
  Write-Warning "FALHA Close: $($_.Exception.Message)"
}

$manifest | Set-Content (Join-Path $Root 'SOAK-SCHEDULER-MANIFEST-NEXT16.md') -Encoding utf8
Write-Host "`nRegistradas $ok/12 amostras. Manifest: SOAK-SCHEDULER-MANIFEST-NEXT16.md"
